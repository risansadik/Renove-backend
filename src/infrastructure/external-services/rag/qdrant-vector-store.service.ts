// src/infrastructure/external-services/qdrant-vector-store.service.ts
import { injectable, inject } from "inversify";
import { QdrantClient } from "@qdrant/js-client-rest";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { QdrantClientProvider } from "./providers/qdrant-client.provider.ts";
import type {
    IVectorStoreService,
    VectorDocument,
} from "../../../application/interfaces/services/rag/IVectorStoreService.ts";

@injectable()
export class QdrantVectorStoreService implements IVectorStoreService {
    private readonly _client: QdrantClient;

    constructor(
        @inject(TYPES.QdrantClient) private readonly _qdrantProvider: QdrantClientProvider
    ) {
        this._client = this._qdrantProvider.getClient();
    }

    async ensureCollection(collectionName: string, vectorSize: number): Promise<void> {
        const { collections } = await this._client.getCollections();
        const exists = collections.some((c) => c.name === collectionName);
        if (!exists) {
            await this._client.createCollection(collectionName, {
                vectors: { size: vectorSize, distance: "Cosine" },
            });
        }
    }

    async upsert(collectionName: string, documents: VectorDocument[]): Promise<void> {
        await this._client.upsert(collectionName, {
            wait: true,
            points: documents.map((doc) => ({
                id: doc.id,
                vector: doc.vector,
                payload: { text: doc.text, ...doc.metadata },
            })),
        });
    }

    async search(
        collectionName: string,
        vector: number[],
        topK: number
    ): Promise<VectorDocument[]> {
        const results = await this._client.search(collectionName, {
            vector,
            limit: topK,
            with_payload: true,
        });
        return results.map((r) => ({
            id: String(r.id),
            text: String(r.payload?.text ?? ""),
            vector: [],
            metadata: r.payload as Record<string, unknown>,
            score: r.score,
        }));
    }

    async searchWithScores(
        collectionName: string,
        vector: number[],
        topK: number,
        scoreThreshold: number
    ): Promise<VectorDocument[]> {
        const results = await this._client.search(collectionName, {
            vector,
            limit: topK,
            with_payload: true,
            score_threshold: scoreThreshold,
        });
        return results.map((r) => ({
            id: String(r.id),
            text: String(r.payload?.text ?? ""),
            vector: [],
            metadata: r.payload as Record<string, unknown>,
            score: r.score,
        }));
    }

    async deleteByIds(collectionName: string, ids: string[]): Promise<void> {
        if (ids.length === 0) return;
        await this._client.delete(collectionName, {
            wait: true,
            points: ids,
        });
    }
}