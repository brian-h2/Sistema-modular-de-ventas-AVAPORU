import React, { useRef, useState, useEffect } from "react";
import { Calendar, X } from "lucide-react";

interface DateInputDDMMYYYYProps {
  value: string; // YYYY-MM-DD format
  onChange: (isoDate: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  disabled?: boolean;
}

export function DateInputDDMMYYYY({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  className = "",
  label,
  disabled = false,
}: DateInputDDMMYYYYProps) {
  // Convierte YYYY-MM-DD a DD/MM/YYYY
  const formatToDisplay = (iso: string): string => {
    if (!iso) return "";
    const parts = iso.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }
    return "";
  };

  const [displayText, setDisplayText] = useState<string>(formatToDisplay(value));
  const hiddenDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayText(formatToDisplay(value));
  }, [value]);

  // Manejar tipeo manual con auto-formato DD/MM/YYYY
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^\d/]/g, "");

    // Si escribe solo números (ej 23082026), auto-insertar barras
    const digitsOnly = raw.replace(/\//g, "");
    if (digitsOnly.length > 2 && !raw.includes("/")) {
      if (digitsOnly.length <= 4) {
        raw = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
      } else {
        raw = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4, 8)}`;
      }
    }

    setDisplayText(raw);

    // Validar si es DD/MM/YYYY completo
    const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const [, d, m, y] = match;
      const day = parseInt(d, 10);
      const month = parseInt(m, 10);
      const year = parseInt(y, 10);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= 2100) {
        const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        onChange(iso);
      }
    } else if (raw === "") {
      onChange("");
    }
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // YYYY-MM-DD
    onChange(val);
    setDisplayText(formatToDisplay(val));
  };

  const openCalendarPicker = () => {
    if (hiddenDateRef.current && typeof hiddenDateRef.current.showPicker === "function") {
      try {
        hiddenDateRef.current.showPicker();
      } catch {
        hiddenDateRef.current.focus();
      }
    } else if (hiddenDateRef.current) {
      hiddenDateRef.current.focus();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setDisplayText("");
  };

  return (
    <div className={`relative flex flex-col ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          type="text"
          value={displayText}
          onChange={handleTextChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={10}
          className="w-full pl-3 pr-16 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-xs"
        />

        {/* Input invisible de tipo date para invocar el selector del calendario */}
        <input
          type="date"
          ref={hiddenDateRef}
          value={value || ""}
          onChange={handleNativeDateChange}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />

        {/* Botones de acción derecha */}
        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
              title="Borrar fecha"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={openCalendarPicker}
            disabled={disabled}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
            title="Abrir calendario"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DateInputDDMMYYYY;
