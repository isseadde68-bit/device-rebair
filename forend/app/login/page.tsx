'use client';

import { StaffLoginCard } from '@/components/staff-login-card';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <StaffLoginCard />
      </div>
    </div>
  );
}
