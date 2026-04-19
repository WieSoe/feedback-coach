import { useState } from 'react'
import PropTypes from 'prop-types'
import { Sparkles, Eye } from 'lucide-react'
import '../styles/ApiKeySetup.css'

export default function ApiKeySetup({ onSubmit, onDemoMode }) {
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
      <div className="api-setup-header">
        <h2 className="api-setup-heading" tabIndex={-1}>Set up your API key</h2>
        <p className="subtitle">
          Enter your Anthropic API key to get started. Your key stays in your browser and is never sent to our servers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="api-setup-form">
        <div className="api-key-context">
          <h3>Why do I need an API key?</h3>
          <p>
            Feedback Coach uses Claude AI to generate your feedback preparation.
            Instead of routing your situation through our servers, you connect
            directly to Anthropic — which means your data stays private,
            and you only pay for what you use (a few cents per session).
          </p>
          <p className="api-key-context-lead">Getting your key takes 2 minutes:</p>
          <ol>
            <li>
              Go to{' '}
              <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">
                console.anthropic.com
              </a>
            </li>
            <li>Create a free account</li>
            <li>Go to API Keys → Create Key</li>
            <li>Paste it below</li>
          </ol>
        </div>

        <div className="form-group">
          <label htmlFor="api-key">Anthropic API Key</label>
          <div className="key-input-wrapper">
            <input
              id="api-key"
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              maxLength={500}
              placeholder="sk-ant-..."
              autoComplete="off"
              aria-describedby="api-key-help api-key-warning"
              required
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowKey(!showKey)}
              aria-label={showKey ? 'Hide API key' : 'Show API key'}
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <p id="api-key-help" className="api-key-help">
            Don't have an API key?{' '}
            <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">
              Get one here
            </a>
          </p>
          <p id="api-key-warning" className="api-key-warning">
            Your key is stored locally in your browser. Avoid using on shared or public computers.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button type="submit" className="primary" style={{ width: 'auto' }}>
            <Sparkles size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', width: '16px', height: '16px' }} />
            Start Using Feedback Coach
          </button>
        </div>
      </form>

      <div className="demo-mode-section">
        <button
          type="button"
          className="secondary"
          onClick={() => onDemoMode?.()}
          aria-label="Enter demo mode to see how it works"
        >
          <Eye size={16} style={{ flexShrink: 0 }} />
          <span>See how it works first</span>
        </button>
      </div>

      <div className="info-box">
        <h3>How it works</h3>
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

ApiKeySetup.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onDemoMode: PropTypes.func,
}