export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 w-full bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        <div className="md:w-1/3 border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="flex flex-col md:flex-row gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-full md:w-[150px] bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        <div className="h-10 w-full bg-gray-200 rounded animate-pulse mb-4"></div>

        <div className="rounded-md border">
          <div className="h-12 w-full bg-gray-200 rounded-t animate-pulse"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 w-full bg-gray-100 animate-pulse border-t"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

