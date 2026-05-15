import { connectDb, Setting } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export default async function handler(req, res) {
  await connectDb();

  if (req.method === 'GET') {
    try {
      const rows = await Setting.find().lean();
      const settings = {};
      rows.forEach((r) => { settings[r.key] = r.value; });
      return res.json(settings);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      requireAuth(req);
      for (const [key, value] of Object.entries(req.body)) {
        await Setting.updateOne({ key }, { key, value }, { upsert: true });
      }
      const rows = await Setting.find().lean();
      const settings = {};
      rows.forEach((r) => { settings[r.key] = r.value; });
      return res.json(settings);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
