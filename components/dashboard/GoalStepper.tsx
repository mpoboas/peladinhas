"use client";

import { motion } from "framer-motion";

export function GoalStepper({
  name,
  value,
  onChange,
}: {
  name: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <motion.button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-navy-light text-lg font-bold text-text-secondary transition-colors duration-200 hover:border-gold/50 hover:text-gold"
        aria-label="Diminuir"
      >
        −
      </motion.button>
      <input type="hidden" name={name} value={value} />
      <motion.span
        key={value}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="w-8 text-center font-display text-3xl font-bold tabular-nums text-white"
      >
        {value}
      </motion.span>
      <motion.button
        type="button"
        onClick={() => onChange(value + 1)}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-navy-light text-lg font-bold text-text-secondary transition-colors duration-200 hover:border-gold/50 hover:text-gold"
        aria-label="Aumentar"
      >
        +
      </motion.button>
    </div>
  );
}
