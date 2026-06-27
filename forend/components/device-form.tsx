'use client';

import { useState } from 'react';
import { Device } from '@/lib/localStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTechnicians } from '@/hooks/useTechnicians';

interface DeviceFormProps {
  device?: Device;
  onSubmit: (data: Omit<Device, 'id'> & { customerPassword?: string }) => void;
  onCancel: () => void;
}

export function DeviceForm({ device, onSubmit, onCancel }: DeviceFormProps) {
  const { technicians } = useTechnicians();
  const isNew = !device;
  const [formData, setFormData] = useState({
    customerName: device?.customerName || '',
    phone: device?.phone || '',
    customerEmail: device?.customerEmail || '',
    customerPassword: '',
    deviceType: device?.deviceType || '',
    problem: device?.problem || '',
    status: device?.status || 'pending' as const,
    technicianId: device?.technicianId || '',
    cost: device?.cost || 0,
    date: device?.date || new Date().toISOString().split('T')[0],
    notes: device?.notes || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cost' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { customerPassword, ...deviceData } = formData;
    if (isNew) {
      onSubmit({ ...deviceData, customerPassword });
    } else {
      onSubmit(deviceData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerName" className="text-slate-200">Customer Name</Label>
          <Input
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            placeholder="Enter customer name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-slate-200">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            placeholder="+1234567890"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="customerEmail" className="text-slate-200">
            Customer Gmail
            <span className="text-slate-500 font-normal ml-1">(login + notifications)</span>
          </Label>
          <Input
            id="customerEmail"
            name="customerEmail"
            type="email"
            value={formData.customerEmail}
            onChange={handleChange}
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            placeholder="customer@gmail.com"
            required
          />
        </div>

        {isNew ? (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="customerPassword" className="text-slate-200">
              Customer Password
              <span className="text-slate-500 font-normal ml-1">(for system login)</span>
            </Label>
            <Input
              id="customerPassword"
              name="customerPassword"
              type="password"
              value={formData.customerPassword}
              onChange={handleChange}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              placeholder="Min. 6 characters"
              minLength={6}
              required
            />
            <p className="text-xs text-slate-500">
              Macmiilku wuxuu ku gali doonaa system-ka Gmail-kan iyo password-kan.
            </p>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="deviceType" className="text-slate-200">Device Type</Label>
          <Input
            id="deviceType"
            name="deviceType"
            value={formData.deviceType}
            onChange={handleChange}
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            placeholder="iPhone, Android, etc."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date" className="text-slate-200">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            className="bg-slate-700/50 border-slate-600 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-slate-200">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="technicianId" className="text-slate-200">Assigned Technician</Label>
          <Select value={formData.technicianId} onValueChange={(value) => handleSelectChange('technicianId', value)}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
              <SelectValue placeholder="Select technician" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {technicians.map((tech) => (
                <SelectItem key={tech.id} value={tech.id}>
                  {tech.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost" className="text-slate-200">Cost ($)</Label>
          <Input
            id="cost"
            name="cost"
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={handleChange}
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="problem" className="text-slate-200">Problem Description</Label>
        <Textarea
          id="problem"
          name="problem"
          value={formData.problem}
          onChange={handleChange}
          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 min-h-[80px]"
          placeholder="Describe the device problem..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-slate-200">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 min-h-[80px]"
          placeholder="Additional notes..."
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {device ? 'Update Device' : 'Add Device'}
        </Button>
      </div>
    </form>
  );
}
