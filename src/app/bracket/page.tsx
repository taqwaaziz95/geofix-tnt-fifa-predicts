"use client";

import { motion } from "framer-motion";
import BracketView from "@/components/BracketView";
import { Grid3x3, Info } from "lucide-react";

export default function BracketPage() {
  return (
    <div className="max-w-full py-6 space-y-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="font-display text-2xl font-black text-white flex items-center gap-2">
              <Grid3x3 size={22} className="text-wc-gold" />
              Tournament Bracket
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              FIFA World Cup 2026 · Knockout Stage
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-gray-500">
              <span className="w-3 h-3 rounded-sm bg-wc-gold/30 inline-block border border-wc-gold/50" />
              Winner
            </span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <span className="w-3 h-3 rounded-sm bg-white/10 inline-block border border-dashed border-white/20" />
              TBD
            </span>
          </div>
        </motion.div>

        {/* Upset alerts are now rendered inside BracketView dynamically */}
      </div>

      {/* Bracket */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="w-full"
      >
        <BracketView />
      </motion.div>

      {/* Legend */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="glass-card p-4 flex flex-wrap items-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <Info size={12} className="text-wc-blue" />
            Scroll horizontally to see full bracket
          </span>
          <span>
            R32 = Round of 32 · R16 = Round of 16 · QF = Quarter-finals · SF =
            Semi-finals
          </span>
        </div>
      </div>
    </div>
  );
}
