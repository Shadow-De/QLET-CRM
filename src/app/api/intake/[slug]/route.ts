import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const intakeLink = await prisma.intakeLink.findFirst({
      where: {
        OR: [
          { id: slug },
          { token: slug }
        ]
      }
    });

    if (!intakeLink) {
      // If mock slug or doesn't exist, we just let it proceed (or fail on POST)
      return NextResponse.json({ valid: true });
    }

    if (intakeLink.usedAt) {
      return NextResponse.json({ valid: false, reason: "used" });
    }
    
    if (intakeLink.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, reason: "expired" });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Error fetching intake link status:", error);
    return NextResponse.json({ valid: false, reason: "error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const {
      name,
      email,
      phone,
      groupType,
      adultMen,
      adultWomen,
      hasChildren,
      childrenCount,
      childrenAges,
      hasPets,
      petsCount,
      pets,
      nationality,
      visaType,
      moveInDate,
      tenancyDuration,
      propertyTypes,
      budget,
      areas,
      otherDetails,
    } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Name, email and phone are required" }, { status: 400 });
    }

    // Try to find the intake link to get the correct agentId
    let agentId: string;
    const intakeLink = await prisma.intakeLink.findFirst({
      where: {
        OR: [
          { id: slug },
          { token: slug }
        ]
      }
    });

    if (intakeLink) {
      if (intakeLink.usedAt) {
        return NextResponse.json({ error: "This intake link has already been used and is no longer active." }, { status: 403 });
      }
      if (intakeLink.expiresAt < new Date()) {
        return NextResponse.json({ error: "This intake link has expired." }, { status: 403 });
      }
      agentId = intakeLink.agentId;
    } else {
      // Fallback: grab the first agent in the system so local testing works with mock slugs
      const defaultAgent = await prisma.agent.findFirst();
      if (!defaultAgent) {
        return NextResponse.json({ error: "No agents available in the system" }, { status: 500 });
      }
      agentId = defaultAgent.id;
    }

    // Construct a rich notes field based on the intake answers
    const notes = [
      `--- Household Profile ---`,
      `Group Type: ${groupType}`,
      groupType === "Single" ? `Adults: 1` : groupType === "Couple" ? `Adults: 2` : `Adults: ${adultMen} Men, ${adultWomen} Women`,
      hasChildren ? `Children: ${childrenCount} (Ages: ${childrenAges || "Not specified"})` : null,
      hasPets ? `Pets: ${petsCount} (${pets || "Breed not specified"})` : null,
      `\n--- Applicant Background ---`,
      visaType ? `Visa/Right to Rent: ${visaType}` : null,
      moveInDate ? `Target Move-in: ${moveInDate}` : null,
      tenancyDuration ? `Tenancy Duration: ${tenancyDuration}` : null,
      `\n--- Requirements ---`,
      otherDetails ? `Additional Requirements: ${otherDetails}` : null
    ].filter(Boolean).join("\n");

    // Map arrays to comma-separated strings for schema compatibility
    const mappedPropertyTypes = Array.isArray(propertyTypes) && propertyTypes.length > 0 ? propertyTypes.join(", ") : null;
    const mappedAreas = Array.isArray(areas) && areas.length > 0 ? areas.join(", ") : null;

    // Create the Lead
    const newLead = await prisma.lead.create({
      data: {
        agentId,
        name,
        email,
        phone,
        nationality: nationality || null,
        propertyType: mappedPropertyTypes,
        budget: budget ? budget.toString() : null,
        area: mappedAreas,
        status: "New",
        source: "Intake Link",
        notes: notes || null,
        intakeLinkId: intakeLink ? intakeLink.id : null,
      }
    });

    // Create an audit log
    await prisma.auditLog.create({
      data: {
        action: "lead.created_via_intake",
        targetId: newLead.id,
        metadata: JSON.stringify({ slug }),
      }
    });

    // Invalidate the link so it can't be used again
    if (intakeLink) {
      await prisma.intakeLink.update({
        where: { id: intakeLink.id },
        data: { usedAt: new Date() }
      });
    }

    return NextResponse.json({ success: true, lead: newLead });

  } catch (error) {
    console.error("Error creating lead from intake:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
