"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore, AVATARS } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function UserSetup({ onComplete }: { onComplete?: () => void }) {
  const setUser = useAppStore((s) => s.setUser);
  const existingUser = useAppStore((s) => s.user);

  const [name, setName] = useState(existingUser?.name || "");
  const [selectedAvatar, setSelectedAvatar] = useState(
    existingUser?.avatar || AVATARS[0],
  );
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter your name to join!");
      return;
    }
    if (trimmed.length > 30) {
      setError("Name must be under 30 characters");
      return;
    }
    setUser(trimmed, selectedAvatar);
    onComplete?.();
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 max-w-md w-full mx-auto"
    >
      <div className="text-center mb-6">
        <div className="text-5xl mb-3 trophy-float inline-block">🏆</div>
        <h2 className="font-display text-2xl font-bold text-white mb-1">
          Join the Prediction Game
        </h2>
        <p className="text-gray-400 text-sm">
          Pick your winners. Climb the leaderboard. Claim glory!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name input */}
        <div>
          <label className="text-sm font-medium text-gray-400 mb-1.5 block">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="Enter your name..."
            maxLength={30}
            className="w-full bg-white/5 border border-white/15 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-wc-gold/60 focus:bg-white/8 transition-all"
            autoFocus
          />
          {error && <p className="text-wc-red text-xs mt-1.5">{error}</p>}
        </div>

        {/* Avatar picker */}
        <div>
          <label className="text-sm font-medium text-gray-400 mb-2 block">
            Choose your icon
          </label>
          <div className="grid grid-cols-5 gap-2">
            {AVATARS.map((avatar) => (
              <button
                key={avatar}
                type="button"
                onClick={() => setSelectedAvatar(avatar)}
                className={cn(
                  "text-2xl p-3 rounded-xl transition-all duration-200 border",
                  selectedAvatar === avatar
                    ? "bg-wc-gold/20 border-wc-gold/60 scale-110"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:scale-105",
                )}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-wc-gold text-wc-navy font-display font-bold py-3.5 rounded-xl hover:bg-wc-gold-light transition-colors text-base"
        >
          Let&apos;s Go! ⚽
        </button>
      </form>
    </motion.div>
  );
}
