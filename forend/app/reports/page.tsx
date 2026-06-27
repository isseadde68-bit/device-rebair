'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useDevices } from '@/hooks/useDevices';
import { useTechnicians } from '@/hooks/useTechnicians';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  Download, 
  Printer, 
  TrendingUp, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { Device } from '@/lib/localStorage';

export default function ReportsPage() {
  const { devices } = useDevices();
  const { technicians } = useTechnicians();

  // Calculate metrics
  const stats = useMemo(() => {
    const total = devices.length;
    const completed = devices.filter((d) => d.status === 'completed').length;
    const pending = devices.filter((d) => d.status === 'pending').length;
    const revenue = devices
      .filter((d) => d.status === 'completed')
      .reduce((sum, d) => sum + (d.cost || 0), 0);
    const rate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';

    return { total, completed, pending, revenue, rate };
  }, [devices]);

  // Technician performance data
  const techPerformance = useMemo(() => technicians.map((tech) => {
    const assigned = devices.filter((d) => d.technicianId === tech.id).length;
    const completed = devices.filter((d) => d.technicianId === tech.id && d.status === 'completed').length;
    return {
      name: tech.name,
      assigned,
      completed,
      rate: assigned > 0 ? ((completed / assigned) * 100).toFixed(1) : '0.0',
    };
  }), [technicians, devices]);

  // Status distribution
  const statusDistribution = useMemo(() => [
    { name: 'Pending', value: devices.filter((d) => d.status === 'pending').length, color: '#eab308' },
    { name: 'In Progress', value: devices.filter((d) => d.status === 'in-progress').length, color: '#3b82f6' },
    { name: 'Completed', value: devices.filter((d) => d.status === 'completed').length, color: '#10b981' },
    { name: 'On Hold', value: devices.filter((d) => d.status === 'hold').length, color: '#ef4444' },
  ], [devices]);

  // Revenue trend (last 7 days for better visibility)
  const revenueTrend = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayRevenue = devices
        .filter((d) => d.date === dateStr && d.status === 'completed')
        .reduce((sum, d) => sum + (d.cost || 0), 0);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
      });
    }
    return data;
  }, [devices]);

  const handleExportCSV = () => {
    const headers = ['Customer Name', 'Device Type', 'Status', 'Technician', 'Cost', 'Date'];
    const rows = devices.map((d) => {
      const techName = technicians.find((t) => t.id === d.technicianId)?.name || 'Unassigned';
      return [d.customerName, d.deviceType, d.status, techName, d.cost, d.date];
    });

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repair-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-8 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-500 border border-blue-500/20">
                <BarChart3 className="w-8 h-8" />
              </div>
              Business Intelligence
            </h1>
            <p className="text-slate-400 text-lg">Comprehensive analytics and performance tracking.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button onClick={handleExportCSV} variant="outline" className="flex-1 md:flex-none h-12 rounded-xl gap-2 border-slate-700 bg-slate-800 hover:bg-slate-700 transition-all font-bold">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
            <Button onClick={() => window.print()} variant="outline" className="flex-1 md:flex-none h-12 rounded-xl gap-2 border-slate-700 bg-slate-800 hover:bg-slate-700 transition-all font-bold">
              <Printer className="w-4 h-4" />
              Print Report
            </Button>
          </div>
        </div>

        {/* High-Impact Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="System Total" value={stats.total} description="Total registered devices" icon={<Wrench />} color="from-blue-600 to-indigo-600" />
          <MetricCard label="Efficiency" value={`${stats.rate}%`} description="Success completion rate" icon={<TrendingUp />} color="from-emerald-600 to-teal-600" />
          <MetricCard label="Active Queue" value={stats.pending} description="Units awaiting diagnostic" icon={<Clock />} color="from-amber-600 to-orange-600" />
          <MetricCard label="Total Yield" value={`$${stats.revenue}`} description="Gross income generated" icon={<DollarSign />} color="from-purple-600 to-pink-600" />
        </div>

        {/* Core Analytics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Revenue Stream */}
          <Card className="xl:col-span-8 border-slate-700 bg-slate-800/40 backdrop-blur-3xl rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
                    <Activity className="w-6 h-6 text-emerald-500" />
                    Revenue Trajectory
                  </CardTitle>
                  <p className="text-slate-500 text-sm mt-1">Earnings breakdown for the current week</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="h-[350px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#94a3b840" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#94a3b840" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      dx={-10}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                      }}
                      itemStyle={{ color: '#10b981', fontWeight: 800 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      strokeWidth={4} 
                      dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#0f172a' }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Device Distribution */}
          <Card className="xl:col-span-4 border-slate-700 bg-slate-800/40 backdrop-blur-3xl rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
                <PieChartIcon className="w-6 h-6 text-blue-500" />
                Workload Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="h-[300px] mt-4 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <p className="text-sm font-bold text-slate-500 uppercase">Load</p>
                   <p className="text-4xl font-black text-white">{stats.total}</p>
                </div>
              </div>
              <div className="mt-8 space-y-3">
                 {statusDistribution.map((item, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                         <span className="text-sm text-slate-400 font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{item.value}</span>
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technician Performance Table */}
        <Card className="border-slate-700 bg-slate-800/40 backdrop-blur-3xl rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5 bg-slate-800/20">
            <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-blue-500" />
              Resource Optimization
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900/40">
                    <th className="text-left py-6 px-8 text-xs font-black text-slate-500 uppercase tracking-widest">Personnel</th>
                    <th className="text-center py-6 px-8 text-xs font-black text-slate-500 uppercase tracking-widest">Load Factor</th>
                    <th className="text-center py-6 px-8 text-xs font-black text-slate-500 uppercase tracking-widest">Execution</th>
                    <th className="text-center py-6 px-8 text-xs font-black text-slate-500 uppercase tracking-widest">Success Metric</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {techPerformance.map((tech, idx) => (
                    <tr key={idx} className="group hover:bg-white/5 transition-all">
                      <td className="py-6 px-8">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center font-black uppercase">
                               {tech.name.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-200">{tech.name}</span>
                         </div>
                      </td>
                      <td className="text-center py-6 px-8">
                         <span className="inline-flex px-3 py-1 rounded-lg bg-slate-900/60 border border-white/5 text-sm font-bold text-slate-300">
                           {tech.assigned} <span className="text-slate-600 ml-1">Orders</span>
                         </span>
                      </td>
                      <td className="text-center py-6 px-8">
                         <span className="inline-flex px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-sm font-bold">
                           {tech.completed} Finished
                         </span>
                      </td>
                      <td className="text-center py-6 px-8 text-center">
                         <div className="flex flex-col items-center gap-1">
                            <span className="text-lg font-black text-white">{tech.rate}%</span>
                            <div className="w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-500" style={{ width: `${tech.rate}%` }} />
                            </div>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ label, value, description, icon, color }: { label: string, value: string | number, description: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="relative group overflow-hidden rounded-[2rem] bg-slate-800/40 border border-white/5 p-8 transition-all hover:bg-slate-800/60">
       <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`} />
       
       <div className="relative flex flex-col gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-xl`}>
             {icon}
          </div>
          <div>
             <p className="text-4xl font-black text-white tracking-tight">{value}</p>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{label}</p>
          </div>
          <p className="text-[10px] font-medium text-slate-500 tracking-wide mt-2">{description}</p>
       </div>
    </div>
  );
}

