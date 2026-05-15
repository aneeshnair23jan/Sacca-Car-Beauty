import bcrypt from 'bcryptjs';
import { connectDb, AdminUser } from '@/lib/db';
import { signToken } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required' });

    await connectDb();
    const user = await AdminUser.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid username or password' });

    const token = signToken({ id: user._id.toString(), username: user.username });
    return res.json({ token, username: user.username });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
