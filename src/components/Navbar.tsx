"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Target,
  BarChart3,
  Grid3x3,
  Menu,
  X,
  LogOut,
  LogIn,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const PUBLIC_NAV = [
  { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { href: "/bracket", label: "Bracket", icon: Grid3x3 },
];

const AUTH_NAV = [
  { href: "/", label: "Home", icon: Trophy },
  { href: "/predict", label: "Predict", icon: Target },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { href: "/bracket", label: "Bracket", icon: Grid3x3 },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user ? AUTH_NAV : PUBLIC_NAV;

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    setMobileOpen(false);
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass-card rounded-none border-x-0 border-t-0 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          href={user ? "/" : "/leaderboard"}
          className="flex items-center gap-2 font-display font-bold text-lg"
        >
          <span className="text-2xl">⚽</span>
          <span className="text-wc-gold">GEOFIX TNT</span>
          <span className="text-white">2026</span>
          <span className="text-xs bg-wc-gold/20 text-wc-gold px-2 py-0.5 rounded-full font-semibold ml-1 hidden sm:inline">
            PREDICT
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-wc-gold text-wc-navy font-bold"
                    : "text-gray-400 hover:text-white hover:bg-white/5",
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Auth area */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="w-24 h-8 shimmer rounded-xl" />
          ) : user && profile ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl">
                <span className="text-lg">{profile.avatar}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate max-w-[100px]">
                    {profile.username}
                  </p>
                  <p className="text-xs text-wc-gold font-bold">
                    {profile.totalPoints} pts
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-wc-red transition-colors rounded-xl hover:bg-wc-red/10"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 bg-wc-gold text-wc-navy px-4 py-1.5 rounded-xl text-sm font-bold hover:bg-wc-gold-light transition-colors"
            >
              <LogIn size={14} /> Sign In
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-wc-navy-light border-b border-white/10 shadow-xl"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-wc-gold text-wc-navy font-bold"
                        : "text-gray-400 hover:text-white hover:bg-white/5",
                    )}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
              <div className="border-t border-white/10 mt-1 pt-2">
                {user && profile ? (
                  <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span>{profile.avatar}</span>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {profile.username}
                        </p>
                        <p className="text-xs text-wc-gold">
                          {profile.totalPoints} pts
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="text-gray-500 hover:text-wc-red transition-colors p-1"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-wc-gold font-bold text-sm"
                  >
                    <LogIn size={16} /> Sign In to Predict
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
