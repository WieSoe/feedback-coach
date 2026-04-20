# SCARF Model Analysis — Manual Test Cases

## SCARF Button Visibility

- [ ] **Advanced Mode ON, non-Self-Clarification framework**: Button "Analyse with SCARF Model" is visible
- [ ] **Advanced Mode OFF (Basic Mode)**: Button is NOT visible (component renders without advancedMode prop defaulting to false)
- [ ] **Advanced Mode ON, Self-Clarification framework selected**: Button is NOT visible (data.framework === 'self')
- [ ] **Before feedback has been generated**: Button is NOT visible (FeedbackOutput not yet mounted / no data.generatedFeedback)

## SCARF Analysis — Happy Path

- [ ] Clicking "Analyse with SCARF Model" triggers a POST to https://api.anthropic.com/v1/messages
  - Request body includes the generated feedback text (or editableText for written format)
  - Request body includes the SCARF system prompt
  - Request body uses model: 'claude-sonnet-4-5'
- [ ] While the API call is in flight:
  - Button shows "Analyzing..." with spinner icon
  - Button is disabled (aria-busy="true")
  - Screen reader announces "Analyzing feedback with SCARF model…" via aria-live region
- [ ] After successful response:
  - Results card renders with heading "SCARF Model Analysis"
  - Exactly 5 dimension rows: Status, Certainty, Autonomy, Relatedness, Fairness
  - Each row shows a colored circle and explanation text
  - Colored circles: green (#16a34a), amber (#b45309), red (#dc2626)
  - Circle aria-label conveys meaning: e.g. "Status: well handled"
  - SCARF info box is visible above the results card
- [ ] Quoted speech in feedback is treated as examples (not misinterpreted as author intent)
  - Test: feedback containing `"he's being difficult"` → Claude should assess framing, not the quote

## SCARF Analysis — Error Handling

- [ ] **Malformed JSON from Claude** (e.g., Claude returns prose instead of JSON):
  - Inline error box shown with message "Could not parse SCARF analysis results"
  - Screen reader announces error via aria-live region
  - No crash / no alert() shown
  - Results card NOT rendered
- [ ] **Network error** (fetch throws):
  - Inline error box shown with error message
  - setIsAnalyzing(false) called in finally block → spinner stops
- [ ] **API timeout (> 15 seconds)**:
  - AbortController cancels the fetch
  - Inline error box shows "Analysis timed out. Please try again."
  - setIsAnalyzing(false) called → spinner stops
- [ ] **Incomplete JSON** (Claude returns only 3/5 dimensions):
  - Throws "Incomplete SCARF analysis — not all dimensions were returned"
  - Inline error box shown
  - scarfAnalysis NOT set → no partial results card rendered
- [ ] **Empty API response** (result.content[0].text is missing):
  - Throws "Empty response from API"
  - Inline error box shown
- [ ] **No API key**: Error box "API key required for SCARF analysis" shown without making a fetch call

## UI

- [ ] SCARF info box appears ABOVE the results card (rendered before .scarf-results-card in DOM)
- [ ] "Analyse with SCARF Model" button is the same width as "Copy to Clipboard" button
  - Both should have flex: 1 in a flex parent (.output-actions / .scarf-button-section)
- [ ] Button has a visible focus ring when tabbed to (focus-visible outline)
- [ ] Button hover state is blue (not grey) — .secondary:hover applies .primary-like blue tint

## Accessibility

- [ ] axe-core reports 0 violations on the output panel with SCARF results visible
- [ ] Each Circle icon has role="img" and aria-label="<Dimension>: <score label>"
  - e.g. aria-label="Status: well handled"
  - e.g. aria-label="Certainty: potential concern"
  - e.g. aria-label="Fairness: significant concern"
- [ ] aria-live="polite" region announces loading and error transitions to screen readers
- [ ] SCARF results card has role="region" and aria-label="SCARF Model analysis results"
- [ ] Color contrast ≥ 3:1 for all UI component colors against white:
  - Green #16a34a: ~6.4:1 ✓
  - Amber #b45309: ~4.6:1 ✓ (replaces #ca8a04 which was ~2.8:1 ✗)
  - Red  #dc2626: ~5.7:1 ✓

## Security

- [ ] API key is sent in request header ONLY — not logged, not included in response rendering
- [ ] Feedback text is truncated to 4000 chars before being sent to the API
- [ ] JSON parse is wrapped in try/catch — malformed JSON never crashes the component
- [ ] All 5 SCARF dimensions validated for presence and correct key types (score: string, text: string)
  before setting state
- [ ] fetch uses AbortController with 15-second timeout — no indefinite hangs
- [ ] No user input is eval()d or inserted as raw HTML
