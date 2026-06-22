import type { Container } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";

import { LevelRepository } from "../../repositories/level.repository.impl";
import { GeminiEmbeddingService } from "../../external-services/rag/gemini-embedding.service"
import { QdrantVectorStoreService } from "../../external-services/rag/qdrant-vector-store.service";
import { SerperSearchService } from "../../external-services/rag/serper-search.service";
import { LangChainRagService } from "../../external-services/rag/langchain-rag.service";
import { LevelController } from "../../../presentation/controllers/level.controller";
import { ILevelRepository } from "../../../domain/repositories/level.repository";
import { IEmbeddingService } from "../../../application/interfaces/services/rag/IEmbeddingService";
import { IVectorStoreService } from "../../../application/interfaces/services/rag/IVectorStoreService";
import { ISearchService } from "../../../application/interfaces/services/rag/ISearchService";
import { IRagService } from "../../../application/interfaces/services/rag/IRagService";
import { ICompleteLevelUseCase, IGenerateLevelsUseCase, IGetUserLevelsUseCase } from "../../../application/interfaces/level/ILevelUseCase";
import { CompleteLevelUseCase, GenerateLevelsUseCase, GetUserLevelsUseCase } from '../../../application/use-cases/level/level.usecase'
import { LlmClientProvider } from "../../external-services/rag/providers/llm-client.provider";
import { GeminiClientProvider } from "../../external-services/rag/providers/gemini-client.provider";
import { QdrantClientProvider } from "../../external-services/rag/providers/qdrant-client.provider";
import { SerperClientProvider } from "../../external-services/rag/providers/serper-client.provider";

export const registerLevelModule = (container: Container): void => {
    container.bind<ILevelRepository>(TYPES.LevelRepository).to(LevelRepository).inSingletonScope();

    container.bind<QdrantClientProvider>(TYPES.QdrantClient).to(QdrantClientProvider).inSingletonScope();
    container.bind<GeminiClientProvider>(TYPES.GeminiClient).to(GeminiClientProvider).inSingletonScope();
    container.bind<LlmClientProvider>(TYPES.LlmClient).to(LlmClientProvider).inSingletonScope();
    container.bind<SerperClientProvider>(TYPES.SerperClient).to(SerperClientProvider).inSingletonScope();

    container.bind<IEmbeddingService>(TYPES.EmbeddingService).to(GeminiEmbeddingService).inSingletonScope();
    container.bind<IVectorStoreService>(TYPES.VectorStoreService).to(QdrantVectorStoreService).inSingletonScope();
    container.bind<ISearchService>(TYPES.SearchService).to(SerperSearchService).inSingletonScope();
    container.bind<IRagService>(TYPES.RagService).to(LangChainRagService).inSingletonScope();


    container.bind<IGenerateLevelsUseCase>(TYPES.GenerateLevelsUseCase).to(GenerateLevelsUseCase);
    container.bind<IGetUserLevelsUseCase>(TYPES.GetUserLevelsUseCase).to(GetUserLevelsUseCase);
    container.bind<ICompleteLevelUseCase>(TYPES.CompleteLevelUseCase).to(CompleteLevelUseCase);

    container.bind<LevelController>(TYPES.LevelController).to(LevelController).inSingletonScope();
};