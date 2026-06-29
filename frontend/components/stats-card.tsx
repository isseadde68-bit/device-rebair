'use client';

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'green' | 'orange';
  trend?: string;
}

export function StatsCard({ label, value, icon: Icon, color, trend }: StatsCardProps) {
  const themes = {
    blue: 'from-blue-600/10 via-blue-600/5 to-transparent border-blue-500/20 text-blue-500',
    purple: 'from-purple-600/10 via-purple-600/5 to-transparent border-purple-500/20 text-purple-500',
    green: 'from-emerald-600/10 via-emerald-600/5 to-transparent border-emerald-500/20 text-emerald-500',
    orange: 'from-orange-600/10 via-orange-600/5 to-transparent border-orange-500/20 text-orange-500',
    red: 'from-red-600/10 via-red-600/5 to-transparent border-red-500/20 text-red-500',
  };

  return (
    <div className={`relative group overflow-hidden bg-gradient-to-br ${themes[color as keyof typeof themes]} rounded-[2rem] border p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-black/50 hover:scale-[1.02] animate-fadeInUp`}>
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-current opacity-[0.03] rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
      
      <div className="relative flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 shadow-2xl group-hover:scale-110 transition-transform duration-500">
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {trend}
            </span>
          )}
        </div>

        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-white tracking-tight">{value}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
