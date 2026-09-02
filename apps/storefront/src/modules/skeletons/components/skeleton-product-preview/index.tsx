const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse overflow-hidden rounded-card border border-ui-border-base bg-white">
      <div className="aspect-[11/14] w-full bg-ui-bg-subtle" />
      <div className="flex flex-col gap-y-2 p-4">
        <div className="h-3 w-1/3 rounded-base bg-ui-bg-subtle" />
        <div className="h-4 w-3/4 rounded-base bg-ui-bg-subtle" />
        <div className="mt-2 h-4 w-1/4 rounded-base bg-ui-bg-subtle" />
      </div>
    </div>
  )
}

export default SkeletonProductPreview
