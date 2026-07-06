"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Match } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { getStagePts, cn } from "@/lib/utils";
import { X, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface PredictionModalProps {
  match: Match;
  onClose: () => void;
}

export default function PredictionModal({
  match,
  onClose,
}: PredictionModalProps) {
  const { predict, predictions } = useAuth();
  const existing = predictions[match.id];
  const [selected, setSelected] = useState<string>(existing?.winner || "");
  const [saving, setSaving] = useState(false);
  const pts = getStagePts(match.stage);

  async function handleSave() {
    if (!selected) {
      toast.error("Pick a winner first!");
      return;
    }
    setSaving(true);
    try {
      await predict(match.id, selected);
      toast.success(`Prediction saved! +${pts} pts if correct 🎯`);
      onClose();
    } catch {
      toast.error("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const choices = [
    { team: match.homeTeam, value: match.homeTeam.name },
    { team: match.awayTeam, value: match.awayTeam.name },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass-card p-6 max-w-sm w-full relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          <h3 className="font-display text-lg font-bold text-white mb-1">
            {match.label} Prediction
          </h3>
          <p className="text-xs text-gray-500 mb-5">
            Correct pick ={" "}
            <span className="text-wc-gold font-bold">+{pts} points</span>
          </p>

          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="text-center">
              <div className="text-4xl mb-1">{match.homeTeam.flag}</div>
              <p className="text-xs font-semibold text-gray-300">
                {match.homeTeam.code}
              </p>
            </div>
            <span className="text-gray-600 font-bold font-display text-xl">
              VS
            </span>
            <div className="text-center">
              <div className="text-4xl mb-1">{match.awayTeam.flag}</div>
              <p className="text-xs font-semibold text-gray-300">
                {match.awayTeam.code}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-5">
            <p className="text-xs text-gray-500 font-medium text-center mb-1">
              Who advances?
            </p>
            {choices.map(({ team, value }) => (
              <button
                key={value}
                onClick={() => setSelected(value)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left",
                  selected === value
                    ? "bg-wc-gold/15 border-wc-gold/60 text-white"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20",
                )}
              >
                <span className="text-2xl">{team.flag}</span>
                <span className="flex-1 font-medium text-sm">{team.name}</span>
                {selected === value && (
                  <CheckCircle2
                    size={16}
                    className="text-wc-gold flex-shrink-0"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/15 text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!selected || saving}
              className={cn(
                "flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-200",
                selected && !saving
                  ? "bg-wc-gold text-wc-navy hover:bg-wc-gold-light"
                  : "bg-white/10 text-gray-600 cursor-not-allowed",
              )}
            >
              {saving ? "Saving..." : "Save Prediction"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
