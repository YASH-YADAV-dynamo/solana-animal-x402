import type { Metadata } from 'next'
import { Creepster, Press_Start_2P } from 'next/font/google'
import './globals.css'

const creepster = Creepster({
  weight: '400',
  variable: '--font-creepster',
  subsets: ['latin'],
})

const pressStart = Press_Start_2P({
  weight: '400',
  variable: '--font-press-start',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Animal API - x402 Solana',
  description: 'Get random animals based on character repetition. Powered by Solana devnet and x402 protocol.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${creepster.variable} ${pressStart.variable} antialiased`}>{children}</body>
    </html>
  )
}
