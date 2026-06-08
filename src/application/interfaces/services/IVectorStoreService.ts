export interface VectorDocument {
  id: string;
  text: string;
  vector: number[];
  metadata?: Record<string, unknown>;
}

export interface IVectorStoreService {
  ensureCollection(collectionName: string, vectorSize: number): Promise<void>;
  upsert(collectionName: string, documents: VectorDocument[]): Promise<void>;
  search(collectionName: string, vector: number[], topK: number): Promise<VectorDocument[]>;
}