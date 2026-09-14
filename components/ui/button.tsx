import Link from 'next/link'
import type { ReactNode } from 'react'

export function Button({ href, children, variant = 'primary', className = '' }: { href: string; children: ReactNode; variant?: 'primary'|'secondary'; className?: string }) {
  const styles = variant === 'primary'
    ? 'bg-[#203e33] text-[#fffdf8] hover:bg-[#162e26]'
    : 'border border-[#203e33]/25 bg-transparent text-[#203e33] hover:bg-white/60'
  return <Link href={href} className={`focus-ring inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${styles} ${className}`}>{children}</Link>
}
