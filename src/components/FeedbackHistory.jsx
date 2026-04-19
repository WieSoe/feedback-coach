import PropTypes from 'prop-types'
import '../styles/FeedbackHistory.css'
import { Clock, X, Trash2, Eye, EyeOff } from 'lucide-react'

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

export default function FeedbackHistory({ entries, isOpen, privacyMode, onToggle, onTogglePrivacyMode, onLoad, onDelete, onClearAll }) {
  return (
    <section className="feedback-history card" aria-label="Feedback history">
      <div className="history-header-row">
        <button
          type="button"
          className="history-toggle"
          onClick={onToggle}
          aria-expanded={isOpen}
          disabled={privacyMode}
        >
          <Clock style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', width: '16px', height: '16px' }} /> History ({entries.length})
        </button>
        <div className="privacy-controls">
          <button
            type="button"
            className="privacy-toggle"
            onClick={onTogglePrivacyMode}
            aria-pressed={privacyMode}
            aria-label={privacyMode ? 'Disable privacy mode' : 'Enable privacy mode'}
            title="Privacy Mode — turn on when working on sensitive feedback. No sessions will be saved while active. Turn off anytime to resume saving history."
          >
            {privacyMode ? (
              <EyeOff style={{ width: '14px', height: '14px', marginRight: '6px', verticalAlign: 'middle' }} />
            ) : (
              <Eye style={{ width: '14px', height: '14px', marginRight: '6px', verticalAlign: 'middle' }} />
            )}
            <span className="privacy-toggle-label">Privacy Mode</span>
          </button>
          {privacyMode && <span className="private-session-chip">● Private session</span>}
        </div>
      </div>

      <p className="privacy-mode-hint">
        Privacy Mode — turn on when working on sensitive feedback. No sessions will be saved while active. Turn off anytime to resume saving history.
      </p>

      {!privacyMode && !isOpen && entries.length === 0 && (
        <p className="history-intro-hint">
          Your last 10 feedback sessions will be saved here automatically.
          Only visible to you, stored in this browser.
        </p>
      )}

      {!privacyMode && isOpen && (
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
                  onClick={(e) => { e.preventDefault(); onLoad(entry); e.currentTarget.blur() }}
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
                    <X style={{ width: '16px', height: '16px' }} />
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
              <Trash2 style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', width: '16px', height: '16px' }} /> Clear all history
            </button>
          )}
        </>
      )}
    </section>
  )
}

FeedbackHistory.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    framework: PropTypes.string,
    recipient: PropTypes.string,
    topic: PropTypes.string,
    date: PropTypes.string,
  })).isRequired,
  isOpen: PropTypes.bool.isRequired,
  privacyMode: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onTogglePrivacyMode: PropTypes.func.isRequired,
  onLoad: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
}
