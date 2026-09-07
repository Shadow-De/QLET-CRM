import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * Fire-and-forget audit log writer.
 * Never throws — errors are logged server-side only.
 * Never logs full PII payloads — only IDs and change deltas.
 */
export async function writeAuditLog(
  action: string,
  agentId?: string,
  targetId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        agentId: agentId ?? null,
        targetId: targetId ?? null,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });
  } catch (err) {
    // Log the error server-side but do not propagate — audit failures must not break the primary request
    logger.error({ err, action, agentId, targetId }, "Failed to write audit log");
  }
}
