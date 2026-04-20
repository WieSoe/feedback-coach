import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { PenLine, Zap, Sparkles, Loader2, MessageSquare, Info } from 'lucide-react'
import '../styles/FeedbackForm.css'

const FRAMEWORKS = [
  {
    id: 'sbi',
    name: 'SBI — Situation, Behavior, Impact',
    description: 'Describe a specific situation, the concrete behavior you observed, and the impact it had. Best for factual, structured feedback.',
    author: 'Developed by the Center for Creative Leadership (CCL)',
  },
  {
    id: 'nvc',
    name: 'NVC — Nonviolent Communication',
    description: 'Focus on observations, feelings, needs, and requests. Best when emotions are involved and empathy is key.',
    author: 'Developed by Marshall B. Rosenberg, psychologist',
  },
  {
    id: 'asset',
    name: 'Asset-oriented Feedback',
    description: "Start from strengths and what's already working. Best for growth conversations and building on potential.",
    author: 'Based on appreciative inquiry by David Cooperrider',
  },
  {
    id: 'radical',
    name: 'Radical Candor',
    description: 'Be direct and honest, while showing you genuinely care about the person. Best when you need to be clear without being harsh.',
    author: 'Developed by Kim Scott, former Google & Apple executive',
  },
  {
    id: 'self',
    name: 'Self-Clarification',
    description: 'Before giving feedback, understand your own reaction first. Why does this actually bother you? What need of yours is unmet?',
    author: 'Based on NVC by Marshall B. Rosenberg',
  },
]

const SITUATION_TYPES = [
  'Feedback to a Peer',
  'Feedback to my Report',
  'Feedback to my Manager',
  'Feedback about someone to their Manager',
  'Feedback for a Team Retrospective',
  'Feedback in a Private Setting',
]

const OUTPUT_LANGUAGES = [
  'English',
  'Deutsch',
  'Español',
  'Français',
  'Italiano',
  'Português',
  'Nederlands',
  'Polish',
  'Русский',
  '中文',
  '日本語',
  'العربية',
]

const ADVANCED_BANNER_DISMISSED_KEY = 'feedback_coach_advanced_banner_dismissed'

export default function FeedbackForm({
  onSubmit,
  loading,
  privacyMode = false,
  advancedMode = false,
  onAdvancedModeChange,
  initialData = null,
  selectedLanguage,
  onLanguageChange,
  onNeutralize,
  onOutputFormatChange,
  onFrameworkChange,
  isDemoMode = false,
}) {
  const [formData, setFormData] = useState({
    framework: 'sbi',
    situationType: 'Feedback to my Report',
    recipient: '',
    topic: '',
    description: '',
    unmetNeed: '',
    outputFormat: 'conversation',
  })
  const [neutralized, setNeutralized] = useState(null)
  const [neutralizingLoading, setNeutralizingLoading] = useState(false)
  const [neutralizeError, setNeutralizeError] = useState(null)
  const [showNeutralizationExplanation, setShowNeutralizationExplanation] = useState(false)
  const [showDefuseRecommendation, setShowDefuseRecommendation] = useState(true)
  const [defuseSkipped, setDefuseSkipped] = useState(false)
  const [defuseCompleted, setDefuseCompleted] = useState(false)
  const [advancedBannerDismissed, setAdvancedBannerDismissed] = useState(() => {
    return localStorage.getItem(ADVANCED_BANNER_DISMISSED_KEY) === 'true'
  })

  const isSelf = formData.framework === 'self'
  const isManagerAboutSomeone = formData.situationType === 'Feedback about someone to their Manager'
  const canGenerateManagerFeedback = defuseSkipped || defuseCompleted

  const BASIC_FRAMEWORK_IDS = ['sbi', 'radical']
  const visibleFrameworks = advancedMode
    ? FRAMEWORKS
    : FRAMEWORKS.filter((fw) => BASIC_FRAMEWORK_IDS.includes(fw.id))

  useEffect(() => {
    if (isManagerAboutSomeone) {
      if (formData.framework !== 'sbi') {
        setFormData((prev) => ({ ...prev, framework: 'sbi' }))
        onFrameworkChange?.('sbi')
      }

      setShowDefuseRecommendation(true)
      setDefuseSkipped(false)
      setDefuseCompleted(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManagerAboutSomeone])

  useEffect(() => {
    if (isSelf && formData.outputFormat !== 'conversation') {
      setFormData((prev) => ({ ...prev, outputFormat: 'conversation' }))
      onOutputFormatChange?.('conversation')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelf])

  useEffect(() => {
    if (!advancedMode) {
      // If unsupported framework selected, reset to sbi
      if (!BASIC_FRAMEWORK_IDS.includes(formData.framework)) {
        setFormData((prev) => ({ ...prev, framework: 'sbi' }))
        onFrameworkChange?.('sbi')
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedMode])

  useEffect(() => {
    if (!initialData) return
    setFormData((prev) => ({
      ...prev,
      ...initialData,
    }))
    setNeutralized(null)
    setNeutralizingLoading(false)
    setNeutralizeError(null)
    setShowNeutralizationExplanation(false)
    setShowDefuseRecommendation(true)
    setDefuseSkipped(false)
    setDefuseCompleted(false)
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNeutralizeClick = async () => {
    setNeutralizingLoading(true)
    setNeutralizeError(null)
    const result = await onNeutralize(formData.description)
    if (result && result.error) {
      setNeutralizeError(result.error)
      setNeutralized(null)
    } else if (result) {
      setNeutralized(result)
      setNeutralizeError(null)
    }
    setNeutralizingLoading(false)
  }

  const handleUseNeutralizedVersion = (neutralized) => {
    setFormData((prev) => ({
      ...prev,
      description: neutralized.neutralizedText || prev.description,
    }))
    setNeutralized(null)
    setNeutralizingLoading(false)
    setDefuseCompleted(true)
    setDefuseSkipped(true)
    setShowDefuseRecommendation(false)
  }

  const handleKeepOriginal = () => {
    setNeutralized(null)
    setNeutralizingLoading(false)
    setDefuseCompleted(true)
    setDefuseSkipped(true)
    setShowDefuseRecommendation(false)
  }

  const renderOriginalWithHighlights = (text, problematicWords) => {
    if (!problematicWords || problematicWords.length === 0) {
      return text
    }

    // Create a regex to find whole words (case-insensitive)
    const wordRegex = new RegExp(
      `\\b(${problematicWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
      'gi'
    )

    const parts = text.split(wordRegex)
    return parts.map((part, idx) => {
      if (problematicWords.some(w => w.toLowerCase() === part?.toLowerCase())) {
        return (
          <span key={idx} className="problematic-word">
            {part}
          </span>
        )
      }
      return part
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const recipientOk = isSelf || formData.recipient.trim()

    if (isManagerAboutSomeone && !canGenerateManagerFeedback) {
      setShowDefuseRecommendation(true)
      return
    }

    if (recipientOk && formData.topic.trim() && formData.description.trim()) {
      setNeutralized(null)
      setNeutralizeError(null)
      onSubmit(formData)
    } else {
      if (!recipientOk) alert('Please enter a recipient.')
      else if (!formData.topic.trim()) alert('Please enter a topic.')
      else if (!formData.description.trim()) alert('Please describe what happened.')
    }
  }

  return (
    <div className="feedback-form card">
      <div className="feedback-form-header">
        <h2 className="feedback-form-title">
          <PenLine width={20} height={20} style={{ flexShrink: 0 }} />
          <span>Prepare Your Feedback</span>
        </h2>
        <button
          type="button"
          className={`advanced-mode-toggle ${advancedMode ? 'toggle-btn-active' : 'toggle-btn-inactive'}`}
          aria-pressed={advancedMode}
          aria-label={advancedMode ? 'Disable Advanced Mode' : 'Enable Advanced Mode'}
          onClick={() => onAdvancedModeChange?.(!advancedMode)}
        >
          <Zap size={16} style={{ flexShrink: 0 }} />
          <span>Advanced</span>
        </button>
      </div>
      {advancedMode && !advancedBannerDismissed && (
        <div className="advanced-mode-banner">
          <span>For experienced communicators and leaders — additional frameworks and tools for nuanced, high-stakes conversations.</span>
          <button
            type="button"
            className="advanced-mode-banner-dismiss"
            aria-label="Dismiss"
            onClick={() => {
              setAdvancedBannerDismissed(true)
              localStorage.setItem(ADVANCED_BANNER_DISMISSED_KEY, 'true')
            }}
          >✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group output-language-group">
          <label htmlFor="outputLanguage">I want my preparation in:</label>
          <select
            id="outputLanguage"
            name="outputLanguage"
            value={selectedLanguage}
            aria-describedby="output-language-hint"
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            {OUTPUT_LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
          <p id="output-language-hint" className="output-language-hint">You can write your input in any language.</p>
        </div>

        {!isSelf && <div className="form-group">
          <label id="output-format-label">What do you need?</label>
          <div className="output-format-pills" role="group" aria-labelledby="output-format-label">
            <button
              type="button"
              className={`output-format-pill${formData.outputFormat === 'conversation' ? ' output-format-pill--active' : ''}`}
              aria-pressed={formData.outputFormat === 'conversation'}
              onClick={() => {
                setFormData((prev) => ({ ...prev, outputFormat: 'conversation' }))
                setDefuseSkipped(false)
                setDefuseCompleted(false)
                setNeutralized(null)
                onOutputFormatChange?.('conversation')
              }}
            >
              <span className="output-format-pill-main">
                <MessageSquare size={16} className="output-format-pill-icon" />
                Conversation guide
              </span>
            </button>
            <button
              type="button"
              className={`output-format-pill${formData.outputFormat === 'written' ? ' output-format-pill--active' : ''}`}
              aria-pressed={formData.outputFormat === 'written'}
              onClick={() => {
                setFormData((prev) => ({ ...prev, outputFormat: 'written' }))
                setDefuseSkipped(false)
                setDefuseCompleted(false)
                setNeutralized(null)
                onOutputFormatChange?.('written')
              }}
            >
              <span className="output-format-pill-main">
                <PenLine size={16} className="output-format-pill-icon" />
                Written feedback
              </span>
            </button>
          </div>
        </div>}

        {isManagerAboutSomeone ? (
          <div className="self-intro-box">
            This type of feedback requires factual, neutral observations.
            We'll help you structure what you've seen — without interpretation
            or emotion. Stick to specific situations and behaviors.

            We use the SBI framework (Situation, Behavior, Impact) for this type
            of feedback — it's the most effective for factual, third-party reporting.
          </div>
        ) : (
          <div className="form-group">
            <label id="framework-label">Framework</label>
            <div className="framework-pills" role="group" aria-labelledby="framework-label">
              {visibleFrameworks.map((fw) => (
                <button
                  key={fw.id}
                  type="button"
                  aria-label={`${fw.name}: ${fw.description}`}
                  aria-pressed={formData.framework === fw.id}
                  className={`pill${formData.framework === fw.id ? ' pill-active' : ''}`}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, framework: fw.id }))
                    onFrameworkChange?.(fw.id)
                  }}
                >
                  {fw.name}
                </button>
              ))}
            </div>
            {(() => {
              const active = FRAMEWORKS.find((fw) => fw.id === formData.framework)
              return active ? (
                !isSelf ? (
                  <div className="framework-description" aria-live="polite">
                    <strong>{active.name}</strong><br />
                    {active.description}
                    {active.author && <span className="framework-author"> - {active.author}</span>}
                  </div>
                ) : null
              ) : null
            })()}
          </div>
        )}

        {isSelf ? (
          <div className="framework-description self-clarification-info-box" role="note" aria-label="Self-clarification guidance">
            <div className="self-clarification-info-content">
              <Info size={18} aria-hidden="true" />
              <div>
                <strong>Self-Clarification</strong><br />
                <p className="self-clarification-info-text">
                  Before giving feedback, understand your own reaction first.
                  Why does this bother you? What need of yours is unmet?
                  Once you know, you can negotiate from interests — not positions.
                </p>
                <p className="framework-author self-clarification-attribution">
                  Based on NVC by Marshall B. Rosenberg &amp; Harvard Negotiation Method
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="situationType">Situation Type</label>
              <select
                id="situationType"
                name="situationType"
                value={formData.situationType}
                onChange={handleChange}
              >
                {SITUATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="recipient">
                {isManagerAboutSomeone ? 'Who is this about?' : 'Who is this for?'}
              </label>
              <input
                id="recipient"
                type="text"
                name="recipient"
                value={formData.recipient}
                onChange={handleChange}
                maxLength={500}
                placeholder="e.g., John (my report), team lead, colleague"
                autoComplete="off"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="topic">{isSelf ? 'What is bothering you?' : 'Topic / Main Issue'}</label>
          <input
            id="topic"
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            maxLength={500}
            placeholder={isSelf ? 'e.g., A colleague interrupted me, I felt dismissed in a meeting...' : 'e.g., Code quality, Communication, Deadline missed'}
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">{isSelf ? 'Describe the situation — no filter needed' : 'What happened? (Your perspective)'}</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={2000}
            placeholder={
              isSelf
                ? "Write freely. No judgment here. You can even say 'he's being an asshole' - we'll help you find what's really going on."
                : isManagerAboutSomeone
                  ? 'Describe what you observed - specific situations, dates, behaviors. Avoid interpretations or emotions.'
                  : 'Describe the situation, behavior, or concern. Be specific and factual.'
            }
          />
          
          {isManagerAboutSomeone && (
            <>
              <button
                type="button"
                className={`neutralize-button${isManagerAboutSomeone ? ' neutralize-button-prominent' : ''}`}
                onClick={handleNeutralizeClick}
                disabled={neutralizingLoading}
              >
                {neutralizingLoading ? (
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
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', width: '16px', height: '16px' }} />
                    Defuse my language
                  </>
                )}
              </button>
              
              <div className="neutralization-explanation-wrapper">
                <button
                  type="button"
                  className="why-toggle-link"
                  onClick={() => setShowNeutralizationExplanation(!showNeutralizationExplanation)}
                >
                  {showNeutralizationExplanation ? '▼' : '▶'} Why?
                </button>
                
                {showNeutralizationExplanation && (
                  <div className="neutralization-explanation">
                    <p><strong>Why defuse your language?</strong></p>
                    <p>When we're emotionally charged, our descriptions often contain evaluative or loaded language - words like 'always', 'never', 'unprofessional', or stronger labels.</p>
                    <p>Even if Claude neutralizes your feedback in the output, understanding your own language patterns is valuable:</p>
                    <p>→ You learn to distinguish observations from judgments<br />
                    → You become more aware of your emotional triggers<br />
                    → You build a habit of factual, neutral communication<br />
                    → Next time, you'll write it neutrally from the start</p>
                    <p>This is also a learning tool - not just a text cleaner.<br />
                    <em>Based on Nonviolent Communication by Marshall B. Rosenberg.</em></p>
                  </div>
                )}
              </div>
            </>
          )}

          {neutralizeError && (
            <div className="neutralize-error">
              <p>{neutralizeError}</p>
            </div>
          )}

          {neutralized && (
            <div className="neutralized-suggestion">
              <div className="neutralized-label">Original</div>
              <div className="neutralized-original">
                {renderOriginalWithHighlights(formData.description, neutralized.problematicWords)}
              </div>

              <div className="neutralized-divider"></div>

              <div className="neutralized-label neutralized-label-success">Neutralized</div>
              <div className="neutralized-positive">
                {neutralized.neutralizedText}
              </div>

              {neutralized.explanation && (
                <>
                  <div className="neutralized-divider"></div>
                  <div className="neutralized-label">What changed</div>
                  <p className="neutralized-explanation-text">{neutralized.explanation}</p>
                </>
              )}

              <div className="neutralized-actions">
                <button
                  type="button"
                  className="secondary-small"
                  onClick={() => handleUseNeutralizedVersion(neutralized)}
                >
                  ✓ Use this version
                </button>
                <button
                  type="button"
                  className="secondary-small-outline"
                  onClick={handleKeepOriginal}
                >
                  Keep my original
                </button>
              </div>
            </div>
          )}

          <p className="char-counter">{formData.description.length} / 2000 characters</p>
        </div>

        {isManagerAboutSomeone && showDefuseRecommendation && (
          <div className="defuse-recommendation-note">
            <p>
              We recommend defusing your language before generating. This helps ensure your feedback is factual and neutral.
            </p>
            <button
              type="button"
              className="defuse-recommendation-skip"
              onClick={() => {
                setDefuseSkipped(true)
                setShowDefuseRecommendation(false)
              }}
            >
              Skip
            </button>
          </div>
        )}

          <button type="submit" className="primary" disabled={loading || (isManagerAboutSomeone && !canGenerateManagerFeedback)}>
            {loading ? (
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
                Generating...
              </>
            ) : <>
              <Sparkles style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', width: '16px', height: '16px' }} />
              {isDemoMode ? 'Regenerate demo' : 'Generate Feedback Preparation'}
            </>}
        </button>
        {privacyMode && (
          <p className="privacy-session-reminder">Privacy mode is on — this session will not be saved.</p>
        )}
      </form>
    </div>
  )
}

FeedbackForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  privacyMode: PropTypes.bool,
  advancedMode: PropTypes.bool,
  onAdvancedModeChange: PropTypes.func,
  initialData: PropTypes.shape({
    framework: PropTypes.string,
    situationType: PropTypes.string,
    recipient: PropTypes.string,
    topic: PropTypes.string,
    description: PropTypes.string,
    unmetNeed: PropTypes.string,
    outputFormat: PropTypes.oneOf(['conversation', 'written']),
    outputLanguage: PropTypes.string,
  }),
  selectedLanguage: PropTypes.string.isRequired,
  onLanguageChange: PropTypes.func.isRequired,
  onNeutralize: PropTypes.func.isRequired,
  onOutputFormatChange: PropTypes.func,
  onFrameworkChange: PropTypes.func,
  isDemoMode: PropTypes.bool,
}