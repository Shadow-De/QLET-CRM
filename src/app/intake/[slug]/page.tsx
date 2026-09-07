"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";

function CustomCalendarPicker({ value, onChange }: { value: string, onChange: (date: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handleDateClick = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    onChange(d.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#0E0A14] border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface font-body-md text-body-md flex justify-between items-center cursor-pointer transition-colors hover:border-primary-container relative overflow-hidden h-[50px]"
      >
        <span className={value ? "text-on-surface" : "text-outline/50"}>{value ? new Date(value).toLocaleDateString() : 'Select date...'}</span>
        <span className="material-symbols-outlined text-[20px] text-primary pointer-events-none">calendar_month</span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-0 w-[280px] sm:w-[310px] p-4 rounded-xl bg-[#1A1523] border border-outline-variant/40 shadow-[0_-12px_32px_rgba(0,0,0,0.6)] z-50 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-3">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1 hover:text-primary transition-colors text-outline hover:bg-surface-container rounded-lg flex items-center justify-center" type="button"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
              <span className="font-label-md font-bold text-on-surface">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1 hover:text-primary transition-colors text-outline hover:bg-surface-container rounded-lg flex items-center justify-center" type="button"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d} className="text-[10px] uppercase font-bold text-outline">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                const dateStr = d.toISOString().split('T')[0];
                const isSelected = value === dateStr;
                return (
                  <button 
                    key={day} 
                    onClick={() => handleDateClick(day)}
                    className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-all ${isSelected ? 'bg-primary-container text-primary shadow-md' : 'text-on-surface hover:bg-surface-container-high'}`}
                    type="button"
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CustomDropdown({ 
  value, 
  onChange, 
  options, 
  placeholder,
  direction = 'down' 
}: { 
  value: string, 
  onChange: (val: string) => void, 
  options: { label: string, value: string }[], 
  placeholder?: string,
  direction?: 'up' | 'down'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);
  const isUp = direction === 'up';

  return (
    <div className="relative w-full" ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#0E0A14] border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface font-body-md text-body-md cursor-pointer flex justify-between items-center transition-colors hover:border-primary-container h-[50px]"
      >
        <span className={value ? "text-on-surface" : "text-outline/50"}>{selectedOption ? selectedOption.label : (placeholder || 'Select...')}</span>
        <span className={`material-symbols-outlined text-[20px] text-outline transition-transform duration-200 ${isOpen ? (isUp ? '-rotate-180' : 'rotate-180') : ''}`}>expand_more</span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: isUp ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isUp ? 6 : -6 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${isUp ? 'bottom-full mb-2 shadow-[0_-12px_32px_rgba(0,0,0,0.6)]' : 'top-full mt-2 shadow-2xl'} left-0 w-full rounded-xl bg-[#1A1523] border border-outline-variant/40 z-50 overflow-hidden flex flex-col py-1`}
          >
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-body-md font-body-md transition-colors flex items-center justify-between ${value === opt.value ? 'bg-primary-container/20 text-primary font-medium' : 'text-on-surface hover:bg-surface-container'}`}
                type="button"
              >
                {opt.label}
                {value === opt.value && <span className="material-symbols-outlined text-[16px]">check</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const NATIONALITIES = [
  "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Antiguans", "Argentinean", "Armenian", "Australian", "Austrian", "Azerbaijani", 
  "Bahamian", "Bahraini", "Bangladeshi", "Barbadian", "Barbudans", "Batswana", "Belarusian", "Belgian", "Belizean", "Beninese", "Bhutanese", "Bolivian", "Bosnian", "Brazilian", "British", "Bruneian", "Bulgarian", "Burkinabe", "Burmese", "Burundian", 
  "Cambodian", "Cameroonian", "Canadian", "Cape Verdean", "Central African", "Chadian", "Chilean", "Chinese", "Colombian", "Comoran", "Congolese", "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech", 
  "Danish", "Djibouti", "Dominican", "Dutch", 
  "East Timorese", "Ecuadorean", "Egyptian", "Emirian", "Equatorial Guinean", "Eritrean", "Estonian", "Ethiopian", 
  "Fijian", "Filipino", "Finnish", "French", 
  "Gabonese", "Gambian", "Georgian", "German", "Ghanaian", "Greek", "Grenadian", "Guatemalan", "Guinea-Bissauan", "Guinean", "Guyanese", 
  "Haitian", "Herzegovinian", "Honduran", "Hungarian", 
  "I-Kiribati", "Icelander", "Indian", "Indonesian", "Iranian", "Iraqi", "Irish", "Israeli", "Italian", "Ivorian", 
  "Jamaican", "Japanese", "Jordanian", 
  "Kazakhstani", "Kenyan", "Kittian and Nevisian", "Kuwaiti", "Kyrgyz", 
  "Laotian", "Latvian", "Lebanese", "Liberian", "Libyan", "Liechtensteiner", "Lithuanian", "Luxembourger", 
  "Macedonian", "Malagasy", "Malawian", "Malaysian", "Maldivan", "Malian", "Maltese", "Marshallese", "Mauritanian", "Mauritian", "Mexican", "Micronesian", "Moldovan", "Monacan", "Mongolian", "Moroccan", "Mosotho", "Motswana", "Mozambican", 
  "Namibian", "Nauruan", "Nepalese", "New Zealander", "Nicaraguan", "Nigerian", "Nigerien", "North Korean", "Northern Irish", "Norwegian", 
  "Omani", 
  "Pakistani", "Palauan", "Panamanian", "Papua New Guinean", "Paraguayan", "Peruvian", "Polish", "Portuguese", 
  "Qatari", 
  "Romanian", "Russian", "Rwandan", 
  "Saint Lucian", "Salvadoran", "Samoan", "San Marinese", "Sao Tomean", "Saudi", "Scottish", "Senegalese", "Serbian", "Seychellois", "Sierra Leonean", "Singaporean", "Slovakian", "Slovenian", "Solomon Islander", "Somali", "South African", "South Korean", "Spanish", "Sri Lankan", "Sudanese", "Surinamer", "Swazi", "Swedish", "Swiss", "Syrian", 
  "Taiwanese", "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan", "Trinidadian or Tobagonian", "Tunisian", "Turkish", "Tuvaluan", 
  "Ugandan", "Ukrainian", "Uruguayan", "Uzbekistani", 
  "Venezuelan", "Vietnamese", 
  "Welsh", 
  "Yemenite", 
  "Zambian", "Zimbabwean"
];

function SearchableNationalitySelect({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = NATIONALITIES.filter(n => n.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative w-full" ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#0E0A14] border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface font-body-md text-body-md cursor-pointer flex justify-between items-center transition-colors hover:border-primary-container"
      >
        <span className={value ? "text-on-surface" : "text-outline/50"}>{value || 'Select nationality...'}</span>
        <span className={`material-symbols-outlined text-[20px] text-outline transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 w-full rounded-xl bg-[#1A1523] border border-outline-variant/40 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[250px]"
          >
            <div className="p-2 border-b border-outline-variant/30 bg-[#15111D]">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-outline pointer-events-none">search</span>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Search nationality..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  className="w-full bg-[#0A0710] border border-outline-variant/20 rounded-lg pl-9 pr-3 py-2 text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-1 scrollbar-thin scrollbar-thumb-surface-container-highest">
              {filtered.length === 0 ? (
                <div className="p-3 text-center text-outline text-body-sm">No matches found.</div>
              ) : (
                filtered.map(nat => (
                  <button
                    key={nat}
                    onClick={() => {
                      onChange(nat);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-body-md font-body-md transition-colors flex items-center justify-between ${value === nat ? 'bg-primary-container/20 text-primary font-medium' : 'text-on-surface hover:bg-surface-container'}`}
                    type="button"
                  >
                    {nat}
                    {value === nat && <span className="material-symbols-outlined text-[16px]">check</span>}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const POPULAR_MALTA_CITIES = [
  "Sliema", "St. Julian's", "Gzira", "Msida", "Swieqi", 
  "Valletta", "Mosta", "San Gwann", "Birkirkara", "Naxxar", 
  "St. Paul's Bay", "Mellieha", "Ta' Xbiex", "Bugibba"
];

const ALL_MALTA_CITIES = [
  "Attard", "Balzan", "Birgu (Vittoriosa)", "Birkirkara", "Birzebbuga", "Bormla (Cospicua)", 
  "Bugibba", "Dingli", "Fgura", "Floriana", "Gharghur", "Ghaxaq", "Gzira", "Hamrun", 
  "Iklin", "Isla (Senglea)", "Kalkara", "Kirkop", "Lija", "Luqa", "Marsa", "Marsaskala", 
  "Marsaxlokk", "Mdina", "Mellieha", "Mgarr", "Mosta", "Mqabba", "Msida", "Mtarfa", 
  "Naxxar", "Paola", "Pembroke", "Pietà", "Qawra", "Qormi", "Qrendi", "Rabat", "Safi", 
  "San Gwann", "Santa Lucija", "Santa Venera", "Siggiewi", "Sliema", "St. Julian's", 
  "St. Paul's Bay", "Swieqi", "Ta' Xbiex", "Tarxien", "Valletta", "Victoria (Gozo)", 
  "Xaghra (Gozo)", "Xewkija (Gozo)", "Xghajra", "Xlendi (Gozo)", "Zabbar", "Zebbug", 
  "Zejtun", "Zurrieq"
];

function CityAutocompleteMultiSelect({ 
  selectedCities, 
  onChange 
}: { 
  selectedCities: string[], 
  onChange: (cities: string[]) => void 
}) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addCity = (city: string) => {
    const trimmed = city.trim();
    if (!trimmed) return;
    if (!selectedCities.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...selectedCities, trimmed]);
    }
    setInputValue("");
    setIsOpen(false);
  };

  const removeCity = (cityToRemove: string) => {
    onChange(selectedCities.filter(c => c !== cityToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        addCity(inputValue.trim());
      }
    }
  };

  // Filter suggestions based on input value
  const suggestions = inputValue.trim() === ""
    ? POPULAR_MALTA_CITIES.filter(c => !selectedCities.some(s => s.toLowerCase() === c.toLowerCase()))
    : ALL_MALTA_CITIES.filter(c => 
        c.toLowerCase().includes(inputValue.toLowerCase()) && 
        !selectedCities.some(s => s.toLowerCase() === c.toLowerCase())
      );

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Search / Input Box */}
      <div className="relative">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-outline pointer-events-none">
            location_on
          </span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Type city or area name (e.g. Sliema, Valletta)..."
            className="w-full bg-[#0E0A14] border border-outline-variant/40 rounded-xl pl-11 pr-24 py-3 text-on-surface font-body-md text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none transition-all placeholder:text-outline/50 h-[50px]"
          />
          {inputValue.trim() && (
            <button
              type="button"
              onClick={() => addCity(inputValue)}
              className="absolute right-2 px-3 py-1.5 rounded-lg bg-primary-container/30 hover:bg-primary-container/50 text-primary border border-primary-container/40 font-label-sm text-label-sm font-semibold transition-all flex items-center gap-1"
            >
              <span>Add</span>
              <span className="material-symbols-outlined text-[14px]">add</span>
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-2 left-0 w-full rounded-xl bg-[#1A1523] border border-outline-variant/40 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[240px]"
            >
              <div className="px-3 py-2 border-b border-outline-variant/20 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-outline bg-[#15111D]">
                <span>{inputValue.trim() ? "Matching Locations" : "Suggested Popular Cities"}</span>
                <span>Tap to add</span>
              </div>
              <div className="overflow-y-auto flex-1 p-1 scrollbar-thin scrollbar-thumb-surface-container-highest">
                {suggestions.length === 0 ? (
                  <div className="p-3 text-center text-outline text-body-sm">
                    {inputValue.trim() ? (
                      <div className="space-y-1.5">
                        <p className="text-body-sm">No exact preset match for &ldquo;{inputValue}&rdquo;</p>
                        <button
                          type="button"
                          onClick={() => addCity(inputValue)}
                          className="px-3 py-1.5 rounded-lg bg-primary-container/20 text-primary hover:bg-primary-container/30 transition-colors text-body-sm font-semibold inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">add_circle</span>
                          Add &ldquo;{inputValue}&rdquo; as preferred area
                        </button>
                      </div>
                    ) : (
                      "All suggested cities already added."
                    )}
                  </div>
                ) : (
                  suggestions.map(city => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => addCity(city)}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-body-md font-body-md transition-colors flex items-center justify-between text-on-surface hover:bg-surface-container"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                        <span>{city}</span>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-outline hover:text-primary">add</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Cities Badges (Multi-city chips) */}
      {selectedCities.length > 0 ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline block">
              Selected Areas ({selectedCities.length})
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] text-outline hover:text-primary transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCities.map(city => (
              <motion.span 
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                key={city} 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container/20 border border-primary-container/50 text-primary font-label-md text-label-md shadow-sm"
              >
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                <span className="font-medium text-on-surface">{city}</span>
                <button 
                  type="button" 
                  onClick={() => removeCity(city)} 
                  className="hover:text-error text-outline transition-colors ml-0.5 p-0.5 rounded-full hover:bg-white/10 flex items-center justify-center"
                  aria-label={`Remove ${city}`}
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </motion.span>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-body-sm text-outline/60 italic text-xs">
          No cities selected yet. You can add more than 1 city.
        </p>
      )}

      {/* Quick-tap Popular Suggestions */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-outline block">
          Quick Suggestions (tap to add / remove)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_MALTA_CITIES.map(city => {
            const isSelected = selectedCities.some(s => s.toLowerCase() === city.toLowerCase());
            return (
              <button
                key={city}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    removeCity(city);
                  } else {
                    addCity(city);
                  }
                }}
                className={`px-2.5 py-1 rounded-md text-label-sm font-label-sm transition-all flex items-center gap-1 ${
                  isSelected
                    ? "bg-primary-container/30 border border-primary-container/50 text-primary font-semibold"
                    : "bg-[#0E0A14] border border-outline-variant/30 text-outline hover:text-on-surface hover:border-outline"
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">
                  {isSelected ? "check" : "add"}
                </span>
                {city}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ClientIntakeWizard() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string; // e.g. "q8f-evelyn-montgomery-992"

  // Step State
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Step 1: Moving in
  const [groupType, setGroupType] = useState<"Single" | "Couple" | "Group">("Single");
  const [adultMen, setAdultMen] = useState(1);
  const [adultWomen, setAdultWomen] = useState(0);
  
  const [hasChildren, setHasChildren] = useState(false);
  const [childrenCount, setChildrenCount] = useState(1);
  const [childrenAges, setChildrenAges] = useState("");

  const [hasPets, setHasPets] = useState(false);
  const [petsCount, setPetsCount] = useState(1);
  const [pets, setPets] = useState("");

  // Step 2: Background
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nationality, setNationality] = useState("");
  const [visaType, setVisaType] = useState("citizen");
  const [moveInDate, setMoveInDate] = useState("");
  const [tenancyDuration, setTenancyDuration] = useState("1");

  // Step 3: Preferences
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [budget, setBudget] = useState(5000);
  const [areas, setAreas] = useState<string[]>([]);
  const [newArea, setNewArea] = useState("");
  const [otherDetails, setOtherDetails] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Force reset state when slug changes (to guarantee a fresh start if navigating client-side)
  React.useEffect(() => {
    setStep(1);
    setGroupType("Single");
    setAdultMen(1);
    setAdultWomen(0);
    setHasChildren(false);
    setChildrenCount(1);
    setChildrenAges("");
    setHasPets(false);
    setPetsCount(1);
    setPets("");
    setName("");
    setPhone("");
    setEmail("");
    setNationality("");
    setVisaType("citizen");
    setMoveInDate("");
    setTenancyDuration("1");
    setPropertyTypes([]);
    setBudget(5000);
    setAreas([]);
    setNewArea("");
    setOtherDetails("");
    setSubmitError("");
    setIsSubmitting(false);
  }, [slug]);

  const handleContinue = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      try {
        const payload = {
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
        };

        const res = await fetch(`/api/intake/${slug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          localStorage.setItem("lastIntakeSubmission", JSON.stringify(payload));
          router.push(`/intake/${slug}/success`);
        } else {
          const data = await res.json().catch(() => ({}));
          console.error("Failed to submit intake form:", data);
          setSubmitError(data.error || "Failed to submit. Please try again.");
        }
      } catch (error) {
        console.error("Error submitting form", error);
        setSubmitError("Network error. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getStepTitle = () => {
    if (step === 1) return "Household Profile";
    if (step === 2) return "Applicant Background";
    return "Housing Requirements";
  };

  const togglePropertyType = (type: string) => {
    if (propertyTypes.includes(type)) {
      setPropertyTypes(propertyTypes.filter(t => t !== type));
    } else {
      setPropertyTypes([...propertyTypes, type]);
    }
  };

  const addArea = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newArea.trim() !== "") {
      e.preventDefault();
      if (!areas.includes(newArea.trim())) {
        setAreas([...areas, newArea.trim()]);
      }
      setNewArea("");
    }
  };

  const removeArea = (area: string) => {
    setAreas(areas.filter(a => a !== area));
  };

  return (
    <div className="bg-[#0A0710] text-on-surface antialiased min-h-screen flex flex-col justify-between selection:bg-primary-container selection:text-on-primary">
      {/* Atmospheric Glow Backdrop */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(230,57,155,0.22)_0%,rgba(124,58,237,0.14)_42%,rgba(10,7,16,0)_75%)] z-0"></div>
      
      {/* Primary Mobile Canvas */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto min-h-screen flex flex-col pb-28">
        
        {/* Top Public Header */}
        <header className="pt-unit-8 px-unit-5 pb-unit-4 flex flex-col items-center text-center">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2 mb-unit-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-secondary-container to-primary-container flex items-center justify-center shadow-lg shadow-secondary-container/40 p-[1.5px]">
              <div className="w-full h-full bg-surface-container-lowest rounded-[10px] flex items-center justify-center">
                <span className="font-headline-sm text-headline-sm text-primary font-bold">Q</span>
              </div>
            </div>
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight">QletLettings</span>
          </motion.div>
          <motion.p initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="font-label-md text-label-md text-on-surface-variant font-medium">Malta Residential Intake</motion.p>
          
          {/* Wizard Indicator */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="w-full mt-unit-6">
            <div className="flex items-center justify-between font-label-sm text-label-sm mb-unit-2">
              <span className="text-primary font-semibold tracking-wider">STEP {step} OF {totalSteps}</span>
              <span className="text-on-surface-variant">{getStepTitle()}</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden p-[1px]">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="h-full rounded-full bg-gradient-to-r from-primary-container via-primary to-secondary shadow-[0_0_10px_rgba(250,74,171,0.5)]" 
              />
            </div>
          </motion.div>
        </header>

        {/* Content Area: Mobile Form Canvas */}
        <main className="px-unit-5 flex-1 flex flex-col gap-unit-5 mt-unit-2">
          
          {/* Summary Pill Cluster */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-unit-2 items-center">
            {step > 1 && (
              <div className="flex items-center gap-1.5 px-unit-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-on-surface-variant text-label-sm font-label-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                <span className="text-on-surface">Step 1:</span>
                <span className="">{groupType} &middot; {adultMen + adultWomen} Adults {hasChildren ? `· ${childrenCount} Children` : ''} {hasPets ? '· Pets' : ''}</span>
                <span className="material-symbols-outlined text-[14px] text-outline ml-0.5">check</span>
              </div>
            )}
            {step > 2 && (
              <div className="flex items-center gap-1.5 px-unit-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-on-surface-variant text-label-sm font-label-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                <span className="text-on-surface">Step 2:</span>
                <span className="">{name || 'Named'} &middot; {moveInDate || 'TBD'}</span>
                <span className="material-symbols-outlined text-[14px] text-outline ml-0.5">check</span>
              </div>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={`step${step}`}
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-card-padding-sm border border-white/5 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] flex flex-col gap-unit-6"
            >
              
              {/* Step 1 */}
              {step === 1 && (
                <>
                  <div>
                    <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">Household Profile</h2>
                    <p className="font-body-sm text-body-sm text-outline mt-1">Please tell us about the household.</p>
                  </div>
                  
                  <div className="flex flex-col gap-unit-4">
                    {/* Group Type */}
                    <div className="space-y-2">
                      <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                        Household Composition (Group Type)
                      </label>
                      <div className="p-1 rounded-xl bg-[#0E0A14] border border-outline-variant/30 grid grid-cols-3 gap-1">
                        {(["Single", "Couple", "Group"] as const).map((type) => (
                          <button 
                            key={type}
                            onClick={() => setGroupType(type)}
                            className={`py-2 px-3 rounded-lg text-label-md font-label-md flex items-center justify-center gap-1.5 transition-colors ${
                              groupType === type 
                                ? 'bg-gradient-to-r from-[#E6399B] to-[#7C3AED] text-white font-semibold shadow-md' 
                                : 'text-outline hover:text-on-surface'
                            }`}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[16px]">{type === "Single" ? "person" : type === "Couple" ? "group" : "groups"}</span>
                            <span>{type}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Men & Women Counts (Only show for Group) */}
                    <AnimatePresence>
                      {groupType === "Group" && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto' }} 
                          exit={{ opacity: 0, height: 0 }} 
                          className="p-unit-4 rounded-xl bg-[#0E0A14] border border-outline-variant/30 grid grid-cols-2 gap-4 overflow-hidden"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-label-sm font-label-sm text-outline">Adult Men</span>
                              <span className="text-data-mono font-data-mono text-primary font-bold">{adultMen}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setAdultMen(Math.max(0, adultMen - 1))} className="w-9 h-9 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface flex items-center justify-center hover:border-primary transition-colors" type="button">
                                <span className="material-symbols-outlined text-[16px]">remove</span>
                              </button>
                              <div className="flex-1 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center font-data-mono text-data-mono text-on-surface">
                                {adultMen.toString().padStart(2, '0')}
                              </div>
                              <button onClick={() => setAdultMen(adultMen + 1)} className="w-9 h-9 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface flex items-center justify-center hover:border-primary transition-colors" type="button">
                                <span className="material-symbols-outlined text-[16px]">add</span>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-label-sm font-label-sm text-outline">Adult Women</span>
                              <span className="text-data-mono font-data-mono text-primary font-bold">{adultWomen}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setAdultWomen(Math.max(0, adultWomen - 1))} className="w-9 h-9 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface flex items-center justify-center hover:border-primary transition-colors" type="button">
                                <span className="material-symbols-outlined text-[16px]">remove</span>
                              </button>
                              <div className="flex-1 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center font-data-mono text-data-mono text-on-surface">
                                {adultWomen.toString().padStart(2, '0')}
                              </div>
                              <button onClick={() => setAdultWomen(adultWomen + 1)} className="w-9 h-9 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface flex items-center justify-center hover:border-primary transition-colors" type="button">
                                <span className="material-symbols-outlined text-[16px]">add</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Children Toggle */}
                    <div className="p-unit-4 rounded-xl bg-[#0E0A14] border border-outline-variant/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">child_care</span>
                          <div>
                            <span className="text-label-md font-label-md text-on-surface font-semibold block">Accompanying Children</span>
                            <span className="text-body-sm font-body-sm text-outline">Dependents under 18</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => setHasChildren(!hasChildren)} 
                          className={`w-12 h-6 rounded-full p-0.5 transition-colors relative flex items-center ${hasChildren ? 'bg-gradient-to-r from-[#E6399B] to-[#7C3AED]' : 'bg-surface-container-high border border-outline-variant/50'}`} 
                          type="button"
                        >
                          <span className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${hasChildren ? 'translate-x-6' : 'translate-x-0'}`}></span>
                        </button>
                      </div>

                      <AnimatePresence>
                        {hasChildren && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-3 border-t border-white/5 grid grid-cols-2 gap-3 overflow-hidden">
                            <div className="space-y-1">
                              <label className="text-label-sm font-label-sm text-outline">Count</label>
                              <div className="flex items-center gap-2 mt-1">
                                <button onClick={() => setChildrenCount(Math.max(1, childrenCount - 1))} className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface flex items-center justify-center hover:border-primary transition-colors" type="button">
                                  <span className="material-symbols-outlined text-[16px]">remove</span>
                                </button>
                                <div className="flex-1 h-10 rounded-lg bg-[#15121b] border border-outline-variant/30 flex items-center justify-center font-data-mono text-data-mono text-on-surface">
                                  {childrenCount.toString().padStart(2, '0')}
                                </div>
                                <button onClick={() => setChildrenCount(childrenCount + 1)} className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface flex items-center justify-center hover:border-primary transition-colors" type="button">
                                  <span className="material-symbols-outlined text-[16px]">add</span>
                                </button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-label-sm font-label-sm text-outline">Ages</label>
                              <input value={childrenAges} onChange={(e) => setChildrenAges(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-[#15121b] border border-outline-variant/30 text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary placeholder:text-outline/50" placeholder="e.g. 4, 7" type="text" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Pets Toggle */}
                    <div className="p-unit-4 rounded-xl bg-[#0E0A14] border border-outline-variant/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">pets</span>
                          <div>
                            <span className="text-label-md font-label-md text-on-surface font-semibold block">Pet Occupants</span>
                            <span className="text-body-sm font-body-sm text-outline">Requires landlord approval</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => setHasPets(!hasPets)} 
                          className={`w-12 h-6 rounded-full p-0.5 transition-colors relative flex items-center ${hasPets ? 'bg-gradient-to-r from-[#E6399B] to-[#7C3AED]' : 'bg-surface-container-high border border-outline-variant/50'}`} 
                          type="button"
                        >
                          <span className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${hasPets ? 'translate-x-6' : 'translate-x-0'}`}></span>
                        </button>
                      </div>

                      <AnimatePresence>
                        {hasPets && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-3 border-t border-white/5 overflow-hidden flex flex-col gap-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-label-sm font-label-sm text-outline">Number of Pets</span>
                                <span className="text-data-mono font-data-mono text-primary font-bold">{petsCount}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => setPetsCount(Math.max(1, petsCount - 1))} className="w-9 h-9 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface flex items-center justify-center hover:border-primary transition-colors" type="button">
                                  <span className="material-symbols-outlined text-[16px]">remove</span>
                                </button>
                                <div className="flex-1 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center font-data-mono text-data-mono text-on-surface">
                                  {petsCount.toString().padStart(2, '0')}
                                </div>
                                <button onClick={() => setPetsCount(petsCount + 1)} className="w-9 h-9 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface flex items-center justify-center hover:border-primary transition-colors" type="button">
                                  <span className="material-symbols-outlined text-[16px]">add</span>
                                </button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-label-sm font-label-sm text-outline block mb-1">Breed & Details</label>
                              <input value={pets} onChange={(e) => setPets(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-[#15121b] border border-outline-variant/30 text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary placeholder:text-outline/50" placeholder="e.g. Golden Retriever" type="text" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <>
                  <div>
                    <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">Applicant Background</h2>
                    <p className="font-body-sm text-body-sm text-outline mt-1">Basic details for the tenancy application.</p>
                  </div>
                  
                  <div className="flex flex-col gap-unit-4">
                    <div className="flex flex-col gap-unit-2">
                      <label className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">Full Name *</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0E0A14] border border-outline-variant/40 rounded-xl px-unit-4 py-unit-3 text-on-surface font-body-md text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none transition-all placeholder:text-outline/50" placeholder="e.g. Evelyn Montgomery" required />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-unit-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">Mobile *</label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#0E0A14] border border-outline-variant/40 rounded-xl px-3 py-3 text-on-surface font-body-md text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none transition-all placeholder:text-outline/50" placeholder="+44 7911..." required />
                      </div>
                      <div className="flex flex-col gap-unit-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">Email *</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0E0A14] border border-outline-variant/40 rounded-xl px-3 py-3 text-on-surface font-body-md text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none transition-all placeholder:text-outline/50" placeholder="evelyn@..." required />
                      </div>
                    </div>

                    <div className="flex flex-col gap-unit-2">
                      <label className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">Nationality</label>
                      <SearchableNationalitySelect value={nationality} onChange={setNationality} />
                    </div>

                    <div className="flex flex-col gap-unit-2">
                      <label className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">Right to Rent / Visa Type</label>
                      <CustomDropdown 
                        value={visaType} 
                        onChange={setVisaType} 
                        options={[
                          { label: "Maltese / EU Citizen (Verified)", value: "citizen" },
                          { label: "Student Visa", value: "student" },
                          { label: "Working Visa", value: "working" }
                        ]} 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-unit-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">Move-in Date *</label>
                        <CustomCalendarPicker value={moveInDate} onChange={setMoveInDate} />
                      </div>
                      <div className="flex flex-col gap-unit-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">Duration</label>
                        <CustomDropdown 
                          value={tenancyDuration} 
                          onChange={setTenancyDuration} 
                          direction="up"
                          options={[
                            { label: "1 Year", value: "1" },
                            { label: "2 Years", value: "2" },
                            { label: "3 Years", value: "3" },
                            { label: "4+ Years", value: "4+" }
                          ]} 
                        />
                      </div>
                    </div>

                  </div>
                </>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <>
                  <div>
                    <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">Housing Requirements</h2>
                    <p className="font-body-sm text-body-sm text-outline mt-1">Specify your residential criteria.</p>
                  </div>

                  <div className="flex flex-col gap-unit-4">
                    {/* Property Types */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                          Target Property Type
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Single Room", 
                          "Studio Apartment", 
                          "1 Bedroom Apartment", 
                          "2 Bedroom Apartment", 
                          "3 Bedroom Apartment", 
                          "Townhouse", 
                          "Penthouse"
                        ].map(type => {
                          const isSelected = propertyTypes.includes(type);
                          return (
                            <button 
                              key={type}
                              onClick={() => togglePropertyType(type)}
                              className={`px-3.5 py-2 rounded-lg border text-label-md font-label-md transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-gradient-to-r from-[#E6399B] to-[#7C3AED] text-white border-transparent font-semibold shadow-md'
                                  : 'bg-[#0E0A14] border-outline-variant/30 text-outline hover:text-on-surface hover:border-outline'
                              }`}
                              type="button"
                            >
                              {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
                              {type}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Target Monthly Budget Slider */}
                    <div className="space-y-2.5 p-unit-4 rounded-xl bg-[#0E0A14] border border-outline-variant/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider block">Maximum Budget</span>
                        </div>
                        <div className="text-right">
                          <span className="text-data-mono font-data-mono text-primary font-bold text-headline-sm">€{budget.toLocaleString()}</span>
                          <span className="text-body-sm font-body-sm text-outline block">/ month</span>
                        </div>
                      </div>
                      <div className="relative pt-2 pb-1">
                        <input 
                          className="w-full bg-surface-container rounded-full appearance-none h-1.5 focus:outline-none 
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] 
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] 
                            [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(250,74,171,0.6)] 
                            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:mt-[-8px]
                            [&::-webkit-slider-runnable-track]:w-full [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:cursor-pointer 
                            [&::-webkit-slider-runnable-track]:bg-[#2c2833] [&::-webkit-slider-runnable-track]:rounded-full" 
                          max="15000" min="300" step="50" type="range" value={budget} onChange={(e) => setBudget(Number(e.target.value))} 
                        />
                        <div className="flex justify-between text-label-sm font-label-sm text-outline pt-2 text-[10px] font-data-mono">
                          <span>€300</span>
                          <span>€15,000</span>
                        </div>
                      </div>
                    </div>

                    {/* Preferred Areas */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                          Preferred Locations in Malta
                        </label>
                        <span className="text-body-sm font-body-sm text-outline text-xs">Multi-select active</span>
                      </div>
                      <CityAutocompleteMultiSelect 
                        selectedCities={areas} 
                        onChange={setAreas} 
                      />
                    </div>

                    {/* Additional Requirements Textarea */}
                    <div className="flex flex-col gap-unit-2">
                      <div className="flex items-center justify-between">
                        <label className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">Additional Requirements</label>
                        <span className="font-body-sm text-body-sm text-outline text-xs">Optional</span>
                      </div>
                      <div className="relative">
                        <textarea value={otherDetails} onChange={(e) => setOtherDetails(e.target.value)} className="w-full bg-[#0E0A14] border border-outline-variant/40 rounded-xl px-unit-4 py-unit-3 text-on-surface font-body-md text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none transition-all resize-none placeholder:text-outline/50" rows={3}></textarea>
                      </div>
                    </div>

                  </div>
                </>
              )}

            </motion.div>
          </AnimatePresence>

        </main>

        {/* Bottom Fixed Sticky Action Bar */}
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 30 }} className="fixed bottom-0 inset-x-0 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/20 px-unit-5 py-unit-4 z-50">
          <div className="max-w-[430px] mx-auto flex items-center justify-between gap-unit-3">
            <button 
              type="button" 
              onClick={() => step > 1 ? setStep(step - 1) : window.history.back()} 
              className="flex items-center justify-center gap-1 px-unit-4 py-3 rounded-xl border border-outline-variant/40 hover:border-outline text-on-surface-variant hover:text-on-surface text-label-md font-label-md font-semibold transition-all active:scale-[0.97]"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span className="">Back</span>
            </button>
            <div className="flex-1 flex flex-col gap-2">
              {submitError && (
                <div className="text-red-400 text-xs font-medium text-center bg-red-500/10 py-1.5 rounded-lg border border-red-500/20">
                  {submitError}
                </div>
              )}
              <button 
                type="button" 
                onClick={handleContinue} 
                disabled={isSubmitting || (step === 2 && (!name || !email || !phone || !moveInDate))}
                className="w-full bg-gradient-to-br from-[#E6399B] to-[#7C3AED] shadow-[0_4px_24px_rgba(230,57,155,0.35)] text-white py-3 px-unit-5 rounded-xl font-label-md text-label-md font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span className="">{step < totalSteps ? "Continue" : "Submit Application"}</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
