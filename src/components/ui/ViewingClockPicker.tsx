"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ViewingClockPickerProps {
  value: string; // 24h time "HH:MM", e.g. "11:00" or "14:30"
  onChange: (time: string) => void;
}

function parse24to12(time24: string) {
  const [hStr, mStr] = (time24 || "11:00").split(":");
  let h = parseInt(hStr || "11", 10);
  const m = parseInt(mStr || "00", 10);
  const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return { hour12: h, minutes: m, period };
}

function format12to24(hour12: number, minutes: number, period: "AM" | "PM"): string {
  let h = hour12;
  if (period === "AM") {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return `${String(h).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

const QUICK_TIMES = [
  { label: "09:30", h: 9, m: 30, p: "AM" as const },
  { label: "11:00", h: 11, m: 0, p: "AM" as const },
  { label: "14:00", h: 2, m: 0, p: "PM" as const },
  { label: "16:30", h: 4, m: 30, p: "PM" as const },
  { label: "18:00", h: 6, m: 0, p: "PM" as const },
];

export function ViewingClockPicker({ value, onChange }: ViewingClockPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"hours" | "minutes">("hours");
  const ref = useRef<HTMLDivElement>(null);

  const { hour12, minutes, period } = parse24to12(value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHourSelect = (selectedH: number) => {
    const new24 = format12to24(selectedH, minutes, period);
    onChange(new24);
    // Smooth transition to minutes mode
    setTimeout(() => {
      setMode("minutes");
    }, 220);
  };

  const handleMinuteSelect = (selectedM: number) => {
    const new24 = format12to24(hour12, selectedM, period);
    onChange(new24);
  };

  const handlePeriodToggle = (newPeriod: "AM" | "PM") => {
    if (newPeriod === period) return;
    const new24 = format12to24(hour12, minutes, newPeriod);
    onChange(new24);
  };

  // Clock dial geometry
  const radius = 76; // px radius from center

  // Angle for hand rotation
  const handAngle =
    mode === "hours"
      ? (hour12 % 12) * 30
      : minutes * 6;

  // 12 points for hours (1-12) or minutes (0-55 step 5)
  const clockNodes = Array.from({ length: 12 }).map((_, i) => {
    const angleDeg = i * 30;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = Math.round(radius * Math.sin(angleRad));
    const y = Math.round(-radius * Math.cos(angleRad));

    const hourVal = i === 0 ? 12 : i;
    const minuteVal = i * 5;

    return {
      index: i,
      x,
      y,
      hourVal,
      minuteVal,
      angleDeg,
    };
  });

  const formattedDisplay = `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;

  return (
    <div className="relative w-full" ref={ref}>
      <label className="block text-label-sm font-label-sm text-outline uppercase tracking-wider mb-1.5">
        Viewing Time (Clock) *
      </label>

      {/* Trigger Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#0E0A14] border border-white/[0.1] rounded-xl px-4 py-2.5 text-on-surface font-body-md text-body-md flex justify-between items-center cursor-pointer transition-all duration-150 hover:border-primary-container h-11 select-none"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[19px] text-primary">
            schedule
          </span>
          <span className="font-data-mono text-sm font-semibold text-white tracking-wide">
            {formattedDisplay}
          </span>
          <span className="text-[11px] font-data-mono text-outline">
            ({value})
          </span>
        </div>
        <span className="material-symbols-outlined text-[18px] text-outline">
          expand_more
        </span>
      </div>

      {/* Clock Popover Dial */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 sm:right-0 left-auto w-[310px] p-4 rounded-2xl bg-[#1A1523] border border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.85)] z-50 overflow-hidden"
          >
            {/* Header: Digital Readout & AM/PM Selector */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-2">
              <div className="flex items-center gap-1.5 font-data-mono">
                {/* Hours Button */}
                <button
                  type="button"
                  onClick={() => setMode("hours")}
                  className={`px-2.5 py-1 rounded-lg text-xl font-bold transition-all ${
                    mode === "hours"
                      ? "bg-primary-container text-white shadow-[0_0_10px_rgba(250,74,171,0.4)]"
                      : "bg-[#0E0A14] text-outline hover:text-white border border-white/[0.08]"
                  }`}
                >
                  {String(hour12).padStart(2, "0")}
                </button>

                <span className="text-xl font-bold text-outline animate-pulse">
                  :
                </span>

                {/* Minutes Button */}
                <button
                  type="button"
                  onClick={() => setMode("minutes")}
                  className={`px-2.5 py-1 rounded-lg text-xl font-bold transition-all ${
                    mode === "minutes"
                      ? "bg-primary-container text-white shadow-[0_0_10px_rgba(250,74,171,0.4)]"
                      : "bg-[#0E0A14] text-outline hover:text-white border border-white/[0.08]"
                  }`}
                >
                  {String(minutes).padStart(2, "0")}
                </button>
              </div>

              {/* AM / PM Segmented Pills */}
              <div className="flex items-center bg-[#0E0A14] p-0.5 rounded-lg border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => handlePeriodToggle("AM")}
                  className={`px-2.5 py-1 text-xs font-bold font-data-mono rounded-md transition-all ${
                    period === "AM"
                      ? "bg-primary-container text-white shadow-sm"
                      : "text-outline hover:text-white"
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodToggle("PM")}
                  className={`px-2.5 py-1 text-xs font-bold font-data-mono rounded-md transition-all ${
                    period === "PM"
                      ? "bg-primary-container text-white shadow-sm"
                      : "text-outline hover:text-white"
                  }`}
                >
                  PM
                </button>
              </div>
            </div>

            {/* Mode Guide Caption */}
            <div className="text-center mb-1">
              <span className="text-[11px] font-label-md uppercase tracking-wider text-outline">
                {mode === "hours" ? "Select Hour (1 - 12)" : "Select Minute (00 - 55)"}
              </span>
            </div>

            {/* Analog Clock Face */}
            <div className="relative w-56 h-56 mx-auto rounded-full bg-[#0E0A14] border border-white/[0.08] shadow-[inset_0_2px_14px_rgba(0,0,0,0.95)] my-2 select-none flex items-center justify-center">
              {/* Subtle perimeter ticks */}
              <div className="absolute inset-2 rounded-full border border-white/[0.03] pointer-events-none" />

              {/* Center Pivot Point */}
              <div className="absolute w-3.5 h-3.5 rounded-full bg-primary-container shadow-[0_0_10px_#fa4aab] z-20 pointer-events-none" />

              {/* Animated Clock Hand */}
              <div
                className="absolute z-10 pointer-events-none transition-transform duration-300 ease-out"
                style={{
                  width: "2px",
                  height: `${radius}px`,
                  bottom: "50%",
                  left: "calc(50% - 1px)",
                  transformOrigin: "bottom center",
                  transform: `rotate(${handAngle}deg)`,
                }}
              >
                {/* Hand Stem Line */}
                <div className="w-full h-full bg-gradient-to-t from-primary-container/20 via-primary-container/70 to-primary-container" />

                {/* Hand Tip Highlight Node */}
                <div className="absolute -top-3.5 -left-[13px] w-7 h-7 rounded-full bg-primary-container text-white text-[11px] font-bold font-data-mono flex items-center justify-center shadow-[0_0_14px_rgba(250,74,171,0.85)] ring-2 ring-primary-container/40">
                  {mode === "hours" ? hour12 : String(minutes).padStart(2, "0")}
                </div>
              </div>

              {/* Clock Number Nodes */}
              {clockNodes.map((node) => {
                const isSelected =
                  mode === "hours"
                    ? hour12 === node.hourVal
                    : Math.abs(minutes - node.minuteVal) < 3;

                return (
                  <button
                    key={node.index}
                    type="button"
                    onClick={() => {
                      if (mode === "hours") {
                        handleHourSelect(node.hourVal);
                      } else {
                        handleMinuteSelect(node.minuteVal);
                      }
                    }}
                    style={{
                      left: `calc(50% + ${node.x}px)`,
                      top: `calc(50% + ${node.y}px)`,
                      transform: "translate(-50%, -50%)",
                    }}
                    className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-xs font-data-mono transition-all z-15 cursor-pointer ${
                      isSelected
                        ? "opacity-0 pointer-events-none" // Covered by hand tip
                        : "text-on-surface hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    {mode === "hours"
                      ? node.hourVal
                      : String(node.minuteVal).padStart(2, "0")}
                  </button>
                );
              })}
            </div>

            {/* Quick Common Viewing Presets */}
            <div className="pt-2 border-t border-white/[0.08]">
              <span className="block text-[10px] font-label-sm text-outline uppercase tracking-wider mb-1.5 text-center">
                Quick Slots
              </span>
              <div className="flex items-center justify-between gap-1">
                {QUICK_TIMES.map((qt) => {
                  const isCurrent =
                    hour12 === qt.h && minutes === qt.m && period === qt.p;
                  return (
                    <button
                      key={qt.label}
                      type="button"
                      onClick={() => {
                        const new24 = format12to24(qt.h, qt.m, qt.p);
                        onChange(new24);
                      }}
                      className={`px-2 py-1 rounded-md text-[11px] font-data-mono transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-primary-container text-white font-bold shadow-sm"
                          : "bg-[#0E0A14] text-outline hover:text-white hover:bg-surface-container border border-white/[0.06]"
                      }`}
                    >
                      {qt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Close / Confirm Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-3 w-full h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-white text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">check</span>
              Set Time ({formattedDisplay})
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
