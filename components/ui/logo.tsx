import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="The Blend Bar home">
      <span className="grid h-10 w-10 place-items-center rounded-full border border-[#203e33]/20 bg-[#203e33] text-sm font-semibold text-[#f6f0e6]">BB</span>
      <span><span className="display block text-xl leading-none">The Blend Bar</span><span className="mt-1 block text-[10px] uppercase tracking-[.2em] text-[#203e33]/60">by Natural Hair Therapist</span></span>
    </Link>
  )
}
