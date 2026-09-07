import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// POST /api/settings/export-data — GDPR data portability
// Returns a downloadable JSON of the requesting agent's own data only
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  try {
    const [agent, leads, properties, tenants] = await prisma.$transaction([
      prisma.agent.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      }),
      prisma.lead.findMany({
        where: { agentId: session.user.id },
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
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.property.findMany({
        where: { agentId: session.user.id },
        select: {
          id: true,
          title: true,
          address: true,
          city: true,
          type: true,
          bedrooms: true,
          monthlyRent: true,
          available: true,
          createdAt: true,
        },
      }),
      prisma.tenant.findMany({
        where: { agentId: session.user.id },
        select: {
          id: true,
          status: true,
          leaseStart: true,
          leaseEnd: true,
          monthlyRent: true,
          depositHeld: true,
          createdAt: true,
          lead: { select: { name: true, email: true } },
          property: { select: { title: true, address: true } },
        },
      }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      agent,
      leads,
      properties,
      tenants,
    };

    const json = JSON.stringify(exportData, null, 2);

    return new NextResponse(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="qletlettings-export-${Date.now()}.json"`,
      },
    });
  } catch (err) {
    logger.error({ err, agentId: session.user.id }, "POST /api/settings/export-data error");
    return NextResponse.json(
      { error: { message: "Failed to generate data export." } },
      { status: 500 }
    );
  }
}
