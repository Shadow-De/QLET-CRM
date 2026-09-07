import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Lead } from "@/lib/api-client";
import { ScheduleViewingModal } from "@/components/modals/ScheduleViewingModal";

type LeadDetailPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  leadId?: string;
  leadName?: string;
  lead?: Lead;
  onStatusChange?: (newStatus: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onAddNote?: (noteText: string) => Promise<void>;
};

export function LeadDetailPanel({ isOpen, onClose, leadId = "#QL-8891", leadName = "Eleanor Lewis", lead, onStatusChange, onDelete, onAddNote }: LeadDetailPanelProps) {
  const [status, setStatus] = React.useState(lead?.status || "New");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [newNote, setNewNote] = React.useState("");
  const [isPostingNote, setIsPostingNote] = React.useState(false);
  const [isViewingModalOpen, setIsViewingModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (lead?.status) {
      setStatus(lead.status);
    }
  }, [lead]);

  // Helper to extract values from notes text
  const extractNoteValue = (key: string) => {
    if (!lead?.notes) return null;
    const match = lead.notes.match(new RegExp(`${key}: (.*)`));
    return match ? match[1].trim() : null;
  };

  const groupType = extractNoteValue("Group Type") || "Unknown";
  const adults = extractNoteValue("Adults") || "Unknown";
  const children = extractNoteValue("Children");
  const pets = extractNoteValue("Pets");
  const visaType = extractNoteValue("Visa/Right to Rent");
  const moveInDate = extractNoteValue("Target Move-in");
  const duration = extractNoteValue("Tenancy Duration");
  const addReqs = extractNoteValue("Additional Requirements");

  // Extract custom agent notes
  const agentNotes: { date: Date; text: string }[] = [];
  if (lead?.notes) {
    const noteBlocks = lead.notes.split('--- Agent Note (');
    for (let i = 1; i < noteBlocks.length; i++) {
      const block = noteBlocks[i];
      const endOfDate = block.indexOf(') ---');
      if (endOfDate !== -1) {
        const dateStr = block.substring(0, endOfDate);
        const text = block.substring(endOfDate + 6).trim();
        agentNotes.push({ date: new Date(dateStr), text });
      }
    }
  }
  agentNotes.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <>
      <AnimatePresence>
      {isOpen && (
        <>
          {/* Dimmed Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0A0710]/75 backdrop-blur-[6px] z-40 transition-opacity duration-300"
            aria-hidden="true"
          />

          {/* Slide-over Panel */}
          <motion.aside
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full sm:w-[520px] max-w-[95vw] bg-surface-container-lowest border-l border-white/[0.08] z-50 flex flex-col shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),-16px_0_48px_-12px_rgba(124,58,237,0.22),0_24px_48px_-12px_rgba(0,0,0,0.9)]"
          >
            {/* Top Subtle Edge Highlight Glow line */}
            <div className="h-1 w-full bg-gradient-to-r from-primary-container to-secondary-container"></div>

            {/* Panel Header Section */}
            <div className="p-unit-6 pb-unit-4 border-b border-outline-variant/30 bg-surface/50 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-surface-container-high text-primary font-data-mono text-label-sm border border-primary/20 tracking-wider">
                    {leadId}
                  </span>
                  <span className="text-label-sm font-label-sm text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">schedule</span> Registered {lead?.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'recently'}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close Lead Detail"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Lead Title & Contact Details */}
              <div className="mt-unit-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-headline-md font-headline-md text-on-surface font-bold tracking-tight">{lead?.name || leadName}</h2>
                  <span className="px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-tertiary/10 text-tertiary border border-tertiary/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span> Priority Prospect
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2.5 text-body-sm font-body-sm text-outline">
                  {lead?.email && (
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[15px] text-primary">mail</span>
                      <span>{lead.email}</span>
                    </a>
                  )}
                  {lead?.email && lead?.phone && <span className="text-outline-variant">•</span>}
                  {lead?.phone && (
                    <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors font-data-mono">
                      <span className="material-symbols-outlined text-[15px] text-primary">chat</span>
                      <span>{lead.phone}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Workflow Bar: Status Dropdown & Save CTA */}
              <div className="flex items-center gap-3 mt-unit-5 pt-4 border-t border-outline-variant/20">
                <div className="flex-1 relative">
                  <label className="block text-label-sm font-label-sm text-outline uppercase tracking-wider mb-1">Pipeline Stage</label>
                  <div className="relative">
                    <select 
                      value={status} 
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setStatus(newStatus);
                        if (newStatus === "Viewing") {
                          setIsViewingModalOpen(true);
                        }
                      }} 
                      className="w-full h-10 pl-3 pr-8 rounded-lg bg-surface-container border border-white/[0.08] text-on-surface text-label-md font-label-md appearance-none focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container cursor-pointer"
                    >
                      <option value="New">New Enquiry</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Viewing">Viewing Arranged</option>
                      <option value="Negotiating">Offer &amp; Negotiation</option>
                      <option value="Won">Won</option>
                      <option value="Lost">Lost</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-outline">
                      <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </span>
                  </div>
                </div>
                <div className="pt-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsViewingModalOpen(true)}
                    className={`h-10 px-3.5 rounded-lg border font-label-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                      status === "Viewing"
                        ? "bg-tertiary-container/30 border-tertiary/50 text-tertiary hover:bg-tertiary-container/50"
                        : "bg-surface-container hover:bg-surface-container-high border-white/[0.08] text-outline hover:text-white"
                    }`}
                    title="Schedule viewing time & sync with Google Calendar"
                  >
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    <span className="hidden sm:inline">Schedule</span>
                  </button>
                  <button 
                    onClick={async () => {
                      if (status === "Viewing") {
                        setIsViewingModalOpen(true);
                        return;
                      }
                      if (!onStatusChange) return;
                      setIsSaving(true);
                      await onStatusChange(status);
                      setIsSaving(false);
                    }}
                    disabled={isSaving}
                    className="h-10 px-unit-6 bg-gradient-to-r from-primary-container to-secondary-container text-white font-label-md text-label-md font-bold rounded-lg shadow-lg shadow-primary-container/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isSaving ? "hourglass_empty" : "check"}
                    </span>
                    <span>{isSaving ? "Saving..." : "Save"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Panel Body with Grouped Sections */}
            <div className="flex-1 overflow-y-auto p-unit-6 space-y-unit-6">
              {/* SECTION 1: Household Intelligence */}
              <section className="bg-surface-container/60 rounded-xl border border-white/[0.08] p-unit-5">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-[18px]">family_restroom</span>
                  <h3 className="text-headline-sm font-headline-sm text-on-surface text-[15px] font-bold">Household Profile</h3>
                </div>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                  <div>
                    <span className="block text-label-sm font-label-sm text-outline">Group Type</span>
                    <span className="text-body-md font-body-md text-on-surface font-medium">{groupType}</span>
                  </div>
                  <div>
                    <span className="block text-label-sm font-label-sm text-outline">Headcount</span>
                    <span className="text-body-md font-body-md text-on-surface font-medium">{adults}</span>
                  </div>
                  {children && (
                    <div>
                      <span className="block text-label-sm font-label-sm text-outline">Children</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-body-md font-body-md text-on-surface font-medium">{children}</span>
                      </div>
                    </div>
                  )}
                  {pets && (
                    <div>
                      <span className="block text-label-sm font-label-sm text-outline">Pets Registered</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-body-md font-body-md text-on-surface font-medium">{pets}</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="block text-label-sm font-label-sm text-outline">Nationality</span>
                    <span className="text-body-md font-body-md text-on-surface font-medium">{lead?.nationality || 'Unspecified'}</span>
                  </div>
                  <div>
                    <span className="block text-label-sm font-label-sm text-outline">Right to Rent / Visa</span>
                    <span className="text-body-md font-body-md text-on-surface font-medium flex items-center gap-1 text-tertiary">
                      <span className="material-symbols-outlined text-[14px]">verified</span> {visaType || 'Unspecified'}
                    </span>
                  </div>
                </div>
              </section>

              {/* SECTION 2: Housing Needs & Financial Constraints */}
              <section className="bg-surface-container/60 rounded-xl border border-white/[0.08] p-unit-5">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-outline-variant/30">
                  <span className="material-symbols-outlined text-secondary text-[18px]">home_work</span>
                  <h3 className="text-headline-sm font-headline-sm text-on-surface text-[15px] font-bold">Housing Requirements</h3>
                </div>
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="block text-label-sm font-label-sm text-outline">Property Type</span>
                      <span className="text-body-md font-body-md text-on-surface font-medium">{lead?.propertyType || 'Unspecified'}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/20">
                    <span className="block text-label-sm font-label-sm text-outline">Target Budget Range</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-headline-sm font-headline-sm text-primary font-bold font-data-mono">
                        {lead?.budget ? `€${lead.budget}` : 'Unspecified'}
                      </span>
                      <span className="text-label-sm font-label-sm text-outline">/ month PCM</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/20">
                    <span className="block text-label-sm font-label-sm text-outline mb-1.5">Preferred Locations</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(lead?.area ? lead.area.split(',') : []).map((loc) => (
                        <span key={loc.trim()} className="px-2.5 py-1 rounded-md bg-surface-container-high border border-white/[0.08] text-label-sm font-label-sm text-on-surface flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] text-primary">pin_drop</span> {loc.trim()}
                        </span>
                      ))}
                      {!lead?.area && <span className="text-body-sm text-outline">Any</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-outline-variant/20">
                    <div>
                      <span className="block text-label-sm font-label-sm text-outline">Move-in Date</span>
                      <span className="text-body-md font-body-md text-tertiary font-medium flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">bolt</span> {moveInDate || 'TBD'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-label-sm font-label-sm text-outline">Duration</span>
                      <span className="text-body-md font-body-md text-on-surface font-medium mt-0.5 block">{duration || 'Unspecified'}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 3: Notes & Interaction History */}
              <section className="bg-surface-container/60 rounded-xl border border-white/[0.08] p-unit-5">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/30">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline text-[18px]">history_edu</span>
                    <h3 className="text-headline-sm font-headline-sm text-on-surface text-[15px] font-bold">Agent Notes &amp; Log</h3>
                  </div>
                  <span className="text-label-sm font-label-sm text-outline font-data-mono">{agentNotes.length + (addReqs ? 2 : 1)} Entries</span>
                </div>
                
                <div className="mb-5">
                  <div className="relative">
                    <textarea 
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="w-full p-3 bg-surface-container-lowest border border-white/[0.08] rounded-lg text-body-sm font-body-sm text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container resize-none" 
                      placeholder="Add an internal observation, viewing reminder, or credit note..." 
                      rows={2}
                    ></textarea>
                    <div className="flex justify-between items-center mt-2 px-1">
                      <div className="flex items-center gap-2 text-outline">
                        <button className="hover:text-primary transition-colors" title="Attach file" type="button">
                          <span className="material-symbols-outlined text-[16px]">attach_file</span>
                        </button>
                        <button className="hover:text-primary transition-colors" title="Tag agent" type="button">
                          <span className="material-symbols-outlined text-[16px]">alternate_email</span>
                        </button>
                      </div>
                      <button 
                        disabled={isPostingNote || !newNote.trim()}
                        onClick={async () => {
                          if (!onAddNote || !newNote.trim()) return;
                          setIsPostingNote(true);
                          await onAddNote(newNote.trim());
                          setNewNote("");
                          setIsPostingNote(false);
                        }}
                        className="px-3 py-1 bg-surface-container-high hover:bg-surface-bright text-on-surface text-label-sm font-label-sm rounded border border-white/[0.08] transition-colors disabled:opacity-50"
                      >
                        {isPostingNote ? "Posting..." : "Post Note"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-outline-variant/30">
                  {agentNotes.map((note, idx) => (
                    <div key={idx} className="relative pl-7">
                      <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-tertiary ring-4 ring-surface-container"></div>
                      <div className="flex items-center justify-between">
                        <span className="text-label-sm font-label-sm text-on-surface font-semibold">Agent Note</span>
                        <span className="text-[11px] font-data-mono text-outline">{note.date.toLocaleString()}</span>
                      </div>
                      <p className="text-body-sm font-body-sm text-on-surface-variant mt-1 leading-relaxed whitespace-pre-wrap">
                        {note.text}
                      </p>
                    </div>
                  ))}
                  {addReqs && (
                    <div className="relative pl-7">
                      <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary-container ring-4 ring-surface-container"></div>
                      <div className="flex items-center justify-between">
                        <span className="text-label-sm font-label-sm text-on-surface font-semibold">Additional Requirements</span>
                      </div>
                      <p className="text-body-sm font-body-sm text-on-surface-variant mt-1 leading-relaxed">
                        {addReqs}
                      </p>
                    </div>
                  )}
                  <div className="relative pl-7">
                    <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-secondary ring-4 ring-surface-container"></div>
                    <div className="flex items-center justify-between">
                      <span className="text-label-sm font-label-sm text-on-surface font-semibold">Automated CRM Webhook</span>
                      <span className="text-[11px] font-data-mono text-outline">Initial Intake</span>
                    </div>
                    <p className="text-body-sm font-body-sm text-outline mt-1 leading-relaxed">
                      Lead generated automatically via private client intake wizard.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Panel Footer: Dangerous Action */}
            <div className="p-unit-5 border-t border-outline-variant/30 bg-surface/80 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3 w-full justify-between">
                <button 
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
                      if (!onDelete) return;
                      setIsDeleting(true);
                      await onDelete();
                      setIsDeleting(false);
                    }
                  }}
                  disabled={isDeleting}
                  className="text-label-sm font-label-sm text-outline hover:text-error transition-colors duration-150 flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-error-container/20 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isDeleting ? "hourglass_empty" : "delete"}
                  </span>
                  <span>{isDeleting ? "Deleting..." : "Delete lead record"}</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-data-mono text-outline">Audit ID: {lead?.id || "#REC-4902"}</span>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>

    <ScheduleViewingModal
      isOpen={isViewingModalOpen}
      onClose={async () => {
        setIsViewingModalOpen(false);
        if (status === "Viewing" && onStatusChange) {
          await onStatusChange("Viewing");
        } else if (lead?.status && lead.status !== "Viewing") {
          setStatus(lead.status);
        }
      }}
      leadId={lead?.id || leadId}
      leadName={lead?.name || leadName}
      leadEmail={lead?.email}
      leadPhone={lead?.phone}
      leadProperty={lead ? (lead.propertyType ? `${lead.bedrooms ? `${lead.bedrooms} Bed ` : ''}${lead.propertyType}${lead.area ? `, ${lead.area}` : ''}` : (lead.area || 'Malta Property')) : 'Malta Property'}
      onSuccess={async () => {
        setStatus("Viewing");
      }}
    />
    </>
  );
}
