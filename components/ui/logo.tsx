import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="focus-ring inline-flex items-center gap-3" aria-label="The Blend Bar home">
      <span className="grid h-10 w-10 shrink-0 place-items-center bg-[var(--green)] text-[13px] font-semibold tracking-[.08em] text-[var(--ivory)]" style={{ borderRadius: 'var(--radius)' }}>BB</span>
      <span>
        <span className="display block text-xl leading-none">The Blend Bar</span>
        <span className="eyebrow mt-1.5 block text-[9px]">by Natural Hair Therapist</span>
      </span>
    </Link>
  )
}
