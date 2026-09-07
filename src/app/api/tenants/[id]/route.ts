import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTenantSchema } from "@/lib/validations/tenant";
import { writeAuditLog } from "@/lib/audit";
import { logger } from "@/lib/logger";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid request body." } }, { status: 400 });
  }

  const parsed = updateTenantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Validation failed.", code: "VALIDATION_ERROR" } },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.tenant.findFirst({
      where: { id, agentId: session.user.id },
      select: { id: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: { message: "Tenant not found." } }, { status: 404 });
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(parsed.data.leaseEnd !== undefined && {
          leaseEnd: parsed.data.leaseEnd ? new Date(parsed.data.leaseEnd) : null,
        }),
      },
      select: { id: true, status: true, leaseEnd: true, monthlyRent: true, updatedAt: true },
    });

    if (parsed.data.status && parsed.data.status !== existing.status) {
      await writeAuditLog("tenant.status_changed", session.user.id, id, {
        from: existing.status,
        to: parsed.data.status,
      });
    }

    return NextResponse.json({ tenant: updated });
  } catch (err) {
    logger.error({ err, agentId: session.user.id, tenantId: id }, "PATCH /api/tenants/:id error");
    return NextResponse.json({ error: { message: "Failed to update tenant." } }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.tenant.findFirst({
      where: { id, agentId: session.user.id },
      select: { id: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: { message: "Tenant not found." } }, { status: 404 });
    }

    await writeAuditLog("tenant.deleted", session.user.id, id, { status: existing.status });
    await prisma.tenant.delete({ where: { id } });

    return NextResponse.json({ message: "Tenant record deleted." });
  } catch (err) {
    logger.error({ err, agentId: session.user.id, tenantId: id }, "DELETE /api/tenants/:id error");
    return NextResponse.json({ error: { message: "Failed to delete tenant." } }, { status: 500 });
  }
}
