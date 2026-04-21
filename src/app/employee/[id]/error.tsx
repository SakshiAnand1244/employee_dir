"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center">
      <Card className="w-full">
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.35em] text-sky-300/70">Employee detail error</p>
          <CardTitle className="mt-2 text-3xl">We could not load that profile</CardTitle>
          <CardDescription>The database request failed or the record is temporarily unavailable.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            The employee detail view could not finish loading.
            {error.digest ? (
              <p className="mt-2 font-mono text-xs text-slate-500">Reference: {error.digest}</p>
            ) : null}
          </div>
          <Button variant="primary" onClick={reset}>
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
