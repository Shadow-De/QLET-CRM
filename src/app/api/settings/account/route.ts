import { NextResponse } from "next/server";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { deleteAccountSchema } from "@/lib/validations/settings";
import { writeAuditLog } from "@/lib/audit";
import { logger } from "@/lib/logger";

// DELETE /api/settings/account — GDPR right to erasure
// Requires re-authentication (currentPassword) and a typed confirmation phrase
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid request body." } }, { status: 400 });
  }

  const parsed = deleteAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          message:
            'Validation failed. Ensure you have entered your password and typed "DELETE MY ACCOUNT" exactly.',
          code: "VALIDATION_ERROR",
        },
      },
      { status: 400 }
    );
  }

  try {
    // Re-authenticate: verify current password
    const agent = await prisma.agent.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true },
    });

    if (!agent) {
      return NextResponse.json({ error: { message: "Agent not found." } }, { status: 404 });
    }

    const passwordValid = await bcrypt.compare(parsed.data.currentPassword, agent.passwordHash);
    if (!passwordValid) {
      await writeAuditLog("auth.failed_delete_account", agent.id, agent.id, {});
      return NextResponse.json(
        { error: { message: "Incorrect password." } },
        { status: 403 }
      );
    }

    // Write final audit log BEFORE deleting (this will be cascade-deleted, but it's a record of intent)
    await writeAuditLog("account.deleted", agent.id, agent.id, {});

    // Delete agent — cascades to: leads, properties, tenants, intake links, settings, password resets
    await prisma.agent.delete({ where: { id: agent.id } });

    // Sign out and clear session
    await signOut({ redirect: false });

    return NextResponse.json({ message: "Account and all associated data have been permanently deleted." });
  } catch (err) {
    logger.error({ err, agentId: session.user.id }, "DELETE /api/settings/account error");
    return NextResponse.json(
      { error: { message: "Failed to delete account. Please try again." } },
      { status: 500 }
    );
  }
}
