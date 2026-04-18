import '../styles/FeedbackOutput.css'

export default function FeedbackOutput({ data }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.generatedFeedback)
    alert('Copied to clipboard!')
  }

  return (
    <div className="feedback-output card">
      <h2>💡 Your Feedback Preparation</h2>

      <div className="output-meta">
        <p><strong>Framework:</strong> {data.framework.toUpperCase()}</p>
        <p><strong>For:</strong> {data.recipient}</p>
        <p><strong>Topic:</strong> {data.topic}</p>
      </div>

      <div className="output-content">
        <div className="markdown-output">
          {data.generatedFeedback.split('\n').map((line, idx) => (
            <p key={idx}>{line || <br />}</p>
          ))}
        </div>
      </div>

      <div className="output-actions">
        <button className="primary" onClick={copyToClipboard}>
          📋 Copy to Clipboard
        </button>
      </div>

      <div className="tips-box">
        <h4>💬 Tips for the Conversation</h4>
        <ul>
          <li>Practice the opening line out loud</li>
          <li>Listen more than you talk</li>
          <li>Ask clarifying questions</li>
          <li>Focus on behavior, not person</li>
          <li>End with clear next steps</li>
        </ul>
      </div>
    </div>
  )
}