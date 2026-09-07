import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updatePropertySchema } from "@/lib/validations/property";
import { logger } from "@/lib/logger";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  const { id } = await params;

  try {
    const rows = await prisma.$queryRaw`
      SELECT
        id, "agentId", title, address, city, type,
        bedrooms, bathrooms, "monthlyRent",
        "landlordName", "ownerPhone", available, "availableFrom", "availabilityStatus",
        description, "epcRating", "createdAt", "updatedAt"
      FROM "Property"
      WHERE id = ${id} AND "agentId" = ${session.user.id}
      LIMIT 1
    ` as any[];

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: { message: "Property not found." } }, { status: 404 });
    }

    return NextResponse.json({ property: rows[0] });
  } catch (err) {
    logger.error({ err, agentId: session.user.id, propertyId: id }, "GET /api/properties/:id error");
    return NextResponse.json({ error: { message: "Failed to fetch property." } }, { status: 500 });
  }
}

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

  const parsed = updatePropertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Validation failed.", code: "VALIDATION_ERROR" } },
      { status: 400 }
    );
  }

  try {
    // Verify property belongs to this agent
    const existing = await prisma.$queryRaw`
      SELECT id FROM "Property" WHERE id = ${id} AND "agentId" = ${session.user.id} LIMIT 1
    ` as any[];

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: { message: "Property not found." } }, { status: 404 });
    }

    const d = parsed.data;
    const now = new Date();

    // Build dynamic SET clause only for provided fields
    const sets: string[] = ['"updatedAt" = NOW()'];
    const values: any[] = [];

    if (d.title !== undefined) { sets.push(`title = $${values.length + 1}`); values.push(d.title); }
    if (d.address !== undefined) { sets.push(`address = $${values.length + 1}`); values.push(d.address); }
    if (d.city !== undefined) { sets.push(`city = $${values.length + 1}`); values.push(d.city); }
    if (d.type !== undefined) { sets.push(`type = $${values.length + 1}`); values.push(d.type); }
    if (d.bedrooms !== undefined) { sets.push(`bedrooms = $${values.length + 1}`); values.push(d.bedrooms); }
    if (d.bathrooms !== undefined) { sets.push(`bathrooms = $${values.length + 1}`); values.push(d.bathrooms); }
    if (d.monthlyRent !== undefined) { sets.push(`"monthlyRent" = $${values.length + 1}`); values.push(d.monthlyRent); }
    if (d.landlordName !== undefined) { sets.push(`"landlordName" = $${values.length + 1}`); values.push(d.landlordName); }
    if (d.ownerPhone !== undefined) { sets.push(`"ownerPhone" = $${values.length + 1}`); values.push(d.ownerPhone); }
    if (d.available !== undefined) { sets.push(`available = $${values.length + 1}`); values.push(d.available); }
    if (d.availableFrom !== undefined) { sets.push(`"availableFrom" = $${values.length + 1}`); values.push(d.availableFrom ? new Date(d.availableFrom) : null); }
    if ((d as any).availabilityStatus !== undefined) { sets.push(`"availabilityStatus" = $${values.length + 1}`); values.push((d as any).availabilityStatus); }
    if (d.description !== undefined) { sets.push(`description = $${values.length + 1}`); values.push(d.description); }
    if (d.epcRating !== undefined) { sets.push(`"epcRating" = $${values.length + 1}`); values.push(d.epcRating); }

    values.push(id);
    values.push(session.user.id);

    const query = `
      UPDATE "Property"
      SET ${sets.join(", ")}
      WHERE id = $${values.length - 1} AND "agentId" = $${values.length}
      RETURNING id, title, available, "availabilityStatus", "monthlyRent", "updatedAt"
    `;

    const result = await prisma.$queryRawUnsafe(query, ...values) as any[];

    return NextResponse.json({ property: result[0] });
  } catch (err) {
    logger.error({ err, agentId: session.user.id, propertyId: id }, "PATCH /api/properties/:id error");
    return NextResponse.json({ error: { message: "Failed to update property." } }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.$queryRaw`
      SELECT id FROM "Property" WHERE id = ${id} AND "agentId" = ${session.user.id} LIMIT 1
    ` as any[];

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: { message: "Property not found." } }, { status: 404 });
    }

    // Check for ANY associated tenants (Active, Ended, etc.) to prevent foreign key violation
    const associatedTenants = await prisma.$queryRaw`
      SELECT id FROM "Tenant" WHERE "propertyId" = ${id} LIMIT 1
    ` as any[];

    if (associatedTenants.length > 0) {
      return NextResponse.json(
        { error: { message: "Cannot delete a property with associated tenancy records. Please remove tenants first." } },
        { status: 409 }
      );
    }

    await prisma.$executeRaw`DELETE FROM "Property" WHERE id = ${id}`;

    return NextResponse.json({ message: "Property deleted." });
  } catch (err) {
    logger.error({ err, agentId: session.user.id, propertyId: id }, "DELETE /api/properties/:id error");
    return NextResponse.json({ error: { message: "Failed to delete property." } }, { status: 500 });
  }
}
