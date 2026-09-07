"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ViewingCalendarPickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (date: string) => void;
  minDate?: string; // e.g. today's date "YYYY-MM-DD"
}

export function ViewingCalendarPicker({
  value,
  onChange,
  minDate,
}: ViewingCalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value) : new Date()
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const handleDateClick = (day: number) => {
    const d = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    const dateStr = d.toISOString().split("T")[0];
    onChange(dateStr);
    setIsOpen(false);
  };

  const isDateDisabled = (day: number) => {
    if (!minDate) return false;
    const d = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    const dateStr = d.toISOString().split("T")[0];
    return dateStr < minDate;
  };

  const formattedDisplay = value
    ? new Date(value + "T12:00:00").toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Select viewing date...";

  return (
    <div className="relative w-full" ref={ref}>
      <label className="block text-label-sm font-label-sm text-outline uppercase tracking-wider mb-1.5">
        Viewing Date *
      </label>

      {/* Trigger Box matching client wizard */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#0E0A14] border border-white/[0.1] rounded-xl px-4 py-2.5 text-on-surface font-body-md text-body-md flex justify-between items-center cursor-pointer transition-all duration-150 hover:border-primary-container h-11 select-none"
      >
        <span
          className={`font-data-mono text-sm ${
            value ? "text-white font-medium" : "text-outline/60"
          }`}
        >
          {formattedDisplay}
        </span>
        <span className="material-symbols-outlined text-[20px] text-primary pointer-events-none">
          calendar_month
        </span>
      </div>

      {/* Calendar Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 w-[290px] sm:w-[310px] p-4 rounded-2xl bg-[#1A1523] border border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.85)] z-50 overflow-hidden"
          >
            {/* Month Navigation */}
            <div className="flex justify-between items-center mb-3.5 border-b border-white/[0.08] pb-3">
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                      1
                    )
                  )
                }
                className="p-1 hover:text-primary transition-colors text-outline hover:bg-surface-container rounded-lg flex items-center justify-center cursor-pointer"
                type="button"
                aria-label="Previous month"
              >
                <span className="material-symbols-outlined text-[20px]">
                  chevron_left
                </span>
              </button>

              <span className="font-label-md font-bold text-white text-sm">
                {currentMonth.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </span>

              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                      1
                    )
                  )
                }
                className="p-1 hover:text-primary transition-colors text-outline hover:bg-surface-container rounded-lg flex items-center justify-center cursor-pointer"
                type="button"
                aria-label="Next month"
              >
                <span className="material-symbols-outlined text-[20px]">
                  chevron_right
                </span>
              </button>
            </div>

            {/* Day Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <span
                  key={d}
                  className="text-[11px] uppercase font-bold text-outline font-data-mono"
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Day Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const d = new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  day
                );
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                const dateStr = d.toISOString().split("T")[0];
                const isSelected = value === dateStr;
                const disabled = isDateDisabled(day);

                return (
                  <button
                    key={day}
                    disabled={disabled}
                    onClick={() => handleDateClick(day)}
                    className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-data-mono font-medium transition-all ${
                      isSelected
                        ? "bg-primary-container text-white font-bold shadow-[0_0_12px_rgba(250,74,171,0.5)] ring-2 ring-primary-container/40"
                        : disabled
                        ? "text-outline/30 cursor-not-allowed"
                        : "text-on-surface hover:text-white hover:bg-surface-container-high cursor-pointer"
                    }`}
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
