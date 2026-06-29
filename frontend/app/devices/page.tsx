'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useDevices } from '@/hooks/useDevices';
import { useTechnicians } from '@/hooks/useTechnicians';
import { DeviceForm } from '@/components/device-form';
import { Modal } from '@/components/modal';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Printer } from 'lucide-react';
import { IntakeReceiptModal } from '@/components/intake-receipt-modal';
import { DeviceDetailModal } from '@/components/device-detail-modal';
import { Device } from '@/lib/localStorage';

export default function DevicesPage() {
  const { devices, addDevice, updateDevice, deleteDevice, refetch } = useDevices();
  const { technicians } = useTechnicians();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [receiptDevice, setReceiptDevice] = useState<Device | null>(null);
  const [receiptLogin, setReceiptLogin] = useState<{ email: string; password: string } | null>(null);
  const [viewDevice, setViewDevice] = useState<Device | null>(null);
  const [submitError, setSubmitError] = useState('');

  const filteredDevices = devices.filter((d) =>
    d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.deviceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (data: any) => {
    setSubmitError('');
    try {
      if (editingDevice) {
        await updateDevice(editingDevice.id, data);
        setEditingDevice(null);
      } else {
        const newDev = await addDevice(data);
        setReceiptLogin({
          email: data.customerEmail,
          password: data.customerPassword,
        });
        setReceiptDevice(newDev);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err ? String((err as Error).message) : 'Failed to save device';
      setSubmitError(message);
    }
  };

  const handleEdit = (device: any) => {
    setEditingDevice(device);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this device?')) {
      deleteDevice(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDevice(null);
    setSubmitError('');
  };

  const getTechnicianName = (device: Device) => {
    if (device.technicianName) return device.technicianName;
    if (!device.technicianId) return 'Unassigned';
    return technicians.find((t) => t.id === device.technicianId)?.name || 'Unknown';
  };

  const handleViewDevice = async (device: Device) => {
    const freshList = await refetch();
    const fresh = freshList?.find((d: Device) => d.id === device.id) || device;
    setViewDevice(fresh);
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Devices</h1>
            <p className="text-slate-400">Manage all devices in the system</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Device
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
          <Input
            placeholder="Search by name or serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-700/50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Device Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Assigned To</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Cost</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map((device, index) => (
                    <tr
                      key={device.id}
                      onClick={() => handleViewDevice(device)}
                      className={`border-b border-slate-700 hover:bg-slate-700/20 transition-all duration-200 cursor-pointer ${
                        index % 2 === 0 ? 'bg-slate-700/10' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-white">{device.customerName}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{device.deviceType}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{getTechnicianName(device)}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={device.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-white">${device.cost}</td>
                      <td className="px-6 py-4 text-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReceiptDevice(device)}
                            className="gap-1 text-blue-400 hover:text-blue-300 border-blue-400/20 hover:bg-blue-400/10"
                            title="Print Drop-off Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(device)}
                            className="gap-1"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(device.id)}
                            className="gap-1 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingDevice ? 'Edit Device' : 'Add New Device'}>
          {submitError ? (
            <p className="mb-4 text-sm text-red-400 font-medium">{submitError}</p>
          ) : null}
          <DeviceForm device={editingDevice} onSubmit={handleSubmit} onCancel={handleCloseModal} />
        </Modal>

        {/* Intake Receipt Modal */}
        {receiptDevice && (
          <IntakeReceiptModal 
            device={receiptDevice} 
            isOpen={!!receiptDevice} 
            onClose={() => {
              setReceiptDevice(null);
              setReceiptLogin(null);
            }}
            loginHint={receiptLogin || undefined}
          />
        )}

        <DeviceDetailModal
          repair={viewDevice}
          isOpen={!!viewDevice}
          onClose={() => setViewDevice(null)}
          mode="staff"
        />
      </div>
    </DashboardLayout>
  );
}
