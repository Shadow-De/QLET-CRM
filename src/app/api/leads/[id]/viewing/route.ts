import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { sendViewingScheduleEmail } from "@/lib/email";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const {
      viewingDate,
      viewingTime,
      durationMinutes = 30,
      propertyLocation = "Selected Property",
      clientEmail,
      agentEmail = session.user.email,
      notes = "",
      sendClientEmail = true,
    } = body;

    if (!viewingDate || !viewingTime) {
      return NextResponse.json({ error: { message: "Date and time are required." } }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: { message: "Lead not found." } }, { status: 404 });
    }

    const targetClientEmail = clientEmail || lead.email;
    const targetAgentEmail = agentEmail || session.user.email || "agent@qletlettings.com";

    // Parse start and end times
    const startDateTime = new Date(`${viewingDate}T${viewingTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + (Number(durationMinutes) || 30) * 60000);

    const formatGCalDate = (d: Date) => {
      return d.toISOString().replace(/-|:|\.\d+/g, "");
    };

    const gcalDates = `${formatGCalDate(startDateTime)}/${formatGCalDate(endDateTime)}`;
    const eventTitle = `Property Viewing: ${propertyLocation} with ${lead.name}`;
    const eventDetails = `Property viewing scheduled with client ${lead.name} (${targetClientEmail}) and agent (${targetAgentEmail}).\n\nNotes & Access: ${notes || "None provided"}`;
    
    // Google Calendar template URL with attendees pre-filled
    const attendees = [targetClientEmail, targetAgentEmail].filter(Boolean).join(",");
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${gcalDates}&details=${encodeURIComponent(eventDetails)}&location=${encodeURIComponent(propertyLocation)}&add=${encodeURIComponent(attendees)}`;

    // Generate iCal (.ics) string for direct download or email attachment
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//QletLettings CRM//Viewing Scheduler//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:REQUEST",
      "BEGIN:VEVENT",
      `UID:viewing-${lead.id}-${Date.now()}@qletlettings.com`,
      `DTSTAMP:${formatGCalDate(new Date())}`,
      `DTSTART:${formatGCalDate(startDateTime)}`,
      `DTEND:${formatGCalDate(endDateTime)}`,
      `SUMMARY:${eventTitle}`,
      `DESCRIPTION:${eventDetails.replace(/\n/g, "\\n")}`,
      `LOCATION:${propertyLocation}`,
      `STATUS:CONFIRMED`,
      targetClientEmail ? `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=${lead.name}:mailto:${targetClientEmail}` : null,
      targetAgentEmail ? `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=Agent:mailto:${targetAgentEmail}` : null,
      "END:VEVENT",
      "END:VCALENDAR",
    ].filter(Boolean).join("\r\n");

    // Send email schedule to client via Resend
    let emailStatus: { success: boolean; simulated?: boolean; error?: unknown } = { success: false, simulated: false };
    if (sendClientEmail && targetClientEmail) {
      emailStatus = await sendViewingScheduleEmail({
        clientEmail: targetClientEmail,
        clientName: lead.name,
        agentEmail: targetAgentEmail,
        agentName: session.user.name || undefined,
        propertyLocation,
        viewingDate,
        viewingTime,
        durationMinutes: Number(durationMinutes) || 30,
        notes,
        googleCalendarUrl,
        icsContent,
      });
    }

    // Format log entry
    const emailNotice = targetClientEmail 
      ? `\n📧 Schedule Sent to Client: ${targetClientEmail} (${emailStatus.simulated ? 'Simulated/Development' : emailStatus.success ? 'Delivered' : 'Pending'})` 
      : '';
    const viewingLogEntry = `\n\n--- Scheduled Viewing (${new Date().toLocaleString()}) ---\n📅 Date: ${viewingDate}\n⏰ Time: ${viewingTime} (${durationMinutes} mins)\n📍 Location: ${propertyLocation}\n👤 Client: ${lead.name} (${targetClientEmail})\n💼 Agent: ${targetAgentEmail}\n📝 Notes: ${notes || "None"}${emailNotice}\n🔗 Google Calendar Event: ${googleCalendarUrl}`;

    // Update lead status to Viewing and append viewing notes
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        status: "Viewing",
        notes: (lead.notes || "") + viewingLogEntry,
      },
    });

    await writeAuditLog(
      "lead.status_updated",
      lead.id,
      session.user.id,
      { status: "Viewing", viewingDate, viewingTime, propertyLocation, clientEmail: targetClientEmail, emailSent: emailStatus.success }
    );

    return NextResponse.json({
      success: true,
      lead: updatedLead,
      googleCalendarUrl,
      icsContent,
      emailSent: emailStatus.success,
      emailSimulated: emailStatus.simulated,
      clientEmail: targetClientEmail,
      viewingDetails: {
        date: viewingDate,
        time: viewingTime,
        durationMinutes,
        location: propertyLocation,
        clientEmail: targetClientEmail,
        agentEmail: targetAgentEmail,
      },
    });
  } catch (error) {
    logger.error({ error }, "Error scheduling viewing");
    return NextResponse.json({ error: { message: "Failed to schedule viewing." } }, { status: 500 });
  }
}
