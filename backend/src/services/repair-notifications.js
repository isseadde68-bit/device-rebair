import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { sendRepairUpdateEmail, sendStaffUpdateEmail } from './email.js';

const STATUS_LABELS = {
  pending: 'Pending',
  'in-progress': 'Active Repair',
  completed: 'Ready for Pickup',
  hold: 'On Hold',
};

function buildMessage(device, status, updatedBy, updatedByRole) {
  const statusLabel = STATUS_LABELS[status] || status;
  const roleLabel = updatedByRole === 'technician' ? 'Technician' : 'Admin';
  return `${roleLabel} ${updatedBy} updated ${device.deviceType} (${device.customerName}) → ${statusLabel}`;
}

export async function notifyRepairUpdate(device, user, { statusChanged, notesChanged }) {
  const ref = String(device._id).slice(-6).toUpperCase();
  const message = buildMessage(device, device.status, user.name, user.role);
  const notes = device.notes || '';
  const emailPayload = {
    deviceType: device.deviceType,
    customerName: device.customerName,
    ref,
    status: device.status,
    notes: notesChanged ? notes : '',
    updatedBy: user.name,
    updatedByRole: user.role,
  };

  const tasks = [];

  if (device.customerEmail) {
    tasks.push(
      sendRepairUpdateEmail({
        to: device.customerEmail,
        customerName: device.customerName,
        ...emailPayload,
      }).catch((err) => console.error('[email] customer update failed:', err.message))
    );
  }

  if (user.role === 'technician') {
    const admins = await User.find({ role: 'admin' }).lean();
    for (const admin of admins) {
      tasks.push(
        Notification.create({
          user: admin._id,
          title: 'Technician Update',
          message,
        })
      );
      if (admin.email) {
        tasks.push(
          sendStaffUpdateEmail({
            to: admin.email,
            name: admin.name,
            ...emailPayload,
          }).catch((err) => console.error('[email] admin update failed:', err.message))
        );
      }
    }
  }

  if (user.role === 'admin' && device.technician) {
    const techUser = await User.findOne({
      role: 'technician',
      technician: device.technician,
    }).lean();

    if (techUser) {
      tasks.push(
        Notification.create({
          user: techUser._id,
          title: 'Admin Update',
          message,
        })
      );
      if (techUser.email) {
        tasks.push(
          sendStaffUpdateEmail({
            to: techUser.email,
            name: techUser.name,
            ...emailPayload,
          }).catch((err) => console.error('[email] technician update failed:', err.message))
        );
      }
    }
  }

  await Promise.all(tasks);
}
