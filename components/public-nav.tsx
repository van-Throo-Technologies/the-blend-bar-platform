import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'

export function PublicNav() {
  return <header className="sticky top-0 z-50 border-b border-[#203e33]/10 bg-[#f6f0e6]/90 backdrop-blur"><div className="shell flex h-20 items-center justify-between"><Logo/><nav className="hidden items-center gap-7 text-sm md:flex"><a href="#experience">Experience</a><a href="#conditioner">Conditioner Edition</a><a href="#science">Our approach</a></nav><Button href="/login" variant="secondary">My Blend Bar</Button></div></header>
}
