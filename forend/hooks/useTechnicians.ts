'use client';

import { useState, useEffect } from 'react';
import { Technician } from '@/lib/localStorage';
import { apiFetch } from '@/lib/api';

export function useTechnicians() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTechnicians = () => {
      apiFetch('/api/technicians', { method: 'GET' })
        .then((data) => setTechnicians(data.technicians))
        .finally(() => setIsLoading(false));
    };
    loadTechnicians();
  }, []);

  const addTechnician = (technician: Omit<Technician, 'id'>) => {
    return apiFetch('/api/technicians', {
      method: 'POST',
      body: JSON.stringify(technician)
    }).then((data) => {
      setTechnicians((prev) => [data.technician, ...prev]);
      return data.technician;
    });
  };

  const updateTechnician = (id: string, updates: Partial<Technician>) => {
    return apiFetch(`/api/technicians/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }).then((data) => {
      setTechnicians((prev) => prev.map((t) => (t.id === id ? data.technician : t)));
      return data.technician;
    });
  };

  const deleteTechnician = (id: string) => {
    return apiFetch(`/api/technicians/${id}`, { method: 'DELETE' }).then(() => {
      setTechnicians((prev) => prev.filter((t) => t.id !== id));
    });
  };

  const getTechnicianById = (id: string) => {
    return technicians.find((t) => t.id === id);
  };

  return {
    technicians,
    isLoading,
    addTechnician,
    updateTechnician,
    deleteTechnician,
    getTechnicianById,
  };
}
