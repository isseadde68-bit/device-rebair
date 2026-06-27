import { Router } from 'express';
import { Notification } from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';

export const notificationsRouter = Router();

notificationsRouter.get('/', requireAuth(), async (req, res) => {
  // broadcast (user null) + user-specific
  const notifs = await Notification.find({
    $or: [{ user: null }, { user: req.user.id }]
  })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  res.json({
    notifications: notifs.map((n) => ({
      id: String(n._id),
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      date: n.createdAt
    }))
  });
});

notificationsRouter.post('/:id/read', requireAuth(), async (req, res) => {
  const notif = await Notification.findById(req.params.id);
  if (!notif) return res.status(404).json({ error: 'Not found' });
  // If notif.user is set, it must match current user
  if (notif.user && String(notif.user) !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  notif.isRead = true;
  await notif.save();
  res.status(204).send();
});

