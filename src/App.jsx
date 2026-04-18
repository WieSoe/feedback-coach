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
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
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
        const errorBody = await response.text()
        const apiError = new Error(`API Error ${response.status}: ${response.statusText}`)
        apiError.status = response.status
        apiError.body = errorBody
        throw apiError
      }

      const data = await response.json()
      const content = data.content[0].text

      setFeedbackData({
        ...formData,
        generatedFeedback: content,
      })
    } catch (error) {
      console.error('Anthropic API request failed:', error)

      if (error.status) {
        alert(`Error ${error.status}: ${error.body || error.message}`)
      } else {
        alert(`Error: ${error.message}`)
      }
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