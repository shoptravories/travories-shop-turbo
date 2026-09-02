export default function Loading() {
  return (
    <>
      <div className="bg-brand-primary-deep h-[14rem] small:h-[18rem]" />
      <div className="content-container py-12 small:py-16">
        <div className="max-w-2xl space-y-3">
          <div className="h-4 w-full rounded-base bg-brand-surface animate-pulse" />
          <div className="h-4 w-11/12 rounded-base bg-brand-surface animate-pulse" />
          <div className="h-4 w-9/12 rounded-base bg-brand-surface animate-pulse" />
        </div>
      </div>
      <div className="content-container pb-16">
        <div className="h-7 w-52 rounded-base bg-brand-surface animate-pulse mb-6" />
        <div className="grid grid-cols-2 small:grid-cols-4 gap-x-6 gap-y-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[9/16] rounded-large bg-brand-surface animate-pulse" />
              <div className="h-4 w-3/4 rounded-base bg-brand-surface animate-pulse mt-4" />
              <div className="h-4 w-1/3 rounded-base bg-brand-surface animate-pulse mt-2" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
