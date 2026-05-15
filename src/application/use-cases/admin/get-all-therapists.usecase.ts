import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.js";
import { TherapistMapper } from "../../mappers/therapist.mapper.js";

import type { IGetAllTherapistsUseCase } from "../../interfaces/admin/IAdminUseCase.js";
import type { PublicTherapistDTO } from "../../mappers/therapist.mapper.js";

export class GetAllTherapistsUseCase implements IGetAllTherapistsUseCase {
  constructor(private readonly therapistRepo: ITherapistRepository) {}

  async execute(): Promise<PublicTherapistDTO[]> {
    const therapists = await this.therapistRepo.findAll();
    return therapists.map(TherapistMapper.toPublicDTO);
  }
}
