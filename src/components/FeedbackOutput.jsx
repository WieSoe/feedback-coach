import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Lightbulb, Copy, RotateCcw, MessageSquare, Loader2, AlertTriangle } from 'lucide-react'
import '../styles/FeedbackOutput.css'

const FRAMEWORK_LABELS = {
  sbi: 'SBI — Situation, Behavior, Impact',
  nvc: 'NVC — Nonviolent Communication',
  asset: 'Asset-oriented Feedback',
  radical: 'Radical Candor',
  self: 'Self-Clarification',
}

export default function FeedbackOutput({
  data,
  chatHistory,
  chatLoading,
  onFollowUp,
  onReset,
  selectedLanguage,
}) {
  const isSelf = data.framework === 'self'
  const isManagerReport = data.situationType === 'Feedback about someone to their Manager'
  const isArabic = selectedLanguage === 'العربية'
  const frameworkLabel = FRAMEWORK_LABELS[data.framework] ?? data.framework
  const isWritten = data.outputFormat === 'written'
  const [input, setInput] = useState('')
  const [editableText, setEditableText] = useState(data.generatedFeedback)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [editableText])

  const extractTrailingNote = (content) => {
    if (typeof content !== 'string') {
      return { main: '', note: '' }
    }

    const blocks = content
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean)

    if (blocks.length === 0) {
      return { main: content, note: '' }
    }

    const lastBlock = blocks[blocks.length - 1]
    const notePattern = /^\s*(?:\*\*|__)?\s*(wichtiger\s+hinweis|hinweis|warning|note)\b/i

    if (!notePattern.test(lastBlock)) {
      return { main: content, note: '' }
    }

    return {
      main: blocks.slice(0, -1).join('\n\n'),
      note: lastBlock,
    }
  }

  const { main: mainFeedback, note: trailingNote } = extractTrailingNote(data.generatedFeedback)

  const prevChatLengthRef = useRef(0)

  useEffect(() => {
    const prev = prevChatLengthRef.current
    prevChatLengthRef.current = chatHistory.length
    if (chatHistory.length > 0 && chatHistory.length > prev) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatHistory])

  const copyToClipboard = () => {
    const text = isWritten ? editableText : data.generatedFeedback
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || chatLoading) return
    onFollowUp(input.trim())
    setInput('')
  }

  const handleKeyDown = (e) => {
    // Send on Enter (without shift) OR Cmd/Ctrl+Enter
    const submitKey = (e.key === 'Enter' && !e.shiftKey) || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))
    if (submitKey) {
      e.preventDefault()
      if (!input.trim() || chatLoading) return
      onFollowUp(input.trim())
      setInput('')
    }
  }

  return (
    <div className="feedback-output card">
      <button
        type="button"
        className="output-reset-btn"
        onClick={onReset}
        aria-label="Start new feedback and clear current output"
      >
          <RotateCcw style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', width: '16px', height: '16px' }} /> Start new feedback
      </button>
      <h2><Lightbulb style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', width: '24px', height: '24px', color: '#1a1a1a' }} /> Your Feedback Preparation</h2>

      <div style={{
        background: '#fef3c7',
        border: '0.5px solid #d97706',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
        fontSize: '13px',
        color: '#92400e',
      }}>
        <AlertTriangle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
        <span>
          This is AI-generated. Always review before sending or using.
          It does not replace your own judgment and knowledge of the situation.
        </span>
      </div>

      <div className="output-meta">
        <p><strong>Framework:</strong> {frameworkLabel}</p>
        {isSelf ? (
          <p><strong>For:</strong> Myself</p>
        ) : (
          <p><strong>For:</strong> {data.recipient}</p>
        )}
        <p><strong>Topic:</strong> {data.topic}</p>
      </div>

      <div
        className="output-content"
        dir={isArabic ? 'rtl' : 'ltr'}
        style={{ textAlign: isArabic ? 'right' : 'left' }}
      >
        {isWritten ? (
          <textarea
            ref={textareaRef}
            className="written-output-textarea"
            value={editableText}
            onChange={(e) => setEditableText(e.target.value)}
          />
        ) : (
          <div className="markdown-output">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{mainFeedback || data.generatedFeedback}</ReactMarkdown>
            {trailingNote && (
              <div className="output-warning-box">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{trailingNote}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="output-actions">
        <button className="primary" onClick={copyToClipboard}>
          <Copy style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', width: '16px', height: '16px' }} /> Copy to Clipboard
        </button>
        {isWritten && (
          <button className="primary" onClick={() => onReset && onReset('regenerate')} style={{ marginLeft: '8px' }}>
            <RotateCcw style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', width: '16px', height: '16px' }} /> Regenerate
          </button>
        )}
      </div>

      {!isManagerReport && !isWritten && (
        <div className="tips-box">
          <h4><MessageSquare style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', width: '16px', height: '16px' }} /> Tips for the Conversation</h4>
          <ul>
            <li>Practice the opening line out loud</li>
            <li>Listen more than you talk</li>
            <li>Ask clarifying questions</li>
            <li>Focus on behavior, not person</li>
            <li>End with clear next steps</li>
          </ul>
        </div>
      )}

      {!isWritten && (
      <div className="chat-section" aria-label="Follow-up conversation">
        <h3>🗨️ Refine or Practice</h3>

        <div
          className="chat-messages"
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`chat-bubble chat-bubble--${msg.role}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          ))}
          {chatLoading && (
            <div className="chat-bubble chat-bubble--assistant chat-bubble--loading" aria-busy="true">
              Thinking…
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-row" onSubmit={handleSend}>
          <label htmlFor="chat-input" className="sr-only">Follow-up message</label>
          <textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={2000}
            placeholder="Ask a follow-up… e.g. 'What if they react defensively?' or 'Make it more direct'"
            disabled={chatLoading}
            className="chat-textarea"
          />
          <button
            type="submit"
            className="chat-send-btn"
            aria-label="Send follow-up message"
            disabled={chatLoading || !input.trim()}
          >
            {chatLoading ? (
              <>
                <Loader2
                  style={{
                    width: '16px',
                    height: '16px',
                    marginRight: '6px',
                    display: 'inline',
                    verticalAlign: 'middle',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Sending...
              </>
            ) : (
              'Send'
            )}
          </button>
        </form>
      </div>
      )}
    </div>
  )
}

FeedbackOutput.propTypes = {
  data: PropTypes.shape({
    framework: PropTypes.string.isRequired,
    situationType: PropTypes.string,
    recipient: PropTypes.string,
    topic: PropTypes.string,
    generatedFeedback: PropTypes.string.isRequired,
    outputFormat: PropTypes.oneOf(['conversation', 'written']),
  }).isRequired,
  chatHistory: PropTypes.arrayOf(
    PropTypes.shape({
      role: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
    })
  ).isRequired,
  chatLoading: PropTypes.bool.isRequired,
  onFollowUp: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  selectedLanguage: PropTypes.string.isRequired,
}