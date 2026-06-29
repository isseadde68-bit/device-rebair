'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useDevices } from '@/hooks/useDevices';
import { useAuth } from '@/lib/auth-context';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Wrench, 
  Phone, 
  Calendar, 
  DollarSign, 
  Send, 
  ArrowRight, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  PauseCircle,
  Hash,
  MessageSquare
} from 'lucide-react';
import { Device } from '@/lib/localStorage';

export default function RepairsPage() {
  const { user } = useAuth();
  const { devices, updateDevice } = useDevices();
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);
  
  // Form Draft States
  const [draftStatus, setDraftStatus] = useState<{ [key: string]: string }>({});
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  const myDevices = useMemo(() => 
    devices.filter((d: Device) => d.technicianId === user?.technicianId && d.status !== 'completed'),
    [devices, user?.technicianId]
  );

  // Statistics
  const stats = useMemo(() => ({
    total: myDevices.length,
    pending: myDevices.filter(d => d.status === 'pending').length,
    inProgress: myDevices.filter(d => d.status === 'in-progress').length,
    onHold: myDevices.filter(d => d.status === 'hold').length,
  }), [myDevices]);

  const handleExpand = (device: Device) => {
    if (expandedDevice === device.id) {
       setExpandedDevice(null);
    } else {
       setExpandedDevice(device.id);
       // Initialize draft states
       setDraftStatus({ ...draftStatus, [device.id]: device.status });
       setNotes({ ...notes, [device.id]: device.notes || '' });
    }
  };

  const handleSubmitUpdate = async (deviceId: string) => {
    const device = myDevices.find((d: Device) => d.id === deviceId);
    if (device) {
      await updateDevice(deviceId, {
        status: (draftStatus[deviceId] || device.status) as 'pending' | 'in-progress' | 'completed' | 'hold',
        notes: notes[deviceId] !== undefined ? notes[deviceId] : device.notes,
      });
      setExpandedDevice(null);
    }
  };

  return (
    <DashboardLayout allowedRoles={['technician']}>
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-500 border border-blue-500/20">
              <Wrench className="w-8 h-8" />
            </div>
            My Workspace
          </h1>
          <p className="text-slate-400 text-lg">Manage and track your assigned repair operations.</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Tasks" value={stats.total} icon={<Wrench className="w-5 h-5" />} color="bg-blue-500" />
          <StatCard label="Pending" value={stats.pending} icon={<Clock className="w-5 h-5" />} color="bg-yellow-500" />
          <StatCard label="In Progress" value={stats.inProgress} icon={<CheckCircle2 className="w-5 h-5" />} color="bg-green-500" />
          <StatCard label="On Hold" value={stats.onHold} icon={<PauseCircle className="w-5 h-5" />} color="bg-red-500" />
        </div>

        {/* Work Orders List */}
        <div className="grid grid-cols-1 gap-6">
          {myDevices.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 rounded-3xl bg-slate-800/20 border-2 border-dashed border-slate-700">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                <CheckCircle2 className="w-12 h-12 text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Active Repairs</h3>
              <p className="text-slate-400 max-w-sm text-center">Your work list is currently empty. New assignments will appear here as soon as they are registered.</p>
            </div>
          ) : (
            myDevices.map((device: Device) => {
              const isExpanded = expandedDevice === device.id;
              const currentDraftStatus = draftStatus[device.id] || device.status;
              
              return (
                <div 
                  key={device.id} 
                  className={`group relative transition-all duration-500 ease-out rounded-[2rem] overflow-hidden ${
                    isExpanded 
                      ? 'bg-slate-800/80 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/10' 
                      : 'bg-slate-800/40 hover:bg-slate-800/60 ring-1 ring-white/5 hover:ring-white/10'
                  }`}
                >
                  {/* Subtle Gradient Hover Backdrop */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Card Header Content */}
                  <div 
                    className="relative flex flex-col md:flex-row items-stretch md:items-center cursor-pointer p-8 gap-6"
                    onClick={() => handleExpand(device)}
                  >
                    <div className="flex items-center gap-6 flex-1">
                      <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 ${
                        isExpanded ? 'bg-blue-600 text-white rotate-6 shadow-lg shadow-blue-900/40' : 'bg-slate-700/50 text-slate-300'
                      }`}>
                        <Wrench className="w-8 h-8" />
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-bold text-white tracking-tight">{device.deviceType}</h3>
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <Hash className="w-3 h-3" />
                            {(device.id || '').toString().slice(-6)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-sm">
                          <span className="flex items-center gap-1.5"><UserCircle className="w-4 h-4" /> {device.customerName}</span>
                          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {device.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={device.status} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Current Status</span>
                      </div>
                      <div className={`w-12 h-12 rounded-full border border-white/10 flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-white text-slate-900 rotate-90' : 'text-slate-400 group-hover:bg-white/5'}`}>
                        <ArrowRight className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content Area */}
                  {isExpanded && (
                    <div className="relative p-8 pt-0 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-8" />
                      
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Device & Issue Overview */}
                        <div className="lg:col-span-4 space-y-6">
                          <SectionTitle title="Operation Details" />
                          
                          <div className="space-y-4">
                            <InfoCard 
                              icon={<AlertTriangle className="text-amber-500" />} 
                              label="Reported Fault" 
                              value={device.problem} 
                              theme="amber"
                            />
                            <InfoCard 
                              icon={<Phone className="text-blue-500" />} 
                              label="Contact Priority" 
                              value={device.phone} 
                              theme="blue"
                            />
                            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                                  <DollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Repair Quote</p>
                                  <p className="text-2xl font-black text-white">${device.cost}</p>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-tight">Approved</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Interface */}
                        <div className="lg:col-span-8 space-y-8">
                          <SectionTitle title="Technician Control" />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lifecycle State</label>
                              <Select
                                value={currentDraftStatus}
                                onValueChange={(val) => setDraftStatus({ ...draftStatus, [device.id]: val })}
                              >
                                <SelectTrigger className={`h-14 rounded-2xl border-white/10 transition-all font-bold text-sm ${
                                  currentDraftStatus === 'completed' ? 'bg-green-600/10 text-green-400 border-green-500/30' : 
                                  currentDraftStatus === 'hold' ? 'bg-red-600/10 text-red-400 border-red-500/30' : 
                                  'bg-slate-900/80 text-white'
                                }`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white rounded-2xl">
                                  <SelectItem value="pending" className="focus:bg-white/10 focus:text-white rounded-xl">Pending Queue</SelectItem>
                                  <SelectItem value="in-progress" className="focus:bg-white/10 focus:text-white rounded-xl">Active Repair</SelectItem>
                                  <SelectItem value="hold" className="focus:bg-white/10 focus:text-white rounded-xl">Halted (Hold)</SelectItem>
                                  <SelectItem value="completed" className="focus:bg-white/10 focus:text-white rounded-xl tracking-tight font-bold text-green-400">Finalize & Complete</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="bg-blue-600/5 rounded-2xl p-4 border border-blue-500/10 flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                                 <AlertTriangle className="w-5 h-5" />
                               </div>
                               <p className="text-[11px] leading-relaxed text-slate-400 font-medium italic">Make sure all parts are logged before finalizing as complete. Final stats are reported to Admin.</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                              <MessageSquare className="w-3 h-3" /> Repair Logs & Internal Notes
                            </label>
                            <Textarea
                              placeholder="Describe the steps taken, parts replaced, or issues encountered..."
                              value={notes[device.id] !== undefined ? notes[device.id] : (device.notes || '')}
                              onChange={(e) => setNotes({ ...notes, [device.id]: e.target.value })}
                              className="bg-slate-900/50 border-white/10 text-white placeholder-slate-600 min-h-[160px] resize-none rounded-2xl p-6 focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                            />
                          </div>

                          <div className="flex justify-end gap-4">
                            <Button 
                              variant="ghost" 
                              onClick={() => setExpandedDevice(null)}
                              className="h-14 px-8 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl font-bold"
                            >
                              Dismiss
                            </Button>
                            <Button 
                              onClick={() => handleSubmitUpdate(device.id)} 
                              className={`h-14 px-10 rounded-2xl font-black gap-3 transition-all duration-500 shadow-xl ${
                                currentDraftStatus === 'completed' 
                                  ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/40 hover:scale-[1.02]' 
                                  : currentDraftStatus === 'hold'
                                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/40 hover:scale-[1.02]'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40 hover:scale-[1.02]'
                              }`}
                            >
                              <Send className="w-5 h-5" />
                              {currentDraftStatus === 'completed' ? 'SUBMIT & CLOSE' : currentDraftStatus === 'hold' ? 'HALT WORK' : 'UPDATE LOGS'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <div className="p-6 rounded-3xl bg-slate-800/40 border border-white/5 flex flex-col gap-3 group hover:bg-slate-800/60 transition-all">
      <div className={`w-10 h-10 rounded-xl ${color} bg-opacity-10 flex items-center justify-center text-white text-opacity-80 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-black text-white">{value}</p>
        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{label}</p>
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] shrink-0">{title}</h4>
      <div className="h-px w-full bg-white/5" />
    </div>
  );
}

function InfoCard({ icon, label, value, theme }: { icon: React.ReactNode, label: string, value: string, theme: 'amber' | 'blue' }) {
  const themes = {
    amber: 'bg-amber-500/5 border-amber-500/10',
    blue: 'bg-blue-500/5 border-blue-500/10'
  };
  
  return (
    <div className={`p-5 rounded-2xl border ${themes[theme]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-sm text-slate-200 font-medium leading-relaxed">{value}</p>
    </div>
  );
}

function UserCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="10" r="3" />
            <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
        </svg>
    );
}
