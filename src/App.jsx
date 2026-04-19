import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import FeedbackForm from './components/FeedbackForm'
import FeedbackOutput from './components/FeedbackOutput'
import FeedbackHistory from './components/FeedbackHistory'
import ApiKeySetup from './components/ApiKeySetup'
import './App.css'

// Add a ref to track if neutralize is in progress
let neutralizeAbortController = null

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

  const handleNeutralize = async (description) => {
    if (!apiKey) {
      alert('Please set your API key first')
      return null
    }

    // Cancel any previous neutralize request
    if (neutralizeAbortController) {
      neutralizeAbortController.abort()
    }
    neutralizeAbortController = new AbortController()
    const timeoutId = setTimeout(() => neutralizeAbortController.abort(), 15000)

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
          messages: [
            {
              role: 'user',
              content: `You are an NVC coach. Neutralize ONLY the evaluative, emotional, or loaded words — keep all factual observations intact.

Original text: ${description}

Rules:
- Remove or replace ONLY words that are judgments, evaluations, or assumptions
- Keep all observable facts and specific behaviors
- The neutralized version should be similar in length to the original
- Do NOT simplify or summarize — just replace loaded words

Example:
Original: "He constantly interrupts female colleagues in a rude way"
Good: "He interrupts female colleagues during meetings"
Bad: "He speaks while others are speaking" (too simplified)

Please respond with ONLY valid JSON (no markdown, no extra text), exactly in this format:
{
  "problematic_words": ["word1", "word2", "word3"],
  "neutralized_text": "the rewritten text with neutral language",
  "explanation": "brief explanation of changes"
}`,
            },
          ],
        }),
        signal: neutralizeAbortController.signal,
      })

      clearTimeout(timeoutId)

      // Handle different HTTP error statuses
      if (!response.ok) {
        const errorBody = await response.text()
        let errorMessage = 'Something went wrong. Please try again.'

        if (response.status === 401) {
          errorMessage = 'Your API key seems invalid. Check your key in the settings.'
          console.error('[Neutralize - 401 Unauthorized]', {
            status: response.status,
            statusText: response.statusText,
            body: errorBody,
            timestamp: new Date().toISOString(),
          })
        } else if (response.status === 429) {
          errorMessage = 'Too many requests. Wait a moment and try again.'
          console.error('[Neutralize - 429 Rate Limited]', {
            status: response.status,
            statusText: response.statusText,
            body: errorBody,
            timestamp: new Date().toISOString(),
          })
        } else {
          // For other errors, try to extract error message from body
          try {
            const errorJson = JSON.parse(errorBody)
            if (errorJson.error?.message) {
              errorMessage = errorJson.error.message
            }
          } catch {
            // If not JSON, use status text
            errorMessage = `API Error ${response.status}: ${response.statusText}`
          }
          console.error('[Neutralize - API Error]', {
            status: response.status,
            statusText: response.statusText,
            body: errorBody,
            timestamp: new Date().toISOString(),
          })
        }

        return { error: errorMessage }
      }

      const data = await response.json()
      const responseText = data.content[0].text

      try {
        // Strip markdown code fences if present
        const cleanJson = responseText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()
        
        // Parse JSON response
        const parsed = JSON.parse(cleanJson)
        return {
          problematicWords: parsed.problematic_words || [],
          neutralizedText: parsed.neutralized_text || '',
          explanation: parsed.explanation || '',
        }
      } catch (parseError) {
        console.error('[Neutralize - JSON Parse Error]', {
          error: parseError.message,
          responseText: responseText,
          timestamp: new Date().toISOString(),
        })
        return { error: 'Something went wrong with the analysis. Please try again.' }
      }
    } catch (error) {
      clearTimeout(timeoutId)

      let errorMessage = 'Something went wrong. Please try again.'

      // Handle timeout
      if (error.name === 'AbortError') {
        errorMessage = 'Analysis is taking too long. Try with a shorter text.'
        console.error('[Neutralize - Timeout (>15s)]', {
          error: error.message,
          timestamp: new Date().toISOString(),
        })
      }
      // Handle network errors
      else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = 'Could not reach the API. Check your internet connection.'
        console.error('[Neutralize - Network Error]', {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        })
      }
      // Handle other errors
      else {
        console.error('[Neutralize - Unexpected Error]', {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        })
      }

      return { error: errorMessage }
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
      <header className="app-header card">
        <h1 className="app-header-title">
          <MessageSquare width={28} height={28} />
          <span>Feedback Coach</span>
        </h1>
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
              onNeutralize={handleNeutralize}
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