import Link from 'next/link'
import type { ReactNode } from 'react'

/** Colour comes from surface tokens, so this stays legible on ivory, white and deep green. */
export function Button({ href, children, variant = 'primary', className = '' }: { href: string; children: ReactNode; variant?: 'primary'|'secondary'; className?: string }) {
  return <Link href={href} className={`${variant === 'primary' ? 'btn' : 'btn-ghost'} ${className}`}>{children}</Link>
}
