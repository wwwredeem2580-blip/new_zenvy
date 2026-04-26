"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface DateDropdownFieldProps {
  label: string;
  icon?: React.ReactNode;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  required?: boolean;
  disableFuture?: boolean;
  disablePast?: boolean;
}

export default function DateDropdownField({ 
  label, 
  icon, 
  value, 
  onChange, 
  required,
  disableFuture,
  disablePast
}: DateDropdownFieldProps) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (value) {
      const [vYear, vMonth, vDay] = value.split("-");
      setYear(vYear || "");
      setMonth(vMonth || "");
      setDay(vDay || "");
    }
  }, [value]);

  const validateAndChange = (d: string, m: string, y: string) => {
    setError("");
    if (!d || !m || !y) {
      onChange("");
      return;
    }

    const selectedDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (disableFuture && selectedDate > today) {
      setError("Date cannot be in the future");
      onChange("");
      return;
    }

    if (disablePast && selectedDate < today) {
      setError("Date cannot be in the past");
      onChange("");
      return;
    }

    onChange(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
  };

  const getDaysInMonth = (m: string, y: string) => {
    if (!m || !y) return 31;
    return new Date(parseInt(y), parseInt(m), 0).getDate();
  };

  const daysCount = getDaysInMonth(month, year);
  const days = Array.from({ length: daysCount }, (_, i) => i + 1);
  
  const months = [
    { name: "January", value: "01" },
    { name: "February", value: "02" },
    { name: "March", value: "03" },
    { name: "April", value: "04" },
    { name: "May", value: "05" },
    { name: "June", value: "06" },
    { name: "July", value: "07" },
    { name: "August", value: "08" },
    { name: "September", value: "09" },
    { name: "October", value: "10" },
    { name: "November", value: "11" },
    { name: "December", value: "12" },
  ];
  
  const currentYear = new Date().getFullYear();
  let yearsList: number[] = [];
  
  if (disableFuture) {
    yearsList = Array.from({ length: 110 }, (_, i) => currentYear - i);
  } else if (disablePast) {
    yearsList = Array.from({ length: 30 }, (_, i) => currentYear + i);
  } else {
    yearsList = [
      ...Array.from({ length: 20 }, (_, i) => currentYear + 20 - i),
      ...Array.from({ length: 100 }, (_, i) => currentYear - i)
    ];
    // Remove duplicates and sort
    yearsList = Array.from(new Set(yearsList)).sort((a, b) => b - a);
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-2">
          {icon} {label} {required && "*"}
        </label>
        {error && (
          <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter animate-pulse">
            {error}
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {/* Year */}
        <div className="relative">
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              validateAndChange(day, month, e.target.value);
            }}
            className={`w-full bg-surface border rounded-xl px-3 py-3 text-[10px] font-bold appearance-none focus:outline-none transition-all text-text ${error ? 'border-red-500/50' : 'border-border focus:border-text/30'}`}
          >
            <option value="">Year</option>
            {yearsList.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
        </div>

        {/* Month */}
        <div className="relative">
          <select
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              validateAndChange(day, e.target.value, year);
            }}
            className={`w-full bg-surface border rounded-xl px-3 py-3 text-[10px] font-bold appearance-none focus:outline-none transition-all text-text ${error ? 'border-red-500/50' : 'border-border focus:border-text/30'}`}
          >
            <option value="">Month</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.name}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
        </div>

        {/* Day */}
        <div className="relative">
          <select
            value={day}
            onChange={(e) => {
              const d = e.target.value;
              setDay(d);
              validateAndChange(d, month, year);
            }}
            className={`w-full bg-surface border rounded-xl px-3 py-3 text-[10px] font-bold appearance-none focus:outline-none transition-all text-text ${error ? 'border-red-500/50' : 'border-border focus:border-text/30'}`}
          >
            <option value="">Day</option>
            {days.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
        </div>
      </div>
    </div>
  );
}
