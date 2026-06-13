import type { ITherapistDocument } from "../databases/schema/therapist.schema.ts";
import type { TherapistEntity } from "../../domain/entities/Therapist.entity.ts";

export class TherapistDbMapper {
  static toEntity(doc: ITherapistDocument): TherapistEntity {
    const obj = doc.toObject({ versionKey: false }) as Record<string, unknown>;
    if (obj._id) {
      obj.id = String(obj._id);
      delete obj._id;
    }
    return obj as unknown as TherapistEntity;
  }
}
