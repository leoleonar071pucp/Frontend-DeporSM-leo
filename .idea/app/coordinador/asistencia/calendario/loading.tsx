import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-[200px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px] mb-2" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-[200px] mb-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Skeleton className="h-5 w-[200px] mb-2" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                    <Skeleton className="h-6 w-[80px]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Skeleton className="h-4 w-[100px] mb-1" />
                      <Skeleton className="h-5 w-[80px]" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-[100px] mb-1" />
                      <Skeleton className="h-5 w-[80px]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}