export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
        </div>
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="border rounded-lg">
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="rounded-md border">
            <div className="h-10 w-full bg-gray-200 rounded-t animate-pulse"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 w-full bg-gray-100 animate-pulse border-t"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

