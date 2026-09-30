import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Drawer({ open, title, onClose, children }: DrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/60" onClick={onClose}>
      <motion.aside
        initial={{ x: 420 }}
        animate={{ x: 0 }}
        exit={{ x: 420 }}
        transition={{ duration: 0.2 }}
        className="ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-slate-700 bg-slate-900 p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button type="button" aria-label="Close drawer" onClick={onClose} className="rounded-lg border border-slate-700 p-2 text-slate-200 hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.aside>
    </div>
  );
}
