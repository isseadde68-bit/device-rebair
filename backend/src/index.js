import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDb } from './db.js';
import { ensureDefaultUsers } from './bootstrap.js';
import { authRouter } from './routes/auth.js';
import { devicesRouter } from './routes/devices.js';
import { techniciansRouter } from './routes/technicians.js';
import { notificationsRouter } from './routes/notifications.js';
import { reportsRouter } from './routes/reports.js';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/devices', devicesRouter);
app.use('/api/technicians', techniciansRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/reports', reportsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = Number(process.env.PORT || 4000);

await connectDb(process.env.MONGODB_URI);
await ensureDefaultUsers();
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});

