"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GenerateClientLinkModal from "@/components/modals/GenerateClientLinkModal";

export const REGION_OPTIONS = [
  { id: "All", label: "Malta (All)", display: "Malta (All)" },
  { id: "Sliema", label: "Sliema" },
  { id: "St. Julian's", label: "St. Julian's" },
  { id: "Gzira", label: "Gzira" },
  { id: "Msida", label: "Msida" },
  { id: "Swieqi", label: "Swieqi" },
  { id: "Valletta", label: "Valletta" },
  { id: "San Gwann", label: "San Gwann" },
  { id: "Mosta", label: "Mosta" },
  { id: "Birkirkara", label: "Birkirkara" },
  { id: "Naxxar", label: "Naxxar" },
  { id: "St. Paul's Bay", label: "St. Paul's Bay" },
  { id: "Mellieha", label: "Mellieha" },
  { id: "Bugibba", label: "Bugibba" },
];

export const BUDGET_OPTIONS = [
  { id: "All", label: "All Budgets", display: "All" },
  { id: "under-1000", label: "Under €1,000/mo", display: "< €1,000", min: 0, max: 1000 },
  { id: "1000-2000", label: "€1,000 - €2,000/mo", display: "€1k - €2k", min: 1000, max: 2000 },
  { id: "2000-3500", label: "€2,000 - €3,500/mo", display: "€2k - €3.5k", min: 2000, max: 3500 },
  { id: "3500-5000", label: "€3,500 - €5,000/mo", display: "€3.5k - €5k", min: 3500, max: 5000 },
  { id: "5000-plus", label: "€5,000+/mo", display: "€5,000+", min: 5000, max: Infinity },
];

export const MOVE_IN_OPTIONS = [
  { id: "All", label: "Any Move-in", display: "All" },
  { id: "14-days", label: "Next 14 Days", display: "Next 14 Days", maxDays: 14 },
  { id: "30-days", label: "Next 30 Days", display: "Next 30 Days", maxDays: 30 },
  { id: "60-days", label: "Next 60 Days", display: "Next 60 Days", maxDays: 60 },
  { id: "60-plus", label: "60+ Days Out", display: "60+ Days", minDays: 60 },
  { id: "asap", label: "Immediate / ASAP", display: "ASAP" },
];

interface FilterDropdownProps {
  label: string;
  value: string;
  options: { id: string; label: string; display?: string }[];
  onChange: (val: string) => void;
  icon: string;
  iconColor?: string;
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
  icon,
  iconColor = "text-primary"
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.id === value) || options[0];
  const isActive = value !== "All";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border text-label-md font-label-md transition-all cursor-pointer ${
          isActive
            ? "bg-[#251E30] border-primary/50 text-white shadow-[0_0_12px_rgba(250,74,171,0.25)]"
            : "bg-[#1E1826] border-white/[0.08] text-on-surface hover:border-white/20 hover:bg-[#251E30]"
        }`}
      >
        <span className={`material-symbols-outlined text-[16px] ${iconColor}`}>{icon}</span>
        <span>
          {label}: <strong className="text-white font-medium">{selectedOption.display || selectedOption.label}</strong>
        </span>
        <span className={`material-symbols-outlined text-[16px] text-outline transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full mt-2 left-0 min-w-[200px] rounded-xl bg-[#1A1523] border border-outline-variant/40 shadow-2xl z-50 overflow-hidden py-1 max-h-[280px] overflow-y-auto"
          >
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-body-sm font-body-sm transition-colors flex items-center justify-between cursor-pointer ${
                  value === opt.id
                    ? "bg-primary-container/20 text-primary font-semibold"
                    : "text-on-surface hover:bg-surface-container"
                }`}
              >
                <span>{opt.label}</span>
                {value === opt.id && (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export interface LeadsPageHeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
  region: string;
  onRegionChange: (val: string) => void;
  budget: string;
  onBudgetChange: (val: string) => void;
  moveIn: string;
  onMoveInChange: (val: string) => void;
  onClearFilters: () => void;
  hasActiveFilters?: boolean;
}

export function LeadsPageHeader({
  search,
  onSearchChange,
  region,
  onRegionChange,
  budget,
  onBudgetChange,
  moveIn,
  onMoveInChange,
  onClearFilters,
  hasActiveFilters = false,
}: LeadsPageHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeCount = [
    search.trim() !== "",
    region !== "All",
    budget !== "All",
    moveIn !== "All",
  ].filter(Boolean).length;

  return (
    <>
      {/* Board Header Title & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-headline-lg font-headline-lg text-on-surface font-bold tracking-tight">Leads Board</h1>
            <span className="px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container-high text-primary border border-outline-variant/40">
              Live
            </span>
          </div>
          <p className="text-body-sm font-body-sm text-outline mt-1">
            Live portfolio applicant status and prospect progression across Malta.
          </p>
        </div>

        {/* Right-aligned + New lead gradient button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-unit-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-container via-primary-container to-secondary-container text-white font-label-md text-label-md shadow-lg shadow-primary-container/30 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          + New lead
        </button>
      </div>

      {/* Subheader Filter & Query Cluster */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#141019] border border-white/[0.07] specular-border shadow-xl">
        {/* Real-time search box */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter applicant by name, phone or ID..."
            className="w-full h-9 pl-9 pr-8 rounded-lg bg-[#0E0A14] border border-white/[0.08] text-white text-body-sm placeholder:text-outline/60 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-white transition-colors cursor-pointer"
              title="Clear search"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Region / City Filter */}
          <FilterDropdown
            label="Region"
            value={region}
            options={REGION_OPTIONS}
            onChange={onRegionChange}
            icon="location_on"
            iconColor="text-primary"
          />

          {/* Budget Filter */}
          <FilterDropdown
            label="Budget"
            value={budget}
            options={BUDGET_OPTIONS}
            onChange={onBudgetChange}
            icon="payments"
            iconColor="text-tertiary"
          />

          {/* Move-in Date Filter */}
          <FilterDropdown
            label="Move-in"
            value={moveIn}
            options={MOVE_IN_OPTIONS}
            onChange={onMoveInChange}
            icon="calendar_month"
            iconColor="text-secondary"
          />

          {/* Clear Filters Button */}
          <button 
            type="button"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className={`h-9 px-2.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all ml-1 ${
              hasActiveFilters 
                ? "bg-primary-container/20 border-primary/40 text-primary hover:bg-primary-container/30 cursor-pointer shadow-sm" 
                : "bg-[#1E1826] border-white/[0.08] text-outline/40 cursor-not-allowed"
            }`} 
            title={hasActiveFilters ? `Clear ${activeCount} active filter${activeCount > 1 ? 's' : ''}` : "No active filters"}
          >
            <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
            {hasActiveFilters && (
              <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <GenerateClientLinkModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
