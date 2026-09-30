interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="mt-5 flex items-center justify-center gap-2">
      <button
        type="button"
        className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-sm text-slate-200 disabled:opacity-50"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </button>
      {pages.map((item) => (
        <button
          key={item}
          type="button"
          className={[
            'rounded-lg px-2.5 py-1.5 text-sm',
            item === page ? 'bg-blue-600 text-white' : 'border border-slate-700 text-slate-200',
          ].join(' ')}
          onClick={() => onPageChange(item)}
        >
          {item}
        </button>
      ))}
      <button
        type="button"
        className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-sm text-slate-200 disabled:opacity-50"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
