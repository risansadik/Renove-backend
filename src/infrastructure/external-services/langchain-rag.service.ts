import { injectable, inject } from "inversify";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { randomUUID } from "crypto";
import { z } from "zod";

import { TYPES } from "../../shared/constants/tokens.ts";
import { LEVEL_DIFFICULTY } from "../../shared/constants/index.ts";
import { InternalServerError } from "../../shared/utils/AppError.ts";

import type { IRagService, RagInput, RawLevelPayload } from "../../application/interfaces/services/IRagService.ts";
import type { IEmbeddingService } from "../../application/interfaces/services/IEmbeddingService.ts";
import type { IVectorStoreService } from "../../application/interfaces/services/IVectorStoreService.ts";
import type { ISearchService } from "../../application/interfaces/services/ISearchService.ts";
import { LlmClientProvider } from "./providers/llm-client.provider.ts";

const COLLECTION_NAME = "renove_recovery_knowledge";
const VECTOR_SIZE = 3072;
const TOP_K = 6;
const LEVEL_COUNT = 20;

const RawLevelSchema = z.object({
  level: z.number(),
  world: z.string(),
  objective: z.string(),
  target: z.number(),
  unit: z.string(),
  xp: z.number(),
  reward: z.string(),
  difficulty: z.enum([
    LEVEL_DIFFICULTY.EASY,
    LEVEL_DIFFICULTY.MEDIUM,
    LEVEL_DIFFICULTY.HARD,
  ]),
  unlockRequirement: z.string(),
});

const RawLevelsArraySchema = z.array(RawLevelSchema).length(LEVEL_COUNT);

const LEVEL_PROMPT = PromptTemplate.fromTemplate(`
You are a game designer creating a personalized recovery journey for someone overcoming {addictionType} addiction (severity: {severity}).
Their interests include: {interests}.

Use this recovery knowledge as context:
{context}

Generate exactly {levelCount} progressive game levels as a valid JSON array.
Each level must follow this exact structure with no extra fields:
{{
  "level": <integer 1-{levelCount}>,
  "world": <thematic world name, game-like, max 4 words>,
  "objective": <specific actionable daily challenge, NO therapy language, NO clinical terms>,
  "target": <positive integer>,
  "unit": <unit of measurement, e.g. "days", "minutes", "sessions">,
  "xp": <integer experience points>,
  "reward": <badge or reward name, max 3 words>,
  "difficulty": <exactly "Easy" or "Medium" or "Hard">,
  "unlockRequirement": <"None" for level 1, "Complete Level N" for others>
}}

Difficulty and XP rules — follow exactly:
- Levels 1–7: difficulty "Easy", xp 50–150, small confidence-building targets
- Levels 8–14: difficulty "Medium", xp 200–350, growing challenges
- Levels 15–20: difficulty "Hard", xp 400–600, mastery milestones

Tone rules — strictly enforced:
- Use game-world language (Arena, Forge, Nexus, Citadel, etc.)
- Integrate the person's interests into objectives naturally
- NEVER use: therapy, clinical, treatment, rehabilitation, recovery program, counseling
- Make it feel like a game quest, not a treatment plan

Return ONLY the raw JSON array. No markdown fences, no preamble, no explanation.
`);

@injectable()
export class LangChainRagService implements IRagService {
    private readonly _llm: ChatOpenAI;

  constructor(
    @inject(TYPES.EmbeddingService) private readonly _embedding: IEmbeddingService,
    @inject(TYPES.VectorStoreService) private readonly _vectorStore: IVectorStoreService,
    @inject(TYPES.SearchService) private readonly _search: ISearchService,
    @inject(TYPES.LlmClient) private readonly _llmProvider: LlmClientProvider 
  ) {
    this._llm = this._llmProvider.getClient();
  }

  async generateLevels(input: RagInput): Promise<RawLevelPayload[]> {
    await this._vectorStore.ensureCollection(COLLECTION_NAME, VECTOR_SIZE);

    
    const query = `${input.addictionType} addiction overcoming strategies habits ${input.interests.join(" ")}`;

    const searchResults = await this._search.search(query, 8);
    if (searchResults.length > 0) {
      const vectors = await this._embedding.embedBatch(
        searchResults.map((r) => `${r.title}. ${r.snippet}`)
      );
      await this._vectorStore.upsert(
        COLLECTION_NAME,
        searchResults.map((r, i) => ({
          id: randomUUID(),
          text: `${r.title}. ${r.snippet}`,
          vector: vectors[i],
          metadata: {
            title: r.title,
            url: r.url,
            addictionType: input.addictionType,
          },
        }))
      );
    }

    const queryVector = await this._embedding.embed(query);
    const contextDocs = await this._vectorStore.search(COLLECTION_NAME, queryVector, TOP_K);
    const context = contextDocs.length > 0
      ? contextDocs.map((d) => d.text).join("\n\n")
      : "Use evidence-based recovery strategies and habit formation principles.";

    const chain = RunnableSequence.from([
      LEVEL_PROMPT,
      this._llm,
      new StringOutputParser(),
    ]);

    const raw = await chain.invoke({
      addictionType: input.addictionType,
      severity: input.severity,
      interests: input.interests.join(", "),
      context,
      levelCount: LEVEL_COUNT,
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw.trim());
    } catch {
      throw new InternalServerError("LLM returned malformed JSON. Please try again.");
    }

    const validated = RawLevelsArraySchema.safeParse(parsed);
    if (!validated.success) {
      throw new InternalServerError("LLM output failed schema validation. Please try again.");
    }

    return validated.data;
  }
}