import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPropertySchema } from "@/lib/validations/property";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50")));
  const offset = (page - 1) * limit;

  try {
    const properties = await prisma.$queryRaw`
      SELECT
        id, "agentId", title, address, city, type,
        bedrooms, bathrooms, "monthlyRent",
        "landlordName", "ownerPhone", available, "availableFrom", "availabilityStatus",
        description, "epcRating", "createdAt", "updatedAt"
      FROM "Property"
      WHERE "agentId" = ${session.user.id}
      ORDER BY "createdAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await prisma.$queryRaw`
      SELECT COUNT(*)::int as total FROM "Property"
      WHERE "agentId" = ${session.user.id}
    ` as { total: number }[];

    const total = countResult[0]?.total ?? 0;

    return NextResponse.json({ properties, total, page, limit });
  } catch (err) {
    logger.error({ err, agentId: session.user.id }, "GET /api/properties error");
    return NextResponse.json({ error: { message: "Failed to fetch properties." } }, { status: 500 });
  }
}

import fs from 'fs';
import path from 'path';

function logToFile(msg: string, data: any) {
  try {
    const logPath = path.join(process.cwd(), 'api-debug.log');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}: ${JSON.stringify(data, null, 2)}\n`);
  } catch (e) {}
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
    logToFile("POST /api/properties - Body received", body);
  } catch (err) {
    logToFile("POST /api/properties - Body parse error", err);
    return NextResponse.json({ error: { message: "Invalid request body." } }, { status: 400 });
  }

  const parsed = createPropertySchema.safeParse(body);
  if (!parsed.success) {
    logToFile("POST /api/properties - Validation failed", parsed.error.format());
    return NextResponse.json(
      { error: { message: "Validation failed.", code: "VALIDATION_ERROR" } },
      { status: 400 }
    );
  }

  try {
    const data = parsed.data;
    logToFile("POST /api/properties - Prisma create start", data);

    // Use raw SQL to bypass the stale Prisma client.
    // The database already has all these columns; the client just hasn't been regenerated yet.
    const id = crypto.randomUUID();
    const now = new Date();

    await prisma.$executeRaw`
      INSERT INTO "Property" (
        "id", "agentId", "title", "address", "city",
        "type", "bedrooms", "bathrooms", "monthlyRent",
        "landlordName", "ownerPhone", "available", "availableFrom",
        "availabilityStatus",
        "description", "epcRating", "createdAt", "updatedAt"
      ) VALUES (
        ${id}, ${session.user.id}, ${data.title}, ${data.address},
        ${data.city ?? "London"},
        ${data.type}, ${data.bedrooms ?? 1}, ${data.bathrooms ?? null},
        ${data.monthlyRent}, ${data.landlordName ?? null},
        ${data.ownerPhone ?? null}, ${data.available ?? false},
        ${data.availableFrom ? new Date(data.availableFrom) : null},
        'Pending',
        ${data.description ?? null}, ${data.epcRating ?? null},
        ${now}, ${now}
      )
    `;

    logToFile("POST /api/properties - Raw SQL insert success", { id });
    return NextResponse.json({ property: { id, title: data.title, monthlyRent: data.monthlyRent, available: data.available, createdAt: now } }, { status: 201 });
  } catch (err: any) {
    logToFile("POST /api/properties - Error", { name: err.name, message: err.message });
    logger.error({ err, agentId: session.user.id }, "POST /api/properties error");
    return NextResponse.json({ error: { message: "Failed to create property." } }, { status: 500 });
  }
}
