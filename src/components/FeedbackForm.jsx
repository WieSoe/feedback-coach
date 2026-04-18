import { useState } from 'react'
import '../styles/FeedbackForm.css'

const FRAMEWORKS = [
  { id: 'sbi', name: 'SBI (Situation-Behavior-Impact)', description: 'Structured, fact-based approach' },
  { id: 'gfk', name: 'GFK (Nonviolent Communication)', description: 'Empathetic, needs-focused' },
  { id: 'asset', name: 'Asset-Oriented', description: 'Strength-based, appreciative' },
  { id: 'radical', name: 'Radical Candor', description: 'Direct, caring personally' },
]

const SITUATION_TYPES = [
  'Critical feedback to report',
  'Peer feedback',
  'Upward feedback to manager/VP',
  'Team dynamic issue',
  'Performance concern',
  'Behavioral feedback',
  'Project/work quality feedback',
]

export default function FeedbackForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    framework: 'sbi',
    situationType: 'Critical feedback to report',
    recipient: '',
    topic: '',
    description: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.recipient.trim() && formData.topic.trim() && formData.description.trim()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="feedback-form card">
      <h2>📝 Prepare Your Feedback</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="framework">Framework</label>
          <select
            id="framework"
            name="framework"
            value={formData.framework}
            onChange={handleChange}
          >
            {FRAMEWORKS.map((fw) => (
              <option key={fw.id} value={fw.id}>
                {fw.name}
              </option>
            ))}
          </select>
          <small>
            {FRAMEWORKS.find((fw) => fw.id === formData.framework)?.description}
          </small>
        </div>

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
          <label htmlFor="recipient">Who is this for?</label>
          <input
            id="recipient"
            type="text"
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            placeholder="e.g., John (my report), Team lead, VP Engineering"
          />
        </div>

        <div className="form-group">
          <label htmlFor="topic">Topic / Main Issue</label>
          <input
            id="topic"
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            placeholder="e.g., Code quality, Communication, Deadline missed"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">What happened? (Your perspective)</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the situation, behavior, or concern. Be specific and factual."
          />
        </div>

        <button type="submit" className="primary" disabled={loading}>
          {loading ? '⏳ Generating...' : '✨ Generate Feedback Preparation'}
        </button>
      </form>
    </div>
  )
}