export default function Loading() {
  return (
    <div className="shell py-20">
      <div role="status" className="animate-pulse motion-reduce:animate-none">
        <span className="sr-only">Loading</span>
        <div className="h-3 w-28 bg-[var(--rule)]" />
        <div className="mt-6 h-12 max-w-2xl bg-[var(--rule)]" />
        <div className="mt-4 h-5 max-w-xl bg-[var(--rule)]" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[1, 2, 3].map((x) => <div key={x} className="h-52 border border-[var(--rule)] bg-[var(--surface-raised)]" />)}
        </div>
      </div>
    </div>
  )
}
