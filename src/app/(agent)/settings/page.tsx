import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ReplayTourButton } from '@/components/ReplayTourButton'

export default async function SettingsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-muted mt-1">Account & preferences</p>
      </div>

      <div className="surface p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-text-primary mb-1">Signed in as</h2>
          <p className="text-sm text-text-secondary">{session.user?.email}</p>
        </div>

        <div className="border-t border-white/5 pt-4">
          <h2 className="text-sm font-semibold text-text-primary mb-2">Onboarding Tour</h2>
          <p className="text-xs text-text-muted mb-3">
            Replay the guided walkthrough that shows you around the platform.
          </p>
          <ReplayTourButton />
        </div>

        <div className="border-t border-white/5 pt-4">
          <h2 className="text-sm font-semibold text-text-primary mb-2">Data & Privacy</h2>
          <p className="text-xs text-text-muted">
            All tenant data is stored encrypted at rest and in transit. To delete a lead and all associated personal data, open the lead on the Leads board and click &quot;Delete Lead.&quot;
          </p>
        </div>
      </div>
    </div>
  )
}
