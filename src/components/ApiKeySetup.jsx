import { useState } from 'react'
import '../styles/ApiKeySetup.css'

export default function ApiKeySetup({ onSubmit }) {
  const [key, setKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (key.trim()) {
      onSubmit(key)
    }
  }

  return (
    <div className="api-setup card">
      <h2>🔑 API Key Setup</h2>
      <p className="subtitle">
        Enter your Anthropic API key to get started. Your key is stored locally in your browser and never sent to our servers.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="api-key">Anthropic API Key</label>
          <div className="key-input-wrapper">
            <input
              id="api-key"
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-ant-..."
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? '👁️' : '🙈'}
            </button>
          </div>
          <small>
            Don't have an API key?{' '}
            <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">
              Get one here
            </a>
          </small>
        </div>

        <button type="submit" className="primary">
          Start Using Feedback Coach
        </button>
      </form>

      <div className="info-box">
        <h3>ℹ️ How it works</h3>
        <ul>
          <li>Your API key is stored only in your browser's local storage</li>
          <li>All API calls go directly to Anthropic's servers</li>
          <li>We don't store any of your feedback data</li>
          <li>You pay only for the API calls you make</li>
        </ul>
      </div>
    </div>
  )
}