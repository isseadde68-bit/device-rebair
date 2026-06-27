import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { Device } from '../models/Device.js';
import { Technician } from '../models/Technician.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { notifyRepairUpdate } from '../services/repair-notifications.js';

export const devicesRouter = Router();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toPublicRepair(device) {
  const id = String(device._id);
  return {
    id,
    ref: id.slice(-6).toUpperCase(),
    customerName: device.customerName,
    deviceType: device.deviceType,
    status: device.status,
    date: device.date,
    problem: device.problem
  };
}

function toPublicRepairDetail(device) {
  const id = String(device._id);
  const technicianName = device.technician?.name || null;
  return {
    ...toPublicRepair(device),
    phone: device.phone,
    customerEmail: device.customerEmail || '',
    notes: device.notes || '',
    cost: device.cost ?? 0,
    technicianName,
    updates: (device.updates || []).map((u) => ({
      status: u.status,
      notes: u.notes || '',
      updatedBy: u.updatedBy,
      updatedByRole: u.updatedByRole,
      createdAt: u.createdAt
    }))
  };
}

function mapUpdates(device) {
  return (device.updates || []).map((u) => ({
    status: u.status,
    notes: u.notes || '',
    updatedBy: u.updatedBy,
    updatedByRole: u.updatedByRole,
    createdAt: u.createdAt
  }));
}

function recordUpdate(device, user, { status, notes }) {
  if (!device.updates) device.updates = [];
  device.updates.push({
    status,
    notes: notes || '',
    updatedBy: user.name,
    updatedByRole: user.role,
    createdAt: new Date()
  });
}

async function upsertCustomerAccount({ name, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });

  if (existing && existing.role !== 'customer') {
    throw new Error('EMAIL_IN_USE_BY_STAFF');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    existing.name = name;
    existing.passwordHash = passwordHash;
    await existing.save();
    return existing;
  }

  return User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role: 'customer',
  });
}

// Public — customer repair tracking (no auth)
devicesRouter.get('/track', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (q.length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }

  const or = [
    { customerName: new RegExp(escapeRegex(q), 'i') },
    { phone: new RegExp(escapeRegex(q), 'i') }
  ];

  const digits = q.replace(/\D/g, '');
  if (digits.length >= 3) {
    or.push({ phone: new RegExp(escapeRegex(digits), 'i') });
  }

  if (/^[a-f0-9]{24}$/i.test(q)) {
    or.push({ _id: q });
  }

  or.push({
    $expr: {
      $regexMatch: {
        input: { $toString: '$_id' },
        regex: new RegExp(`${escapeRegex(q)}$`, 'i')
      }
    }
  });

  const repairs = await Device.find({ $or: or })
    .select('customerName deviceType status date problem phone')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  res.json({ repairs: repairs.map(toPublicRepair) });
});

// Public — single repair detail with technician updates (no auth)
devicesRouter.get('/track/:id', async (req, res) => {
  const device = await Device.findById(req.params.id)
    .populate('technician')
    .lean();

  if (!device) {
    return res.status(404).json({ error: 'Repair not found' });
  }

  res.json({ repair: toPublicRepairDetail(device) });
});

devicesRouter.get('/', requireAuth(), async (req, res) => {
  const { status, technicianId, q } = req.query;

  const filter = {};
  if (typeof status === 'string' && status.length) filter.status = status;
  if (typeof technicianId === 'string' && technicianId.length) filter.technician = technicianId;

  if (typeof q === 'string' && q.trim().length) {
    const r = new RegExp(q.trim(), 'i');
    filter.$or = [{ customerName: r }, { deviceType: r }, { phone: r }];
  }

  // Technicians only see devices assigned to their linked technician profile
  if (req.user.role === 'technician') {
    if (req.user.technicianId) {
      filter.technician = req.user.technicianId;
    } else {
      filter.technician = null;
    }
  }

  // Customers only see their own repairs (matched by Gmail on file)
  if (req.user.role === 'customer') {
    filter.customerEmail = req.user.email.toLowerCase();
  }

  const devices = await Device.find(filter)
    .populate('technician')
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    devices: devices.map((d) => ({
      ...d,
      id: String(d._id),
      technicianId: d.technician?._id ? String(d.technician._id) : undefined,
      technicianName: d.technician?.name || undefined,
      updates: mapUpdates(d)
    }))
  });
});

devicesRouter.post('/', requireAuth(), requireRole(['admin']), async (req, res) => {
  const schema = z.object({
    customerName: z.string().min(1),
    phone: z.string().min(1),
    customerEmail: z.string().email(),
    customerPassword: z.string().min(6),
    deviceType: z.string().min(1),
    problem: z.string().min(1),
    status: z.enum(['pending', 'in-progress', 'completed', 'hold']).optional(),
    technicianId: z.string().optional(),
    cost: z.number().nonnegative(),
    date: z.string().min(1),
    notes: z.string().optional().default('')
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const { technicianId, customerPassword, customerEmail, ...rest } = parsed.data;

  try {
    await upsertCustomerAccount({
      name: rest.customerName,
      email: customerEmail,
      password: customerPassword,
    });
  } catch (err) {
    if (err.message === 'EMAIL_IN_USE_BY_STAFF') {
      return res.status(400).json({ error: 'This email belongs to a staff account. Use a different Gmail.' });
    }
    throw err;
  }

  const device = await Device.create({
    ...rest,
    customerEmail: customerEmail.toLowerCase(),
    technician: technicianId || null
  });

  if (technicianId) {
    const techUser = await User.findOne({ role: 'technician' }).populate('technician').lean();
    // best-effort notification: find technician user by technicianId
    const user = await User.findOne({ role: 'technician', technician: technicianId }).lean();
    await Notification.create({
      user: user?._id || null,
      title: 'New Assignment',
      message: `You have been assigned a new device: ${device.deviceType} (${device.problem})`
    });
  }

  res.status(201).json({
    device: { ...device.toObject(), id: String(device._id), technicianId: technicianId || undefined }
  });
});

devicesRouter.patch('/:id', requireAuth(), async (req, res) => {
  const schema = z.object({
    customerName: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    customerEmail: z.union([z.string().email(), z.literal('')]).optional(),
    deviceType: z.string().min(1).optional(),
    problem: z.string().min(1).optional(),
    status: z.enum(['pending', 'in-progress', 'completed', 'hold']).optional(),
    technicianId: z.string().nullable().optional(),
    cost: z.number().nonnegative().optional(),
    date: z.string().min(1).optional(),
    notes: z.string().optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const device = await Device.findById(req.params.id);
  if (!device) return res.status(404).json({ error: 'Not found' });

  const oldStatus = device.status;
  const oldNotes = device.notes || '';

  // technicians can only update status/notes of their assigned device
  if (req.user.role === 'technician') {
    if (!req.user.technicianId || String(device.technician || '') !== String(req.user.technicianId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const allowed = {};
    if (parsed.data.status !== undefined) allowed.status = parsed.data.status;
    if (parsed.data.notes !== undefined) allowed.notes = parsed.data.notes;
    Object.assign(device, allowed);
  } else {
    if (parsed.data.customerName !== undefined) device.customerName = parsed.data.customerName;
    if (parsed.data.phone !== undefined) device.phone = parsed.data.phone;
    if (parsed.data.customerEmail !== undefined) device.customerEmail = parsed.data.customerEmail || '';
    if (parsed.data.deviceType !== undefined) device.deviceType = parsed.data.deviceType;
    if (parsed.data.problem !== undefined) device.problem = parsed.data.problem;
    if (parsed.data.status !== undefined) device.status = parsed.data.status;
    if (parsed.data.technicianId !== undefined) device.technician = parsed.data.technicianId || null;
    if (parsed.data.cost !== undefined) device.cost = parsed.data.cost;
    if (parsed.data.date !== undefined) device.date = parsed.data.date;
    if (parsed.data.notes !== undefined) device.notes = parsed.data.notes;
  }

  const statusChanged = parsed.data.status !== undefined && parsed.data.status !== oldStatus;
  const notesChanged = parsed.data.notes !== undefined && parsed.data.notes !== oldNotes;

  if (statusChanged || notesChanged) {
    recordUpdate(device, req.user, {
      status: device.status,
      notes: device.notes || ''
    });

    notifyRepairUpdate(device, req.user, { statusChanged, notesChanged }).catch((err) =>
      console.error('[notify] repair update failed:', err.message)
    );
  }

  const oldTech = device.technician ? String(device.technician) : null;

  await device.save();

  // Notifications (best effort)
  if (req.user.role === 'admin') {
    if (parsed.data.technicianId && parsed.data.technicianId !== oldTech) {
      const user = await User.findOne({ role: 'technician', technician: parsed.data.technicianId }).lean();
      await Notification.create({
        user: user?._id || null,
        title: 'New Assignment',
        message: `You have been assigned to repair: ${device.deviceType}`
      });
    }
  }

  if (parsed.data.status === 'completed' && oldStatus !== 'completed') {
    await Notification.create({
      user: null,
      title: 'Repair Completed',
      message: `Repair completed for ${device.deviceType} (${device.customerName})`
    });
  }

  const populated = await Device.findById(device._id).populate('technician').lean();

  res.json({
    device: {
      ...populated,
      id: String(populated._id),
      technicianId: populated.technician?._id ? String(populated.technician._id) : undefined,
      technicianName: populated.technician?.name || undefined,
      updates: mapUpdates(populated)
    }
  });
});

devicesRouter.delete('/:id', requireAuth(), requireRole(['admin']), async (req, res) => {
  const device = await Device.findById(req.params.id);
  if (!device) return res.status(404).json({ error: 'Not found' });
  await device.deleteOne();
  res.status(204).send();
});

