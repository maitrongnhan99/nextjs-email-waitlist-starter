import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Wait - Email Waitlist Landing Page',
  description: 'Get early access to Wait and launch a viral waitlist. Sign up to be notified when we launch!',
  keywords: 'waitlist, early access, product launch, email signup',
  openGraph: {
    title: 'Wait - Get Early Access',
    description: 'Be amongst the first to experience Wait and launch a viral waitlist.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}