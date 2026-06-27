'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useDevices } from '@/hooks/useDevices';
import { useAuth } from '@/lib/auth-context';
import { Device } from '@/lib/localStorage';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, Phone, DollarSign, FileText, Wrench } from 'lucide-react';
import { InvoiceModal } from '@/components/invoice-modal';
import { Button } from '@/components/ui/button';

export default function HistoryPage() {
  const { user } = useAuth();
  const { devices, isLoading } = useDevices();
  const [selectedInvoice, setSelectedInvoice] = useState<Device | null>(null);

  if (isLoading || !user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Filter only completed devices assigned to this technician
  const completedDevices = devices.filter(
    (d: Device) => d.technicianId === user.technicianId && d.status === 'completed'
  );

  return (
    <ProtectedRoute allowedRoles={['technician', 'admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My History</h1>
            <p className="text-slate-400">View your completed repairs and generate invoices.</p>
          </div>

          {completedDevices.length === 0 ? (
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-xl">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                  <Wrench className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No completed repairs yet</h3>
                <p className="text-slate-400">Your completed jobs will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {completedDevices.map((device: Device) => (
                <Card key={device.id} className="border-slate-700 bg-slate-800/50 backdrop-blur-xl hover:shadow-xl transition-all h-full flex flex-col">
                  <CardHeader className="border-b border-slate-700/50 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="bg-slate-700/50 p-3 rounded-lg">
                        <Wrench className="w-6 h-6 text-blue-400" />
                      </div>
                      <StatusBadge status={device.status} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{device.customerName}</h3>
                    <p className="text-slate-400 font-medium">{device.deviceType}</p>
                  </CardHeader>
                  <CardContent className="pt-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-300">Problem</p>
                          <p className="text-sm text-slate-500">{device.problem}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-300">Phone</p>
                          <p className="text-sm text-slate-500">{device.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-300">Completed Date</p>
                          <p className="text-sm text-slate-500">{new Date(device.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-300">Total Cost</p>
                          <p className="text-sm text-slate-500">${device.cost.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setSelectedInvoice(device)}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-white"
                    >
                       View Invoice
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
