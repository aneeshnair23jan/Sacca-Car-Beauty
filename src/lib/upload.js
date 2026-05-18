import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

const garageConfig = {
  endpoint: process.env.GARAGE_S3_ENDPOINT,
  region: process.env.GARAGE_S3_REGION || 'garage',
  bucket: process.env.GARAGE_S3_BUCKET,
  accessKeyId: process.env.GARAGE_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.GARAGE_S3_SECRET_ACCESS_KEY,
  publicUrl: process.env.GARAGE_S3_PUBLIC_URL,
};

export const isGarageStorageEnabled = Boolean(
  garageConfig.endpoint &&
  garageConfig.bucket &&
  garageConfig.accessKeyId &&
  garageConfig.secretAccessKey
);

if (!isGarageStorageEnabled && !fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

let s3Client;
let s3Commands;

const storage = isGarageStorageEnabled
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadsDir),
      filename: (_req, file, cb) => cb(null, createUploadName(file.originalname)),
    });

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext) && allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export async function uploadFilesToStorage(files = []) {
  if (!isGarageStorageEnabled) {
    return files.map((file) => ({ filename: file.filename }));
  }

  return Promise.all(files.map(async (file) => {
    const { client, PutObjectCommand } = await getS3();
    const key = `products/${createUploadName(file.originalname)}`;
    await client.send(new PutObjectCommand({
      Bucket: garageConfig.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: 'public, max-age=31536000, immutable',
    }));
    return { filename: key };
  }));
}

export async function deleteStoredFile(filename) {
  if (!filename) return;

  if (isGarageStorageEnabled && isGarageKey(filename)) {
    const { client, DeleteObjectCommand } = await getS3();
    await client.send(new DeleteObjectCommand({
      Bucket: garageConfig.bucket,
      Key: filename,
    }));
    return;
  }

  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

export function getStoredFileUrl(filename) {
  if (!filename) return null;
  if (/^https?:\/\//i.test(filename)) return filename;

  if (isGarageKey(filename)) {
    const base = garageConfig.publicUrl || `${garageConfig.endpoint}/${garageConfig.bucket}`;
    return `${base.replace(/\/$/, '')}/${filename}`;
  }

  return `/uploads/${filename}`;
}

export function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

function createUploadName(originalName = '') {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return unique + path.extname(originalName).toLowerCase();
}

function isGarageKey(filename) {
  return filename.includes('/');
}

async function getS3() {
  if (!s3Client) {
    s3Commands = await import('@aws-sdk/client-s3');
    const { S3Client } = s3Commands;
    s3Client = new S3Client({
      endpoint: garageConfig.endpoint,
      region: garageConfig.region,
      forcePathStyle: true,
      credentials: {
        accessKeyId: garageConfig.accessKeyId,
        secretAccessKey: garageConfig.secretAccessKey,
      },
    });
  }

  return {
    client: s3Client,
    PutObjectCommand: s3Commands.PutObjectCommand,
    DeleteObjectCommand: s3Commands.DeleteObjectCommand,
  };
}
