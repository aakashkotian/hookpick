import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
export const metadata: Metadata = { title:'HookPick', description:'Test thumbnails and titles with a small audience before you publish' }
export default function RootLayout({ children }: { children: React.ReactNode }){
  return (<html lang='en'><body>
    <header className='border-b border-[#141725]'><div className='container flex items-center justify-between py-4'><Link href='/' className='text-xl font-semibold tracking-tight'>HookPick</Link></div></header>
    <main className='container py-8'>{children}</main>
    <footer className='border-t border-[#141725]'><div className='container py-6 text-sm text-[#9aa3b2]'>Built for creators. No fluff.</div></footer>
  </body></html>) }
