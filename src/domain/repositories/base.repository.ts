import { PaginationParams, PaginatedResult } from "../interfaces/pagination.ts";

export interface BaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(params?: PaginationParams): Promise<PaginatedResult<T>>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}