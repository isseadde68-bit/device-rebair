'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Mail, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { API_BASE_URL } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Request failed.');
      } else {
        setMessage(data.message);
        if (data.emailConfigured === false) {
          setMessage(
            `${data.message} (SMTP ma configured — eeg backend console-ka link-ga reset-ka.)`
          );
        }
      }
    } catch {
      setError('Server-ka lama heli karo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-card border border-border rounded-xl flex items-center justify-center">
            <Wrench className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              FIX<span className="text-blue-600">FLOW</span>
            </h1>
            <p className="text-xs text-muted-foreground">Admin password reset</p>
          </div>
        </div>

        <Card className="border-border bg-card/80 backdrop-blur-3xl rounded-[2rem] shadow-xl">
          <CardHeader className="p-8 pb-0 space-y-2">
            <CardTitle className="text-2xl font-black tracking-tight">Forgot password</CardTitle>
            <CardDescription>
              Geli Gmail-ka admin-ka. Waxaan kuu soo diraynaa link reset ah.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}
            {message && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                <Mail className="w-5 h-5 shrink-0" />
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Admin email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl"
                  placeholder="admin@gmail.com"
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-bold">
                {isLoading ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
