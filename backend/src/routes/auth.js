import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import {
  createResetToken,
  hashResetToken,
  sendPasswordResetEmail,
  isEmailConfigured,
} from '../services/email.js';

export const authRouter = Router();

function toPublicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    technicianId: user.technician ? String(user.technician) : null,
  };
}

const appUrl = () => process.env.APP_URL || 'http://localhost:3000';

authRouter.post('/login', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { email, password } = parsed.data;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ sub: String(user._id), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  return res.json({
    token,
    user: toPublicUser(user),
  });
});

authRouter.post('/forgot-password', async (req, res) => {
  const schema = z.object({ email: z.string().email() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await User.findOne({ email, role: 'admin' });

  // Always respond success to avoid revealing whether email exists
  const genericMessage =
    'If an admin account exists for this email, a reset link has been sent.';

  if (!user) {
    return res.json({ message: genericMessage });
  }

  const rawToken = createResetToken();
  user.resetPasswordToken = hashResetToken(rawToken);
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetUrl = `${appUrl()}/login/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });

  return res.json({
    message: genericMessage,
    emailConfigured: isEmailConfigured(),
  });
});

authRouter.post('/reset-password', async (req, res) => {
  const schema = z.object({
    token: z.string().min(1),
    password: z.string().min(6),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Token and password (min 6 chars) are required' });
  }

  const { token, password } = parsed.data;
  const user = await User.findOne({
    resetPasswordToken: hashResetToken(token),
    resetPasswordExpires: { $gt: new Date() },
    role: 'admin',
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired reset link' });
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return res.json({ message: 'Password updated successfully. You can sign in now.' });
});

authRouter.get('/me', requireAuth(), async (req, res) => {
  return res.json({ user: req.user });
});
