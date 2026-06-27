import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    customerEmail: { type: String, default: '', trim: true, lowercase: true },
    deviceType: { type: String, required: true, trim: true },
    problem: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'in-progress', 'completed', 'hold'],
      default: 'pending'
    },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician', default: null },
    cost: { type: Number, required: true, default: 0 },
    date: { type: String, required: true }, // ISO yyyy-mm-dd
    notes: { type: String, default: '' },
    updates: {
      type: [
        {
          status: { type: String, required: true },
          notes: { type: String, default: '' },
          updatedBy: { type: String, required: true },
          updatedByRole: { type: String, enum: ['admin', 'technician'], required: true },
          createdAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

DeviceSchema.index({ status: 1, date: 1 });
DeviceSchema.index({ customerName: 1 });
DeviceSchema.index({ deviceType: 1 });

export const Device = mongoose.models.Device || mongoose.model('Device', DeviceSchema);

