"use client";

import { useId, useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";

export function LocationAutocomplete({
  name = "location",
  locations,
  defaultValue = "",
  required,
  placeholder,
}: {
  name?: string;
  locations: string[];
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const listId = useId();

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((loc) => loc.toLowerCase().includes(q));
  }, [locations, value]);

  const showList = open && filtered.length > 0;

  function select(loc: string) {
    setValue(loc);
    setOpen(false);
  }

  return (
    <div className="relative">
      <Input
        name={name}
        required={required}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={(e) => {
          if (!showList) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, filtered.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter" && filtered[highlight]) {
            e.preventDefault();
            select(filtered[highlight]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
      />

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-white/15 bg-navy-light py-1 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
        >
          {filtered.map((loc, i) => (
            <li key={loc} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={i === highlight}
                className={`w-full px-4 py-2.5 text-left text-base transition ${
                  i === highlight
                    ? "bg-gold/15 text-gold"
                    : "text-text-primary hover:bg-surface"
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(loc)}
              >
                {loc}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
