import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { OnboardingTour } from '@/components/OnboardingTour'

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const hasSeenTour = (session.user as { hasSeenTour?: boolean }).hasSeenTour ?? true

  return (
    <div className="flex min-h-screen bg-base-bg bg-grid">
      <Sidebar />
      <main className="flex-1 md:ml-56 p-4 md:p-6 min-h-screen pt-20 md:pt-6">
        {children}
      </main>
      <OnboardingTour hasSeenTour={hasSeenTour} />
    </div>
  )
}
