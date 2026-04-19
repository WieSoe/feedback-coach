import { useState } from 'react'
import FeedbackForm from './components/FeedbackForm'
import FeedbackOutput from './components/FeedbackOutput'
import FeedbackHistory from './components/FeedbackHistory'
import ApiKeySetup from './components/ApiKeySetup'
import './App.css'

const HISTORY_STORAGE_KEY = 'feedback_history'
const OUTPUT_LANGUAGE_STORAGE_KEY = 'feedback_output_language'

const LANGUAGE_MAP = {
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  pt: 'Português',
  nl: 'Nederlands',
  pl: 'Polish',
  zh: '中文',
  ja: '日本語',
}

const SUPPORTED_OUTPUT_LANGUAGES = [
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

const sanitizeOutputLanguage = (language) => {
  if (typeof language !== 'string') return 'English'
  return SUPPORTED_OUTPUT_LANGUAGES.includes(language) ? language : 'English'
}

const loadHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveHistory = (history) => {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
}

const detectBrowserLanguage = () => {
  if (typeof navigator === 'undefined' || !navigator.language) {
    return 'English'
  }

  const primary = navigator.language.toLowerCase().split('-')[0]
  return sanitizeOutputLanguage(LANGUAGE_MAP[primary] || 'English')
}

const DEFAULT_FORM_DATA = {
  framework: 'sbi',
  situationType: 'Feedback to my Report',
  recipient: '',
  topic: '',
  description: '',
  unmetNeed: '',
}

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('anthropic_api_key') || '')
  const [feedbackData, setFeedbackData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const [feedbackHistory, setFeedbackHistory] = useState(loadHistory)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [formInitialData, setFormInitialData] = useState(null)
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const saved = localStorage.getItem(OUTPUT_LANGUAGE_STORAGE_KEY)
    return sanitizeOutputLanguage(saved || detectBrowserLanguage())
  })

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
              content: generatePrompt(formData, selectedLanguage),
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

      const now = Date.now()
      const historyEntry = {
        id: now,
        date: new Date(now).toLocaleString([], {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        framework: formData.framework,
        recipient: formData.framework === 'self' ? 'Myself' : formData.recipient,
        topic: formData.topic,
        generatedFeedback: content,
        situationType: formData.situationType,
        description: formData.description,
      }

      setFeedbackHistory((prev) => {
        const next = [historyEntry, ...prev].slice(0, 10)
        saveHistory(next)
        return next
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

  const handleLoadHistoryEntry = (entry) => {
    setFeedbackData({
      framework: entry.framework,
      recipient: entry.recipient === 'Myself' ? '' : entry.recipient,
      topic: entry.topic,
      generatedFeedback: entry.generatedFeedback,
      situationType: entry.situationType || 'Feedback to my Report',
      description: entry.description || '',
    })
    setFormInitialData({
      framework: entry.framework,
      recipient: entry.recipient === 'Myself' ? '' : entry.recipient,
      topic: entry.topic,
      situationType: entry.situationType || 'Feedback to my Report',
      description: entry.description || '',
    })
    setChatHistory([])
  }

  const handleDeleteHistoryEntry = (id) => {
    setFeedbackHistory((prev) => {
      const next = prev.filter((entry) => entry.id !== id)
      saveHistory(next)
      return next
    })
  }

  const handleClearHistory = () => {
    setFeedbackHistory([])
    saveHistory([])
  }

  const handleReset = () => {
    setFeedbackData(null)
    setChatHistory([])
    setChatLoading(false)
    setFormInitialData({ ...DEFAULT_FORM_DATA })
  }

  const handleLanguageChange = (language) => {
    const safeLanguage = sanitizeOutputLanguage(language)
    setSelectedLanguage(safeLanguage)
    localStorage.setItem(OUTPUT_LANGUAGE_STORAGE_KEY, safeLanguage)
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
          <div className="left-column">
            <FeedbackHistory
              entries={feedbackHistory}
              isOpen={historyOpen}
              onToggle={() => setHistoryOpen((prev) => !prev)}
              onLoad={handleLoadHistoryEntry}
              onDelete={handleDeleteHistoryEntry}
              onClearAll={handleClearHistory}
            />
            <FeedbackForm
              onSubmit={handleGenerateFeedback}
              loading={loading}
              initialData={formInitialData}
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
            />
          </div>
          {feedbackData && (
            <FeedbackOutput
              data={feedbackData}
              chatHistory={chatHistory}
              chatLoading={chatLoading}
              onFollowUp={handleFollowUp}
              onReset={handleReset}
            />
          )}
        </div>
      )}

      <footer className="app-footer">
        <p>Built by Wiebke Söhrens</p>
        <p>© 2026 · Use it freely, don't change it, credit me · CC BY-ND 4.0</p>
        <p>This app uses Vercel Analytics to count page visits — no cookies, no personal data.</p>
        <p>
          <a
            className="app-footer-link"
            href="https://github.com/WieSoe/feedback-coach"
            target="_blank"
            rel="noreferrer"
          >
            Source on GitHub
          </a>
        </p>
        <p>
          <a
            className="app-footer-link"
            href="https://buymeacoffee.com/wiesoe"
            target="_blank"
            rel="noreferrer"
          >
            If this eased a difficult conversation for you — buy me a coffee ☕
          </a>
        </p>
      </footer>
    </div>
  )
}

function generatePrompt(formData, selectedLanguage) {
  const safeLanguage = sanitizeOutputLanguage(selectedLanguage)

  if (formData.framework === 'self') {
    return `You are an empathetic NVC coach. The user is frustrated and trying to understand their own reaction before having a difficult conversation.

Their input: ${formData.description}

Your task:
1. Reflect back what you heard WITHOUT judgment
2. Identify 2-3 possible FEELINGS behind their reaction (from NVC feelings inventory)
3. Identify 2-3 possible unmet NEEDS (from NVC needs inventory, e.g. respect, clarity, collaboration, autonomy, recognition)
4. Suggest one gentle opening sentence they could use in a conversation, starting from their need — NOT from blame

IMPORTANT: Only use information explicitly provided by the user.
Do NOT invent, assume, or hallucinate specific details such as dates,
times, names, frequencies, or situations that were not mentioned.
If details are missing, use placeholders like [specific date] or
[specific situation] instead.

Please respond entirely in ${safeLanguage}.

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

IMPORTANT: Only use information explicitly provided by the user.
Do NOT invent, assume, or hallucinate specific details such as dates,
times, names, frequencies, or situations that were not mentioned.
If details are missing, use placeholders like [specific date] or
[specific situation] instead.

Please respond entirely in ${safeLanguage}.

Make it practical, empathetic, but honest. Keep it concise and actionable.`
}