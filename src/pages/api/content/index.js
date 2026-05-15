import { connectDb, Setting } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { CMS_SETTING_KEY, parseCmsContent, serializeCmsContent } from '@/lib/cms';

export default async function handler(req, res) {
  await connectDb();

  if (req.method === 'GET') {
    const row = await Setting.findOne({ key: CMS_SETTING_KEY }).lean();
    return res.json(parseCmsContent({ [CMS_SETTING_KEY]: row?.value }));
  }

  if (req.method === 'PUT') {
    try {
      requireAuth(req);
      const value = serializeCmsContent(req.body);
      await Setting.updateOne({ key: CMS_SETTING_KEY }, { key: CMS_SETTING_KEY, value }, { upsert: true });
      return res.json(parseCmsContent({ [CMS_SETTING_KEY]: value }));
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
