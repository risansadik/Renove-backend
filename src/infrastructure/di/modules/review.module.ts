import type { Container } from "inversify";
import type { IGetTherapistReviewStatusUseCase, IRateTherapistUseCase } from "../../../application/interfaces/review/IReviewUseCase.ts";
import { GetTherapistReviewStatusUseCase, RateTherapistUseCase } from "../../../application/use-cases/review/review.usecase.ts";
import { TherapistReviewController } from "../../../presentation/controllers/therapist-review.controller.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";

export const registerReviewModule = (container: Container): void => {
  container.bind<IGetTherapistReviewStatusUseCase>(TYPES.GetTherapistReviewStatusUseCase).to(GetTherapistReviewStatusUseCase);
  container.bind<IRateTherapistUseCase>(TYPES.RateTherapistUseCase).to(RateTherapistUseCase);
  container.bind<TherapistReviewController>(TYPES.TherapistReviewController).to(TherapistReviewController).inSingletonScope();
};
