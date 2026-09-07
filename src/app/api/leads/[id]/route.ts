import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { updateLeadSchema } from "@/lib/validations/lead";
import { logger } from "@/lib/logger";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/leads/:id
export async function GET(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  const { id } = await params;

  try {
    const lead = await prisma.lead.findFirst({
      where: { id, agentId: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        nationality: true,
        area: true,
        propertyType: true,
        bedrooms: true,
        budget: true,
        status: true,
        source: true,
        notes: true,
        intakeLinkId: true,
        createdAt: true,
        updatedAt: true,
        tenant: {
          select: { id: true, status: true, leaseStart: true, leaseEnd: true },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: { message: "Lead not found." } }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (err) {
    logger.error({ err, agentId: session.user.id, leadId: id }, "GET /api/leads/:id error");
    return NextResponse.json({ error: { message: "Failed to fetch lead." } }, { status: 500 });
  }
}

// PATCH /api/leads/:id
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

  const parsed = updateLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Validation failed.", code: "VALIDATION_ERROR" } },
      { status: 400 }
    );
  }

  try {
    // Fetch existing lead to scope to agentId and capture old status for audit
    const existing = await prisma.lead.findFirst({
      where: { id, agentId: session.user.id },
      select: { id: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: { message: "Lead not found." } }, { status: 404 });
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        updatedAt: true,
      },
    });

    // Write audit log if status changed
    if (parsed.data.status && parsed.data.status !== existing.status) {
      await writeAuditLog("lead.status_changed", session.user.id, id, {
        from: existing.status,
        to: parsed.data.status,
      });
    } else if (Object.keys(parsed.data).length > 0) {
      await writeAuditLog("lead.updated", session.user.id, id, {});
    }

    return NextResponse.json({ lead: updated });
  } catch (err) {
    logger.error({ err, agentId: session.user.id, leadId: id }, "PATCH /api/leads/:id error");
    return NextResponse.json({ error: { message: "Failed to update lead." } }, { status: 500 });
  }
}

// DELETE /api/leads/:id
export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.lead.findFirst({
      where: { id, agentId: session.user.id },
      select: { id: true, name: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: { message: "Lead not found." } }, { status: 404 });
    }

    // Write audit log BEFORE deleting
    await writeAuditLog("lead.deleted", session.user.id, id, { status: existing.status });

    await prisma.lead.delete({ where: { id } });

    return NextResponse.json({ message: "Lead deleted." });
  } catch (err) {
    logger.error({ err, agentId: session.user.id, leadId: id }, "DELETE /api/leads/:id error");
    return NextResponse.json({ error: { message: "Failed to delete lead." } }, { status: 500 });
  }
}
