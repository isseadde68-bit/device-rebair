'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { useDevices } from '@/hooks/useDevices';
import { Device } from '@/lib/localStorage';
import { DeviceDetailModal } from '@/components/device-detail-modal';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Smartphone, Calendar, Hash, ChevronRight, Loader2 } from 'lucide-react';

export function CustomerDashboard() {
  const { user } = useAuth();
  const { devices, isLoading } = useDevices();
  const [viewDevice, setViewDevice] = useState<Device | null>(null);

  if (isLoading) {
    return (
      <DashboardLayout allowedRoles={['customer']}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['customer']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome, <span className="text-blue-400">{user?.name}</span>
          </h1>
          <p className="text-slate-400 mt-1">
            Gmail: {user?.email} — halkan ka arag heerka dayactirka qalabkaaga
          </p>
        </div>

        {devices.length === 0 ? (
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-xl">
            <CardContent className="py-16 text-center">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Wali ma jiraan qalab lagu diiwaangeliyay Gmail-kan.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((device) => (
              <button
                key={device.id}
                type="button"
                onClick={() => setViewDevice(device)}
                className="text-left rounded-2xl border border-slate-700 bg-slate-800/50 p-5 space-y-3 hover:bg-slate-700/30 hover:border-blue-500/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-white flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />
                      {device.deviceType}
                    </p>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{device.problem}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 shrink-0" />
                </div>

                <StatusBadge status={device.status} />

                <div className="flex justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Ref #{(device.id || '').slice(-6).toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {device.date}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        <Card className="border-slate-700 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="text-white text-base">Macluumaad</CardTitle>
            <CardDescription>
              Marka technician ama admin update sameeyo, waxaad arki doontaa halkan. Ogeysiisyada waxaa sidoo kale
              loo diri karaa Gmail-kaaga.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <DeviceDetailModal
        repair={viewDevice}
        isOpen={!!viewDevice}
        onClose={() => setViewDevice(null)}
        mode="customer"
      />
    </DashboardLayout>
  );
}
