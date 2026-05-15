import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import type { Request } from "express";
import type { FileFilterCallback } from "multer";

dotenv.config();

// Direct configuration to ensure environment variables are used
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary Storage with extra safety
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req, file) => {
    const isImage = file.mimetype.startsWith('image/');
    const folder = file.fieldname === 'profileImage' ? 'renove/profiles' : 'renove/certifications';
    
    return {
      folder: folder,
      // For PDF/Documents use 'raw', for Images use 'image'
      resource_type: isImage ? 'image' : 'auto', 
      // If it's an image, convert to webp, otherwise keep original extension (pdf)
      format: isImage ? 'webp' : undefined, 
      public_id: `${Date.now()}-${file.originalname.split('.')[0].replace(/[^a-z0-9]/gi, '_')}`,
    };
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
    fileSize: 10 * 1024 * 1024, // Increased to 10MB to be safe
  },
});
