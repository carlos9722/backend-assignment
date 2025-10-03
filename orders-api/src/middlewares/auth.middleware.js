const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function serviceAuth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token === process.env.SERVICE_TOKEN) return next();
  return res.status(403).json({ error: 'Forbidden' });
}

module.exports = { authenticate, serviceAuth };
