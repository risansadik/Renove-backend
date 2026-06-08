import { injectable, inject } from "inversify";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { createHash } from "crypto";
import { z } from "zod";

import { TYPES } from "../../shared/constants/tokens.ts";
import { LEVEL_DIFFICULTY } from "../../shared/constants/index.ts";
import { InternalServerError } from "../../shared/utils/AppError.ts";

import type { IRagService, RagInput, RawLevelPayload } from "../../application/interfaces/services/IRagService.ts";
import type { IEmbeddingService } from "../../application/interfaces/services/IEmbeddingService.ts";
import type { IVectorStoreService, VectorDocument } from "../../application/interfaces/services/IVectorStoreService.ts";
import type { ISearchService } from "../../application/interfaces/services/ISearchService.ts";
import { LlmClientProvider } from "./providers/llm-client.provider.ts";

const COLLECTION_NAME = "renove_recovery_knowledge";
const VECTOR_SIZE = 3072;
const TOP_K = 6;

const DOCUMENT_TTL_DAYS = 60;
export const DOCUMENT_RETENTION_DAYS = 180;
const RELEVANCE_THRESHOLD = 0.7;

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


const LEVEL_PROMPT = PromptTemplate.fromTemplate(`
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
        const queryVector = await this._embedding.embed(query);

        let contextDocs = await this._vectorStore.searchWithScores(
            COLLECTION_NAME, queryVector, TOP_K, RELEVANCE_THRESHOLD
        );

        if (contextDocs.length === 0) {
            await this.fetchAndUpsertFromSerper(query, input.addictionType);
            contextDocs = await this._vectorStore.search(COLLECTION_NAME, queryVector, TOP_K);
        } else {
            contextDocs = await this.refreshDocumentsIfNeeded(
                contextDocs, query, input.addictionType, queryVector
            );
        }

        const context = contextDocs.length > 0
            ? contextDocs.map((d) => d.text).join("\n\n")
            : "Use evidence-based recovery strategies and habit formation principles.";

        const previousLevelsContext = input.previousLevels && input.previousLevels.length > 0
            ? `\nPREVIOUS LEVELS CONTEXT (Do NOT regenerate these, just continue from them):\n${JSON.stringify(input.previousLevels, null, 2)}\n`
            : "";

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
            previousLevelsContext,
            startLevel: input.startLevel,
            endLevel: input.endLevel,
        });

        let parsed: unknown;
        try {
            parsed = JSON.parse(raw.trim());
        } catch {
            throw new InternalServerError("LLM returned malformed JSON. Please try again.");
        }

        const expectedCount = input.endLevel - input.startLevel + 1;
        const DynamicLevelsArraySchema = z.array(RawLevelSchema).length(expectedCount);

        const validated = DynamicLevelsArraySchema.safeParse(parsed);
        if (!validated.success) {
            throw new InternalServerError("LLM output failed schema validation. Please try again.");
        }

        return validated.data;
    }

    private createDeterministicDocumentId(url: string): string {
        const hex = createHash("sha256").update(url).digest("hex");
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
    }

    private isDocumentStale(doc: VectorDocument): boolean {
        const indexedAt = doc.metadata.indexedAt as number | undefined;
        if (!indexedAt) return true;
        const ageMs = Date.now() - indexedAt;
        const ageDays = ageMs / (1000 * 60 * 60 * 24);
        return ageDays > DOCUMENT_TTL_DAYS;
    }

    private shouldRefreshDocuments(docs: VectorDocument[]): boolean {
        if (docs.length === 0) return false;
        const staleCount = docs.filter((d) => this.isDocumentStale(d)).length;
        return staleCount > docs.length / 2;
    }

    private async fetchAndUpsertFromSerper(query: string, addictionType: string): Promise<void> {
        const searchResults = await this._search.search(query, 8);
        if (searchResults.length === 0) return;

        const vectors = await this._embedding.embedBatch(
            searchResults.map((r) => `${r.title}. ${r.snippet}`)
        );

        await this._vectorStore.upsert(
            COLLECTION_NAME,
            searchResults.map((r, i) => ({
                id: this.createDeterministicDocumentId(r.url),
                text: `${r.title}. ${r.snippet}`,
                vector: vectors[i],
                metadata: {
                    title: r.title,
                    url: r.url,
                    addictionType,
                    indexedAt: Date.now(),
                },
            }))
        );
    }

    private async refreshDocumentsIfNeeded(
        docs: VectorDocument[],
        query: string,
        addictionType: string,
        queryVector: number[]
    ): Promise<VectorDocument[]> {
        if (!this.shouldRefreshDocuments(docs)) {
            return docs;
        }

        await this.fetchAndUpsertFromSerper(query, addictionType);
        return this._vectorStore.search(COLLECTION_NAME, queryVector, TOP_K);
    }
}