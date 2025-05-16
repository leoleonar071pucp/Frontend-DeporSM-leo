export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
      <div className="rounded-lg border bg-white">
        <div className="p-6 border-b">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="p-2 rounded-lg border">
                <div className="h-6 w-full bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="p-2 bg-gray-100 rounded-md">
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t flex justify-between">
          <div className="h-9 w-28 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-9 w-36 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
