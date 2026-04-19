import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Lightbulb, Copy, RotateCcw, MessageSquare } from 'lucide-react'
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
  const isArabic = selectedLanguage === 'العربية'
  const frameworkLabel = FRAMEWORK_LABELS[data.framework] ?? data.framework
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.generatedFeedback)
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
      <h2><Lightbulb style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', width: '20px', height: '20px' }} /> Your Feedback Preparation</h2>

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
        <div className="markdown-output">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.generatedFeedback}</ReactMarkdown>
        </div>
      </div>

      <div className="output-actions">
        <button className="primary" onClick={copyToClipboard}>
          <Copy style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', width: '16px', height: '16px' }} /> Copy to Clipboard
        </button>
      </div>

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
            Send
          </button>
        </form>
      </div>
    </div>
  )
}