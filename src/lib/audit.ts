import { prisma } from './db'

export type AuditEvent =
  | 'LOGIN_FAILED'
  | 'LOGIN_SUCCESS'
  | 'ACCOUNT_LOCKED'
  | 'RATE_LIMIT_HIT'
  | 'INVALID_TOKEN'
  | 'LEAD_CREATED_PUBLIC'
  | 'HONEYPOT_TRIGGERED'
  | 'TURNSTILE_FAILED'

export async function writeAudit(
  event: AuditEvent,
  ip: string | null,
  detail?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        event,
        ip: ip?.slice(0, 45) ?? null,
        // Never log PII or full payloads
        detail: detail?.slice(0, 500) ?? null,
      },
    })
  } catch {
    // Audit logging must never crash the main request
    console.error(`[AUDIT] Failed to write event: ${event}`)
  }
}
