/**
 * Cloudflare Turnstile server-side token verification.
 * Called from /api/leads/public after client completes the challenge.
 */
export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  // If no secret key configured (dev/test), skip verification
  if (!secretKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[TURNSTILE] TURNSTILE_SECRET_KEY not set in production!')
      return false
    }
    return true
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
          remoteip: ip,
        }),
      }
    )

    const data = await response.json() as { success: boolean }
    return data.success === true
  } catch {
    console.error('[TURNSTILE] Verification request failed')
    return false
  }
}
