import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export function CustomerNav() {
  return (
    <header className="border-b border-[var(--rule)] bg-[var(--white)]">
      <div className="shell flex min-h-20 items-center justify-between gap-5">
        <Logo />
        <nav className="hidden gap-8 text-sm md:flex">
          <Link className="link-quiet focus-ring" href="/my-blend-bar">Home</Link>
          <Link className="link-quiet focus-ring" href="/my-blend-bar/assessment">Hair Need</Link>
          <Link className="link-quiet focus-ring" href="/my-blend-bar/workshop">Workshop</Link>
        </nav>
        <form action="/api/signout" method="post">
          <button className="btn-ghost btn-small">Sign out</button>
        </form>
      </div>
    </header>
  )
}
