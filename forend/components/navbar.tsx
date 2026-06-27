'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, Wrench } from 'lucide-react';
import { useState } from 'react';
import { NotificationsMenu } from './notifications-menu';
import { ThemeToggle } from './theme-toggle';
import Link from 'next/link';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-2xl">
      <div className="flex items-center justify-between h-20 px-8">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center shadow-lg">
              <Wrench className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase text-foreground">
              Fix<span className="text-blue-500">Flow</span>
            </h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] -mt-1">Repair Management</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-sm font-bold text-foreground tracking-tight">{user?.name}</p>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded leading-none">{user?.role}</p>
          </div>

          <div className="h-8 w-px bg-border mx-1 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationsMenu />
            
            <Link href="/profile" className="hidden sm:block">
              <button className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300">
                <Settings className="w-5 h-5" />
              </button>
            </Link>

            <Button 
              variant="destructive" 
              onClick={handleLogout} 
              className="h-11 px-6 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-900/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline italic">Exit System</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
