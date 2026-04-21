import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader className="space-y-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="space-y-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-24 w-full" />
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader className="space-y-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-8 w-72" />
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-36 rounded-full" />
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-5 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
