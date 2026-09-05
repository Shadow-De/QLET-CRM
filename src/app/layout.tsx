import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'QLET CRM — Malta Lettings',
  description: 'Private lettings management platform for QLET, Malta.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet" />
      </head>
      <body className={`${plusJakarta.variable} ${inter.variable} ${jetBrainsMono.variable} font-sans bg-surface text-on-surface min-h-screen antialiased bg-mesh-precision flex flex-col justify-between selection:bg-primary selection:text-on-primary-fixed`}>
        {children}
      </body>
    </html>
  )
}
