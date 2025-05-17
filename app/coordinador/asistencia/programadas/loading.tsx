import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-[200px]" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-grow" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[150px] mb-2" />
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Skeleton className="h-5 w-[180px] mb-2" />
                    <Skeleton className="h-5 w-[100px]" />
                  </div>
                </div>
                <Skeleton className="h-4 w-[150px] mb-4" />
                <div className="space-y-4">
                  <div>
                    <Skeleton className="h-4 w-[80px] mb-1" />
                    <Skeleton className="h-5 w-[100px]" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-[80px] mb-1" />
                    <Skeleton className="h-5 w-[100px]" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}