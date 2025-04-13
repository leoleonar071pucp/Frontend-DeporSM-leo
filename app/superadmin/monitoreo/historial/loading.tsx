import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[350px] mt-2" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px] mt-2" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Skeleton className="h-10 flex-1" />
            <div className="flex flex-col md:flex-row gap-2">
              <Skeleton className="h-10 w-[150px]" />
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-[150px]" />
              <Skeleton className="h-10 w-[180px]" />
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <Skeleton className="h-12 w-[200px]" />
                    <Skeleton className="h-12 w-[100px]" />
                    <Skeleton className="h-12 w-[150px]" />
                    <Skeleton className="h-12 w-[100px]" />
                    <Skeleton className="h-12 w-[100px]" />
                    <Skeleton className="h-12 w-[150px]" />
                    <Skeleton className="h-12 w-[120px]" />
                    <Skeleton className="h-12 w-[100px]" />
                  </div>
                ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[180px]" />
            <Skeleton className="h-4 w-[250px] mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-start space-x-3 pb-4 border-b">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-[250px]" />
                      <Skeleton className="h-4 w-[200px] mt-1" />
                      <Skeleton className="h-3 w-[180px] mt-2" />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[180px]" />
            <Skeleton className="h-4 w-[250px] mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Skeleton className="h-5 w-[220px] mb-2" />
                <div className="space-y-3">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <Skeleton className="h-4 w-[100px]" />
                          <Skeleton className="h-4 w-[30px]" />
                        </div>
                        <Skeleton className="h-2.5 w-full rounded-full" />
                      </div>
                    ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <Skeleton className="h-5 w-[200px] mb-2" />
                <div className="space-y-3">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <Skeleton className="h-4 w-[120px]" />
                          <Skeleton className="h-4 w-[30px]" />
                        </div>
                        <Skeleton className="h-2.5 w-full rounded-full" />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

