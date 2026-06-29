'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertCircle, LogIn } from 'lucide-react';

export function StaffLoginCard() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    if (result.ok) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Email ama password khaldan.');
    }
    setIsLoading(false);
  };

  return (
    <Card className="border-border bg-card/80 backdrop-blur-3xl rounded-[2rem] shadow-xl overflow-hidden w-full">
      <CardHeader className="p-6 pb-0 space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-muted text-blue-500">
            <LogIn className="w-5 h-5" />
          </div>
          <CardTitle className="text-xl font-black tracking-tight">Login</CardTitle>
        </div>
        <CardDescription>
          Admin, Technician, ama Macmiil — geli Gmail iyo password; system-ku wuxuu aqoonsanayaa nooca akoonkaaga
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {error ? (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-500 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
              Gmail / Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl"
              placeholder="email@gmail.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl"
              placeholder="••••••••"
              required
            />
            <Link
              href="/login/forgot-password"
              className="block text-xs font-medium text-blue-600 hover:text-blue-500 pt-0.5"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all"
          >
            {isLoading ? 'Galaya...' : 'OK'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
