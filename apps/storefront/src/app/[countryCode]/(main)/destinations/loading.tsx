export default function Loading() {
  return (
    <>
      <div className="bg-brand-primary-deep h-[13rem] small:h-[15rem]" />
      <div className="content-container py-12 small:py-16">
        <div className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[13rem] rounded-large bg-brand-surface animate-pulse"
            />
          ))}
        </div>
      </div>
    </>
  )
}
