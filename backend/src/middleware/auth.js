import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export function requireAuth() {
  return async (req, res, next) => {
    try {
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice(7) : null;
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.sub).lean();
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      req.user = { 
        id: String(user._id), 
        role: user.role, 
        name: user.name, 
        email: user.email,
        technicianId: user.technician ? String(user.technician) : null
      };
      next();
    } catch {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

