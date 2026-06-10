import { PromptTemplate } from "@langchain/core/prompts";


export const LEVEL_PROMPT = PromptTemplate.fromTemplate(`
You are a game designer and behavioral psychologist creating a personalized addiction recovery journey.
The player is overcoming {addictionType} addiction (severity: {severity}).
Their interests include: {interests}.

Use this recovery knowledge as context:
{context}
{previousLevelsContext}

CORE PHILOSOPHY — read this carefully before generating:
This person will face sudden, powerful urges. Most levels must directly confront those urges.
Every level should make them feel one of these things:
- "This addiction is stealing something real from my life"
- "I am stronger than this urge right now"
- "Every time I resist, I reclaim a piece of myself"

Never let a level feel like a generic wellness task. Each one must feel personal and urgent.

Generate levels {startLevel} through {endLevel} as a valid JSON array.
Each level must follow this exact structure with no extra fields:
{{
  "level": <integer from {startLevel} to {endLevel}>,
  "world": <thematic world name, game-like, max 4 words>,
  "objective": <see objective rules below>,
  "target": <positive integer>,
  "unit": <unit of measurement, e.g. "days", "minutes", "urges", "sessions">,
  "xp": <integer experience points>,
  "reward": <badge or reward name, max 3 words>,
  "difficulty": <exactly "Easy" or "Medium" or "Hard">,
  "unlockRequirement": <"None" for level 1, "Complete Level N" for others>
}}

OBJECTIVE RULES — strictly enforced:
- Every objective must either (a) directly confront an urge, (b) replace the addictive behavior with something from their interests, or (c) force them to face the real cost of their addiction
- Use second-person ("you", "your") to make it personal and immediate
- Include a consequence reminder in at least 8 of the 20 objectives — e.g. "every hour you resist {addictionType} today is an hour you get back"
- Some objectives should be for the exact moment an urge hits — e.g. "when the urge strikes, immediately do X for Y minutes before you act on it"
- Objectives that use their interests must connect the interest to beating the urge — not just doing the hobby
- Use motivational AND negative reinforcement — remind them of what the addiction has already cost them
- Keep objectives realistic and daily-life achievable — if they love music, objectives involve listening or playing, not performing
- Never use: therapy, clinical, treatment, rehabilitation, counseling, recovery program
- If previous levels are provided, continue naturally from them. Never repeat objectives, rewards, or world names.

LEVEL STRUCTURE — follow exactly:
- Levels 1–7: difficulty "Easy", xp 50–150 — building first wins, recognizing urge patterns
- Levels 8–14: difficulty "Medium", xp 200–350 — actively fighting urges, replacing triggers
- Levels 15–20: difficulty "Hard", xp 400–600 — mastery, relapse prevention, reclaiming identity

EXAMPLE objectives for someone who loves music overcoming gaming addiction:
- "When the urge to game hits today, put on a playlist and play guitar until the urge passes. You built this skill — the game didn't."
- "Go 6 hours without gaming. Every hour you hold, your real life gets louder than the screen."
- "Write down one thing gaming has cost you this month. Then play your favorite song as a reminder of what you're fighting for."

Return ONLY the raw JSON array. No markdown fences, no preamble, no explanation.
`);
