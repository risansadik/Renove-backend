import { injectable } from "inversify";

import { BaseRepository } from "./base-repository.impl.ts";

import type { IAdminRepository } from "../../domain/repositories/admin.repository.ts";
import type { AdminEntity } from "../../domain/entities/Admin.entity.ts";

import { AdminModel } from "../databases/schema/admin.schema.ts";
import type { IAdminDocument } from "../databases/schema/admin.schema.ts";

@injectable()
export class AdminRepository
  extends BaseRepository<AdminEntity, IAdminDocument>
  implements IAdminRepository
{
  constructor() {
    super(AdminModel);
  }

  public async findByEmail(
    email: string
  ): Promise<AdminEntity | null> {
    const document = await this.model.findOne({ email }).exec();

    return document ? this.toEntity(document) : null;
  }
}