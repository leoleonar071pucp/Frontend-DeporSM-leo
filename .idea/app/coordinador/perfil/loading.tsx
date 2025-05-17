import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Skeleton className="h-12 w-full mb-4" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
            <CardContent className="flex justify-end">
              <Skeleton className="h-10 w-36" />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-6 w-48 mt-4" />
              <Skeleton className="h-4 w-24 mt-2" />
              <div className="w-full mt-6 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full mt-1" />
              </div>
              <Skeleton className="h-1 w-full" />
              <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full mt-1" />
              </div>
              <Skeleton className="h-1 w-full" />
              <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full mt-1" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

