import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import dotenv from "dotenv";
import type { Request } from "express";
import type { FileFilterCallback } from "multer";
import { MAX_FILE_SIZE, S3_CONFIG } from "../../shared/constants/index.ts";

dotenv.config();

// AWS S3 Client Configuration
const s3 = new S3Client({
  region: S3_CONFIG.REGION,
  credentials: {
    accessKeyId: S3_CONFIG.ACCESS_KEY,
    secretAccessKey: S3_CONFIG.SECRET_KEY,
  },
});

// Configure S3 Storage
const storage = multerS3({
  s3: s3,
  bucket: S3_CONFIG.BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, metadata?: Record<string, string>) => void
  ) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, key?: string) => void
  ) => {
    const folder =
      file.fieldname === 'profileImage'
        ? 'renove/profiles'
        : file.fieldname === 'attachments'
        ? 'renove/attachments'
        : 'renove/certifications';
    const timestamp = Date.now();
    const sanitizedName = file.originalname.split('.')[0].replace(/[^a-z0-9]/gi, '_');
    const extension = file.originalname.split('.').pop();

    cb(null, `${folder}/${timestamp}-${sanitizedName}.${extension}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF and images are allowed."));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE, // Increased to 10MB to be safe
  },
});
