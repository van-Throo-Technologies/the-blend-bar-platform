import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'

export function PublicNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--rule)] bg-[color-mix(in_srgb,var(--ivory)_92%,transparent)] backdrop-blur">
      <div className="shell flex h-20 items-center justify-between gap-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <a className="link-quiet focus-ring" href="#experience">Experience</a>
          <a className="link-quiet focus-ring" href="#conditioner">Conditioner Edition</a>
          <a className="link-quiet focus-ring" href="#science">Our approach</a>
        </nav>
        <Button href="/login" variant="secondary" className="btn-small">My Blend Bar</Button>
      </div>
    </header>
  )
}
