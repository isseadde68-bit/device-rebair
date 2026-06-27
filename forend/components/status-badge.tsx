'use client';

import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: 'pending' | 'in-progress' | 'completed' | 'hold' | string;
}

const statusConfig = {
  pending: {
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    label: 'Pending Diagnostic',
  },
  'in-progress': {
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    label: 'Active Repair',
  },
  completed: {
    className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    label: 'Ready for Pickup',
  },
  hold: {
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
    label: 'Operation Halted',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    className: 'bg-slate-500/10 text-slate-400 border-white/5',
    label: status || 'Awaiting Data',
  };

  return (
    <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${config.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {config.label}
    </div>
  );
}
