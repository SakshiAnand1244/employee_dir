import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-2xl items-center">
      <Card className="w-full">
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.35em] text-sky-300/70">404</p>
          <CardTitle className="mt-2 text-3xl">That employee could not be found</CardTitle>
          <CardDescription>
            The requested record is missing, archived, or the link is stale.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href={ROUTES.home}
            className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-4 text-sm font-medium text-slate-950 shadow-[0_16px_50px_rgba(56,189,248,0.18)] transition-colors hover:bg-accentSoft"
          >
            Return home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
