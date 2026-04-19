import { useEffect, useState } from 'react'
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

export default function FeedbackForm({ onSubmit, loading, initialData }) {
  const [formData, setFormData] = useState({
    framework: 'sbi',
    situationType: 'Feedback to my Report',
    recipient: '',
    topic: '',
    description: '',
    unmetNeed: '',
  })

  const isSelf = formData.framework === 'self'
  const isManagerAboutSomeone = formData.situationType === 'Feedback about someone to their Manager'

  useEffect(() => {
    if (!initialData) return
    setFormData((prev) => ({
      ...prev,
      ...initialData,
    }))
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const recipientOk = isSelf || formData.recipient.trim()
    if (recipientOk && formData.topic.trim() && formData.description.trim()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="feedback-form card">
      <h2>📝 Prepare Your Feedback</h2>

      <form onSubmit={handleSubmit} noValidate>
        {isManagerAboutSomeone ? (
          <div className="self-intro-box">
            This type of feedback requires factual, neutral observations.
            We'll help you structure what you've seen - without interpretation
            or emotion. Stick to specific situations and behaviors.
          </div>
        ) : (
          <div className="form-group">
            <label id="framework-label">Framework</label>
            <div className="framework-pills" role="group" aria-labelledby="framework-label">
              {FRAMEWORKS.map((fw) => (
                <button
                  key={fw.id}
                  type="button"
                  aria-label={`${fw.name}: ${fw.description}`}
                  aria-pressed={formData.framework === fw.id}
                  className={`pill${formData.framework === fw.id ? ' pill-active' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, framework: fw.id }))}
                >
                  {fw.name}
                </button>
              ))}
            </div>
            {(() => {
              const active = FRAMEWORKS.find((fw) => fw.id === formData.framework)
              return active ? (
                <div className="framework-description" aria-live="polite">
                  <strong>{active.name}</strong><br />
                  {active.description}
                  {active.author && <span className="framework-author"> - {active.author}</span>}
                </div>
              ) : null
            })()}
          </div>
        )}

        {isSelf ? (
          <div className="self-intro-box">
            Before talking to someone, let's understand what's going on for you first.
            There are no right or wrong answers here.
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
                placeholder="e.g., John (my report), Team lead, VP Engineering"
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
          <p className="char-counter">{formData.description.length} / 2000 characters</p>
        </div>

        <button type="submit" className="primary" disabled={loading}>
          {loading ? '⏳ Generating...' : '✨ Generate Feedback Preparation'}
        </button>
      </form>
    </div>
  )
}