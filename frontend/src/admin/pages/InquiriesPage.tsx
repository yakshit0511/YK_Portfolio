import { useEffect, useMemo, useState } from 'react';
import { Mail, MailCheck, MailX, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Drawer } from '../components/Drawer';
import { Pagination } from '../components/Pagination';
import { useToast } from '../components/Toast';
import { getInquiries, getInquiryById, updateInquiryStatus, deleteInquiry, resendInquiryEmail, type InquiryData } from '../api/adminApi';

const tabs = ['all', 'new', 'read', 'replied'] as const;

type InquiryTab = (typeof tabs)[number];

export function InquiriesPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<InquiryTab>('all');
  const [page, setPage] = useState(1);
  const [emailFailedOnly, setEmailFailedOnly] = useState(false);
  const [items, setItems] = useState<InquiryData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryData | null>(null);
  const [pendingDelete, setPendingDelete] = useState<InquiryData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const result = await getInquiries({
        page,
        limit: 10,
        status: tab === 'all' ? undefined : tab,
        emailFailed: emailFailedOnly || undefined,
      });
      setItems(result.items);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      showToast((error as Error).message || 'Unable to load inquiries.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInquiries();
  }, [page, tab, emailFailedOnly]);

  const openInquiry = async (id: string) => {
    try {
      const inquiry = await getInquiryById(id);
      setSelectedInquiry(inquiry);
      if (inquiry.status === 'new') {
        await updateInquiryStatus(id, 'read');
        await loadInquiries();
      }
    } catch (error) {
      showToast((error as Error).message || 'Unable to open inquiry.', 'error');
    }
  };

  const updateStatus = async (status: InquiryData['status']) => {
    if (!selectedInquiry?._id) return;
    try {
      const updated = await updateInquiryStatus(selectedInquiry._id, status);
      setSelectedInquiry(updated);
      await loadInquiries();
      showToast('Inquiry status updated.', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Unable to update inquiry status.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete?._id) return;
    try {
      await deleteInquiry(pendingDelete._id);
      setPendingDelete(null);
      setSelectedInquiry(null);
      await loadInquiries();
      showToast('Inquiry deleted.', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Delete failed.', 'error');
    }
  };

  const handleResend = async () => {
    if (!selectedInquiry?._id) return;
    try {
      const result = await resendInquiryEmail(selectedInquiry._id);
      setSelectedInquiry((current) => current ? { ...current, emailSent: result.emailSent, emailError: result.emailError } : current);
      showToast(result.emailSent ? 'Notification email resent.' : 'Email could not be sent.', result.emailSent ? 'success' : 'error');
    } catch (error) {
      showToast((error as Error).message || 'Unable to resend email.', 'error');
    }
  };

  const relativeLabel = useMemo(() => (value?: string) => value && value.length > 80 ? `${value.slice(0, 80)}…` : value, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {tabs.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => { setTab(status); setPage(1); }}
                className={['rounded-full px-3 py-1.5 text-sm', tab === status ? 'bg-blue-600 text-white' : 'border border-slate-700 bg-slate-900 text-slate-300'].join(' ')}
              >
                {status === 'all' ? 'All' : status[0].toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={emailFailedOnly} onChange={(event) => { setEmailFailedOnly(event.target.checked); setPage(1); }} />
            Failed emails only
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="hidden md:grid md:grid-cols-[1.1fr_1.3fr_0.8fr_0.7fr] border-b border-slate-800 px-4 py-3 text-xs uppercase tracking-wide text-slate-400">
          <span>Name</span>
          <span>Message</span>
          <span>Status</span>
          <span>Time</span>
        </div>

        <div className="divide-y divide-slate-800">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-16 animate-pulse bg-slate-800/70" />)
          ) : items.length === 0 ? (
            <div className="p-6 text-sm text-slate-400">No inquiries match the active filter.</div>
          ) : items.map((item) => (
            <button key={item._id} type="button" onClick={() => void openInquiry(item._id)} className="grid w-full gap-3 bg-slate-900/40 px-4 py-3 text-left md:grid-cols-[1.1fr_1.3fr_0.8fr_0.7fr] hover:bg-slate-800/60">
              <div>
                <div className="font-medium text-white">{item.name}</div>
                <div className="text-xs text-slate-400">{item.email}</div>
              </div>
              <div className="text-sm text-slate-300">{relativeLabel(item.subject || item.message)}</div>
              <div className="flex items-center gap-2">
                <span className={['rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide', item.status === 'new' ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : item.status === 'replied' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-slate-700 bg-slate-800 text-slate-300'].join(' ')}>
                  {item.status}
                </span>
                {!item.emailSent ? <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200">Email failed</span> : null}
              </div>
              <div className="text-sm text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recently'}</div>
            </button>
          ))}
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Drawer open={Boolean(selectedInquiry)} title="Inquiry details" onClose={() => setSelectedInquiry(null)}>
        {selectedInquiry ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-white">{selectedInquiry.name}</div>
                  <a href={`mailto:${selectedInquiry.email}`} className="mt-1 inline-flex items-center gap-2 text-sm text-blue-300">
                    <Mail size={14} /> {selectedInquiry.email}
                  </a>
                </div>
                <span className={['rounded-full border px-2 py-1 text-[10px] uppercase tracking-wide', selectedInquiry.status === 'new' ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : selectedInquiry.status === 'replied' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-slate-700 bg-slate-800 text-slate-300'].join(' ')}>
                  {selectedInquiry.status}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-300">
              <div><span className="font-medium text-slate-100">Subject:</span> {selectedInquiry.subject || 'No subject'}</div>
              <div><span className="font-medium text-slate-100">Received:</span> {selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleString() : 'Recently'}</div>
            </div>

            <label className="flex flex-col gap-1.5 text-sm text-slate-200">
              <span className="font-medium text-slate-100">Status</span>
              <select value={selectedInquiry.status} onChange={(event) => void updateStatus(event.target.value as InquiryData['status'])} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white focus:border-blue-400 focus:outline-none">
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
              </select>
            </label>

            <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Message</div>
              <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{selectedInquiry.message}</pre>
            </div>

            {!selectedInquiry.emailSent && selectedInquiry.emailError ? (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-100">
                Email not delivered: {selectedInquiry.emailError}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <a href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(`Re: ${selectedInquiry.subject || 'Inquiry'}`)}`} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white">
                <MailCheck size={15} /> Reply by email
              </a>
              {!selectedInquiry.emailSent ? (
                <button type="button" onClick={() => void handleResend()} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200">
                  <MailX size={15} /> Resend notification email
                </button>
              ) : null}
              <button type="button" onClick={() => setPendingDelete(selectedInquiry)} className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        ) : null}
      </Drawer>

      <ConfirmDialog open={Boolean(pendingDelete)} title="Delete inquiry" message="This cannot be undone." confirmLabel="Delete inquiry" onClose={() => setPendingDelete(null)} onConfirm={confirmDelete} />
    </div>
  );
}
