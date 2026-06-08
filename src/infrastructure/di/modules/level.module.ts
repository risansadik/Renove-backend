import type { Container } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";

import { LevelRepository } from "../../repositories/level.repository.impl.ts";
import { GeminiEmbeddingService } from "../../external-services/gemini-embedding.service.ts";
import { QdrantVectorStoreService } from "../../external-services/qdrant-vector-store.service.ts";
import { SerperSearchService } from "../../external-services/serper-search.service.ts";
import { LangChainRagService } from "../../external-services/langchain-rag.service.ts";
import { LevelController } from "../../../presentation/controllers/level.controller.ts";
import { ILevelRepository } from "../../../domain/repositories/level.repository.ts";
import { IEmbeddingService } from "../../../application/interfaces/services/IEmbeddingService.ts";
import { IVectorStoreService } from "../../../application/interfaces/services/IVectorStoreService.ts";
import { ISearchService } from "../../../application/interfaces/services/ISearchService.ts";
import { IRagService } from "../../../application/interfaces/services/IRagService.ts";
import { ICompleteLevelUseCase, IGenerateLevelsUseCase, IGetUserLevelsUseCase } from "../../../application/interfaces/level/ILevelUseCase.ts";
import { CompleteLevelUseCase, GenerateLevelsUseCase, GetUserLevelsUseCase } from '../../../application/use-cases/level/level.usecase.ts'
import { LlmClientProvider } from "../../external-services/providers/llm-client.provider.ts";
import { GeminiClientProvider } from "../../external-services/providers/gemini-client.provider.ts";
import { QdrantClientProvider } from "../../external-services/providers/qdrant-client.provider.ts";
import { SerperClientProvider } from "../../external-services/providers/serper-client.provider.ts";

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