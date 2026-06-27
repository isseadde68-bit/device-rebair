import mongoose from 'mongoose';

const TechnicianSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    specialization: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Technician =
  mongoose.models.Technician || mongoose.model('Technician', TechnicianSchema);

