'use client';

import { Device } from '@/lib/localStorage';
import { X, Printer, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IntakeReceiptModalProps {
  device: Device;
  isOpen: boolean;
  onClose: () => void;
  loginHint?: { email: string; password: string };
}

export function IntakeReceiptModal({ device, isOpen, onClose, loginHint }: IntakeReceiptModalProps) {
  if (!isOpen) return null;

  const ref = ((device?.id) || '').toString().slice(-6).toUpperCase();
  const droppedAt = device.date ? new Date(device.date) : new Date();
  const dropDate = droppedAt.toLocaleDateString();
  const dropTime = droppedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-[2px] print:bg-white print:p-0">
      <div className="relative w-full max-w-[340px] bg-white rounded-xl shadow-xl border border-slate-200/80 overflow-hidden print:shadow-none print:border-0 print:max-w-[300px] print:rounded-none">
        <div className="flex justify-between items-center px-3 py-2 border-b border-slate-100 print:hidden bg-slate-50/80">
          <h2 className="text-sm font-semibold text-slate-700">Drop-off Receipt</h2>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8 px-2.5 text-xs gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 print:p-3 bg-white text-slate-800" id="printable-receipt">
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-dashed border-slate-200">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 text-white">
                  <Wrench className="h-3.5 w-3.5" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-800 leading-tight">
                  Device Repair
                </p>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">123 Main St · City</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-800">
                Drop-off
              </p>
              <p className="text-[9px] text-slate-500">Proof of intake</p>
              <p className="text-[10px] font-medium text-slate-700 mt-0.5">#{ref}</p>
            </div>
          </div>

          <div className="flex justify-between py-2 text-[10px] text-slate-500 border-b border-slate-100">
            <span>Date: {dropDate}</span>
            <span>Time: {dropTime}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 py-3 text-[11px]">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                Customer
              </p>
              <p className="font-medium text-slate-800 leading-tight truncate">
                {device.customerName}
              </p>
              <p className="text-slate-500 mt-0.5">{device.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                Device
              </p>
              <p className="font-medium text-slate-800 leading-tight">{device.deviceType}</p>
            </div>
          </div>

          <div className="mb-3 rounded-md border border-slate-200 bg-slate-50/80 p-2">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
              Reported issue
            </p>
            <p className="text-[11px] text-slate-800 leading-snug whitespace-pre-wrap">
              {device.problem || 'No description provided.'}
            </p>
            {device.notes ? (
              <p className="text-[10px] text-slate-500 mt-1.5 leading-snug border-t border-slate-200/80 pt-1.5">
                Note: {device.notes}
              </p>
            ) : null}
          </div>

          {device.cost > 0 ? (
            <div className="flex justify-between items-center rounded-md border border-dashed border-slate-300 px-2.5 py-1.5 mb-3 text-[10px]">
              <span className="text-slate-500">Est. service fee</span>
              <span className="font-semibold tabular-nums text-slate-800">
                ${device.cost.toFixed(2)}
              </span>
            </div>
          ) : null}

          {loginHint || device.customerEmail ? (
            <div className="mb-3 rounded-md border border-blue-200 bg-blue-50/80 p-2">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-600 mb-1">
                System login (track repair online)
              </p>
              <p className="text-[10px] text-slate-700">
                Gmail: <span className="font-semibold">{loginHint?.email || device.customerEmail}</span>
              </p>
              {loginHint?.password ? (
                <p className="text-[10px] text-slate-700">
                  Password: <span className="font-semibold">{loginHint.password}</span>
                </p>
              ) : null}
              <p className="text-[9px] text-slate-500 mt-1">Go to /login — geli Gmail iyo password</p>
            </div>
          ) : null}

          <p className="text-[8px] text-slate-500 leading-relaxed text-justify mb-3">
            You authorize diagnosis and repair. Unlisted pre-existing damage is not our
            responsibility. Devices not collected within 30 days of completion may incur
            storage fees or disposal per shop policy.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-dashed border-slate-200">
            <div>
              <div className="border-b border-slate-300 h-5" />
              <p className="text-[8px] text-slate-400 text-center mt-1 uppercase">Technician</p>
            </div>
            <div>
              <div className="border-b border-slate-300 h-5" />
              <p className="text-[8px] text-slate-400 text-center mt-1 uppercase">Customer</p>
            </div>
          </div>

          <p className="text-center text-[9px] font-medium text-slate-600 mt-3">
            Keep this receipt — required for pickup
          </p>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: 80mm auto;
            margin: 4mm;
          }
          body * {
            visibility: hidden;
          }
          #printable-receipt,
          #printable-receipt * {
            visibility: visible;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 72mm !important;
            max-width: 72mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            font-size: 10px !important;
            background: white !important;
            color: #1e293b !important;
          }
        }
      `,
        }}
      />
    </div>
  );
}
