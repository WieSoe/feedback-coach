import { useState } from 'react'
import FeedbackForm from './components/FeedbackForm'
import FeedbackOutput from './components/FeedbackOutput'
import ApiKeySetup from './components/ApiKeySetup'
import './App.css'

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('anthropic_api_key') || '')
  const [feedbackData, setFeedbackData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleApiKeySubmit = (key) => {
    setApiKey(key)
    localStorage.setItem('anthropic_api_key', key)
  }

  const handleGenerateFeedback = async (formData) => {
    if (!apiKey) {
      alert('Please set your API key first')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1500,
          messages: [
            {
              role: 'user',
              content: generatePrompt(formData),
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.content[0].text

      setFeedbackData({
        ...formData,
        generatedFeedback: content,
      })
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>💬 Feedback Coach</h1>
        <p>Prepare difficult conversations with confidence</p>
      </header>

      {!apiKey ? (
        <ApiKeySetup onSubmit={handleApiKeySubmit} />
      ) : (
        <div className="app-container">
          <FeedbackForm onSubmit={handleGenerateFeedback} loading={loading} />
          {feedbackData && <FeedbackOutput data={feedbackData} />}
        </div>
      )}
    </div>
  )
}

function generatePrompt(formData) {
  return `You are an experienced executive coach specializing in difficult conversations and feedback.

A user wants to prepare feedback using the "${formData.framework}" framework.

Context:
- Situation Type: ${formData.situationType}
- Recipient: ${formData.recipient}
- Topic: ${formData.topic}
- Your Description: ${formData.description}

Please provide a structured feedback preparation using the ${formData.framework} framework. Include:

1. **Opening Line**: How to start the conversation
2. **Core Message**: The main feedback structured according to the framework
3. **Potential Reactions**: What the recipient might say/feel
4. **Closing**: How to end constructively

Make it practical, empathetic, but honest. Keep it concise and actionable.`
}