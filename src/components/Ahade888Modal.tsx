"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const QUOTES = [
  "Kakanda ingin maju? apalagi di bidang GEOS 🧠",
  "Jangan cuma bisa nebak bola, nebak karir juga dong! 💼",
  "Odds-nya bagus nih: 1 klik = masa depan cerah ✨",
  "Prediksi kamu bagus di sini, tapi prediksi karir di luar sana! 📈",
];

const SESSION_KEY = "ahade888_shown";

export default function Ahade888Modal() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [quote] = useState(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
  );
  const [prevUser, setPrevUser] = useState<string | null>(null);

  useEffect(() => {
    // Trigger only when user transitions from logged-out → logged-in
    const currentId = user?.uid ?? null;
    if (currentId && !prevUser) {
      try {
        const shown = sessionStorage.getItem(SESSION_KEY);
        if (!shown) {
          sessionStorage.setItem(SESSION_KEY, "1");
          // Small delay for dramatic effect
          setTimeout(() => setVisible(true), 800);
        }
      } catch {
        // ignore
      }
    }
    setPrevUser(currentId);
  }, [user, prevUser]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(6px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -8, y: 60 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -40 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="relative max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background:
                "linear-gradient(135deg, #0a0a0a 0%, #1a0000 40%, #0a0014 100%)",
              border: "2px solid #cc0000",
              boxShadow:
                "0 0 40px rgba(204,0,0,0.5), 0 0 80px rgba(245,184,0,0.15)",
            }}
          >
            {/* Animated top bar */}
            <div
              className="h-1.5 w-full"
              style={{
                background:
                  "linear-gradient(90deg, #cc0000, #ff6600, #ffcc00, #ff6600, #cc0000)",
                backgroundSize: "200% 100%",
                animation: "shimmer 2s linear infinite",
              }}
            />

            {/* Header */}
            <div className="pt-5 pb-3 px-5 text-center border-b border-red-900/40">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl">🎰</span>
                <h2
                  className="text-3xl font-black tracking-widest"
                  style={{
                    fontFamily: "Impact, Arial Black, sans-serif",
                    background:
                      "linear-gradient(180deg, #ffdd00 0%, #ff6600 60%, #cc0000 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textShadow: "none",
                    filter: "drop-shadow(0 0 8px rgba(255,180,0,0.6))",
                  }}
                >
                  AHADE888
                </h2>
                <span className="text-2xl">🎰</span>
              </div>
              <p
                className="text-xs tracking-[0.3em] font-bold uppercase"
                style={{ color: "#cc4400" }}
              >
                .COM
              </p>

              {/* Blinking lights */}
              <div className="flex justify-center gap-1.5 mt-2">
                {["🔴", "🟡", "🟢", "🟡", "🔴"].map((dot, i) => (
                  <span
                    key={i}
                    className="text-[8px]"
                    style={{
                      animation: `blink ${0.5 + i * 0.15}s ease-in-out infinite alternate`,
                    }}
                  >
                    {dot}
                  </span>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 text-center space-y-4">
              {/* Trophy row */}
              <div className="flex justify-center gap-3 text-3xl">
                <span style={{ animation: "spin 3s linear infinite" }}>⭐</span>
                <span>🏆</span>
                <span style={{ animation: "spin 3s linear infinite reverse" }}>
                  ⭐
                </span>
              </div>

              {/* Quote */}
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  background: "rgba(255,100,0,0.08)",
                  border: "1px solid rgba(204,0,0,0.3)",
                }}
              >
                <p className="text-white font-semibold text-sm leading-relaxed">
                  {quote}
                </p>
              </div>

              {/* Fake odds / stats row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "WIN RATE", value: "69%", color: "#22c55e" },
                  { label: "ODDS", value: "8.88", color: "#ffcc00" },
                  { label: "JACKPOT", value: "∞", color: "#cc0000" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg p-2"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <p className="text-[10px] text-gray-500 font-medium tracking-wide">
                      {s.label}
                    </p>
                    <p
                      className="font-black text-lg"
                      style={{ color: s.color, fontFamily: "monospace" }}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <a
                href="https://geonest-software.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 rounded-xl font-black text-base uppercase tracking-widest transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background:
                    "linear-gradient(135deg, #cc0000 0%, #ff4400 50%, #cc0000 100%)",
                  color: "#fff",
                  boxShadow: "0 4px 20px rgba(204,0,0,0.5)",
                  fontFamily: "Impact, Arial Black, sans-serif",
                  letterSpacing: "0.15em",
                }}
              >
                ⛔ JANGAN KLIK ⛔
              </a>

              <p
                className="text-[10px] text-center"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                * ini bukan judi, ini masa depan mu *
              </p>
            </div>

            {/* Dismiss */}
            <div className="px-6 pb-5 pt-1">
              <button
                onClick={() => setVisible(false)}
                className="w-full py-2 rounded-lg text-xs text-gray-600 hover:text-gray-400 transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}
              >
                Tidak, Saya Takut 😭
              </button>
            </div>

            {/* Animated bottom bar */}
            <div
              className="h-1 w-full"
              style={{
                background:
                  "linear-gradient(90deg, #ffcc00, #ff6600, #cc0000, #ff6600, #ffcc00)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s linear infinite reverse",
              }}
            />
          </motion.div>

          {/* Floating chips */}
          {["🎲", "🃏", "💰", "🎯", "🎰"].map((emoji, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 100 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [100, -20 - i * 30],
                x: [(i - 2) * 60, (i - 2) * 80],
              }}
              transition={{ duration: 2.5, delay: i * 0.3, ease: "easeOut" }}
              className="absolute text-2xl pointer-events-none"
              style={{ left: "50%", bottom: "20%" }}
            >
              {emoji}
            </motion.div>
          ))}
        </motion.div>
      )}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes blink {
          from { opacity: 0.3; transform: scale(0.8); }
          to   { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </AnimatePresence>
  );
}
