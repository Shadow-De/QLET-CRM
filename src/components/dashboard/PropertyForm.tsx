"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { propertiesApi } from "@/lib/api-client";
import { CreatePropertyInput, UpdatePropertyInput } from "@/lib/validations/property";

type PropertyFormProps = {
  property?: any;
};

export function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter();
  const isEditing = !!property;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreatePropertyInput>({
    title: "",
    address: "",
    city: "London",
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    available: false,
    availabilityStatus: "Pending",
    availableFrom: "",
    description: "",
    epcRating: null,
    landlordName: "",
    ownerPhone: "",
    monthlyRent: "",
  });

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || "",
        address: property.address || "",
        city: property.city || "London",
        type: (property.type || "apartment") as any,
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        monthlyRent: property.monthlyRent || "",
        available: property.available ?? false,
        availabilityStatus: property.availabilityStatus || "Pending",
        availableFrom: property.availableFrom ? new Date(property.availableFrom).toISOString().split('T')[0] : "",
        description: property.description || "",
        epcRating: property.epcRating as any || null,
        landlordName: property.landlordName || "",
        ownerPhone: property.ownerPhone || "",
      });
    }
  }, [property]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.address?.trim()) {
      setError("Please provide a Reference ID.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    if (!formData.monthlyRent || Number(formData.monthlyRent) <= 0) {
      setError("Please provide a valid Target Monthly Asking Rent.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Provide default title and address if they are missing since UI doesn't have explicit fields for them in Screen 7,
    // though we mapped them to custom inputs for usability.
    const title = formData.title || `${formData.bedrooms} Bed ${formData.type} in ${formData.city}`;
    const address = formData.address || `${formData.city} Area`;

    try {
      const payload = {
        ...formData,
        title,
        address,
        availableFrom: formData.availabilityStatus === "Available Soon" && formData.availableFrom ? new Date(formData.availableFrom).toISOString() : null,
      };

      let res;
      if (isEditing) {
        res = await propertiesApi.update(property.id, payload as any);
      } else {
        res = await propertiesApi.create(payload as any);
      }
      
      if (res.error) {
        throw new Error(res.error);
      }

      await mutate('/api/properties');
      router.refresh();
      router.push('/dashboard/properties');
    } catch (err: any) {
      setError(err.message || "Failed to save property");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const propertyTypes = ["penthouse", "apartment", "townhouse", "house", "studio"];
  
  return (
    <div className="w-full">
      {/* Breadcrumbs & Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-unit-6 border-b border-outline-variant/20 mb-unit-8">
        <div>
          <div className="flex items-center gap-2 text-label-md font-label-md text-outline mb-1.5">
            <a className="hover:text-primary transition-colors cursor-pointer" onClick={() => router.push('/dashboard/properties')}>Properties</a>
            <span className="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
            <span className="text-on-surface font-semibold">{isEditing ? "Edit Property" : "Add New Property"}</span>
          </div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">{isEditing ? "Edit Property" : "Add New Property"}</h1>
          <p className="text-body-md font-body-md text-outline mt-1 max-w-2xl">
            Register operational listing details and owner portfolio terms during intake calls. Live auto-sync active.
          </p>
        </div>
        {/* Top Right Reference Badge & Intake Mode Indicator */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-white/5">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span className="text-label-sm font-label-sm text-tertiary">Live Intake Mode Active</span>
          </div>
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-surface-container border border-outline-variant/40">
            <span className="text-label-sm font-label-sm text-outline uppercase tracking-wider">Ref ID</span>
            <span className="font-data-mono text-data-mono font-bold text-primary">{isEditing && property?.id ? "QL-" + property.id.substring(0,4).toUpperCase() : "QL-NEW"}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-label-sm font-semibold bg-primary-container/20 text-primary border border-primary-container/30">Auto-generated</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 text-error text-body-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      {/* Main Cold-Call Optimized Intake Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop" id="propertyIntakeForm">
        {/* Column Left (8 Cols): Core Property Spec & Listing Specs */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Section 1: Property Location & Identification */}
          <div className="glass-card rounded-2xl p-card-lg border border-white/5 relative overflow-hidden" style={{ background: '#141019', padding: '1.75rem' }}>
            <div className="flex items-center justify-between pb-unit-4 border-b border-white/5 mb-unit-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">pin_drop</span>
                </div>
                <div>
                  <h2 className="text-headline-sm font-headline-sm text-on-surface">Location & Nomenclature</h2>
                  <p className="text-body-sm font-body-sm text-outline">Verified Land Registry address coordinates</p>
                </div>
              </div>
              <span className="text-label-sm font-label-sm text-outline-variant uppercase">Step 01 / 04</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-unit-5">

              <div className="md:col-span-12 flex flex-col gap-2">
                <label className="text-label-md font-label-md font-medium text-on-surface">Reference ID</label>
                <input 
                  type="text" 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})} 
                  placeholder="e.g. REF-1002"
                  className="w-full h-11 px-3.5 bg-[#0E0A14] border border-white/10 rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150" 
                />
              </div>
              <div className="md:col-span-12 flex flex-col gap-2">
                <label className="text-label-md font-label-md font-medium text-on-surface">City / London Borough</label>
                <input 
                  type="text" 
                  value={formData.city} 
                  onChange={e => setFormData({...formData, city: e.target.value})} 
                  className="w-full h-11 px-3.5 bg-[#0E0A14] border border-white/10 rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150" 
                />
              </div>
            </div>
          </div>

          {/* Section 2: Property Type & Financial Rent Calibration */}
          <div className="glass-card rounded-2xl p-card-lg border border-white/5" style={{ background: '#141019', padding: '1.75rem' }}>
            <div className="flex items-center justify-between pb-unit-4 border-b border-white/5 mb-unit-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">villa</span>
                </div>
                <div>
                  <h2 className="text-headline-sm font-headline-sm text-on-surface">Property Typology & Yield Targets</h2>
                  <p className="text-body-sm font-body-sm text-outline">Class specifications and baseline target rent</p>
                </div>
              </div>
              <span className="text-label-sm font-label-sm text-outline-variant uppercase">Step 02 / 04</span>
            </div>

            <div className="flex flex-col gap-3 mb-unit-6">
              <label className="text-label-md font-label-md font-medium text-on-surface">
                Property Architecture & Classification <span className="text-primary">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {propertyTypes.map((ptype) => (
                  <label key={ptype} className="cursor-pointer">
                    <input 
                      type="radio" 
                      name="property_type" 
                      value={ptype} 
                      checked={formData.type === ptype} 
                      onChange={() => setFormData({...formData, type: ptype as any})} 
                      className="hidden peer" 
                    />
                    <div className="peer-checked:border-primary peer-checked:bg-primary-container/10 peer-checked:text-white p-3 rounded-xl border border-white/10 bg-[#0E0A14] flex flex-col items-center justify-center text-center gap-1.5 hover:border-white/20 transition-all duration-150 text-outline">
                      <span className="material-symbols-outlined text-[22px] peer-checked:text-primary">
                        {ptype === 'penthouse' ? 'domain' : ptype === 'apartment' ? 'apartment' : ptype === 'townhouse' ? 'location_city' : ptype === 'house' ? 'holiday_village' : 'meeting_room'}
                      </span>
                      <span className="text-label-md font-label-md font-semibold capitalize">{ptype}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-unit-5 mb-unit-6">
              {/* Bedrooms */}
              <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-surface-container-low border border-white/5">
                <label className="text-label-md font-label-md font-medium text-on-surface flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-secondary">bed</span>
                    Room Count / Bedrooms
                  </span>
                </label>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-3">
                    <span className="text-headline-sm font-headline-sm font-bold text-on-surface font-data-mono">{formData.bedrooms}</span>
                    <span className="text-body-sm font-body-sm text-outline">Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#0E0A14] p-1 rounded-lg border border-white/10">
                    <button type="button" onClick={() => setFormData({...formData, bedrooms: Math.max(0, formData.bedrooms - 1)})} className="w-8 h-8 rounded flex items-center justify-center text-outline hover:text-white hover:bg-surface-container-high transition-colors">
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <div className="w-px h-4 bg-outline-variant/30"></div>
                    <button type="button" onClick={() => setFormData({...formData, bedrooms: formData.bedrooms + 1})} className="w-8 h-8 rounded flex items-center justify-center text-outline hover:text-white hover:bg-surface-container-high transition-colors">
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bathrooms */}
              <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-surface-container-low border border-white/5">
                <label className="text-label-md font-label-md font-medium text-on-surface flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-tertiary">bathtub</span>
                    Bathroom Count
                  </span>
                </label>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-3">
                    <span className="text-headline-sm font-headline-sm font-bold text-on-surface font-data-mono">{formData.bathrooms}</span>
                    <span className="text-body-sm font-body-sm text-outline">Bathrooms</span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#0E0A14] p-1 rounded-lg border border-white/10">
                    <button type="button" onClick={() => setFormData({...formData, bathrooms: Math.max(0, (formData.bathrooms || 1) - 1)})} className="w-8 h-8 rounded flex items-center justify-center text-outline hover:text-white hover:bg-surface-container-high transition-colors">
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <div className="w-px h-4 bg-outline-variant/30"></div>
                    <button type="button" onClick={() => setFormData({...formData, bathrooms: (formData.bathrooms || 0) + 1})} className="w-8 h-8 rounded flex items-center justify-center text-outline hover:text-white hover:bg-surface-container-high transition-colors">
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-unit-5">
              <div className="md:col-span-12 flex flex-col gap-2">
                <label className="text-label-md font-label-md font-medium text-on-surface">Target Monthly Asking Rent <span className="text-primary">*</span></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-headline-sm font-headline-sm text-primary font-bold">€</span>
                  <input 
                    type="number" 
                    value={formData.monthlyRent}
                    onChange={e => setFormData({...formData, monthlyRent: e.target.value})}
                    className="w-full h-12 pl-9 pr-14 bg-[#0E0A14] border border-white/10 rounded-lg text-headline-sm font-headline-sm font-bold text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150 font-data-mono" 
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-label-sm font-label-sm text-outline">/ mo</span>
                </div>
                <span className="text-body-sm font-body-sm text-outline">Yield equivalent: €{(Number(formData.monthlyRent || 0) * 12).toLocaleString()} / annum gross</span>
              </div>
            </div>
          </div>

          {/* Section 3: Availability */}
          <div className="glass-card rounded-2xl p-card-lg border border-white/5" style={{ background: '#141019', padding: '1.75rem' }}>
            <div className="flex items-center justify-between pb-unit-4 border-b border-white/5 mb-unit-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">calendar_clock</span>
                </div>
                <div>
                  <h2 className="text-headline-sm font-headline-sm text-on-surface">Tenancy Commencement & Vacancy</h2>
                </div>
              </div>
              <span className="text-label-sm font-label-sm text-outline-variant uppercase">Step 03 / 04</span>
            </div>

            <div className="flex flex-col gap-3 mb-unit-5">
              <label className="text-label-md font-label-md font-medium text-on-surface">
                Current Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "Pending", label: "Pending", icon: "hourglass_empty", color: "text-outline-variant", bg: "peer-checked:bg-outline-variant/10", border: "peer-checked:border-outline-variant" },
                  { id: "Available Now", label: "Available Now", icon: "check_circle", color: "text-emerald-400", bg: "peer-checked:bg-emerald-400/10", border: "peer-checked:border-emerald-400" },
                  { id: "Available Soon", label: "Available Soon", icon: "event_available", color: "text-amber-400", bg: "peer-checked:bg-amber-400/10", border: "peer-checked:border-amber-400" },
                  { id: "Rented", label: "Rented", icon: "key", color: "text-[#A78BFA]", bg: "peer-checked:bg-[#A78BFA]/10", border: "peer-checked:border-[#A78BFA]" },
                ].map((status) => (
                  <label key={status.id} className="cursor-pointer">
                    <input 
                      type="radio" 
                      name="availabilityStatus" 
                      value={status.id} 
                      checked={formData.availabilityStatus === status.id} 
                      onChange={() => setFormData({...formData, availabilityStatus: status.id as any})} 
                      className="hidden peer" 
                    />
                    <div className={`peer-checked:border-primary ${status.bg} ${status.border} peer-checked:text-white p-3 rounded-xl border border-white/10 bg-[#0E0A14] flex flex-col items-center justify-center text-center gap-1.5 hover:border-white/20 transition-all duration-150 text-outline`}>
                      <span className={`material-symbols-outlined text-[20px] peer-checked:${status.color}`}>
                        {status.icon}
                      </span>
                      <span className="text-label-sm font-label-sm font-semibold whitespace-nowrap">{status.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {formData.availabilityStatus === "Available Soon" && (
              <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">event_available</span>
                  </div>
                  <div>
                    <span className="text-label-sm font-label-sm uppercase text-outline">Target Move-in Date</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <input 
                    type="date" 
                    value={formData.availableFrom || ""}
                    onChange={e => setFormData({...formData, availableFrom: e.target.value})}
                    className="h-11 px-3.5 bg-[#0E0A14] border border-white/10 rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-data-mono" 
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Notes */}
          <div className="glass-card rounded-2xl p-card-lg border border-white/5" style={{ background: '#141019', padding: '1.75rem' }}>
            <div className="flex items-center justify-between pb-unit-4 border-b border-white/5 mb-unit-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                </div>
                <div>
                  <h2 className="text-headline-sm font-headline-sm text-on-surface">Key Features & Intake Notes</h2>
                </div>
              </div>
              <span className="text-label-sm font-label-sm text-outline-variant uppercase">Step 04 / 04</span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-label-md font-label-md font-medium text-on-surface flex items-center gap-2">
                <span>Live Cold-Call Notes & Landlord Preferences</span>
              </label>
              <textarea 
                value={formData.description || ""}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={4} 
                className="w-full p-3.5 bg-[#0E0A14] border border-white/10 rounded-xl text-body-md font-body-md text-on-surface placeholder:text-outline/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150 resize-y" 
                placeholder="Transcribe landlord specifics..."
              />
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="glass-card rounded-2xl p-card-lg border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: '#141019', padding: '1.75rem' }}>
            <button type="button" onClick={() => router.push('/dashboard/properties')} className="w-full sm:w-auto px-5 py-3 rounded-lg text-outline hover:text-white hover:bg-white/5 font-label-md transition-colors">
              Cancel
            </button>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button disabled={isSubmitting} type="submit" className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg bg-gradient-to-r from-[#E6399B] to-[#7C3AED] text-white font-label-md font-semibold shadow-[0_4px_20px_rgba(230,57,155,0.35)] hover:shadow-[0_6px_24px_rgba(124,58,237,0.45)] hover:brightness-110 active:scale-[0.98] transition-all duration-200 w-full sm:w-auto disabled:opacity-50">
                {isSubmitting && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>}
                <span className="material-symbols-outlined text-[20px]">save</span>
                <span>Save property to portfolio</span>
              </button>
            </div>
          </div>
        </div>

        {/* Column Right (4 Cols): Landlord Contact & Intake Summary Rail */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card rounded-2xl p-card-lg border border-white/5" style={{ background: '#141019', padding: '1.75rem' }}>
            <div className="flex items-center justify-between pb-unit-4 border-b border-white/5 mb-unit-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                </div>
                <div>
                  <h3 className="text-headline-sm font-headline-sm text-on-surface">Landlord & Ownership</h3>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-unit-4">
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-label-md font-medium text-on-surface">Landlord / Owner Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={formData.landlordName || ""}
                    onChange={e => setFormData({...formData, landlordName: e.target.value})}
                    className="w-full h-11 px-3.5 bg-[#0E0A14] border border-white/10 rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150" 
                  />
                  <span className="material-symbols-outlined text-outline text-[18px] absolute right-3 top-1/2 -translate-y-1/2">person</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-label-md font-medium text-on-surface flex justify-between">
                  <span>Verified Mobile</span>
                </label>
                <div className="relative">
                  <input 
                    type="tel" 
                    value={formData.ownerPhone || ""}
                    onChange={e => setFormData({...formData, ownerPhone: e.target.value})}
                    className="w-full h-11 px-3.5 bg-[#0E0A14] border border-white/10 rounded-lg text-body-md font-body-md text-on-surface font-data-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150" 
                  />
                  <span className="material-symbols-outlined text-outline text-[18px] absolute right-3 top-1/2 -translate-y-1/2">phone_iphone</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
