import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sacca-car-beauty-secret-key-change-in-production';
const JWT_EXPIRES = '24h';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Extract and verify the Bearer token from a Next.js API request.
 * Returns the decoded payload or throws if invalid/missing.
 */
export function requireAuth(req) {
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) {
    const err = new Error('Authentication required');
    err.status = 401;
    throw err;
  }
  const token = authHeader.slice(7);
  try {
    return verifyToken(token);
  } catch {
    const err = new Error('Invalid or expired token');
    err.status = 401;
    throw err;
  }
}
