import { injectable, inject } from "inversify";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { createHash } from "crypto";
import { z } from "zod";

import { TYPES } from "../../../shared/constants/tokens";
import { COLLECTION_NAME, DOCUMENT_TTL_DAYS, RELEVANCE_THRESHOLD, TOP_K, VECTOR_SIZE } from "../../../shared/constants/index";
import { InternalServerError } from "../../../shared/utils/AppError";

import type { IRagService, RagInput, RawLevelPayload } from "../../../application/interfaces/services/rag/IRagService";
import type { IEmbeddingService } from "../../../application/interfaces/services/rag/IEmbeddingService";
import type { IVectorStoreService, VectorDocument } from "../../../application/interfaces/services/rag/IVectorStoreService";
import type { ISearchService } from "../../../application/interfaces/services/rag/ISearchService";
import { LlmClientProvider } from "./providers/llm-client.provider";
import { RawLevelSchema } from "./schema/level.schema";
import { LEVEL_PROMPT } from "./prompts/level.prompt";

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