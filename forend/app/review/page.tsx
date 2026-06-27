'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useDevices } from '@/hooks/useDevices';
import { useTechnicians } from '@/hooks/useTechnicians';
import { Device } from '@/lib/localStorage';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, Phone, DollarSign, FileText, AlertTriangle, Printer, UserCircle, Search } from 'lucide-react';
import { InvoiceModal } from '@/components/invoice-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ReviewPage() {
  const { devices, isLoading } = useDevices();
  const { technicians } = useTechnicians();
  const [selectedInvoice, setSelectedInvoice] = useState<Device | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <DashboardLayout allowedRoles={['admin']}>
        <div className="flex items-center justify-center min-h-[60vh]">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Combine completed and hold devices, and apply search filter
  const actionableDevices = devices.filter((d: Device) => {
    const isMatchedType = d.status === 'completed' || d.status === 'hold';
    const isMatchedSearch = 
      d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.deviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase());
    return isMatchedType && isMatchedSearch;
  });

  const getTechnicianName = (id?: string) => {
    if (!id) return 'Unassigned';
    return technicians.find((t) => t.id === id)?.name || 'Unknown';
  };

  const renderDeviceCard = (device: Device) => {
    const isHold = device.status === 'hold';
    return (
      <Card key={device.id} className={`border-slate-700 bg-slate-800/50 backdrop-blur-xl hover:shadow-xl transition-all h-full flex flex-col ${isHold ? 'border-t-4 border-t-red-500' : 'border-t-4 border-t-green-500'}`}>
        <CardHeader className="border-b border-slate-700/50 pb-4">
          <div className="flex justify-between items-start mb-2">
            <div className={`p-3 rounded-lg ${isHold ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
              {isHold ? <AlertTriangle className="w-6 h-6 text-red-400" /> : <Printer className="w-6 h-6 text-green-400" />}
            </div>
            <StatusBadge status={device.status} />
          </div>
          <h3 className="text-xl font-bold text-white">{device.customerName}</h3>
          <p className="text-slate-400 font-medium">{device.deviceType}</p>
          <span className="text-xs font-mono text-slate-500 mt-1 inline-block">#{(device.id || '').toString().slice(-6).toUpperCase()}</span>
        </CardHeader>
        
        <CardContent className="pt-4 flex-grow flex flex-col justify-between">
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <UserCircle className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-300">Technician</p>
                <p className="text-sm text-slate-500">{getTechnicianName(device.technicianId)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-300">{isHold ? 'Hold Reason / Notes' : 'Repair Notes'}</p>
                <p className="text-sm text-slate-500">{device.notes || 'No notes provided by technician.'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-300">Customer Phone</p>
                <p className="text-sm text-slate-500">{device.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-300">Date Logged</p>
                <p className="text-sm text-slate-500">{new Date(device.date).toLocaleDateString()}</p>
              </div>
            </div>
            {!isHold && (
              <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded border border-slate-700">
                <DollarSign className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-300">Total Charged</p>
                  <p className="text-md text-emerald-400 font-black">${device.cost.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
          
          {device.status === 'completed' && (
            <Button 
              onClick={() => setSelectedInvoice(device)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white gap-2 font-bold mt-auto"
            >
               <Printer className="w-4 h-4" /> Print Final Invoice
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Review & Attention</h1>
              <p className="text-slate-400">Track all devices waiting for pickup (Completed) or needing attention (Hold).</p>
            </div>
            <div className="relative w-full md:w-72 mt-2 md:mt-0">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <Input
                placeholder="Search by name, device, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 h-11"
              />
            </div>
          </div>

          <div className="mt-8">
            {actionableDevices.length === 0 ? (
              <div className="bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-xl p-16 text-center">
                <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-400">No Actionable Devices</h3>
                <p className="text-slate-500">There are currently no devices on Hold or Completed that match your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {actionableDevices.map(d => renderDeviceCard(d))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>

      {selectedInvoice && (
        <InvoiceModal 
          device={selectedInvoice} 
          isOpen={!!selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}
    </ProtectedRoute>
  );
}
