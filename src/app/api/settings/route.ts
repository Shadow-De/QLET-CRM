import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateSettingsSchema } from "@/lib/validations/settings";
import { writeAuditLog } from "@/lib/audit";
import { logger } from "@/lib/logger";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  try {
    const [agent, settings] = await prisma.$transaction([
      prisma.agent.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      }),
      prisma.agentSettings.findUnique({
        where: { agentId: session.user.id },
        select: { defaultLinkExpiryDays: true, emailOnNewLead: true, hasSeenTour: true },
      }),
    ]);

    if (!agent) {
      return NextResponse.json({ error: { message: "Agent not found." } }, { status: 404 });
    }

    return NextResponse.json({ agent, settings });
  } catch (err) {
    logger.error({ err, agentId: session.user.id }, "GET /api/settings error");
    return NextResponse.json({ error: { message: "Failed to fetch settings." } }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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

  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Validation failed.", code: "VALIDATION_ERROR" } },
      { status: 400 }
    );
  }

  try {
    const settings = await prisma.agentSettings.upsert({
      where: { agentId: session.user.id },
      update: parsed.data,
      create: {
        agentId: session.user.id,
        ...parsed.data,
      },
      select: { defaultLinkExpiryDays: true, emailOnNewLead: true, hasSeenTour: true },
    });

    await writeAuditLog("settings.updated", session.user.id, session.user.id, {});

    return NextResponse.json({ settings });
  } catch (err) {
    logger.error({ err, agentId: session.user.id }, "PATCH /api/settings error");
    return NextResponse.json({ error: { message: "Failed to update settings." } }, { status: 500 });
  }
}
