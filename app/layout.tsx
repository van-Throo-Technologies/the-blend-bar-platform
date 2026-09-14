import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'The Blend Bar', template: '%s | The Blend Bar' },
  description: 'A guided, science-led formulation experience from Natural Hair Therapist.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
