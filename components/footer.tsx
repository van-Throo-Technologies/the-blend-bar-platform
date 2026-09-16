import { Logo } from '@/components/ui/logo'

export function Footer() {
  return (
    <footer className="border-t border-[var(--rule)] py-12">
      <div className="shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <Logo />
        <p className="muted max-w-xl text-sm leading-6">
          Educational formulation experience. The Blend Bar does not diagnose or treat medical conditions. Hair and scalp concerns requiring clinical assessment should be referred appropriately.
        </p>
      </div>
    </footer>
  )
}
