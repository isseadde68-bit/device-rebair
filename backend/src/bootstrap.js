import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Technician } from './models/Technician.js';

const DEFAULT_PASSWORD = '123456';

const DEFAULT_ACCOUNTS = [
  {
    name: 'Admin User',
    email: 'admin@gmail.com',
    role: 'admin',
  },
  {
    name: 'Technician User',
    email: 'tech@gmail.com',
    role: 'technician',
    technician: {
      name: 'Technician User',
      email: 'tech@gmail.com',
      phone: '',
      specialization: 'General Repairs',
    },
  },
];

export async function ensureDefaultUsers() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const account of DEFAULT_ACCOUNTS) {
    const email = account.email.toLowerCase();
    const existing = await User.findOne({ email });

    if (existing) continue;

    let technicianId = null;
    if (account.role === 'technician' && account.technician) {
      let tech = await Technician.findOne({ email: account.technician.email.toLowerCase() });
      if (!tech) {
        tech = await Technician.create({
          name: account.technician.name,
          email: account.technician.email.toLowerCase(),
          phone: account.technician.phone,
          specialization: account.technician.specialization,
        });
      }
      technicianId = tech._id;
    }

    await User.create({
      name: account.name,
      email,
      passwordHash,
      role: account.role,
      technician: technicianId,
    });

    console.log(`Created default account: ${email} (${account.role})`);
  }
}
