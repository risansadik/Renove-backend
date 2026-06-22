import { injectable } from "inversify";

import { BaseRepository } from "./base-repository.impl";

import type { IAdminRepository } from "../../domain/repositories/admin.repository";
import type { AdminEntity } from "../../domain/entities/Admin.entity";

import { AdminModel } from "../databases/schema/admin.schema";
import type { IAdminDocument } from "../databases/schema/admin.schema";
import { AdminDbMapper } from "../mappers/admin.db-mapper";

@injectable()
export class AdminRepository
  extends BaseRepository<AdminEntity, IAdminDocument>
  implements IAdminRepository
{
  constructor() {
    super(AdminModel);
  }

  protected toEntity(doc: IAdminDocument): AdminEntity {
    return AdminDbMapper.toEntity(doc);
  }

  public async findByEmail(
    email: string
  ): Promise<AdminEntity | null> {
    const document = await this.model.findOne({ email }).exec();

    return document ? this.toEntity(document) : null;
  }
}