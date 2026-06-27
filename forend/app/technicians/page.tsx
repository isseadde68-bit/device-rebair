'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useTechnicians } from '@/hooks/useTechnicians';
import { useDevices } from '@/hooks/useDevices';
import { TechnicianForm } from '@/components/technician-form';
import { Modal } from '@/components/modal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

export default function TechniciansPage() {
  const { technicians, addTechnician, updateTechnician, deleteTechnician } = useTechnicians();
  const { devices } = useDevices();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<any>(null);

  const handleSubmit = async (data: any) => {
    if (editingTechnician) {
      await updateTechnician(editingTechnician.id, data);
      setEditingTechnician(null);
    } else {
      await addTechnician(data);
    }
    setIsModalOpen(false);
  };

  const handleEdit = (technician: any) => {
    setEditingTechnician(technician);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this technician?')) {
      deleteTechnician(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTechnician(null);
  };

  const getAssignedCount = (techId: string) => {
    return devices.filter((d) => d.technicianId === techId).length;
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Technicians</h1>
            <p className="text-slate-400">Manage your repair team</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Technician
          </Button>
        </div>

        {/* Grid of Technician Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technicians.map((technician) => (
            <Card key={technician.id} className="border-slate-700 bg-slate-800/50 backdrop-blur-xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{technician.name}</h3>
                      <p className="text-sm text-slate-400">{technician.specialization}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-200">{technician.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Phone:</span>
                    <span className="text-slate-200">{technician.phone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Assigned Tasks:</span>
                    <span className="text-blue-400 font-semibold">{getAssignedCount(technician.id)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(technician)}
                    className="flex-1 gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(technician.id)}
                    className="flex-1 gap-1 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {technicians.length === 0 && (
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No technicians added yet</p>
            </CardContent>
          </Card>
        )}

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTechnician ? 'Edit Technician' : 'Add New Technician'}>
          <TechnicianForm technician={editingTechnician} onSubmit={handleSubmit} onCancel={handleCloseModal} />
        </Modal>
      </div>
    </DashboardLayout>
  );
}
