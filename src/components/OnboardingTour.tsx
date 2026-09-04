'use client'

import { useEffect, useRef } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

interface OnboardingTourProps {
  hasSeenTour: boolean
  force?: boolean
}

export function OnboardingTour({ hasSeenTour, force = false }: OnboardingTourProps) {
  const started = useRef(false)

  useEffect(() => {
    if ((hasSeenTour && !force) || started.current) return
    started.current = true

    // Small delay to let the page paint
    const timer = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        progressText: '{{current}} of {{total}}',
        popoverClass: 'driver-popover',
        steps: [
          {
            element: '#nav-dashboard',
            popover: {
              title: 'Dashboard',
              description: 'Track your monthly wins, MoM growth, and a 6-month trend at a glance.',
              side: 'right',
            },
          },
          {
            element: '#nav-leads',
            popover: {
              title: 'Leads Board',
              description: 'Your pipeline in 6 stages — New → Won. Click any card to update status, add notes, or delete.',
              side: 'right',
            },
          },
          {
            element: '#generate-link-btn',
            popover: {
              title: 'Generate Client Link',
              description: 'Click here to create a unique link. Share it with a prospective tenant — they fill the form, and the lead appears on your board instantly.',
              side: 'right',
            },
          },
          {
            element: '#nav-properties',
            popover: {
              title: 'Properties',
              description: 'Your property database. Add listings from cold calls in seconds — optimised for keyboard-first entry.',
              side: 'right',
            },
          },
          {
            element: '#nav-settings',
            popover: {
              title: 'Settings',
              description: 'Replay this tour any time from here. That\'s it — you\'re all set!',
              side: 'right',
            },
          },
        ],
        onDestroyed: async () => {
          // Persist tour completion to DB
          try {
            await fetch('/api/agent/tour-seen', { method: 'PATCH' })
          } catch {
            // Non-critical
          }
        },
      })

      driverObj.drive()
    }, 600)

    return () => clearTimeout(timer)
  }, [hasSeenTour, force])

  return null
}
