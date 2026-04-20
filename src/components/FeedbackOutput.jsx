import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Lightbulb, Copy, RotateCcw, MessageSquare, Loader2, AlertTriangle, Brain, Circle, Lock, RefreshCw } from 'lucide-react'
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
  advancedMode = false,
  isDemoMode = false,
  apiKey,
  languageChangedAfterGeneration = false,
}) {
  const isSelf = data.framework === 'self'
  const isManagerReport = data.situationType === 'Feedback about someone to their Manager'
  const isArabic = selectedLanguage === 'العربية'
  const frameworkLabel = FRAMEWORK_LABELS[data.framework] ?? data.framework
  const isWritten = data.outputFormat === 'written'
  const [input, setInput] = useState('')
  const [editableText, setEditableText] = useState(data.generatedFeedback)
  const [scarfAnalysis, setScarfAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [scarfError, setScarfError] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    setEditableText(data.generatedFeedback)
  }, [data.generatedFeedback])

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

  const scarfAnalyseFeedback = async () => {
    if (!apiKey) {
      setScarfError('API key required for SCARF analysis')
      return
    }

    setIsAnalyzing(true)
    setScarfError(null)
    setScarfAnalysis(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const rawText = isWritten ? editableText : data.generatedFeedback
      // Truncate to avoid sending excessively large prompts
      const feedbackText = rawText.slice(0, 4000)

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: `Analyze the following feedback against the SCARF Model. For each of the 5 dimensions (Status, Certainty, Autonomy, Relatedness, Fairness), provide:
1. A score: "green" if the feedback handles this dimension well, "yellow" if there are potential issues, "red" if there are significant concerns
2. A short one-sentence explanation

When analyzing the feedback, treat quoted speech (text in quotation marks) as examples or citations, not as the author's own words or intentions. Only analyze the framing, tone, and approach of the feedback itself.

Return ONLY a valid JSON object with this exact structure:
{
  "Status": { "score": "green|yellow|red", "text": "explanation" },
  "Certainty": { "score": "green|yellow|red", "text": "explanation" },
  "Autonomy": { "score": "green|yellow|red", "text": "explanation" },
  "Relatedness": { "score": "green|yellow|red", "text": "explanation" },
  "Fairness": { "score": "green|yellow|red", "text": "explanation" }
}

Feedback to analyze:
${feedbackText}`,
            },
          ],
        }),
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API Error ${response.status}`)
      }

      const result = await response.json()
      const analysisText = result.content?.[0]?.text

      if (!analysisText) {
        throw new Error('Empty response from API')
      }

      // Parse JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not parse SCARF analysis results')
      }

      const analysis = JSON.parse(jsonMatch[0])

      // Validate all 5 required dimensions exist with expected shape
      const required = ['Status', 'Certainty', 'Autonomy', 'Relatedness', 'Fairness']
      const valid = required.every(
        (d) => analysis[d] && typeof analysis[d].score === 'string' && typeof analysis[d].text === 'string'
      )
      if (!valid) {
        throw new Error('Incomplete SCARF analysis — not all dimensions were returned')
      }

      setScarfAnalysis(analysis)
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        setScarfError('Analysis timed out. Please try again.')
      } else {
        setScarfError(error.message || 'Error analyzing feedback with SCARF model')
      }
    } finally {
      setIsAnalyzing(false)
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

      {languageChangedAfterGeneration && (
        <div style={{
          background: '#fef3c7',
          border: '0.5px solid #d97706',
          borderRadius: '8px',
          padding: '12px 16px',
          marginTop: '8px',
          marginBottom: '16px',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
          fontSize: '13px',
          color: '#92400e',
        }}>
          <RefreshCw size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
          <span>
            To get your preparation in the selected language, just hit <strong>Generate</strong> again.
          </span>
        </div>
      )}

      <>
          <div
            className="output-content"
            dir={isArabic ? 'rtl' : 'ltr'}
            style={{ textAlign: isArabic ? 'right' : 'left' }}
          >
        {isWritten ? (
          <>
            <label htmlFor="written-output-textarea" className="sr-only">Editable written feedback</label>
            <textarea
              id="written-output-textarea"
              ref={textareaRef}
              className="written-output-textarea"
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              maxLength={5000}
              aria-describedby="written-output-limit"
            />
            <p id="written-output-limit" className="char-counter" aria-live="polite">
              {editableText.length} / 5000 characters
            </p>
          </>
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

          <div className="output-actions output-actions--stack">
            <button className="primary output-action-btn" onClick={copyToClipboard}>
              <Copy style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', width: '16px', height: '16px' }} /> Copy to Clipboard
            </button>
          </div>

          {advancedMode && data.framework !== 'self' && (
            <div className="output-secondary-actions">
              <button
                type="button"
                className="secondary output-secondary-btn"
                onClick={scarfAnalyseFeedback}
                disabled={isAnalyzing || isDemoMode}
                aria-label="Analyze feedback with SCARF model"
                aria-busy={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', width: '16px', height: '16px' }} />
                    Analyse with SCARF Model
                  </>
                )}
              </button>
            </div>
          )}

          {advancedMode && data.framework !== 'self' && (
        <>

          {/* aria-live region announces loading and error states to screen readers */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {isAnalyzing ? 'Analyzing feedback with SCARF model…' : ''}
            {scarfError ? `SCARF analysis error: ${scarfError}` : ''}
          </div>

          {scarfError && (
            <div className="scarf-error-box" role="alert">
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{scarfError}</span>
            </div>
          )}

          {scarfAnalysis && (
            <>
              <div className="scarf-info-box">
                <strong>SCARF Model</strong><br />
                The SCARF Model identifies five social triggers that influence how people respond to feedback: Status, Certainty, Autonomy, Relatedness, and Fairness. Understanding these helps you deliver feedback that feels safe rather than threatening.
                <span className="scarf-info-author">- Developed by David Rock, NeuroLeadership Institute</span>
              </div>
              <div className="scarf-results-card" role="region" aria-label="SCARF Model analysis results">
                <h4>SCARF Model Analysis</h4>
                <div className="scarf-dimensions">
                  {['Status', 'Certainty', 'Autonomy', 'Relatedness', 'Fairness'].map((dimension) => {
                    const analysis = scarfAnalysis[dimension]
                    if (!analysis) return null

                    const scoreLabels = {
                      green: 'well handled',
                      yellow: 'potential concern',
                      red: 'significant concern',
                    }
                    
                    const scoreColor = {
                      green: '#16a34a',
                      // #b45309 (amber-700) replaces #ca8a04 — achieves ~4.6:1 on white, passing WCAG AA
                      yellow: '#b45309',
                      red: '#dc2626',
                    }[analysis.score] || '#666'

                    const scoreLabel = scoreLabels[analysis.score] || analysis.score

                    return (
                      <div key={dimension} className="scarf-row">
                        <Circle
                          size={16}
                          aria-label={`${dimension}: ${scoreLabel}`}
                          role="img"
                          style={{
                            fill: scoreColor,
                            color: scoreColor,
                            flexShrink: 0,
                            marginRight: '12px',
                          }}
                        />
                        <div className="scarf-content">
                          <strong>{dimension}</strong>
                          <span>{analysis.text}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}

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

          {!isWritten && advancedMode && (
            isDemoMode ? (
              <div className="chat-section" aria-label="Follow-up chat disabled in demo">
                <h3>🗨️ Refine or Practice</h3>
                <div className="chat-disabled-message">
                  <p><Lock style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', width: '16px', height: '16px' }} /> Add your API key to use the follow-up chat</p>
                </div>
              </div>
            ) : (
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
            )
          )}
      </>
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
  advancedMode: PropTypes.bool,
  isDemoMode: PropTypes.bool,
  apiKey: PropTypes.string.isRequired,
  languageChangedAfterGeneration: PropTypes.bool,
}