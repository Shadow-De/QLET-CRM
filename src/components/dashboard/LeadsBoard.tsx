"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import { leadsApi, Lead } from "@/lib/api-client";
import { LeadDetailPanel } from "./LeadDetailPanel";
import { ScheduleViewingModal } from "@/components/modals/ScheduleViewingModal";
import { BUDGET_OPTIONS, MOVE_IN_OPTIONS } from "./LeadsPageHeader";

type LeadStatus = 'New' | 'Contacted' | 'Viewing' | 'Negotiating' | 'Won' | 'Lost';

type UILead = {
  id: string;
  name: string;
  initials: string;
  timeAgo: string;
  property: string;
  price: string;
  badges: { text: string; icon?: string }[];
  status: LeadStatus;
  raw: Lead;
};

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const formatBudget = (raw?: string | null) => {
  if (!raw) return 'Unspecified Budget';
  const num = parseInt(raw.replace(/[^0-9.]/g, ''), 10);
  if (!isNaN(num)) {
    return `€${num.toLocaleString()}/mo`;
  }
  return raw;
};

const COLUMNS: { id: LeadStatus; label: string; count: number; theme: string; dot: string; bg: string; text: string; ring: string }[] = [
  { id: 'New', label: 'New', count: 0, theme: 'secondary', dot: 'bg-secondary shadow-[0_0_8px_#d2bbff]', bg: 'bg-secondary/15', text: 'text-secondary', ring: 'border-secondary/30 bg-secondary-container/40' },
  { id: 'Contacted', label: 'Contacted', count: 0, theme: 'primary-container', dot: 'bg-primary-container shadow-[0_0_8px_#fa4aab]', bg: 'bg-primary-container/15', text: 'text-primary', ring: 'border-primary/30 bg-primary-container/20' },
  { id: 'Viewing', label: 'Viewing', count: 0, theme: 'tertiary-container', dot: 'bg-tertiary-container shadow-[0_0_8px_#00a572]', bg: 'bg-tertiary-container/15', text: 'text-tertiary', ring: 'border-tertiary/30 bg-tertiary-container/30' },
  { id: 'Negotiating', label: 'Negotiating', count: 0, theme: 'amber', dot: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]', bg: 'bg-amber-400/15', text: 'text-amber-300', ring: 'border-amber-400/30 bg-amber-500/20' },
  { id: 'Won', label: 'Won', count: 0, theme: 'emerald', dot: 'bg-emerald-400 shadow-[0_0_8px_#10b981]', bg: 'bg-emerald-500/15', text: 'text-emerald-400', ring: 'border-emerald-400/30 bg-emerald-500/20' },
  { id: 'Lost', label: 'Lost', count: 0, theme: 'rose', dot: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]', bg: 'bg-rose-500/15', text: 'text-rose-400', ring: 'border-rose-400/30 bg-rose-500/20' },
];

export interface LeadsBoardProps {
  search?: string;
  region?: string;
  budget?: string;
  moveIn?: string;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function LeadsBoard({
  search = "",
  region = "All",
  budget = "All",
  moveIn = "All",
  onClearFilters,
  hasActiveFilters = false,
}: LeadsBoardProps) {
  const { data, error, isLoading, mutate } = useSWR('/api/leads', () => leadsApi.list({}), { refreshInterval: 5000 });
  const [selectedLead, setSelectedLead] = useState<UILead | null>(null);
  const [viewingModalLead, setViewingModalLead] = useState<UILead | null>(null);
  const [dragOverCol, setDragOverCol] = useState<LeadStatus | null>(null);

  const leads: UILead[] = useMemo(() => {
    return (data?.data?.leads || []).map(lead => {
      return {
        id: lead.id,
        name: lead.name,
        initials: getInitials(lead.name),
        timeAgo: new Date(lead.createdAt).toLocaleDateString(),
        property: lead.propertyType ? `${lead.bedrooms ? `${lead.bedrooms} Bed ` : ''}${lead.propertyType}${lead.area ? `, ${lead.area}` : ''}` : 'Unspecified Property',
        price: formatBudget(lead.budget),
        badges: [{ text: lead.status }],
        status: lead.status as LeadStatus,
        raw: lead
      };
    });
  }, [data]);

  // Apply all filter controls: search, region, budget, moveIn
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // 1. Search filter: applicant name, phone, email, id, property, area
      if (search && search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = lead.name.toLowerCase().includes(q);
        const matchesPhone = lead.raw.phone ? lead.raw.phone.toLowerCase().includes(q) : false;
        const matchesEmail = lead.raw.email ? lead.raw.email.toLowerCase().includes(q) : false;
        const matchesId = lead.id.toLowerCase().includes(q);
        const matchesProperty = lead.property.toLowerCase().includes(q);
        const matchesArea = lead.raw.area ? lead.raw.area.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesPhone && !matchesEmail && !matchesId && !matchesProperty && !matchesArea) {
          return false;
        }
      }

      // 2. Region / City filter
      if (region && region !== "All") {
        const leadArea = (lead.raw.area || "").toLowerCase();
        if (!leadArea.includes(region.toLowerCase())) {
          return false;
        }
      }

      // 3. Budget Range filter
      if (budget && budget !== "All") {
        const option = BUDGET_OPTIONS.find(o => o.id === budget);
        if (option) {
          const rawBudgetStr = lead.raw.budget || "";
          const rawVal = parseInt(rawBudgetStr.replace(/[^0-9.]/g, ""), 10);
          if (isNaN(rawVal)) {
            return false;
          }
          if (option.min !== undefined && rawVal < option.min) return false;
          if (option.max !== undefined && rawVal > option.max) return false;
        }
      }

      // 4. Move-in timeline filter
      if (moveIn && moveIn !== "All") {
        const match = lead.raw.notes?.match(/Target Move-in: ([^\n\r]+)/);
        const moveInStr = match ? match[1].trim() : null;
        if (!moveInStr) {
          return false;
        }
        const targetDate = new Date(moveInStr);
        if (isNaN(targetDate.getTime())) return false;

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);

        const diffTime = targetDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (moveIn === "14-days") {
          if (diffDays < 0 || diffDays > 14) return false;
        } else if (moveIn === "30-days") {
          if (diffDays < 0 || diffDays > 30) return false;
        } else if (moveIn === "60-days") {
          if (diffDays < 0 || diffDays > 60) return false;
        } else if (moveIn === "60-plus") {
          if (diffDays <= 60) return false;
        } else if (moveIn === "asap") {
          if (diffDays > 7) return false;
        }
      }

      return true;
    });
  }, [leads, search, region, budget, moveIn]);

  return (
    <div className="flex-1 flex flex-col mt-4">
      {/* Active Filter Info Banner when empty */}
      {hasActiveFilters && filteredLeads.length === 0 && (
        <div className="w-full mb-6 p-8 rounded-2xl bg-[#141019] border border-white/[0.08] text-center flex flex-col items-center justify-center gap-3 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-[28px]">filter_alt_off</span>
          </div>
          <h3 className="text-headline-sm font-semibold text-white">No applicants match your filter criteria</h3>
          <p className="text-body-sm text-outline max-w-md">
            No active pipeline leads match the selected search, region, budget, or move-in timeframe.
          </p>
          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-primary-container/20 hover:bg-primary-container/30 text-primary border border-primary/40 text-label-md font-semibold transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}

      {/* Kanban Board Columns */}
      <div className="overflow-x-auto kanban-scroll pb-6">
        <div className="grid grid-flow-col auto-cols-[300px] xl:auto-cols-[1fr] gap-4 min-w-[1850px] xl:min-w-[1500px]">
          {COLUMNS.map((col) => {
            const columnLeads = filteredLeads.filter(l => l.status === col.id);
            
            return (
              <section 
                key={col.id} 
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragOverCol !== col.id) setDragOverCol(col.id);
                }}
                onDragLeave={() => {
                  if (dragOverCol === col.id) setDragOverCol(null);
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  setDragOverCol(null);
                  const draggedId = e.dataTransfer.getData("text/plain");
                  if (!draggedId) return;
                  const targetLead = leads.find(l => l.id === draggedId);
                  if (!targetLead) return;

                  if (col.id === 'Viewing') {
                    // Intercept: Ask for viewing date & time before transferring to viewing
                    setViewingModalLead(targetLead);
                  } else if (targetLead.status !== col.id) {
                    await leadsApi.update(draggedId, { status: col.id });
                    mutate();
                  }
                }}
                className={`flex flex-col rounded-2xl bg-surface-container-lowest/60 border transition-all duration-200 p-3 gap-3 ${
                  dragOverCol === col.id
                    ? "border-primary-container ring-2 ring-primary-container/40 bg-[#191224]"
                    : "border-white/[0.05]"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-2 py-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`}></div>
                    <h2 className="text-headline-sm font-headline-sm font-semibold text-white">{col.label}</h2>
                    <span className={`text-label-sm font-label-sm ml-1 px-2 py-0.5 rounded-full ${
                      columnLeads.length > 0 ? "bg-surface-container text-white font-medium" : "text-outline"
                    }`}>
                      {columnLeads.length}
                    </span>
                  </div>
                  <button aria-label={`Quick Add to ${col.label}`} className="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-white flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>

                {/* Cards Container */}
                <div className="flex flex-col gap-3 min-h-[150px]">
                  <AnimatePresence>
                    {columnLeads.map((lead) => (
                      <motion.article
                        key={lead.id}
                        layout
                        draggable
                        onDragStart={(e: any) => {
                          e.dataTransfer?.setData("text/plain", lead.id);
                        }}
                        onClick={() => setSelectedLead(lead)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: col.id === 'Lost' ? 0.85 : 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="p-4 rounded-[20px] bg-[#141019] border border-white/[0.07] specular-border hover:border-white/[0.14] hover:bg-[#1E1826] transition-colors duration-200 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] cursor-grab active:cursor-grabbing group"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-label-md font-bold text-[12px] ${col.ring} ${col.text}`}>
                              {lead.initials}
                            </div>
                            <div>
                              <h3 className={`text-label-md font-label-md font-semibold text-white transition-colors group-hover:${col.text.split(' ')[0]}`}>
                                {lead.name}
                              </h3>
                              <span className="text-body-sm font-body-sm text-outline">Ref: {lead.id.substring(0, 8)}</span>
                            </div>
                          </div>
                          <span className="text-label-sm font-label-sm text-outline flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">schedule</span> {lead.timeAgo}
                          </span>
                        </div>
                        
                        <div className="text-body-md font-body-md text-on-surface mb-3 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-outline text-[16px]">apartment</span>
                          {lead.property}
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.04]">
                          <span className="text-label-md font-label-md font-bold text-white tracking-tight">{lead.price}</span>
                          <div className="flex items-center gap-1.5">
                            {col.id === 'Viewing' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingModalLead(lead);
                                }}
                                className="px-2 py-0.5 rounded-full text-label-sm font-label-sm border border-tertiary/40 bg-tertiary-container/20 text-tertiary hover:bg-tertiary-container/40 flex items-center gap-1 transition-colors cursor-pointer"
                                title="Schedule Viewing & Sync to Gmail"
                              >
                                <span className="material-symbols-outlined text-[13px]">calendar_clock</span>
                                <span>Schedule</span>
                              </button>
                            )}
                            {lead.badges.map((badge, idx) => {
                              if (badge.icon) {
                                return (
                                  <span key={idx} className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container text-on-surface-variant flex items-center gap-1 border border-white/[0.05]">
                                    <span className="material-symbols-outlined text-[12px]">{badge.icon}</span> {badge.text}
                                  </span>
                                );
                              }
                              return (
                                <span key={idx} className={`px-2 py-0.5 rounded-full text-label-sm font-label-sm border ${col.bg} ${col.text} ${col.ring.split(' ')[0]}`}>
                                  {badge.text}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <LeadDetailPanel 
        isOpen={!!selectedLead} 
        onClose={() => setSelectedLead(null)} 
        leadId={selectedLead?.id} 
        leadName={selectedLead?.name} 
        lead={selectedLead?.raw}
        onStatusChange={async (newStatus) => {
          if (selectedLead) {
            await leadsApi.update(selectedLead.id, { status: newStatus });
            mutate();
            setSelectedLead(null);
          }
        }}
        onDelete={async () => {
          if (selectedLead) {
            await leadsApi.delete(selectedLead.id);
            mutate();
            setSelectedLead(null);
          }
        }}
        onAddNote={async (noteText) => {
          if (selectedLead) {
            const currentNotes = selectedLead.raw.notes || "";
            const newEntry = `\n\n--- Agent Note (${new Date().toLocaleString()}) ---\n${noteText}`;
            await leadsApi.update(selectedLead.id, { notes: currentNotes + newEntry });
            mutate();
          }
        }}
      />

      {viewingModalLead && (
        <ScheduleViewingModal
          isOpen={!!viewingModalLead}
          onClose={() => {
            setViewingModalLead(null);
            mutate();
          }}
          leadId={viewingModalLead.id}
          leadName={viewingModalLead.name}
          leadEmail={viewingModalLead.raw.email}
          leadPhone={viewingModalLead.raw.phone}
          leadProperty={viewingModalLead.property}
          onSuccess={() => {
            mutate();
          }}
        />
      )}
    </div>
  );
}
