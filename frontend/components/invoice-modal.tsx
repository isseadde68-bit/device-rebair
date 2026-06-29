'use client';

import { Device } from '@/lib/localStorage';
import { X, Printer, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvoiceModalProps {
  device: Device;
  isOpen: boolean;
  onClose: () => void;
}

const statusLabel: Record<Device['status'], string> = {
  pending: 'Pending',
  'in-progress': 'In progress',
  completed: 'Completed',
  hold: 'On hold',
};

export function InvoiceModal({ device, isOpen, onClose }: InvoiceModalProps) {
  if (!isOpen) return null;

  const ref = ((device?.id) || '').toString().slice(-6).toUpperCase();
  const invoiceDate = device.date
    ? new Date(device.date).toLocaleDateString()
    : new Date().toLocaleDateString();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-[2px] print:bg-white print:p-0">
      <div className="relative w-full max-w-[340px] bg-white rounded-xl shadow-xl border border-slate-200/80 overflow-hidden print:shadow-none print:border-0 print:max-w-[300px] print:rounded-none">
        <div className="flex justify-between items-center px-3 py-2 border-b border-slate-100 print:hidden bg-slate-50/80">
          <h2 className="text-sm font-semibold text-slate-700">Invoice</h2>
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

        <div className="p-4 print:p-3 bg-white text-slate-800" id="printable-invoice">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-dashed border-slate-200">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white">
                  <Wrench className="h-3.5 w-3.5" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-800 leading-tight">
                  Device Repair
                </p>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">123 Main St · City</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-600">
                Invoice
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">#{ref}</p>
              <p className="text-[10px] text-slate-500">{invoiceDate}</p>
            </div>
          </div>

          {/* Customer & device */}
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
              <p className="text-slate-500 mt-0.5 line-clamp-2 leading-snug">{device.problem}</p>
            </div>
          </div>

          <div className="flex justify-center mb-2">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-medium text-slate-600">
              Status: {statusLabel[device.status]}
            </span>
          </div>

          {/* Line items */}
          <table className="w-full text-[11px] mb-2">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50/80">
                <th className="py-1.5 px-2 text-left font-semibold text-slate-600">Item</th>
                <th className="py-1.5 px-2 text-right font-semibold text-slate-600">Amt</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 px-2 align-top">
                  <span className="font-medium text-slate-800">Repair service</span>
                  {device.notes ? (
                    <span className="block text-[10px] text-slate-500 mt-0.5 leading-snug">
                      {device.notes}
                    </span>
                  ) : null}
                </td>
                <td className="py-2 px-2 text-right font-medium tabular-nums whitespace-nowrap">
                  ${device.cost.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Total */}
          <div className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2 text-white print:bg-slate-900">
            <span className="text-[11px] font-medium">Total due</span>
            <span className="text-base font-bold tabular-nums">${device.cost.toFixed(2)}</span>
          </div>

          <p className="text-center text-[9px] text-slate-400 mt-3 leading-relaxed">
            Thank you — keep this receipt for pickup
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
          #printable-invoice,
          #printable-invoice * {
            visibility: visible;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-invoice {
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
