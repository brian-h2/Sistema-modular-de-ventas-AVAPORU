import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ChevronDown } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 15, 25,]
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  const navButtonClass =
    "p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 dark:disabled:hover:text-slate-400 disabled:cursor-not-allowed";

  const handleSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
      onPageChange(1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
      {/* Selector "Registros por página" mejorado visualmente */}
      {onPageSizeChange && (
        <div className="flex items-center gap-2.5 bg-slate-100/70 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs transition-all hover:border-indigo-300 dark:hover:border-indigo-500/50">
          <label htmlFor="pageSizeSelect" className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap tracking-wide">
            Registros por página:
          </label>
          <div className="relative flex items-center">
            <select
              id="pageSizeSelect"
              value={pageSize}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="appearance-none pl-3 pr-7 py-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 cursor-pointer shadow-xs transition-all hover:bg-slate-50 dark:hover:bg-slate-850"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option} className="font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 absolute right-2 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Botones de navegación y texto "Página X de Y" centrados */}
      <div className="flex items-center justify-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={isFirstPage}
          className={navButtonClass}
          aria-label="Primera página"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          className={navButtonClass}
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-3 whitespace-nowrap">
          Página {currentPage} de {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          className={navButtonClass}
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={isLastPage}
          className={navButtonClass}
          aria-label="Última página"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
