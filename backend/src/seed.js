import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDb } from './db.js';
import { User } from './models/User.js';
import { Technician } from './models/Technician.js';
import { Device } from './models/Device.js';

try {
  await connectDb(process.env.MONGODB_URI);
} catch (e) {
  console.error('Failed to connect to MongoDB. Is it running?');
  console.error(e?.message || e);
  process.exit(1);
}

// Reset collections (dev-friendly)
await Promise.all([User.deleteMany({}), Technician.deleteMany({}), Device.deleteMany({})]);

const tech1 = await Technician.create({
  name: 'John Smith',
  email: 'john@repair.com',
  phone: '+1234567890',
  specialization: 'Mobile Repairs'
});
const tech2 = await Technician.create({
  name: 'Sarah Johnson',
  email: 'sarah@repair.com',
  phone: '+0987654321',
  specialization: 'Laptop Repairs'
});

await User.create({
  name: 'Admin User',
  email: 'admin@gmail.com',
  passwordHash: await bcrypt.hash('123456', 10),
  role: 'admin'
});

await User.create({
  name: 'Technician User',
  email: 'tech@gmail.com',
  passwordHash: await bcrypt.hash('123456', 10),
  role: 'technician',
  technician: tech1._id
});

await User.create({
  name: tech1.name,
  email: tech1.email,
  passwordHash: await bcrypt.hash('123456', 10),
  role: 'technician',
  technician: tech1._id
});
await User.create({
  name: tech2.name,
  email: tech2.email,
  passwordHash: await bcrypt.hash('123456', 10),
  role: 'technician',
  technician: tech2._id
});

const today = new Date().toISOString().slice(0, 10);

await Device.create([
  {
    customerName: 'Alice Brown',
    phone: '+1234567890',
    deviceType: 'iPhone',
    problem: 'Screen replacement needed',
    status: 'pending',
    technician: tech1._id,
    cost: 150,
    date: today,
    notes: 'Cracked screen, customer needs it by Friday'
  },
  {
    customerName: 'Bob Davis',
    phone: '+0987654321',
    deviceType: 'Samsung Galaxy',
    problem: 'Battery not charging',
    status: 'in-progress',
    technician: tech2._id,
    cost: 80,
    date: today,
    notes: 'Replaced charging port'
  },
  {
    customerName: 'Carol White',
    phone: '+1122334455',
    deviceType: 'iPad',
    problem: 'Software issue',
    status: 'completed',
    technician: tech1._id,
    cost: 50,
    date: today,
    notes: 'Reinstalled iOS'
  }
]);

console.log('Seed complete');
process.exit(0);

