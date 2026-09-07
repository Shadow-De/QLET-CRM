"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ViewingCalendarPicker } from "@/components/ui/ViewingCalendarPicker";
import { ViewingClockPicker } from "@/components/ui/ViewingClockPicker";

interface ScheduleViewingModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadName: string;
  leadEmail?: string | null;
  leadPhone?: string | null;
  leadProperty?: string;
  defaultAgentEmail?: string;
  onSuccess: (updatedLead?: any) => void;
}

export function ScheduleViewingModal({
  isOpen,
  onClose,
  leadId,
  leadName,
  leadEmail = "",
  leadPhone = "",
  leadProperty = "",
  defaultAgentEmail = "agent@qletlettings.com",
  onSuccess,
}: ScheduleViewingModalProps) {
  // Tomorrow's date as default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split("T")[0];

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("11:00");
  const [duration, setDuration] = useState(30);
  const [location, setLocation] = useState(leadProperty || "Malta Property");
  const [clientEmail, setClientEmail] = useState(leadEmail || "");
  const [agentEmail, setAgentEmail] = useState(defaultAgentEmail);
  const [notes, setNotes] = useState("");
  const [sendClientEmail, setSendClientEmail] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleResult, setScheduleResult] = useState<{
    googleCalendarUrl: string;
    icsContent: string;
    emailSent?: boolean;
    emailSimulated?: boolean;
    clientEmail?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDate(defaultDate);
      setTime("11:00");
      setDuration(30);
      setLocation(leadProperty || "Malta Property");
      setClientEmail(leadEmail || "");
      setAgentEmail(defaultAgentEmail || "agent@qletlettings.com");
      setNotes("");
      setSendClientEmail(true);
      setScheduleResult(null);
      setErrorMsg("");
    }
  }, [isOpen, leadEmail, leadProperty, defaultDate, defaultAgentEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      setErrorMsg("Please select both a date and a time.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/leads/${leadId}/viewing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          viewingDate: date,
          viewingTime: time,
          durationMinutes: duration,
          propertyLocation: location,
          clientEmail,
          agentEmail,
          notes,
          sendClientEmail,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setScheduleResult({
          googleCalendarUrl: data.googleCalendarUrl,
          icsContent: data.icsContent,
          emailSent: data.emailSent,
          emailSimulated: data.emailSimulated,
          clientEmail: data.clientEmail || clientEmail,
        });
        onSuccess(data.lead);
      } else {
        setErrorMsg(data.error?.message || "Failed to schedule viewing.");
      }
    } catch (err) {
      console.error("Error scheduling viewing", err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadIcs = () => {
    if (!scheduleResult?.icsContent) return;
    const blob = new Blob([scheduleResult.icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `viewing-${leadName.replace(/\s+/g, "-")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Pre-generate Gmail direct compose link
  const emailSubject = `Property Viewing Confirmation: ${location} - ${date} at ${time}`;
  const emailBody = `Hi ${leadName},\n\nYour viewing has been confirmed for:\n\n📅 Date: ${date}\n⏰ Time: ${time} (${duration} minutes)\n📍 Location: ${location}\n👤 Agent: ${agentEmail}\n${notes ? `\nAccess & Notes: ${notes}\n` : ""}\nWe look forward to showing you the property!\n\nBest regards,\nQlet Lettings Team`;
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(clientEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  // Pre-generate WhatsApp message if phone available
  const cleanPhone = leadPhone ? leadPhone.replace(/[^0-9]/g, "") : "";
  const whatsappMsg = `Hi ${leadName}, your property viewing for ${location} is confirmed for ${date} at ${time}. We look forward to meeting you!`;
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}` : null;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="w-full max-w-xl rounded-2xl bg-[#141019] border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-[#18131F]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-tertiary-container/30 border border-tertiary/40 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[20px]">calendar_clock</span>
              </div>
              <div>
                <h2 className="text-headline-sm font-semibold text-white">Schedule Viewing</h2>
                <p className="text-body-sm text-outline">
                  Transfer <strong className="text-white font-medium">{leadName}</strong> to Viewing Stage
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4 pb-8">
            {scheduleResult ? (
              /* Success State */
              <div className="py-3 flex flex-col items-center text-center space-y-3.5">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                  <span className="material-symbols-outlined text-[32px]">check_circle</span>
                </div>

                <div>
                  <h3 className="text-headline-sm font-bold text-white">Viewing Scheduled!</h3>
                  <p className="text-body-sm text-outline mt-1 max-w-sm">
                    Lead moved to <strong className="text-primary font-semibold">Viewing</strong>. 
                    Add to Google Calendar to send the invite directly to both Gmail accounts.
                  </p>
                </div>

                <div className="w-full p-3.5 rounded-xl bg-[#0E0A14] border border-white/[0.06] text-left space-y-2 text-body-sm">
                  <div className="flex justify-between">
                    <span className="text-outline">Date &amp; Time:</span>
                    <span className="text-white font-medium">{date} at {time} ({duration} mins)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Location:</span>
                    <span className="text-white font-medium text-right">{location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Client Gmail:</span>
                    <span className="text-white font-medium">{clientEmail || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Agent Gmail:</span>
                    <span className="text-white font-medium">{agentEmail}</span>
                  </div>
                </div>

                {/* Client Schedule Dispatch Confirmation Badge */}
                {scheduleResult.clientEmail && (
                  <div className="w-full p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        Schedule Dispatched to Client
                      </p>
                      <p className="text-[11px] text-emerald-300/90 font-data-mono mt-0.5">
                        Viewing invitation &amp; calendar invite sent to {scheduleResult.clientEmail}
                      </p>
                    </div>
                  </div>
                )}

                {/* Direct Google Calendar & Gmail Sync Actions */}
                <div className="w-full space-y-2 pt-1">
                  <a
                    href={scheduleResult.googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-label-md font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-container/30 hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">event</span>
                    Open &amp; Save in Google Calendar (Invites both Gmails)
                  </a>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={gmailComposeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 rounded-xl bg-[#1E1826] hover:bg-[#251E30] text-on-surface hover:text-white border border-white/[0.08] text-body-sm font-medium flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span className="material-symbols-outlined text-[17px] text-red-400">mail</span>
                      Email to Client
                    </a>

                    {whatsappUrl ? (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 rounded-xl bg-[#1E1826] hover:bg-[#251E30] text-on-surface hover:text-white border border-white/[0.08] text-body-sm font-medium flex items-center justify-center gap-1.5 transition-all"
                      >
                        <span className="material-symbols-outlined text-[17px] text-emerald-400">chat</span>
                        WhatsApp Client
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={handleDownloadIcs}
                        className="h-10 rounded-xl bg-[#1E1826] hover:bg-[#251E30] text-on-surface hover:text-white border border-white/[0.08] text-body-sm font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[17px]">download</span>
                        Download .ics
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="pt-1 text-body-sm text-outline hover:text-white transition-colors cursor-pointer"
                >
                  Done &amp; Return to Pipeline
                </button>
              </div>
            ) : (
              /* Schedule Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-body-sm">
                    {errorMsg}
                  </div>
                )}

                {/* Date and Time Row: Custom Calendar & Analog Clock Picker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative">
                  <ViewingCalendarPicker
                    value={date}
                    onChange={(newDate) => setDate(newDate)}
                    minDate={new Date().toISOString().split("T")[0]}
                  />

                  <ViewingClockPicker
                    value={time}
                    onChange={(newTime) => setTime(newTime)}
                  />
                </div>

                {/* Duration and Property Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="block text-label-sm font-label-sm text-outline uppercase tracking-wider">
                      Duration
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-lg bg-[#0E0A14] border border-white/[0.1] text-white text-body-sm focus:outline-none focus:border-primary-container cursor-pointer"
                    >
                      <option value={15}>15 Mins</option>
                      <option value={30}>30 Mins</option>
                      <option value={45}>45 Mins</option>
                      <option value={60}>60 Mins</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-label-sm font-label-sm text-outline uppercase tracking-wider">
                      Property / Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Tower Road, Sliema Apartment 4B"
                      className="w-full h-10 px-3 rounded-lg bg-[#0E0A14] border border-white/[0.1] text-white text-body-sm focus:outline-none focus:border-primary-container"
                    />
                  </div>
                </div>

                {/* Attendees: Client Email & Agent Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-label-sm font-label-sm text-outline uppercase tracking-wider">
                      Client Email (Gmail)
                    </label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@gmail.com"
                      className="w-full h-10 px-3 rounded-lg bg-[#0E0A14] border border-white/[0.1] text-white text-body-sm focus:outline-none focus:border-primary-container"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-label-sm font-label-sm text-outline uppercase tracking-wider">
                      Agent Email (Gmail)
                    </label>
                    <input
                      type="email"
                      value={agentEmail}
                      onChange={(e) => setAgentEmail(e.target.value)}
                      placeholder="agent@qletlettings.com"
                      className="w-full h-10 px-3 rounded-lg bg-[#0E0A14] border border-white/[0.1] text-white text-body-sm focus:outline-none focus:border-primary-container"
                    />
                  </div>
                </div>

                {/* Viewing Instructions / Notes */}
                <div className="space-y-1.5">
                  <label className="block text-label-sm font-label-sm text-outline uppercase tracking-wider">
                    Viewing Notes &amp; Access Details
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Meet client outside the building lobby. Landlord key code 3921."
                    className="w-full p-3 rounded-lg bg-[#0E0A14] border border-white/[0.1] text-white text-body-sm focus:outline-none focus:border-primary-container resize-none"
                  ></textarea>
                </div>

                {/* Send Schedule to Client Toggle */}
                <div className="p-3.5 rounded-xl bg-[#0E0A14] border border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
                    </div>
                    <div>
                      <span className="text-body-sm font-semibold text-white block">
                        Send schedule to client also
                      </span>
                      <span className="text-[11px] text-outline font-data-mono">
                        {clientEmail ? `Automatically emails calendar invite to ${clientEmail}` : "Enter client email above to dispatch"}
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendClientEmail}
                      disabled={!clientEmail}
                      onChange={(e) => setSendClientEmail(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#1A1523] border border-white/[0.15] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-container peer-checked:to-secondary-container"></div>
                  </label>
                </div>

                {/* Gmail / Google Calendar Auto-Invite Notice */}
                <div className="p-3 rounded-xl bg-primary-container/10 border border-primary-container/30 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 shrink-0">
                    sync
                  </span>
                  <p className="text-[12px] text-on-surface-variant leading-relaxed">
                    Confirming will transfer this lead to <strong className="text-white">Viewing</strong>, email the appointment &amp; calendar invite to the client, and prepare the <strong>Google Calendar / Gmail invite</strong> for both attendees.
                  </p>
                </div>

                {/* Modal Footer Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-[#1E1826] hover:bg-[#251E30] text-outline hover:text-white border border-white/[0.08] text-body-sm font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary-container via-primary-container to-secondary-container text-white font-label-md font-bold shadow-lg shadow-primary-container/30 hover:brightness-105 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isSubmitting ? "hourglass_empty" : "calendar_month"}
                    </span>
                    <span>{isSubmitting ? "Scheduling..." : "Schedule & Add to Google Calendar"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
