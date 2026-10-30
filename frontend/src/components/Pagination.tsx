import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  totalElements: number
  onPrev?: () => void
  onNext?: () => void
  onPageChange?: (page: number) => void
}

export function Pagination({ page, totalPages, totalElements, onPrev, onNext, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const handlePrev = () => {
    if (onPrev) onPrev()
    else if (onPageChange && page > 0) onPageChange(page - 1)
  }

  const handleNext = () => {
    if (onNext) onNext()
    else if (onPageChange && page < totalPages - 1) onPageChange(page + 1)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 0 0',
        borderTop: '1px solid #27303a',
        color: '#67727e',
        fontSize: 11,
      }}
    >
      <span>
        Page {page + 1} of {totalPages} &mdash; {totalElements} total
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          className="secondary-button"
          onClick={handlePrev}
          disabled={page === 0}
          style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <ChevronLeft size={13} /> Prev
        </button>
        <button
          className="secondary-button"
          onClick={handleNext}
          disabled={page >= totalPages - 1}
          style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          Next <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}
