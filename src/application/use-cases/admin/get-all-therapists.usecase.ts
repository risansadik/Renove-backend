import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.js";
import { TherapistMapper } from "../../mappers/therapist.mapper.js";

export class GetAllTherapistsUseCase {
  constructor(private readonly therapistRepo: ITherapistRepository) {}

  async execute() {
    const therapists = await this.therapistRepo.findAll();
    return therapists.map(TherapistMapper.toPublicDTO);
  }
}
