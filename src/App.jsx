import { useState } from 'react'
import FeedbackForm from './components/FeedbackForm'
import FeedbackOutput from './components/FeedbackOutput'
import ApiKeySetup from './components/ApiKeySetup'
import './App.css'

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('anthropic_api_key') || '')
  const [feedbackData, setFeedbackData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [chatLoading, setChatLoading] = useState(false)

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
      setChatHistory([])
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

  const handleFollowUp = async (userMessage) => {
    if (!apiKey || !feedbackData) return

    const updatedHistory = [...chatHistory, { role: 'user', content: userMessage }]
    setChatHistory(updatedHistory)
    setChatLoading(true)

    const systemMessage = `You are a feedback coach. The user just prepared feedback using the ${feedbackData.framework} framework. Here is the preparation you generated:\n\n${feedbackData.generatedFeedback}\n\nNow help them refine, practice, or think through their conversation. Be concise and practical.`

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
          max_tokens: 1000,
          system: systemMessage,
          messages: updatedHistory,
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
      const reply = data.content[0].text
      setChatHistory([...updatedHistory, { role: 'assistant', content: reply }])
    } catch (error) {
      console.error('Follow-up request failed:', error)
      alert(`Error: ${error.body || error.message}`)
      setChatHistory(chatHistory) // revert on error
    } finally {
      setChatLoading(false)
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
          {feedbackData && (
            <FeedbackOutput
              data={feedbackData}
              chatHistory={chatHistory}
              chatLoading={chatLoading}
              onFollowUp={handleFollowUp}
            />
          )}
        </div>
      )}
    </div>
  )
}

function generatePrompt(formData) {
  if (formData.framework === 'self') {
    return `You are an empathetic NVC coach. The user is frustrated and trying to understand their own reaction before having a difficult conversation.

Their input: ${formData.description}

Your task:
1. Reflect back what you heard WITHOUT judgment
2. Identify 2-3 possible FEELINGS behind their reaction (from NVC feelings inventory)
3. Identify 2-3 possible unmet NEEDS (from NVC needs inventory, e.g. respect, clarity, collaboration, autonomy, recognition)
4. Suggest one gentle opening sentence they could use in a conversation, starting from their need — NOT from blame

Be warm, non-judgmental, and concise.`
  }

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