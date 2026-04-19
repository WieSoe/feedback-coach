import '../styles/FeedbackHistory.css'

const FRAMEWORK_SHORT = {
  sbi: 'SBI',
  nvc: 'NVC',
  asset: 'Asset',
  radical: 'Candor',
  self: 'Self',
}

const formatHistoryDate = (value) => {
  if (typeof value !== 'string') return value
  return value.replace(/:(\d{2})(?!\d)/, '')
}

export default function FeedbackHistory({ entries, isOpen, onToggle, onLoad, onDelete, onClearAll }) {
  return (
    <section className="feedback-history card" aria-label="Feedback history">
      <button
        type="button"
        className="history-toggle"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        {isOpen ? `▾ History (${entries.length})` : `▸ History (${entries.length})`}
      </button>

      {isOpen && (
        <>
          {entries.length === 0 ? (
            <p className="history-empty">No feedback sessions yet. Your history will appear here.</p>
          ) : (
            <div className="history-list">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="history-item"
                  role="button"
                  tabIndex={0}
                  onClick={() => onLoad(entry)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onLoad(entry)
                    }
                  }}
                >
                  <div className="history-item-main">
                    <span className="history-framework-pill">
                      {FRAMEWORK_SHORT[entry.framework] || entry.framework}
                    </span>
                    <div className="history-item-text">
                      <p className="history-recipient">{entry.recipient || 'Myself'}</p>
                      <p className="history-topic">{entry.topic}</p>
                      <p className="history-date">{formatHistoryDate(entry.date)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="history-delete"
                    aria-label="Delete history entry"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(entry.id)
                    }}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}

          {entries.length > 0 && (
            <button
              type="button"
              className="history-clear"
              onClick={onClearAll}
            >
              Clear all history
            </button>
          )}
        </>
      )}
    </section>
  )
}
