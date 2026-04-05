import { useState } from 'react';
import type { PaginationMeta } from '../../types/PaginationType';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
};

export function ButtonPagination({ meta, onPageChange }: Props) {
  const [open, setOpen] = useState(false);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= meta.totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out bg-gray-600 text-white shadow-lg
  ${open ? 'w-64 rounded-xl p-4' : 'w-14 h-14 rounded-full flex items-center justify-center'}`}
      >
        {!open ? (
          <>
            <ChevronLeft />
            <ChevronRight />
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <button
                onClick={() => goToPage(meta.page - 1)}
                disabled={meta.page === 1}
                className="px-2 py-1 bg-white text-gray-900 rounded disabled:opacity-50"
              >
                ◀
              </button>
              <div className="text-sm">
                Página {meta.page} de {meta.totalPages}
              </div>
              <button
                onClick={() => goToPage(meta.page + 1)}
                disabled={meta.page === meta.totalPages}
                className="px-2 py-1 bg-white text-gray-900 rounded disabled:opacity-50"
              >
                ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
