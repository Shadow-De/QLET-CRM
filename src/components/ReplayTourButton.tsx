'use client'

import { Button } from '@/components/ui/Button'
import { OnboardingTour } from '@/components/OnboardingTour'
import { useState } from 'react'

export function ReplayTourButton() {
  const [replaying, setReplaying] = useState(false)

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setReplaying(true)}>
        Replay Tour
      </Button>
      {replaying && <OnboardingTour hasSeenTour={false} force={true} />}
    </>
  )
}
