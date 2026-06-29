'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { useDevices } from '@/hooks/useDevices';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, Clock, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import { StatsCard } from '@/components/stats-card';
import Link from 'next/link';

export function TechnicianDashboard() {
  const { user } = useAuth();
  const { devices } = useDevices();

  // Get devices assigned to this technician
  const assignedDevices = devices.filter((d) => d.technicianId === user?.technicianId) || [];
  const inProgressDevices = assignedDevices.filter((d) => d.status === 'in-progress').length;
  const completedDevices = assignedDevices.filter((d) => d.status === 'completed').length;
  const holdDevices = assignedDevices.filter((d) => d.status === 'hold').length;

  return (
    <div className="space-y-10 pb-20">
      {/* Cinematic Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-2">
            Technician <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">Terminal</span>
          </h1>
          <p className="text-slate-400 text-lg">Assigned Repair Operations • Logged as {user?.name}</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
           <div className="px-4 py-2 bg-violet-600 rounded-xl text-white font-bold text-sm shadow-lg shadow-violet-900/40">Active Session</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Assigned Tasks" value={assignedDevices.length} icon={Wrench} color="blue" />
        <StatsCard label="In Progress" value={inProgressDevices} icon={Clock} color="orange" />
        <StatsCard label="Completed" value={completedDevices} icon={CheckCircle} color="green" />
        <StatsCard label="On Hold" value={holdDevices} icon={AlertCircle} color="red" />
      </div>

      {/* Action Center */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden group hover:bg-slate-900/60 transition-all duration-500">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-3xl font-black text-white flex items-center gap-4">
               <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
                  <Wrench className="w-8 h-8" />
               </div>
               My Repair Workspace
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
               Access your full diagnostic suite and manage repair pipelines with high precision.
            </p>
            <Link href="/repairs">
              <Button className="w-full h-16 rounded-[1.5rem] bg-blue-600 hover:bg-blue-500 text-white font-black text-lg shadow-xl shadow-blue-900/40 transition-all active:scale-[0.98]">
                 Enter Workspace
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-3xl font-black text-white flex items-center gap-4">
               <div className="p-3 rounded-2xl bg-emerald-600/10 text-emerald-500 border border-emerald-500/20">
                  <Activity className="w-8 h-8" />
               </div>
               Efficiency Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-6">
            <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5">
              <div className="flex justify-between items-end mb-4">
                 <div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Completion Rate</p>
                    <p className="text-4xl font-black text-white">
                      {assignedDevices.length > 0 ? Math.round((completedDevices / assignedDevices.length) * 100) : 0}%
                    </p>
                 </div>
                 <div className="text-emerald-500 font-bold text-sm bg-emerald-500/10 px-3 py-1 rounded-lg">Performance: Optimal</div>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                   style={{ width: `${assignedDevices.length > 0 ? (completedDevices / assignedDevices.length) * 100 : 0}%` }} 
                 />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Assignments</p>
                  <p className="text-2xl font-black text-white">{assignedDevices.length}</p>
               </div>
               <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Success Metric</p>
                  <p className="text-2xl font-black text-white">{completedDevices}</p>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
