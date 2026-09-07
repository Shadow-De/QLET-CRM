import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@qletlettings.com";

/**
 * Sends an email notification to the agent when a new lead submits via intake form.
 */
export async function sendNewLeadNotification({
  agentEmail,
  agentName,
  leadName,
  propertyType,
  area,
}: {
  agentEmail: string;
  agentName: string;
  leadName: string;
  propertyType?: string | null;
  area?: string | null;
}) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: agentEmail,
    subject: `New intake submission: ${leadName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; color: #1a1a2e;">
        <h2 style="color: #E6399B;">New Lead — QletLettings CRM</h2>
        <p>Hi ${agentName},</p>
        <p>A new prospective tenant has submitted their intake form:</p>
        <ul>
          <li><strong>Name:</strong> ${leadName}</li>
          ${propertyType ? `<li><strong>Property type:</strong> ${propertyType}</li>` : ""}
          ${area ? `<li><strong>Area of interest:</strong> ${area}</li>` : ""}
        </ul>
        <p>Log in to your CRM to review and progress this lead:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads" 
           style="display:inline-block;background:linear-gradient(135deg,#E6399B,#7C3AED);color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">
          View Lead in CRM →
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px;">QletLettings Enterprise Estate CRM · Automated notification</p>
      </div>
    `,
  });

  return error;
}

/**
 * Sends a password reset email with a single-use token link.
 */
export async function sendPasswordResetEmail({
  to,
  resetToken,
  name,
}: {
  to: string;
  resetToken: string;
  name: string;
}) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login/reset-password?token=${resetToken}`;

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your QletLettings password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; color: #1a1a2e;">
        <h2 style="color: #E6399B;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the link below — it expires in 1 hour:</p>
        <a href="${resetUrl}" 
           style="display:inline-block;background:linear-gradient(135deg,#E6399B,#7C3AED);color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Reset Password →
        </a>
        <p>If you didn't request this, ignore this email — your password hasn't changed.</p>
        <p style="color:#999;font-size:12px;margin-top:24px;">QletLettings Enterprise Estate CRM</p>
      </div>
    `,
  });

  return error;
}

/**
 * Sends viewing confirmation schedule to the client (and agent).
 */
export async function sendViewingScheduleEmail({
  clientEmail,
  clientName,
  agentEmail,
  agentName,
  propertyLocation,
  viewingDate,
  viewingTime,
  durationMinutes,
  notes,
  googleCalendarUrl,
  icsContent,
}: {
  clientEmail: string;
  clientName: string;
  agentEmail: string;
  agentName?: string;
  propertyLocation: string;
  viewingDate: string;
  viewingTime: string;
  durationMinutes: number;
  notes?: string;
  googleCalendarUrl: string;
  icsContent?: string;
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes("your_key_here")) {
    console.info(`[Email Service] Simulated sending viewing schedule to ${clientEmail}`);
    return { success: true, simulated: true };
  }

  try {
    const formattedDate = new Date(viewingDate + "T12:00:00").toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const attachments = icsContent
      ? [
          {
            filename: `viewing-${propertyLocation.replace(/[^a-zA-Z0-9]/g, "-")}.ics`,
            content: Buffer.from(icsContent).toString("base64"),
          },
        ]
      : undefined;

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: clientEmail,
      cc: agentEmail ? [agentEmail] : undefined,
      subject: `Property Viewing Confirmed: ${propertyLocation} — ${viewingDate} at ${viewingTime}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; color: #141019; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #eaeaea;">
          <div style="background: linear-gradient(135deg, #7C3AED 0%, #E6399B 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Property Viewing Confirmed</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Qlet Lettings Private Concierge</p>
          </div>
          
          <div style="padding: 28px;">
            <p style="font-size: 16px; line-height: 1.5; color: #333333; margin-top: 0;">
              Hi <strong>${clientName}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #555555;">
              Your upcoming property viewing has been officially scheduled. Here are the confirmed appointment details:
            </p>

            <div style="background: #F8F7FB; border: 1px solid #E9E6F2; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #777777; width: 110px;">📅 Date:</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #141019;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #777777;">⏰ Time:</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #141019;">${viewingTime} (${durationMinutes} minutes)</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #777777;">📍 Location:</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #141019;">${propertyLocation}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #777777;">👤 Your Agent:</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #141019;">${agentName || "Dedicated Letting Agent"} (<a href="mailto:${agentEmail}" style="color: #7C3AED; text-decoration: none;">${agentEmail}</a>)</td>
                </tr>
                ${notes ? `
                <tr>
                  <td style="padding: 6px 0; color: #777777; vertical-align: top;">📝 Instructions:</td>
                  <td style="padding: 6px 0; color: #444444; line-height: 1.5;">${notes}</td>
                </tr>
                ` : ""}
              </table>
            </div>

            <div style="text-align: center; margin: 28px 0;">
              <a href="${googleCalendarUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #E6399B); color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                📅 Add to Google Calendar
              </a>
            </div>

            <p style="font-size: 12px; color: #888888; line-height: 1.5; text-align: center; margin-bottom: 0;">
              A calendar invitation (.ics) is also attached to this email. You can directly import it into Apple Calendar, Google Calendar, or Outlook.
            </p>
          </div>

          <div style="background: #F4F2F8; border-top: 1px solid #EBE8F2; padding: 16px 28px; text-align: center; font-size: 12px; color: #888888;">
            Need to reschedule or have questions? Contact your agent at <a href="mailto:${agentEmail}" style="color: #7C3AED; text-decoration: none;">${agentEmail}</a>.<br/>
            © ${new Date().getFullYear()} QletLettings Enterprise Estate CRM
          </div>
        </div>
      `,
      attachments,
    });

    if (error) {
      console.error("[Email Service] Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("[Email Service] Failed to send viewing email:", err);
    return { success: false, error: err };
  }
}

