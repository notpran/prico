export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  // Placeholder: Accept any Bearer token for now; extend with Clerk/JWT validation later.
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.auth = { token: header.substring(7) };
  next();
}
