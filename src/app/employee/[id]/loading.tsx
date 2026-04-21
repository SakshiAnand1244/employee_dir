import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader className="space-y-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-5 w-2/3" />
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Skeleton className="h-44 rounded-[24px]" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
