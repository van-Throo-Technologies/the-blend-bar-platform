import { Logo } from '@/components/ui/logo'
export default function AuthLayout({children}:{children:React.ReactNode}){return <main className="min-h-screen bg-[#203e33] px-4 py-10"><div className="mx-auto max-w-md"><div className="mb-8 rounded-2xl bg-[#f6f0e6] p-4"><Logo/></div>{children}</div></main>}
