'use client';

import { Modal } from '@/components/modal';
import { StatusBadge } from '@/components/status-badge';
import { Device, DeviceUpdate } from '@/lib/localStorage';
import {
  User,
  Smartphone,
  Phone,
  Calendar,
  Hash,
  Wrench,
  MessageSquare,
  Clock,
  DollarSign,
  AlertCircle,
  Mail,
} from 'lucide-react';

export interface RepairDetail {
  id: string;
  ref?: string;
  customerName: string;
  deviceType: string;
  status: Device['status'];
  date: string;
  problem: string;
  phone?: string;
  customerEmail?: string;
  notes?: string;
  cost?: number;
  technicianName?: string;
  updates?: DeviceUpdate[];
}

interface DeviceDetailModalProps {
  repair: RepairDetail | Device | null;
  isOpen: boolean;
  onClose: () => void;
  mode?: 'staff' | 'customer';
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

function UpdateTimeline({ updates }: { updates: DeviceUpdate[] }) {
  if (!updates.length) {
    return (
      <p className="text-sm text-slate-400 italic py-4 text-center">
        Weli wax update ah lama sameyn.
      </p>
    );
  }

  const sorted = [...updates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
      {sorted.map((update, i) => (
        <div
          key={`${update.createdAt}-${i}`}
          className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 space-y-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <StatusBadge status={update.status} />
              <span className="text-xs text-slate-400">
                {update.updatedByRole === 'technician' ? 'Technician' : 'Admin'}:{' '}
                <span className="text-slate-200 font-medium">{update.updatedBy}</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(update.createdAt)}
            </span>
          </div>
          {update.notes ? (
            <p className="text-sm text-slate-300 leading-relaxed">{update.notes}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function DeviceDetailModal({
  repair,
  isOpen,
  onClose,
  mode = 'staff',
}: DeviceDetailModalProps) {
  if (!repair) return null;

  const ref =
    repair.ref ||
    (repair.id ? repair.id.toString().slice(-6).toUpperCase() : '------');
  const updates = repair.updates || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Faahfaahinta Dayactirka">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
              Tixraac
            </p>
            <p className="text-lg font-black text-white flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-400" />#{ref}
            </p>
          </div>
          <StatusBadge status={repair.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow icon={<User className="w-4 h-4" />} label="Macmiil" value={repair.customerName} />
          <DetailRow icon={<Smartphone className="w-4 h-4" />} label="Qalab" value={repair.deviceType} />
          {repair.phone ? (
            <DetailRow icon={<Phone className="w-4 h-4" />} label="Telefoon" value={repair.phone} />
          ) : null}
          {mode === 'staff' && repair.customerEmail ? (
            <DetailRow icon={<Mail className="w-4 h-4" />} label="Email" value={repair.customerEmail} />
          ) : null}
          <DetailRow icon={<Calendar className="w-4 h-4" />} label="Taariikh" value={repair.date} />
          {repair.technicianName ? (
            <DetailRow
              icon={<Wrench className="w-4 h-4" />}
              label="Technician"
              value={repair.technicianName}
            />
          ) : null}
          {mode === 'staff' && repair.cost !== undefined ? (
            <DetailRow
              icon={<DollarSign className="w-4 h-4" />}
              label="Qiimaha"
              value={`$${repair.cost}`}
            />
          ) : null}
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Dhibaatada
          </p>
          <p className="text-sm text-slate-200">{repair.problem}</p>
        </div>

        {repair.notes ? (
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Xogta ugu dambeysay
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">{repair.notes}</p>
          </div>
        ) : null}

        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Taariikhda Update-ka
          </p>
          <UpdateTimeline updates={updates} />
        </div>

        {mode === 'customer' && updates.length > 0 ? (
          <p className="text-xs text-blue-400/80 text-center">
            Haddii email laguu diiwaangeliyay, waxaad sidoo kale Gmail ka heli doontaa ogeysiiska.
          </p>
        ) : null}
      </div>
    </Modal>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/30 p-3">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}
