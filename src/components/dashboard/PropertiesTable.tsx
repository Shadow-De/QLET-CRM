"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import { propertiesApi } from "@/lib/api-client";
import Link from "next/link";
import domtoimage from "dom-to-image-more";
import jsPDF from "jspdf";

type UIProperty = {
  id: string;
  reference: string;
  city: string;
  type: string;
  rent: number;
  landlordName: string;
  landlordName: string;
  ownerPhone: string;
  availabilityStatus: "Pending" | "Available Now" | "Available Soon" | "Rented";
  availabilityDate?: string;
  notes: string;
  original: any;
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

export function PropertiesTable() {
  const { data, error, isLoading, mutate } = useSWR('/api/properties', () => propertiesApi.list(), {
    revalidateOnFocus: true,
    revalidateOnMount: true,
    revalidateOnReconnect: true,
  });
  
  // Log errors to help debugging
  React.useEffect(() => { if (error) console.error('[PropertiesTable] SWR error:', error); }, [error]);
  React.useEffect(() => { if (data) console.log('[PropertiesTable] SWR data:', data); }, [data]);

  const properties: UIProperty[] = (data?.data?.properties || []).map((p: any) => ({
    id: p.id,
    reference: p.address || "QL-" + p.id.substring(0,4).toUpperCase(),
    city: p.city || "Malta",
    type: `${p.bedrooms || 1} Bed ${p.type ? p.type.charAt(0).toUpperCase() + p.type.slice(1) : 'Apartment'}`,
    rent: parseFloat(p.monthlyRent) || 0,
    landlordName: p.landlordName || "Unknown Landlord",
    landlordName: p.landlordName || "Unknown Landlord",
    ownerPhone: p.ownerPhone || "No Phone",
    availabilityStatus: p.availabilityStatus || 'Pending',
    availabilityDate: p.availableFrom ? new Date(p.availableFrom).toLocaleDateString() : undefined,
    notes: p.description || '',
    original: p
  }));


  const [activeFilter, setActiveFilter] = useState("All");
  const [availabilityFilters, setAvailabilityFilters] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Dynamically calculate city filters based on all properties
  const cityFilters = useMemo(() => {
    const cities = new Map<string, number>();
    properties.forEach((p) => {
      const city = p.city;
      cities.set(city, (cities.get(city) || 0) + 1);
    });

    const filters = [{ name: "All", count: properties.length }];
    cities.forEach((count, name) => {
      filters.push({ name, count });
    });
    
    return filters.sort((a, b) => a.name === "All" ? -1 : b.name === "All" ? 1 : b.count - a.count);
  }, [properties]);

  // Availability filter counts
  const availabilityStats = useMemo(() => {
    const availableNow = properties.filter(p => p.availabilityStatus === 'Available Now').length;
    const availableSoon = properties.filter(p => p.availabilityStatus === 'Available Soon').length;
    const rented = properties.filter(p => p.availabilityStatus === 'Rented').length;

    return { availableNow, availableSoon, rented };
  }, [properties]);

  const filteredProperties = useMemo(() => {
    let result = properties;

    // City filter
    if (activeFilter !== "All") {
      result = result.filter(p => p.city === activeFilter);
    }

    // Availability filter (array-based, if empty means "All")
    if (availabilityFilters.length > 0) {
      result = result.filter(p => availabilityFilters.includes(p.availabilityStatus));
    }

    return result;
  }, [properties, activeFilter, availabilityFilters]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to archive this property?")) return;
    setIsDeleting(id);
    try {
      await propertiesApi.delete(id);
      mutate();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Failed to delete property");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/property/${id}`;
    navigator.clipboard.writeText(url);
    alert("Public listing link copied to clipboard!");
  };

  const handleExportPDF = async () => {
    if (!filteredProperties || filteredProperties.length === 0) {
      alert("No data to export");
      return;
    }
    
    setIsExporting(true);

    // Wait for React to render the clean non-interactive version
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      const tableElement = document.getElementById("properties-table-container");
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

      pdf.save(`properties_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleAvailabilityFilter = (key: string) => {
    if (key === "All") {
      setAvailabilityFilters([]);
      return;
    }
    setAvailabilityFilters(prev => 
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    );
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsTogglingAvailability(id);
    try {
      await propertiesApi.update(id, { availabilityStatus: newStatus } as any);
      mutate();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Failed to update availability");
    } finally {
      setIsTogglingAvailability(null);
    }
  };

  return (
    <div className="flex flex-col gap-unit-6 md:gap-unit-4">
      {/* Header Row: Title & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Properties</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high border border-outline-variant/40 text-primary text-label-sm font-label-sm font-semibold">Live Portfolio</span>
          </div>
          <p className="text-body-sm font-body-sm text-outline mt-1">Operational status, tenant allocations, and yield metrics for active instructions.</p>
        </div>
        <Link 
          href="/dashboard/properties/new"
          className="inline-flex items-center justify-center gap-2 px-unit-6 py-unit-3 rounded-lg bg-gradient-to-r from-[#E6399B] to-[#7C3AED] text-white font-label-md text-label-md font-semibold shadow-[0_4px_20px_rgba(230,57,155,0.35)] hover:shadow-[0_6px_24px_rgba(124,58,237,0.45)] hover:brightness-110 active:scale-[0.98] transition-all duration-200" 
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>+ New property</span>
        </Link>
      </div>

      {/* Row 1: City Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by city">
          {cityFilters.map((filter) => {
            const isActive = activeFilter === filter.name;
            return (
              <button 
                key={filter.name}
                onClick={() => setActiveFilter(filter.name)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-label-sm font-label-sm transition-all ${
                  isActive 
                  ? 'bg-primary-container text-on-primary font-semibold shadow-md shadow-primary-container/20 ring-1 ring-white/20' 
                  : 'bg-surface-container border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
                type="button"
              >
                <span>{filter.name} ({filter.count})</span>
              </button>
            )
          })}
        </div>
        
        {/* Utility Filter Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-outline hover:text-on-surface text-label-sm font-label-sm transition-colors" type="button">
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            <span>Filter Columns</span>
          </button>
          <button 
            onClick={handleExportPDF} 
            disabled={isExporting}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-label-sm font-label-sm transition-colors ${
              isExporting 
                ? 'bg-primary-container/20 border-primary/30 text-primary opacity-50 cursor-wait' 
                : 'bg-surface-container border-outline-variant/30 text-outline hover:text-on-surface'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isExporting ? 'hourglass_empty' : 'picture_as_pdf'}
            </span>
            <span>{isExporting ? 'Generating...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Row 2: Availability Status Filters */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by availability">
        {[
          { key: "All", label: "All Properties", icon: "home_work", color: "", dot: "" },
          { key: "Available Now", label: `Available Now`, icon: "check_circle", color: "text-emerald-400", dot: "bg-emerald-400", count: availabilityStats.availableNow },
          { key: "Available Soon", label: `Available Soon`, icon: "event_available", color: "text-amber-400", dot: "bg-amber-400", count: availabilityStats.availableSoon },
          { key: "Rented", label: `Rented`, icon: "key", color: "text-[#A78BFA]", dot: "bg-[#A78BFA]", count: availabilityStats.rented },
        ].map((f) => {
          const isActive = f.key === "All" ? availabilityFilters.length === 0 : availabilityFilters.includes(f.key);
          return (
            <button
              key={f.key}
              onClick={() => toggleAvailabilityFilter(f.key)}
              type="button"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-label-sm font-label-sm transition-all duration-150 ${
                isActive
                  ? 'bg-surface-container-high border border-outline-variant/60 text-white font-semibold ring-1 ring-white/10'
                  : 'bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {f.dot && <span className={`w-2 h-2 rounded-full ${f.dot} ${isActive ? 'animate-pulse' : 'opacity-60'}`} />}
              <span className={isActive && f.color ? f.color : ''}>{f.label}</span>
              {f.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isActive ? 'bg-white/10 text-white' : 'bg-surface-container-high text-outline'
                }`}>{f.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* DATA CARD CONTAINER */}
      <div id="properties-table-container" className="rounded-[20px] bg-[#141019] border border-white/[0.07] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-surface-container-lowest/50">
                {!isExporting && (
                  <th className="py-unit-4 pl-unit-6 pr-3 w-10 text-center" scope="col">
                    <input className="w-[18px] h-[18px] rounded bg-[#0E0A14] border-white/20 text-primary-container focus:ring-primary-container focus:ring-offset-0 focus:outline-none" type="checkbox"/>
                  </th>
                )}
                <th className="py-unit-4 px-unit-3 text-label-sm font-label-sm text-[#A19BAA] tracking-[0.05em] uppercase whitespace-nowrap" scope="col">Reference</th>
                <th className="py-unit-4 px-unit-3 text-label-sm font-label-sm text-[#A19BAA] tracking-[0.05em] uppercase whitespace-nowrap" scope="col">City / Area</th>
                <th className="py-unit-4 px-unit-3 text-label-sm font-label-sm text-[#A19BAA] tracking-[0.05em] uppercase whitespace-nowrap" scope="col">Property Type</th>
                <th className="py-unit-4 px-unit-3 text-label-sm font-label-sm text-[#A19BAA] tracking-[0.05em] uppercase text-right whitespace-nowrap" scope="col">Monthly Rent</th>
                <th className="py-unit-4 px-unit-3 text-label-sm font-label-sm text-[#A19BAA] tracking-[0.05em] uppercase whitespace-nowrap" scope="col">Landlord / Owner</th>
                <th className="py-unit-4 px-unit-3 text-label-sm font-label-sm text-[#A19BAA] tracking-[0.05em] uppercase whitespace-nowrap" scope="col">Owner Phone</th>
                <th className="py-unit-4 px-unit-3 text-label-sm font-label-sm text-[#A19BAA] tracking-[0.05em] uppercase whitespace-nowrap" scope="col">Availability</th>
                {!isExporting && <th className="py-unit-4 px-unit-3 text-label-sm font-label-sm text-[#A19BAA] tracking-[0.05em] uppercase whitespace-nowrap" scope="col">Notes Preview</th>}
                {!isExporting && <th className="py-unit-4 pl-unit-3 pr-unit-6 text-label-sm font-label-sm text-[#A19BAA] tracking-[0.05em] uppercase text-right whitespace-nowrap" scope="col">Actions</th>}
              </tr>
            </thead>
            
            <motion.tbody 
              className="divide-y divide-white/[0.04] text-body-md font-body-md relative"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {filteredProperties.length === 0 && !isLoading ? (
                <tr className="h-64">
                  <td colSpan={8} className="text-center text-outline">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-outline-variant">real_estate_agent</span>
                      <p className="text-body-lg text-on-surface-variant">No properties found.</p>
                      <Link 
                        href="/dashboard/properties/new"
                        className="mt-2 text-primary hover:underline font-medium text-body-sm"
                      >
                        Add your first property
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProperties.map((prop) => (
                  <motion.tr key={prop.id} variants={itemVariants} className={`hover:bg-white/[0.02] transition-colors group ${isDeleting === prop.id ? 'opacity-50' : ''}`}>
                    {!isExporting && (
                      <td className="py-unit-4 pl-unit-6 pr-3 text-center">
                        <input className="w-[18px] h-[18px] rounded bg-[#0E0A14] border-white/20 text-primary-container focus:ring-primary-container focus:ring-offset-0" type="checkbox"/>
                      </td>
                    )}
                    <td className="py-unit-4 px-unit-3">
                      <div className="flex items-center gap-2">
                        <span className="font-data-mono text-data-mono font-semibold text-white group-hover:text-primary transition-colors">{prop.reference}</span>
                        {prop.availabilityStatus === 'Available Now' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                        {prop.availabilityStatus === 'Available Soon' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                        {prop.availabilityStatus === 'Pending' && <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>}
                        {prop.availabilityStatus === 'Rented' && <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]"></span>}
                      </div>
                    </td>
                    <td className="py-unit-4 px-unit-3 whitespace-nowrap">
                      <div className="text-white font-medium">{prop.city}</div>
                    </td>
                    <td className="py-unit-4 px-unit-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant/30 text-body-sm font-body-sm text-on-surface">{prop.type}</span>
                    </td>
                    <td className="py-unit-4 px-unit-3 text-right whitespace-nowrap font-data-mono text-data-mono font-bold text-white">
                      €{prop.rent.toLocaleString()}<span className="text-outline font-normal text-body-sm">/mo</span>
                    </td>
                    <td className="py-unit-4 px-unit-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-secondary-container/40 border border-secondary-container flex items-center justify-center text-secondary font-semibold text-xs">
                          {prop.landlordName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">{prop.landlordName}</div>
                          <div className="text-body-sm font-body-sm text-outline">Private Portfolio</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-unit-4 px-unit-3 whitespace-nowrap font-data-mono text-data-mono text-outline">
                      {prop.ownerPhone && prop.ownerPhone !== "No Phone" ? (
                        <a 
                          href={`https://wa.me/${prop.ownerPhone.replace(/[^\d+]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-[#25D366] transition-colors inline-flex items-center gap-1.5 hover:underline"
                          title="Message on WhatsApp"
                        >
                          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current" aria-hidden="true">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          {prop.ownerPhone}
                        </a>
                      ) : (
                        prop.ownerPhone
                      )}
                    </td>
                    <td className="py-unit-4 px-unit-3 whitespace-nowrap">
                      {isExporting ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            prop.availabilityStatus === 'Available Now' ? 'bg-emerald-400' :
                            prop.availabilityStatus === 'Available Soon' ? 'bg-amber-400' :
                            prop.availabilityStatus === 'Rented' ? 'bg-[#A78BFA]' : 'bg-outline-variant'
                          }`}></span>
                          <span className="text-white font-medium">{prop.availabilityStatus}</span>
                        </div>
                      ) : (
                        <div className={`relative inline-flex items-center ${isTogglingAvailability === prop.id ? 'opacity-50 cursor-wait' : ''}`}>
                          <div className={`absolute left-2 w-1.5 h-1.5 rounded-full pointer-events-none ${
                            prop.availabilityStatus === 'Available Now' ? 'bg-emerald-400' :
                            prop.availabilityStatus === 'Available Soon' ? 'bg-amber-400' :
                            prop.availabilityStatus === 'Rented' ? 'bg-[#A78BFA]' : 'bg-outline-variant'
                          }`} />
                          <select
                            value={prop.availabilityStatus}
                            onChange={(e) => handleStatusChange(prop.id, e.target.value)}
                            disabled={isTogglingAvailability === prop.id}
                            className={`appearance-none pl-6 pr-8 py-1 rounded-full text-label-sm font-label-sm font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-primary-container cursor-pointer ${
                              prop.availabilityStatus === 'Available Now' ? 'bg-[rgba(16,185,129,0.12)] text-[#10B981]' :
                              prop.availabilityStatus === 'Available Soon' ? 'bg-[rgba(245,158,11,0.12)] text-[#F59E0B]' :
                              prop.availabilityStatus === 'Rented' ? 'bg-[rgba(167,139,250,0.12)] text-[#A78BFA]' :
                              'bg-surface-container-high text-on-surface-variant'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Available Now">Available Now</option>
                            <option value="Available Soon">Available Soon</option>
                            <option value="Rented">Rented</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-2 text-[14px] pointer-events-none opacity-50">expand_more</span>
                        </div>
                      )}
                    </td>
                    {!isExporting && (
                      <>
                        <td className="py-unit-4 px-unit-3 max-w-[200px]">
                          <p className="truncate text-body-sm font-body-sm text-outline" title={prop.notes}>
                            {prop.notes || '-'}
                          </p>
                        </td>
                        <td className="py-unit-4 pl-unit-3 pr-unit-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Link 
                              href={`/dashboard/properties/${prop.id}/edit`}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-white hover:bg-surface-container-high transition-colors" title="Edit property"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </Link>
                            <button 
                              onClick={() => handleCopyLink(prop.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-white hover:bg-surface-container-high transition-colors" title="Copy listing link" type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">content_copy</span>
                            </button>
                            <button 
                              disabled={isDeleting === prop.id}
                              onClick={() => handleDelete(prop.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-error/10 transition-colors" title="Archive record" type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER CONTAINER - Hidden when empty */}
        {filteredProperties.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-unit-6 py-unit-4 border-t border-white/[0.06] bg-surface-container-lowest/70 mt-auto">
            <div className="text-body-sm font-body-sm text-outline">
              Showing <span className="font-semibold text-white font-data-mono">1-{filteredProperties.length}</span> of <span className="font-semibold text-white font-data-mono">{properties.length}</span> properties
            </div>
            
            <div className="flex items-center gap-1.5">
              <button className="px-2.5 py-1.5 rounded-lg border border-outline-variant/30 text-outline hover:text-white hover:bg-surface-container transition-colors disabled:opacity-30 disabled:pointer-events-none" disabled type="button">
                <span className="material-symbols-outlined text-[18px] align-middle">chevron_left</span>
              </button>
              <button className="w-8 h-8 rounded-lg bg-primary-container text-on-primary font-bold text-label-md font-label-md shadow-md shadow-primary-container/20" type="button">
                1
              </button>
              <button className="px-2.5 py-1.5 rounded-lg border border-outline-variant/30 text-outline hover:text-white hover:bg-surface-container transition-colors disabled:opacity-30 disabled:pointer-events-none" disabled type="button">
                <span className="material-symbols-outlined text-[18px] align-middle">chevron_right</span>
              </button>
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              <span className="text-body-sm font-body-sm text-outline">Rows:</span>
              <select className="bg-surface-container border border-outline-variant/30 rounded-md py-1 pl-2 pr-6 text-label-sm font-label-sm text-on-surface focus:outline-none focus:border-primary-container">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
