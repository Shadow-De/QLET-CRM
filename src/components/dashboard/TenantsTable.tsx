"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { tenantsApi } from "@/lib/api-client";
import domtoimage from "dom-to-image-more";
import jsPDF from "jspdf";

type UITenant = {
  id: string;
  name: string;
  astCode: string;
  propertyCode: string;
  propertyArea: string;
  propertyType: string;
  astStart: string;
  astEnd: string;
  astStatusText: string;
  rent: number;
  rentStatus: "Paid" | "Pending" | "Arrears";
  rentStatusText: string;
  depositAmount: number;
  dpsCode: string;
  initials: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export function TenantsTable() {
  const { data, error, isLoading } = useSWR('/api/tenants', () => tenantsApi.list());
  
  const tenants: UITenant[] = (data?.data?.tenants || []).map((t: any) => {
    // Dynamic rent extraction
    const rentNum = parseFloat((t.monthlyRent || "0").replace(/[^0-9.]/g, ''));
    const depNum = t.depositHeld ? parseFloat((t.depositHeld).replace(/[^0-9.]/g, '')) : rentNum * 1.5;

    return {
      id: t.id,
      name: t.lead?.name || "Unknown",
      astCode: "AST-" + t.id.substring(0,6).toUpperCase(),
      propertyArea: t.property?.city || "Unknown",
      propertyCode: "QL-" + (t.property?.id || "XXXX").substring(0,4).toUpperCase(),
      propertyType: t.property?.type || "Apartment",
      astStart: new Date(t.leaseStart).toLocaleDateString(),
      astEnd: t.leaseEnd ? new Date(t.leaseEnd).toLocaleDateString() : "Ongoing",
      astStatusText: t.status,
      rent: isNaN(rentNum) ? 0 : rentNum,
      rentStatus: "Paid",
      rentStatusText: "Paid · Direct Debit",
      depositAmount: isNaN(depNum) ? 0 : depNum,
      dpsCode: "DPS-" + t.id.substring(t.id.length-6).toUpperCase(),
      initials: (t.lead?.name || "U N").split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase()
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Active");
  const [sortByExpiry, setSortByExpiry] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const filteredTenants = tenants.filter(t => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        t.name.toLowerCase().includes(query) || 
        t.astCode.toLowerCase().includes(query) || 
        t.propertyCode.toLowerCase().includes(query) ||
        t.propertyArea.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter === "Rent Due / Arrears" && t.rentStatus !== "Arrears" && t.rentStatus !== "Pending") {
      return false;
    }
    if (statusFilter === "Expiring Soon") {
       const sixtyDaysFromNow = new Date();
       sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
       const endDate = new Date(t.astEnd);
       if (t.astEnd === "Ongoing" || endDate > sixtyDaysFromNow || endDate < new Date()) {
         return false;
       }
    }
    
    return true;
  }).sort((a, b) => {
    if (sortByExpiry) {
      if (a.astEnd === "Ongoing") return 1;
      if (b.astEnd === "Ongoing") return -1;
      return new Date(a.astEnd).getTime() - new Date(b.astEnd).getTime();
    }
    return 0; // Default order
  });

  const kpis = (data?.data as any)?.kpis || {
     monthlyRentRoll: 0,
     activeTenancies: 0,
     upcomingExpiries: 0,
     collectionRate: 100
  };

  const handleExportPDF = async () => {
    if (!filteredTenants || filteredTenants.length === 0) {
      alert("No data to export");
      return;
    }

    setIsExporting(true);

    // Wait for React to render the clean non-interactive version
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      const tableElement = document.getElementById("tenants-table-container");
      if (!tableElement) return;

      const imgData = await domtoimage.toPng(tableElement, {
        bgcolor: '#141019',
        scale: 2
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const rect = tableElement.getBoundingClientRect();
      const pdfHeight = (rect.height * pdfWidth) / rect.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`tenants_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-unit-6 md:gap-unit-4">
      {/* Header Area & Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-outline-variant/20">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Active Tenancies &amp; Occupancy Ledger</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container/15 border border-tertiary/25 text-tertiary text-label-sm font-label-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <p className="text-body-md font-body-md text-outline">
            Manage live AST leases, rent collection, DPS deposit bonds, and tenancy renewals across portfolios.
          </p>
          
          <div className="pt-2 inline-flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-surface-container-lowest border border-white/5 text-data-mono font-data-mono text-outline">
            <span className="flex items-center gap-1.5 text-on-surface">
              <span className="material-symbols-outlined text-sm text-primary">key</span>
              Active Leases: <strong className="text-white">{kpis.activeTenancies}</strong>
            </span>
            <span className="text-outline-variant">·</span>
            <span className="flex items-center gap-1.5 text-on-surface">
              <span className="material-symbols-outlined text-sm text-[#4edea3]">payments</span>
              Rent Roll: <strong className="text-white">€{kpis.monthlyRentRoll.toLocaleString()}/mo</strong>
            </span>
            <span className="text-outline-variant">·</span>
            <span className="flex items-center gap-1.5 text-on-surface">
              <span className="material-symbols-outlined text-sm text-secondary">verified_user</span>
              Collection Rate: <strong className="text-tertiary">{kpis.collectionRate}%</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-center">
          <button 
            onClick={handleExportPDF} 
            disabled={isExporting}
            className={`h-10 px-unit-4 rounded-lg border font-label-md text-label-md flex items-center gap-2 transition-all ${
              isExporting 
                ? 'bg-primary-container/20 border-primary/30 text-primary opacity-50 cursor-wait' 
                : 'bg-surface-container-low border-white/10 text-on-surface hover:bg-surface-container-high hover:border-white/20'
            }`}
          >
            <span className="material-symbols-outlined text-lg text-outline">
              {isExporting ? 'hourglass_empty' : 'picture_as_pdf'}
            </span>
            <span>{isExporting ? 'Generating...' : 'Export PDF'}</span>
          </button>
          <button className="h-10 px-unit-4 rounded-lg bg-surface-container-low border border-white/10 text-on-surface font-label-md text-label-md hover:bg-surface-container-high hover:border-white/20 flex items-center gap-2 transition-all">
            <span className="material-symbols-outlined text-lg text-outline">filter_list</span>
            <span>Filter By Status</span>
          </button>
          <button className="h-10 px-unit-4 rounded-lg bg-gradient-to-r from-[#E6399B] to-[#7C3AED] text-white font-label-md text-label-md shadow-lg shadow-primary-container/20 hover:brightness-110 flex items-center gap-2 transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined text-lg">calendar_month</span>
            <span>Schedule Inspection</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC ROW (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter-desktop">
        <div className="bg-[#141019] border border-white/[0.07] rounded-xl p-card-padding-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline">Monthly Rent Roll</span>
            <span className="inline-flex items-center gap-1 text-label-sm font-label-sm text-tertiary bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              Active
            </span>
          </div>
          <div className="mt-2 text-headline-lg font-headline-lg text-white">€{kpis.monthlyRentRoll.toLocaleString()}</div>
          <p className="text-body-sm font-body-sm text-outline mt-1">across {kpis.activeTenancies} properties</p>
          <div className="mt-4 flex items-end gap-1.5 h-6">
            <div className="w-full bg-white/5 rounded-t h-2"></div>
            <div className="w-full bg-white/5 rounded-t h-3"></div>
            <div className="w-full bg-white/5 rounded-t h-3.5"></div>
            <div className="w-full bg-white/5 rounded-t h-4"></div>
            <div className="w-full bg-primary/40 rounded-t h-5"></div>
            <div className="w-full bg-primary-container rounded-t h-6 shadow-[0_0_8px_#fa4aab]"></div>
          </div>
        </div>

        <div className="bg-[#141019] border border-white/[0.07] rounded-xl p-card-padding-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline">Active Tenancies</span>
            <span className="inline-flex items-center gap-1 text-label-sm font-label-sm text-secondary bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded-full">
              Live Data
            </span>
          </div>
          <div className="mt-2 text-headline-lg font-headline-lg text-white">{kpis.activeTenancies}</div>
          <p className="text-body-sm font-body-sm text-outline mt-1">{kpis.activeTenancies} occupied units</p>
          <div className="mt-4 w-full bg-white/5 h-2 rounded-full overflow-hidden flex">
            <div className="bg-gradient-to-r from-primary to-primary-container h-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-[#141019] border border-white/[0.07] rounded-xl p-card-padding-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline">Rent Collection Rate</span>
            <span className="inline-flex items-center gap-1 text-label-sm font-label-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
              Healthy
            </span>
          </div>
          <div className="mt-2 text-headline-lg font-headline-lg text-white">{kpis.collectionRate}%</div>
          <p className="text-body-sm font-body-sm text-outline mt-1">€0 in arrears</p>
          <div className="mt-4 flex items-center justify-between text-label-sm font-label-sm text-outline">
            <span className="text-emerald-400">€{kpis.monthlyRentRoll.toLocaleString()} Cleared</span>
            <span className="text-emerald-300">0.0% Remaining</span>
          </div>
        </div>

        <div className="bg-[#141019] border border-white/[0.07] rounded-xl p-card-padding-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline">Upcoming Lease Expiries</span>
            <span className="inline-flex items-center gap-1 text-label-sm font-label-sm text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded-full">
              Within 60d
            </span>
          </div>
          <div className="mt-2 text-headline-lg font-headline-lg text-white">{kpis.upcomingExpiries}</div>
          <p className="text-body-sm font-body-sm text-outline mt-1">{kpis.upcomingExpiries} expiring within 60 days</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-tertiary h-full" style={{ width: kpis.activeTenancies > 0 ? `${(kpis.upcomingExpiries / kpis.activeTenancies) * 100}%` : '0%' }}></div>
            </div>
            <span className="text-data-mono font-data-mono text-xs text-outline">{kpis.upcomingExpiries}/{kpis.activeTenancies}</span>
          </div>
        </div>
      </div>

      {/* CONTROLS BAR (Filters, Search, View Switcher) */}
      <div className="bg-[#141019] border border-white/[0.07] rounded-xl p-unit-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            <input 
              className="w-full h-9 bg-[#0E0A14] border border-white/10 rounded-lg pl-9 pr-3 text-body-sm font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container transition-all" 
              placeholder="Search AST code, tenant, or unit..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button 
              onClick={() => setStatusFilter("All Active")}
              className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm shadow-sm transition-all ${statusFilter === "All Active" ? "bg-primary-container text-on-primary font-semibold" : "bg-surface-container-low hover:bg-surface-container text-outline hover:text-on-surface border border-white/5"}`}
            >
              All Active ({kpis.activeTenancies})
            </button>
            <button 
              onClick={() => setStatusFilter("Rent Due / Arrears")}
              className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm shadow-sm transition-all ${statusFilter === "Rent Due / Arrears" ? "bg-primary-container text-on-primary font-semibold" : "bg-surface-container-low hover:bg-surface-container text-outline hover:text-on-surface border border-white/5"}`}
            >
              Rent Due / Arrears (0)
            </button>
            <button 
              onClick={() => setStatusFilter("Expiring Soon")}
              className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm shadow-sm transition-all ${statusFilter === "Expiring Soon" ? "bg-primary-container text-on-primary font-semibold" : "bg-surface-container-low hover:bg-surface-container text-outline hover:text-on-surface border border-white/5"}`}
            >
              Expiring Soon ({kpis.upcomingExpiries})
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="flex items-center bg-[#0E0A14] p-1 rounded-lg border border-white/10">
            <button className="p-1.5 rounded bg-surface-container text-on-surface hover:text-white" title="Table View">
              <span className="material-symbols-outlined text-sm">table_rows</span>
            </button>
            <button className="p-1.5 rounded text-outline hover:text-on-surface" title="Grid View">
              <span className="material-symbols-outlined text-sm">grid_view</span>
            </button>
          </div>
          <button 
            onClick={() => setSortByExpiry(!sortByExpiry)}
            className={`h-9 px-3 rounded-lg border text-label-sm font-label-sm flex items-center gap-1.5 transition-all ${sortByExpiry ? "bg-surface-container border-primary text-on-surface" : "bg-surface-container-low border-white/10 text-outline hover:text-on-surface"}`}
          >
            <span className="material-symbols-outlined text-sm">sort</span>
            <span>Sort: Expiry Date</span>
          </button>
        </div>
      </div>

      {/* MAIN DATA TABLE / LEDGER */}
      <div id="tenants-table-container" className="bg-[#141019] border border-white/[0.07] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-surface-container-lowest/70 text-label-sm font-label-sm text-outline uppercase tracking-wider">
                <th className="py-4 px-6">Tenant / Primary Occupant</th>
                <th className="py-4 px-6">Property &amp; Unit</th>
                <th className="py-4 px-6">AST Term &amp; Expiry</th>
                <th className="py-4 px-6">Monthly Rent &amp; Status</th>
                <th className="py-4 px-6">DPS / Deposit Protection</th>
                {!isExporting && <th className="py-4 px-6 text-right">Actions</th>}
              </tr>
            </thead>
            <motion.tbody 
              className="divide-y divide-white/[0.04]"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {filteredTenants.map((tenant) => (
                <motion.tr 
                  key={tenant.id}
                  variants={itemVariants}
                  className={`hover:bg-white/[0.02] transition-colors group ${tenant.rentStatus === 'Arrears' ? 'bg-amber-500/[0.01]' : ''}`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full p-0.5 relative shrink-0 ${
                        tenant.rentStatus === 'Arrears' ? 'bg-gradient-to-tr from-amber-500 to-primary' :
                        tenant.initials === 'MZ' ? 'bg-gradient-to-tr from-[#7C3AED] to-primary' :
                        tenant.initials === 'SM' ? 'bg-gradient-to-tr from-primary to-amber-500' :
                        tenant.initials === 'AW' ? 'bg-gradient-to-tr from-secondary to-[#E6399B]' :
                        'bg-gradient-to-tr from-primary to-secondary'
                      }`}>
                        <div className="w-full h-full rounded-full bg-surface-container flex items-center justify-center text-label-md font-label-md text-white font-bold">
                          {tenant.initials}
                        </div>
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-[#141019] ${tenant.rentStatus === 'Arrears' ? 'bg-amber-400' : 'bg-tertiary'}`}></span>
                      </div>
                      <div>
                        <div className="text-body-md font-body-md font-semibold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                          {tenant.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-label-sm font-label-sm text-outline">{tenant.astCode}</span>
                          {!isExporting && (
                            <div className="flex items-center gap-1 text-outline">
                              <button className="hover:text-white transition-colors" title="Call">
                                <span className="material-symbols-outlined text-xs">call</span>
                              </button>
                              <button className="hover:text-white transition-colors" title="Email">
                                <span className="material-symbols-outlined text-xs">mail</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="text-body-md font-body-md text-white font-medium">{tenant.propertyArea}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-data-mono font-data-mono text-xs px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant border border-white/5">{tenant.propertyCode}</span>
                        <span className={`text-label-sm font-label-sm px-2 py-0.5 rounded-full ${
                          tenant.propertyType === 'Penthouse' ? 'bg-secondary/10 border border-secondary/20 text-secondary' :
                          tenant.propertyType === 'Townhouse' ? 'bg-primary/10 border border-primary/20 text-primary' :
                          'bg-surface-container-high border border-white/10 text-on-surface'
                        }`}>
                          {tenant.propertyType}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="text-body-sm font-body-sm text-white flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs text-primary">event</span>
                        <span>{tenant.astStart} → {tenant.astEnd}</span>
                      </div>
                      <div className={`inline-flex items-center gap-1 text-label-sm font-label-sm px-2 py-0.5 rounded-full ${
                        tenant.astStatusText.includes('Break') ? 'bg-secondary/10 text-secondary border border-secondary/20' :
                        tenant.astStatusText.includes('Renewal') ? 'bg-primary/10 text-primary border border-primary/20' :
                        'bg-tertiary/10 text-tertiary border border-tertiary/20'
                      }`}>
                        {tenant.astStatusText}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="text-headline-sm font-headline-sm text-white font-semibold">€{tenant.rent.toLocaleString()}<span className="text-xs text-outline font-normal">/mo</span></div>
                      <div className={`inline-flex items-center gap-1 mt-1 text-label-sm font-label-sm px-2 py-0.5 rounded-full border ${
                        tenant.rentStatus === 'Arrears' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                        tenant.rentStatus === 'Pending' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          tenant.rentStatus === 'Arrears' ? 'bg-amber-400 animate-ping' :
                          tenant.rentStatus === 'Pending' ? 'bg-blue-400' :
                          'bg-emerald-400'
                        }`}></span>
                        {tenant.rentStatusText}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="text-data-mono font-data-mono text-xs text-on-surface">€{tenant.depositAmount.toLocaleString()} Custodial</div>
                      <div className="inline-flex items-center gap-1 text-label-sm font-label-sm text-tertiary">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        <span>DPS Cert: {tenant.dpsCode}</span>
                      </div>
                    </div>
                  </td>
                  {!isExporting && (
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="h-8 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container border border-white/10 text-on-surface font-label-sm text-label-sm transition-all hover:border-primary">
                          Manage AST
                        </button>
                        <button className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-outline hover:text-white transition-all">
                          <span className="material-symbols-outlined text-base">more_vert</span>
                        </button>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
              {filteredTenants.length === 0 && !isLoading && (
                 <tr className="hover:bg-white/[0.02] transition-colors">
                    <td colSpan={6} className="py-8 text-center text-outline">
                       No active tenancies found.
                    </td>
                 </tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
