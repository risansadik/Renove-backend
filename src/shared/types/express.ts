import type { Request } from "express";
import type { Role } from "../constants/index";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

export interface S3File extends Express.Multer.File {
  location: string;
}
