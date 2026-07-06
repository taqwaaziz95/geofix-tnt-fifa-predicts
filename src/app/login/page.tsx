"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { PLAYER_ROSTER } from "@/lib/auth-config";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const VALID_USERNAMES = Object.keys(PLAYER_ROSTER);

export default function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in → go home
  if (!loading && user) {
    router.replace("/");
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const trimUser = username.trim().toLowerCase();
    if (!trimUser) {
      setError("Enter your username");
      return;
    }
    if (!password) {
      setError("Enter your password");
      return;
    }

    if (!VALID_USERNAMES.includes(trimUser)) {
      setError("Username not found. Are you in the game?");
      return;
    }

    setSubmitting(true);
    try {
      await signIn(trimUser, password);
      router.replace("/");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setError("Wrong password. Try again.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Wait a bit and try again.");
      } else {
        setError("Login failed. Check your credentials.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-mesh flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="text-6xl mb-3 trophy-float inline-block">⚽</div>
        <h1 className="font-display text-3xl font-black text-white">
          WC<span className="text-wc-gold">2026</span> Predict
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Friends edition · Sign in to play
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-7 w-full max-w-sm"
      >
        <h2 className="font-display text-xl font-bold text-white mb-1">
          Welcome back
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Use your username + password to sign in
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 block uppercase tracking-wide">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="e.g. aiman"
                autoCapitalize="none"
                autoComplete="username"
                className="w-full bg-white/5 border border-white/15 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-wc-gold/60 focus:bg-white/8 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 block uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Your password"
                autoComplete="current-password"
                className="w-full bg-white/5 border border-white/15 text-white placeholder-gray-600 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-wc-gold/60 focus:bg-white/8 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-wc-red/15 border border-wc-red/30 text-wc-red text-sm px-3 py-2.5 rounded-xl"
            >
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={submitting || loading}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-display font-bold text-base transition-all duration-200",
              submitting || loading
                ? "bg-wc-gold/50 text-wc-navy/50 cursor-not-allowed"
                : "bg-wc-gold text-wc-navy hover:bg-wc-gold-light active:scale-[0.98]",
            )}
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={16} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Player list hint */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-600 text-center mb-2">
            Players in this game
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {VALID_USERNAMES.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUsername(u)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-gray-400 hover:bg-wc-gold/15 hover:text-wc-gold border border-white/10 hover:border-wc-gold/40 transition-all"
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <p className="text-gray-700 text-xs mt-6 text-center">
        Not in the game? Ask the admin to add you.
      </p>
    </div>
  );
}
