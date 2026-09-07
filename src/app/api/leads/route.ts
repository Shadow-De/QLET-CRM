import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { createLeadSchema } from "@/lib/validations/lead";
import { logger } from "@/lib/logger";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/leads — list all leads for the authenticated agent
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const area = searchParams.get("area");
  const propertyType = searchParams.get("propertyType");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50")));

  try {
    const where = {
      agentId: session.user.id,
      ...(status && { status }),
      ...(area && { area: { contains: area, mode: "insensitive" as const } }),
      ...(propertyType && { propertyType }),
    };

    const [leads, total] = await prisma.$transaction([
      prisma.lead.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({ leads, total, page, limit }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      }
    });
  } catch (err) {
    logger.error({ err, agentId: session.user.id }, "GET /api/leads error");
    return NextResponse.json(
      { error: { message: "Failed to fetch leads." } },
      { status: 500 }
    );
  }
}

// POST /api/leads — create a new lead manually
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

  const parsed = createLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Validation failed.", code: "VALIDATION_ERROR" } },
      { status: 400 }
    );
  }

  try {
    const lead = await prisma.lead.create({
      data: {
        ...parsed.data,
        agentId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    await writeAuditLog("lead.created", session.user.id, lead.id, { status: lead.status });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (err) {
    logger.error({ err, agentId: session.user.id }, "POST /api/leads error");
    return NextResponse.json(
      { error: { message: "Failed to create lead." } },
      { status: 500 }
    );
  }
}
