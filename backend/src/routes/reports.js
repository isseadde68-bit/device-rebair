import { Router } from 'express';
import { Device } from '../models/Device.js';
import { Technician } from '../models/Technician.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const reportsRouter = Router();

reportsRouter.get('/summary', requireAuth(), requireRole(['admin']), async (_req, res) => {
  const devices = await Device.find().lean();
  const technicians = await Technician.find().lean();

  const total = devices.length;
  const completed = devices.filter((d) => d.status === 'completed').length;
  const pending = devices.filter((d) => d.status === 'pending').length;
  const inProgress = devices.filter((d) => d.status === 'in-progress').length;
  const hold = devices.filter((d) => d.status === 'hold').length;

  const revenue = devices
    .filter((d) => d.status === 'completed')
    .reduce((sum, d) => sum + (d.cost || 0), 0);

  const techPerformance = technicians.map((t) => {
    const assigned = devices.filter((d) => String(d.technician || '') === String(t._id)).length;
    const techCompleted = devices.filter(
      (d) => String(d.technician || '') === String(t._id) && d.status === 'completed'
    ).length;
    return {
      id: String(t._id),
      name: t.name,
      assigned,
      completed: techCompleted,
      rate: assigned > 0 ? Number(((techCompleted / assigned) * 100).toFixed(1)) : 0
    };
  });

  res.json({
    stats: { total, completed, pending, inProgress, hold, revenue },
    techPerformance
  });
});

