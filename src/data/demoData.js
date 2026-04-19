// Demo mode data with static example outputs for each framework/format combination

export const DEMO_EXAMPLES = {
  sbi_conversation: {
    framework: 'sbi',
    outputFormat: 'conversation',
    recipient: 'Magnus',
    situationType: 'Feedback to my Report',
    topic: 'Missing deadline on Q2 roadmap',
    description: 'Magnus committed to Q2 roadmap completion by Friday but delivered Monday without communication.',
    generatedFeedback: `# Feedback Preparation: SBI Framework — Conversation Guide

You're preparing to have a conversation about a missed deadline. Use this guide to structure your feedback clearly and factually.

---

## Opening
*Start specific and calm:*

"Magnus, I wanted to talk about the Q2 roadmap deadline we discussed. Do you have a few minutes?"

---

## Situation
*Describe what you observed, without judgment:*

"The deadline we set was Friday end of day. I didn't hear from you Friday evening or Saturday morning. Monday morning, you submitted the roadmap without letting me know about the delay beforehand."

---

## Behavior
*Explain the specific action that concerned you:*

"What I noticed is that there was no heads-up message—no Slack, no email—before the missed deadline. I had to discover it when I checked for the deliverable."

---

## Impact
*Explain the real consequences:*

- I couldn't plan the sprint retrospective timing
- I had to reschedule a stakeholder check-in
- The team was blocked waiting for roadmap sign-off

---

## Your intention
*Be clear about why you're having this conversation:*

"I want to make sure we're aligned on how we handle timeline changes. When something's going to slip, I need a heads-up so I can adjust downstream plans."

---

## Close with curiosity
*Invite their perspective:*

"What happened on your end? Was there something blocking you that I should have known about?"`,
  },

  sbi_written: {
    framework: 'sbi',
    outputFormat: 'written',
    recipient: 'Magnus',
    situationType: 'Feedback to my Report',
    topic: 'Missing deadline on Q2 roadmap',
    description: 'Magnus committed to Q2 roadmap completion by Friday but delivered Monday without communication.',
    generatedFeedback: `# Feedback: Q2 Roadmap Deadline

Hi Magnus,

I wanted to give you feedback on how the Q2 roadmap deadline was handled.

## The Situation
We agreed the roadmap would be ready Friday end of day. You submitted it Monday morning.

## What I Observed
You didn't communicate the delay beforehand. I found out when I checked for the deliverable Monday morning instead of hearing from you Friday or over the weekend.

## The Impact
- I couldn't plan the sprint schedule without it
- I had to reschedule a stakeholder update
- The team was waiting for your input to move forward

## What I Need Going Forward
When you realize a deadline will slip, please let me know as soon as you know. A quick Slack message is all I need—just give me the heads-up so I can adjust what depends on it.

I know unexpected things come up. My ask isn't perfection—it's communication. When you keep me in the loop, I can support you better and adjust our plans.

Let's sync this week if you'd like to talk through what got in the way.

Magnus`,
  },

  radical_conversation: {
    framework: 'radical',
    outputFormat: 'conversation',
    recipient: 'Klaus',
    situationType: 'Feedback to my Report',
    topic: 'Unilateral decision-making affecting team',
    description: 'Klaus made a major technical architecture decision without consulting the team, and it created rework for others.',
    generatedFeedback: `# Feedback Preparation: Radical Candor — Conversation Guide

Radical Candor means caring personally while challenging directly. Use this guide to give clear, direct feedback while showing you believe in Klaus.

---

## Opening
*Lead with genuine care and clarity:*

"Klaus, I really value your technical depth and your willingness to tackle hard problems. I want to give you some direct feedback on something that happened, because I think it matters for your growth."

---

## The Direct Challenge
*Say what you saw, clearly and without softening:*

"You made a call on the database architecture Tuesday without checking in with the team first. Jia and Chen spent Wednesday rewriting to align with your decision—work that could have been part of the plan from the start."

---

## Why It Matters
*Connect it to impact and to him:*

"Here's what concerns me: You have great instincts, and I want you to make decisions. But when you move unilaterally, you miss input that would make decisions better. And you create rework for people who respect your thinking."

---

## The Personal Part
*Show you see his potential and care about his development:*

"You have the skills to lead architecture decisions. I want to see you do that with the team, not around them. That's actually the thing that will make you a strong tech lead."

---

## The Ask
*Be specific about what changes:*

"Next time there's a major call: loop in the relevant people first. Not for permission—for input. 15 minutes with Jia and Chen would have caught the rework."

---

## Close with confidence
*Reinforce that you believe in him:*

"I know you care about getting it right. I'm telling you this because I think you can. What's your read on this?"`,
  },

  radical_written: {
    framework: 'radical',
    outputFormat: 'written',
    recipient: 'Klaus',
    situationType: 'Feedback to my Report',
    topic: 'Unilateral decision-making',
    description: 'Klaus made a major technical architecture decision without consulting the team, and it created rework for others.',
    generatedFeedback: `# Feedback: Technical Decisions & Team Input

Klaus,

I want to give you direct feedback on how the database architecture decision was made this week.

## What Happened
You made the call on Tuesday and communicated it after. Jia and Chen spent Wednesday rewriting code to align with your decision—work that could have been planned together from the start.

## Why I'm Saying This
You have strong technical judgment. You should make decisions. But unilateral moves create rework and they miss the input that would make decisions even better. More importantly, it signals you're not including people who could make you a better engineer.

## The Opportunity
You have the skills to be a tech lead who guides decisions *with* the team, not around them. That's what I want to see you develop. Next time there's an architecture call: give the relevant people 15 minutes to weigh in first. Not for permission—for input. It makes solutions better and it shows leadership.

## My Confidence in You
I'm telling you this directly because I think you can do this well. I see your potential as a leader. Let's talk through this when we sync.

Klaus`,
  },

  nvc_conversation: {
    framework: 'nvc',
    outputFormat: 'conversation',
    recipient: 'Elena',
    situationType: 'Feedback to my Report',
    topic: 'Interrupting in meetings',
    description: 'Elena frequently interrupts teammates during stand-ups and planning meetings, especially women.',
    generatedFeedback: `# Feedback Preparation: NVC Framework — Conversation Guide

Nonviolent Communication focuses on observations, feelings, needs, and requests. This framework creates space for understanding.

---

## Opening
*Show genuine interest and openness:*

"Elena, I'd like to talk about something I've noticed in our meetings. I want to understand what's happening for you. Is now a good time?"

---

## Observation (Not Judgment)
*Describe what you see without labels:*

"In the last three standups, I noticed you spoke while other people were still talking. In Tuesday's planning meeting, three times when Alex or Priya were presenting, you started talking before they finished."

---

## Your Feeling
*Share your internal response—not blame, but impact:*

"When that happens, I feel concerned. Not upset at you—I'm concerned about whether people feel heard."

---

## Your Need
*Name the underlying need that matters to you:*

"I care about an environment where everyone feels safe to share their full thought. I also want to understand what's driving what I'm noticing."

---

## Curiosity
*Shift to genuine inquiry:*

"What's happening for you in those moments? When you're in a meeting and someone's sharing, what comes up for you?"

*Listen for their experience. They might be:*
- Excited and losing track of turns
- Nervous and managing anxiety by talking
- Not realizing it's happening
- Feeling dismissed and jumping in

---

## Request
*Make a specific, doable ask:*

"Here's what I'd like: When you notice yourself ready to speak while someone else is still talking, could you pause for three seconds? See if they're done. I think you'll notice it changes the dynamic."

---

## Close
*Affirm your relationship:*

"I'm asking because I see your energy as an asset. I want our meetings to be a place where you *and* everyone else feels able to speak."`,
  },

  asset_conversation: {
    framework: 'asset',
    outputFormat: 'conversation',
    recipient: 'Team',
    situationType: 'Feedback for a Team Retrospective',
    topic: 'Q2 performance and what worked well',
    description: 'Retrospective after Q2 sprint cycle. Want to acknowledge what the team did well and build from there.',
    generatedFeedback: `# Feedback Preparation: Asset-oriented Framework — Retrospective

Asset-oriented feedback starts from strengths and what's working. Use this in retrospectives to build momentum.

---

## Opening
*Name the moment and what you notice:*

"We finished Q2 and I want to name something before we dig into what to improve. I'm noticing real strengths that I want us to build on."

---

## What You Did Well (Strengths)
*Be specific about observable achievements:*

**On communication:**
- This quarter, the Slack updates from each track were clear and on time
- I didn't have to hunt for status—it came to me
- That's different from Q1

**On collaboration:**
- Jia and Klaus really worked together on the database migration
- I saw them asking each other questions instead of making assumptions
- That's the kind of pairing I want to see more of

**On pace:**
- You shipped 7 features instead of 4
- You also took time for technical debt
- That balance matters

---

## The Underlying Capability
*Name the *capability* behind what went well:*

"What I'm seeing is: You know how to work together when the goal is clear. You're willing to slow down to go fast. You give each other room."

---

## What's Possible
*Paint a picture of building from strength:*

"If we keep this energy—the clarity, the collaboration, the willingness to invest in good code—I think Q3 could be the quarter where we really move."

---

## Invitation
*Ask how to build from here:*

"What would help you keep this momentum? What do you need from me?"`,
  },

  self_conversation: {
    framework: 'self',
    outputFormat: 'conversation',
    recipient: 'Myself',
    situationType: 'Feedback to my Manager',
    topic: 'Skip-level meeting decision',
    description: 'I made a decision to escalate something without telling my manager first. Want to understand my own reaction before talking to them.',
    generatedFeedback: `# Self-Clarification: Before You Give That Feedback

Self-Clarification helps you understand your own reaction first. This is for you to think through before you have the conversation.

---

## Your Situation
You learned that your skip-level (their boss) made a decision about your project without looping you in first.

---

## Pause: Get Curious About You

**What's actually bothering me?**
- They didn't consult me
- I look uninformed in front of leadership
- They don't respect my expertise
- I feel left out

*Which one is true? Usually it's layered.*

---

## Consider Your Needs

From NVC, here are needs that might be active:

**Autonomy** — "I need to have input on decisions affecting my work"

**Respect** — "I need to be treated as a full partner, not peripheral"

**Inclusion** — "I need to be part of important conversations about my projects"

**Clarity** — "I need to understand *how* decisions are being made so I can do my job"

**Trust** — "I need to believe they're making decisions *with* me, not about me"

---

## Before You Approach Them, Ask Yourself

1. **What's the real issue?** (Often it's not the decision itself—it's how it happened)

2. **What do I actually need from them?** (To tell you first? To explain? To involve you?)

3. **What am I assuming about their intention?** (Did they forget you? Not trust you? Move fast and mess up?)

4. **What would rebuild trust here?** (An apology? A new process? A conversation about how you work together?)

---

## Your Conversation Approach

Go in knowing you care about the work and the relationship.

"I want to understand what happened with the decision about [topic]. I felt caught off guard when I heard it from [person instead of] you. What happened?"

*Listen for their side first.* They might say:
- "I should have told you—I moved fast"
- "I don't think it needed your input"
- "I talked to [person], I thought they'd loop you in"

---

## If You're Not Ready Yet

That's information too. Your reaction might be telling you:
- You need clearer agreements about collaboration
- You need to rebuild trust in this relationship
- You need to understand their decision-making style better

Consider talking to a peer or mentor before approaching them.`,
  },
}

// Demo initial form state
export const DEMO_FORM_DEFAULT = {
  framework: 'sbi',
  situationType: 'Feedback to my Report',
  recipient: 'Magnus',
  topic: 'Missing deadline on Q2 roadmap',
  description: 'Magnus committed to Q2 roadmap completion by Friday but delivered Monday without communication.',
  unmetNeed: '',
  outputFormat: 'conversation',
}
