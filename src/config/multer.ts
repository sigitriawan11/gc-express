import multer from "multer";
import { RequestHandler } from "express";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

export const multerMiddleware = {
  single: (field: string): RequestHandler => upload.single(field),
  array: (field: string, max?: number): RequestHandler =>
    upload.array(field, max),
  fields: (fields: { name: string; maxCount?: number }[]): RequestHandler =>
    upload.fields(fields),
  any: (): RequestHandler => upload.any(),
};
