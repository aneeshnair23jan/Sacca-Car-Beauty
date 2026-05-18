import { requireAuth } from '@/lib/auth';
import { upload, runMiddleware, uploadFilesToStorage, getStoredFileUrl } from '@/lib/upload';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    requireAuth(req);
    await runMiddleware(req, res, upload.single('image'));

    if (!req.file) return res.status(400).json({ error: 'Image file is required' });

    const [storedImage] = await uploadFilesToStorage([req.file]);
    return res.status(201).json({
      filename: storedImage.filename,
      url: getStoredFileUrl(storedImage.filename),
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: err.message });
  }
}
