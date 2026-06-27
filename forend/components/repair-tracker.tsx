'use client';

import { useState } from 'react';
import { Search, Loader2, Package, Smartphone, Calendar, Hash, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE_URL } from '@/lib/api';
import { DeviceDetailModal, RepairDetail } from '@/components/device-detail-modal';
import { DeviceUpdate } from '@/lib/localStorage';

export interface TrackedRepair {
  id: string;
  ref: string;
  customerName: string;
  deviceType: string;
  status: 'pending' | 'in-progress' | 'completed' | 'hold';
  date: string;
  problem: string;
  phone?: string;
  notes?: string;
  cost?: number;
  technicianName?: string;
  updates?: DeviceUpdate[];
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Received', labelSo: 'La helay' },
  { key: 'in-progress', label: 'Repairing', labelSo: 'Waa la dayactirayaa' },
  { key: 'completed', label: 'Ready', labelSo: 'Diyaar — soo qaado' },
] as const;

const STATUS_META: Record<
  TrackedRepair['status'],
  { label: string; labelSo: string; color: string; step: number }
> = {
  pending: { label: 'Pending', labelSo: 'Sugitaan', color: 'text-amber-400', step: 0 },
  'in-progress': { label: 'In repair', labelSo: 'Dayactir socda', color: 'text-blue-400', step: 1 },
  completed: { label: 'Ready for pickup', labelSo: 'Diyaar — soo qaado', color: 'text-emerald-400', step: 2 },
  hold: { label: 'On hold', labelSo: 'la habayn waayay', color: 'text-red-400', step: 1 },
};

function ProgressBar({ status }: { status: TrackedRepair['status'] }) {
  const meta = STATUS_META[status];
  const progress =
    status === 'hold' ? 50 : status === 'completed' ? 100 : meta.step === 0 ? 15 : 55;

  return (
    <div className="space-y-2">
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            status === 'completed'
              ? 'bg-emerald-500'
              : status === 'hold'
                ? 'bg-red-500'
                : status === 'in-progress'
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
        {STATUS_STEPS.map((step, i) => (
          <span
            key={step.key}
            className={
              meta.step >= i || (status === 'completed' && i <= 2)
                ? 'text-foreground'
                : ''
            }
          >
            {step.labelSo}
          </span>
        ))}
      </div>
    </div>
  );
}

function RepairCard({ repair, onClick }: { repair: TrackedRepair; onClick: () => void }) {
  const meta = STATUS_META[repair.status];

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-border bg-muted/40 p-4 space-y-3 hover:bg-muted/60 hover:border-blue-500/30 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-foreground truncate">{repair.customerName}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            {repair.deviceType}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-xs font-bold ${meta.color}`}>{meta.labelSo}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-400 transition-colors" />
        </div>
      </div>

      <ProgressBar status={repair.status} />

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Hash className="w-3 h-3" />
          Ref #{repair.ref}
        </span>
        <span className="flex items-center gap-1 justify-end">
          <Calendar className="w-3 h-3" />
          {repair.date}
        </span>
      </div>

      {repair.problem ? (
        <p className="text-xs text-muted-foreground border-t border-border pt-2 line-clamp-2">
          {repair.problem}
        </p>
      ) : null}

      <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
        Riix si aad u aragto faahfaahinta →
      </p>
    </button>
  );
}

export function RepairTracker() {
  const [query, setQuery] = useState('');
  const [repairs, setRepairs] = useState<TrackedRepair[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRepair, setSelectedRepair] = useState<RepairDetail | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) {
      setError('Geli ugu yaraan 2 xaraf (magac, telefoon, ama ID).');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(false);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/devices/track?q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Raadinta waa fashilantay.');
        setRepairs([]);
      } else {
        setRepairs(data.repairs || []);
        setSearched(true);
      }
    } catch {
      setError('Server-ka lama heli karo. Isku day mar dambe.');
      setRepairs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRepair = async (repair: TrackedRepair) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/devices/track/${repair.id}`);
      const data = await res.json();
      if (res.ok && data.repair) {
        setSelectedRepair(data.repair);
      } else {
        setSelectedRepair(repair);
      }
    } catch {
      setSelectedRepair(repair);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <Card className="border-border bg-card/80 backdrop-blur-3xl rounded-[2rem] shadow-xl h-full">
      <CardHeader className="p-8 pb-4 space-y-1">
        <div className="flex items-center gap-2 text-blue-500 mb-1">
          <Package className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Macmiil</span>
        </div>
        <CardTitle className="text-2xl font-black tracking-tight">
          Raadi heerka dayactirka
        </CardTitle>
        <CardDescription>
          Geli magacaaga, telefoonkaaga, ama tixraaca (ID) si aad u aragto heerka qalabkaaga
        </CardDescription>
      </CardHeader>

      <CardContent className="p-8 pt-4 space-y-5">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Magac, telefoon, ama ID..."
              className="h-12 pl-10 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-12 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Raadi'}
          </Button>
        </form>

        {error ? (
          <p className="text-sm text-red-400 font-medium">{error}</p>
        ) : null}

        {searched && repairs.length === 0 && !error ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Wax dayactir ah lagama helin. Hubi magaca, telefoonka, ama ID-ga.
          </div>
        ) : null}

        {repairs.length > 0 ? (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {repairs.map((r) => (
              <RepairCard key={r.id} repair={r} onClick={() => handleViewRepair(r)} />
            ))}
          </div>
        ) : null}

        {detailLoading ? (
          <div className="flex items-center justify-center py-4 text-muted-foreground text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Soo raraya faahfaahinta...
          </div>
        ) : null}
      </CardContent>

      <DeviceDetailModal
        repair={selectedRepair}
        isOpen={!!selectedRepair}
        onClose={() => setSelectedRepair(null)}
        mode="customer"
      />
    </Card>
  );
}
