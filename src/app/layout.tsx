import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body className="bg-base-bg text-text-primary min-h-screen">
        {children}
      </body>
    </html>
  )
}
