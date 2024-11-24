import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md bg-gray-950/10 text-gray-50 border border-gray-900/50 hover:bg-gray-900/20 hover:border-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        «
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md bg-gray-950/10 text-gray-50 border border-gray-900/50 hover:bg-gray-900/20 hover:border-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ‹
      </button>
      
      {pages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 rounded-md bg-gray-950/10 text-gray-50 border border-gray-900/50 hover:bg-gray-900/20 hover:border-gray-700/50"
          >
            1
          </button>
          {pages[0] > 2 && <span className="px-1 text-gray-500">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-md ${
            currentPage === page
              ? 'bg-gray-900/40 text-gray-400 border border-gray-700/50'
              : 'bg-gray-950/10 text-gray-50 border border-gray-900/50 hover:bg-gray-900/20 hover:border-gray-700/50'
          }`}
        >
          {page}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="px-1 text-gray-500">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1 rounded-md bg-gray-950/10 text-gray-50 border border-gray-900/50 hover:bg-gray-900/20 hover:border-gray-700/50"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md bg-gray-950/10 text-gray-50 border border-gray-900/50 hover:bg-gray-900/20 hover:border-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ›
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md bg-gray-950/10 text-gray-50 border border-gray-900/50 hover:bg-gray-900/20 hover:border-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        »
      </button>
    </div>
  );
};

export default Pagination;
