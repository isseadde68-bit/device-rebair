'use client';

import { useState } from 'react';
import { Technician } from '@/lib/localStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TechnicianFormProps {
  technician?: Technician;
  onSubmit: (data: Omit<Technician, 'id'>) => void;
  onCancel: () => void;
}

export function TechnicianForm({ technician, onSubmit, onCancel }: TechnicianFormProps) {
  const [formData, setFormData] = useState({
    name: technician?.name || '',
    email: technician?.email || '',
    phone: technician?.phone || '',
    password: technician?.password || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-slate-200">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
          placeholder="Enter technician name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-200">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
          placeholder="technician@example.com"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-slate-200">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
          placeholder="+252 61..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-200">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
          placeholder="Enter password to log in"
          required={!technician} // Required only when creating a new technician
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
          {technician ? 'Update Technician' : 'Add Technician'}
        </Button>
      </div>
    </form>
  );
}
