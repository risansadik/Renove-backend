import type { Container } from "inversify";
import type { IGetTherapistReviewStatusUseCase, IGetTherapistReviewsUseCase, IRateTherapistUseCase } from "../../../application/interfaces/review/IReviewUseCase";
import { GetTherapistReviewStatusUseCase, GetTherapistReviewsUseCase, RateTherapistUseCase } from "../../../application/use-cases/review/review.usecase";
import { TherapistReviewController } from "../../../presentation/controllers/therapist-review.controller";
import { TYPES } from "../../../shared/constants/tokens";

export const registerReviewModule = (container: Container): void => {
  container.bind<IGetTherapistReviewStatusUseCase>(TYPES.GetTherapistReviewStatusUseCase).to(GetTherapistReviewStatusUseCase);
  container.bind<IRateTherapistUseCase>(TYPES.RateTherapistUseCase).to(RateTherapistUseCase);
    container.bind<IGetTherapistReviewsUseCase>(TYPES.GetTherapistReviewsUseCase).to(GetTherapistReviewsUseCase);
  container.bind<TherapistReviewController>(TYPES.TherapistReviewController).to(TherapistReviewController).inSingletonScope();
};
