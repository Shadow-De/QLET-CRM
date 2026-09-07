import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTenantSchema } from "@/lib/validations/tenant";
import { writeAuditLog } from "@/lib/audit";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50")));

  try {
    const where = {
      agentId: session.user.id,
      ...(status && { status }),
    };

    const [tenants, total, allTenants] = await prisma.$transaction([
      prisma.tenant.findMany({
        where,
        select: {
          id: true,
          status: true,
          leaseStart: true,
          leaseEnd: true,
          monthlyRent: true,
          depositHeld: true,
          createdAt: true,
          lead: { select: { id: true, name: true, email: true, phone: true, nationality: true } },
          property: { select: { id: true, title: true, address: true, type: true, bedrooms: true, city: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tenant.count({ where }),
      prisma.tenant.findMany({ where: { agentId: session.user.id } }) // Fetch all for KPI calcs
    ]);

    // KPI Calculations
    let monthlyRentRoll = 0;
    let activeTenancies = 0;
    let upcomingExpiries = 0;

    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

    allTenants.forEach(t => {
      if (t.status === "Active") {
        activeTenancies++;
        const rentVal = parseFloat((t.monthlyRent || "0").replace(/[^0-9.]/g, ''));
        if (!isNaN(rentVal)) monthlyRentRoll += rentVal;
      }
      if (t.leaseEnd && new Date(t.leaseEnd) <= sixtyDaysFromNow && new Date(t.leaseEnd) >= new Date()) {
         upcomingExpiries++;
      }
    });

    const kpis = {
       monthlyRentRoll,
       activeTenancies,
       upcomingExpiries,
       collectionRate: 100, // Hardcoded as requested
    };

    return NextResponse.json({ tenants, total, page, limit, kpis });
  } catch (err) {
    logger.error({ err, agentId: session.user.id }, "GET /api/tenants error");
    return NextResponse.json({ error: { message: "Failed to fetch tenants." } }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

  const parsed = createTenantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Validation failed.", code: "VALIDATION_ERROR" } },
      { status: 400 }
    );
  }

  try {
    // Validate: lead must belong to this agent and have status "Won"
    const lead = await prisma.lead.findFirst({
      where: { id: parsed.data.leadId, agentId: session.user.id },
      select: { id: true, status: true, tenant: { select: { id: true } } },
    });

    if (!lead) {
      return NextResponse.json({ error: { message: "Lead not found." } }, { status: 404 });
    }

    if (lead.status !== "Won") {
      return NextResponse.json(
        { error: { message: "Only leads with status 'Won' can be converted to tenants." } },
        { status: 409 }
      );
    }

    if (lead.tenant) {
      return NextResponse.json(
        { error: { message: "This lead has already been converted to a tenant." } },
        { status: 409 }
      );
    }

    // Validate: property must belong to this agent
    const property = await prisma.property.findFirst({
      where: { id: parsed.data.propertyId, agentId: session.user.id },
      select: { id: true },
    });

    if (!property) {
      return NextResponse.json({ error: { message: "Property not found." } }, { status: 404 });
    }

    const tenant = await prisma.tenant.create({
      data: {
        ...parsed.data,
        leaseStart: new Date(parsed.data.leaseStart),
        leaseEnd: parsed.data.leaseEnd ? new Date(parsed.data.leaseEnd) : null,
        agentId: session.user.id,
      },
      select: { id: true, status: true, leaseStart: true, monthlyRent: true, createdAt: true },
    });

    await writeAuditLog("tenant.created", session.user.id, tenant.id, {
      leadId: parsed.data.leadId,
      propertyId: parsed.data.propertyId,
    });

    return NextResponse.json({ tenant }, { status: 201 });
  } catch (err) {
    logger.error({ err, agentId: session.user.id }, "POST /api/tenants error");
    return NextResponse.json({ error: { message: "Failed to create tenant." } }, { status: 500 });
  }
}
