# Feedback Coach

![Version](https://img.shields.io/badge/version-v3.1.0-blue)
![Live](https://img.shields.io/badge/live-vercel-brightgreen)
![License](https://img.shields.io/badge/license-CC%20BY--ND%204.0-lightgrey)

Prepare difficult conversations with confidence — 
as a structured talk or as written feedback, ready to send.

**[Try the live demo — no API key required](https://feedback-coach-beta.vercel.app)**

## 🤖 Use as a Claude Project (no API key needed)

You can use Feedback Coach directly in Claude.ai as a Project — no app, no API key required.

👉 [See setup instructions](CLAUDE_PROJECT.md)

## What it does

Feedback Coach helps engineers, managers, and leaders prepare 
difficult feedback conversations using proven frameworks. 
Choose between a conversation guide or written feedback 
(email, Slack, performance review), pick your framework, 
describe the situation — and get a structured preparation in seconds.

Try a demo first — no API key required. Once you're ready, add your API key to generate your own feedback preparation.

## How to use

1. Open the app: https://feedback-coach-beta.vercel.app
2. Enter your Anthropic API key (free at console.anthropic.com)
3. Choose your output format: Conversation Guide or Written Feedback
4. Select a framework
5. Describe your situation
6. Get your preparation — then refine it in the follow-up chat

## Frameworks

### Basic
- **SBI — Situation, Behavior, Impact** (Center for Creative Leadership)
- **Radical Candor** (Kim Scott)

### Advanced Mode
- **NVC — Nonviolent Communication** (Marshall B. Rosenberg)
- **Asset-oriented Feedback** (David Cooperrider)
- **Self-Clarification** — understand your own reaction first (based on NVC)

## Features

- **Demo Mode** — explore the app with example outputs before entering your API key
- **Conversation Guide or Written Feedback** — choose your output format
- **Advanced Mode** — unlock additional frameworks and tools for nuanced conversations
- **Dark Mode** — automatically adapts to your OS/browser dark mode setting (prefers-color-scheme)
- **SCARF Model Analysis** — analyse your generated feedback against the 5 SCARF dimensions (Advanced Mode only)
- **"Defuse my words"** — highlights loaded language in red, suggests neutral alternatives based on NVC principles
- **Feedback History** — last 10 sessions saved in browser, quickly access previous work
- **Privacy Mode** — prevent sessions from being saved to history
- **Output in 10 languages** — auto-detected from browser language
- **Language change notice** — clear prompt to regenerate when output language is changed
- **Follow-up chat** — refine and practice after generation
- **Reset button** — start fresh without page reload

## Why this exists

I built this as an agile coach turned engineering manager.
I got tired of rewriting the same prompts every time someone asked:
"I need to give difficult feedback — help me do it."

## Tech stack

- React + Vite
- Claude API (Anthropic)
- Hosted on Vercel
- Lucide React icons

## Feedback & Feature Requests

Have an idea or found a bug? 
[Open an issue on GitHub](https://github.com/WieSoe/feedback-coach/issues)

## License

© 2026 Wiebke Söhrens — CC BY-ND 4.0  
Use it freely, don't change it, credit me.

If this eased a difficult conversation for you — 
[buy me a coffee ☕](https://buymeacoffee.com/wiesoe)
