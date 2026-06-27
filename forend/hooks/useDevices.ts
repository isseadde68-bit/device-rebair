'use client';

import { useState, useEffect } from 'react';
import { Device } from '@/lib/localStorage';
import { apiFetch } from '@/lib/api';

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = () => {
    setIsLoading(true);
    return apiFetch('/api/devices', { method: 'GET' })
      .then((data) => {
        setDevices(data.devices);
        return data.devices as Device[];
      })
      .finally(() => setIsLoading(false));
  };

  const addDevice = (device: Omit<Device, 'id'>) => {
    return apiFetch('/api/devices', {
      method: 'POST',
      body: JSON.stringify(device)
    }).then((data) => {
      setDevices((prev) => [data.device, ...prev]);
      return data.device;
    });
  };

  const updateDevice = (id: string, updates: Partial<Device>) => {
    return apiFetch(`/api/devices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }).then((data) => {
      setDevices((prev) => prev.map((d) => (d.id === id ? data.device : d)));
      return data.device;
    });
  };

  const deleteDevice = (id: string) => {
    return apiFetch(`/api/devices/${id}`, { method: 'DELETE' }).then(() => {
      setDevices((prev: Device[]) => prev.filter((d: Device) => d.id !== id));
    });
  };

  const getDeviceById = (id: string) => {
    return devices.find((d: Device) => d.id === id);
  };

  const getDevicesByTechnicianId = (technicianId: string) => {
    return devices.filter((d: Device) => d.technicianId === technicianId);
  };

  return {
    devices,
    isLoading,
    refetch: loadDevices,
    addDevice,
    updateDevice,
    deleteDevice,
    getDeviceById,
    getDevicesByTechnicianId,
  };
}
