import { verifyClerkToken } from '../lib/clerkAuth.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = header.substring(7);
    const payload = await verifyClerkToken(token);
    req.auth = { token, userId: payload.sub, claims: payload };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized', detail: e.message });
  }
}
