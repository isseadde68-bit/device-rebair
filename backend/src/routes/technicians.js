import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { Technician } from '../models/Technician.js';
import { User } from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const techniciansRouter = Router();

techniciansRouter.get('/', requireAuth(), async (_req, res) => {
  const techs = await Technician.find().sort({ createdAt: -1 }).lean();
  res.json({ technicians: techs.map((t) => ({ ...t, id: String(t._id) })) });
});

techniciansRouter.post('/', requireAuth(), requireRole(['admin']), async (req, res) => {
  const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional().default(''),
    specialization: z.string().optional().default(''),
    password: z.string().min(6).optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const { name, email, phone, specialization, password } = parsed.data;

  const tech = await Technician.create({ name, email: email.toLowerCase(), phone, specialization });

  // Create matching user for login
  const passwordHash = await bcrypt.hash(password || '123456', 10);
  await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: 'technician',
    technician: tech._id
  });

  res.status(201).json({ technician: { ...tech.toObject(), id: String(tech._id) } });
});

techniciansRouter.patch('/:id', requireAuth(), requireRole(['admin']), async (req, res) => {
  const schema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    specialization: z.string().optional(),
    password: z.string().min(6).optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const tech = await Technician.findById(req.params.id);
  if (!tech) return res.status(404).json({ error: 'Not found' });

  const oldEmail = tech.email;
  if (parsed.data.name !== undefined) tech.name = parsed.data.name;
  if (parsed.data.email !== undefined) tech.email = parsed.data.email.toLowerCase();
  if (parsed.data.phone !== undefined) tech.phone = parsed.data.phone;
  if (parsed.data.specialization !== undefined) tech.specialization = parsed.data.specialization;
  await tech.save();

  // sync user
  const user = await User.findOne({ email: oldEmail.toLowerCase(), role: 'technician' });
  if (user) {
    if (parsed.data.name !== undefined) user.name = parsed.data.name;
    if (parsed.data.email !== undefined) user.email = parsed.data.email.toLowerCase();
    if (parsed.data.password !== undefined) user.passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await user.save();
  }

  res.json({ technician: { ...tech.toObject(), id: String(tech._id) } });
});

techniciansRouter.delete('/:id', requireAuth(), requireRole(['admin']), async (req, res) => {
  const tech = await Technician.findById(req.params.id);
  if (!tech) return res.status(404).json({ error: 'Not found' });

  await User.deleteOne({ email: tech.email.toLowerCase(), role: 'technician' });
  await tech.deleteOne();
  res.status(204).send();
});

