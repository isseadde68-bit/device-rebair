'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wrench, Users, FileText, Menu, X, CheckSquare } from 'lucide-react';
import { useState } from 'react';

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const adminLinks = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/devices', label: 'Operations', icon: Wrench },
    { href: '/review', label: 'Quality Control', icon: CheckSquare },
    { href: '/technicians', label: 'Staff Hub', icon: Users },
    { href: '/reports', label: 'Analytics', icon: FileText },
  ];

  const technicianLinks = [
    { href: '/dashboard', label: 'Workspace', icon: LayoutDashboard },
    { href: '/repairs', label: 'Active Repairs', icon: Wrench },
    { href: '/history', label: 'Service Logs', icon: FileText },
  ];

  const customerLinks = [
    { href: '/dashboard', label: 'My Repairs', icon: Wrench },
  ];

  const links =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'customer'
        ? customerLinks
        : technicianLinks;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 md:hidden z-[60] p-4 bg-blue-600 text-white rounded-2xl shadow-2xl shadow-blue-900/40 hover:scale-110 active:scale-95 transition-all duration-300"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`fixed left-0 top-20 h-[calc(100vh-80px)] w-72 bg-card/80 border-r border-border backdrop-blur-2xl transition-all duration-500 ease-in-out md:translate-x-0 z-40 ${
          isOpen ? 'translate-x-0 translate-y-0 opacity-100' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-8 space-y-8">
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-6 px-4">Navigation Menu</p>
            <nav className="space-y-1.5">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-center gap-3.5 px-5 py-4 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="font-bold tracking-tight">{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-8 border-t border-border">
            <div className="bg-muted/50 border border-border p-6 rounded-[2rem] shadow-lg">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Status</p>
              <p className="text-sm font-bold text-foreground mb-4">System Online</p>
              <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}
