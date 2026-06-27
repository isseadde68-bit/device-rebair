'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { StatsCard } from '@/components/stats-card';
import { useAuth } from '@/lib/auth-context';
import { useDevices } from '@/hooks/useDevices';
import { useTechnicians } from '@/hooks/useTechnicians';
import { TechnicianDashboard } from './technician';
import { CustomerDashboard } from './customer';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wrench, CheckCircle, Clock, DollarSign, Activity, Zap, PieChart as PieIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function AdminDashboardContent() {
  const { user } = useAuth();
  const { devices } = useDevices();
  const { technicians } = useTechnicians();
  const [chartData, setChartData] = useState<any[]>([]);

  // Calculate statistics
  const totalDevices = devices.length;
  const pendingDevices = devices.filter((d) => d.status === 'pending').length;
  const completedDevices = devices.filter((d) => d.status === 'completed').length;
  const totalRevenue = devices
    .filter((d) => d.status === 'completed')
    .reduce((sum, d) => sum + d.cost, 0);

  // Prepare chart data for repairs per day
  useEffect(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const data = last7Days.map((date) => {
      const count = devices.filter((d) => d.date === date).length;
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        repairs: count,
      };
    });

    setChartData(data);
  }, [devices]);

  // Status distribution data
  const statusData = [
    { name: 'Pending', value: pendingDevices, color: '#eab308' },
    { name: 'In Progress', value: devices.filter((d) => d.status === 'in-progress').length, color: '#3b82f6' },
    { name: 'Completed', value: completedDevices, color: '#10b981' },
  ];

  // Technician performance data
  const techPerformance = technicians.map((tech) => {
    const completed = devices.filter((d) => d.technicianId === tech.id && d.status === 'completed').length;
    return {
      name: tech.name,
      completed,
    };
  });

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-2">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500">{user?.name}</span>
          </h1>
          <p className="text-slate-400 text-lg">System Intelligence Overview • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
           <div className="px-4 py-2 bg-blue-600 rounded-xl text-white font-bold text-sm shadow-lg shadow-blue-900/40">Real-time Feed</div>
           <div className="px-4 py-2 text-slate-400 font-bold text-sm">System Health: 98%</div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Fleet Status" value={totalDevices} icon={Wrench} color="blue" trend="+12% from last week" />
        <StatsCard label="Diagnostic Queue" value={pendingDevices} icon={Clock} color="orange" trend="Average: 2h" />
        <StatsCard label="Success Events" value={completedDevices} icon={CheckCircle} color="green" trend="Target reached" />
        <StatsCard label="Revenue Yield" value={`$${totalRevenue}`} icon={DollarSign} color="purple" trend="Gross income" />
      </div>

      {/* Primary Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Repairs Line Chart */}
        <Card className="lg:col-span-8 border-white/5 bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
              <Activity className="w-6 h-6 text-blue-500" />
              Operational Trajectory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Line type="monotone" dataKey="repairs" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', stroke: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Load Distribution Pie Chart */}
        <Card className="lg:col-span-4 border-white/5 bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
              <PieIcon className="w-6 h-6 text-violet-500" />
              Workload Mix
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {statusData.map((s, i) => (
                <div key={i} className="flex justify-between items-center text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></div>
                    <span className="text-slate-400">{s.name}</span>
                  </div>
                  <span className="text-white">{s.value} units</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workforce Performance Section */}
      <Card className="border-white/5 bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
            <Zap className="w-6 h-6 text-emerald-500" />
            Performance Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={techPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}
                />
                <Bar dataKey="completed" fill="#10b981" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (user?.role === 'technician') {
    return <TechnicianDashboard />;
  }

  if (user?.role === 'customer') {
    return <CustomerDashboard />;
  }

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <AdminDashboardContent />
    </DashboardLayout>
  );
}
