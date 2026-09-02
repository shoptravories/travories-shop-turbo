export default function Loading() {
  return (
    <>
      <div className="bg-brand-primary-deep h-[12rem] small:h-[14rem]" />
      <div className="content-container py-12 small:py-16 grid grid-cols-1 small:grid-cols-[minmax(0,22rem)_1fr] gap-x-12">
        <div className="space-y-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border-l-2 border-ui-border-base pl-6">
              <div className="h-5 w-40 rounded-base bg-brand-surface animate-pulse" />
              <div className="flex flex-wrap gap-2 mt-4">
                {Array.from({ length: 4 }).map((__, j) => (
                  <div
                    key={j}
                    className="h-9 w-24 rounded-circle bg-brand-surface animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 small:mt-0 h-64 rounded-large bg-brand-surface animate-pulse" />
      </div>
    </>
  )
}
