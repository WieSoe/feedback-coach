# Feedback Coach

Prepare difficult conversations with confidence.
A free tool for anybody who needs to give critical, constructive, or sensitive feedback, but aren't sure how.

## How to use

1. Open the app
2. Enter your Anthropic API key (free at console.anthropic.com)
3. Choose a framework
4. Describe your situation
5. Get a structured preparation — then refine it in the follow-up chat

## Frameworks included

- SBI — Situation, Behavior, Impact (Center for Creative Leadership)
- NVC — Nonviolent Communication (Marshall B. Rosenberg)
- Asset-oriented Feedback (David Cooperrider)
- Radical Candor (Kim Scott)
- Self-Clarification — understand your own reaction first (based on NVC)

## Features

- **"Defuse my words"** — highlights loaded language in red, suggests neutral alternatives based on NVC principles
- **Feedback History** — last 10 sessions saved in browser, quickly access previous work
- **Follow-up chat** — refine and practice after generation
- **Output in 10 languages** — auto-detected from browser language
- **Reset button** — start fresh without page reload

## Why this exists

I built this as an agile coach turned engineering manager.
I got tired of rewriting the same prompts.

## Feedback & Feature Requests
Have an idea or found a bug? [Open an issue on GitHub](https://github.com/WieSoe/feedback-coach/issues) — I'd love to hear from you!

## Tech stack

- React + Vite
- Claude API (Anthropic)
- Hosted on Vercel

## License

© 2026 Wiebke Söhrens — CC BY-ND 4.0
Use it freely, don't change it, credit me.

---

## Changelog

### v1.1.0

#### New Features
- **"Defuse my words"** — highlights loaded language in red, suggests neutral alternatives based on NVC
- **Feedback History** — last 10 sessions saved in browser
- **Output in 10 languages** — auto-detected from browser
- **Follow-up chat** — refine and practice after generation
- **Reset button** — start fresh without page reload
- **Lucide icons** — replaced all emojis with clean SVG icons

#### Improvements
- Anti-hallucination: Claude no longer invents dates or details
- Markdown tables now render correctly
- Accessibility audit passed
- Consistent icon styling throughout

#### Bug Fixes
- Fixed scroll jump when loading from history
- Fixed defuse flow blocking generation
- Fixed JSON parsing errors
