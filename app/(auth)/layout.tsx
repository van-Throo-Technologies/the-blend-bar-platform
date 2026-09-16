import { Logo } from '@/components/ui/logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main data-surface="deep" className="surface min-h-screen px-5 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-10 flex justify-center">
          <span className="display text-2xl text-[var(--ivory)]">The Blend Bar</span>
        </div>
        <div className="hidden"><Logo /></div>
        {children}
      </div>
    </main>
  )
}
