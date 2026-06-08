export interface VectorDocument {
  id: string;
  text: string;
  vector: number[];
  metadata: Record<string, unknown>;
  score?: number;
}

export interface IVectorStoreService {
  ensureCollection(collectionName: string, vectorSize: number): Promise<void>;
  upsert(collectionName: string, documents: VectorDocument[]): Promise<void>;
  search(collectionName: string, vector: number[], topK: number): Promise<VectorDocument[]>;
  searchWithScores(
    collectionName: string,
    vector: number[],
    topK: number,
    scoreThreshold: number
  ): Promise<VectorDocument[]>;
  deleteByIds(collectionName: string, ids: string[]): Promise<void>;
}