import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isPast, isFuture } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMatchDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "EEE, MMM d · HH:mm") + " UTC";
}

export function formatMatchDateWIB(dateStr: string): {
  utc: string;
  wib: string;
  date: string;
} {
  const date = parseISO(dateStr);
  const utc = format(date, "HH:mm") + " UTC";
  const wib =
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    }).format(date) + " WIB";
  const dateLabel = format(date, "EEE, MMM d");
  return { utc, wib, date: dateLabel };
}

/** Returns true when the match is within 1 hour of kickoff (or already started). */
export function isMatchLockedByTime(dateStr: string): boolean {
  const kickoff = parseISO(dateStr).getTime();
  return Date.now() >= kickoff - 60 * 60 * 1000;
}

export function formatMatchDateShort(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "MMM d");
}

export function formatMatchTime(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "HH:mm") + " UTC";
}

export function isMatchLocked(dateStr: string): boolean {
  return isPast(parseISO(dateStr));
}

export function isMatchFuture(dateStr: string): boolean {
  return isFuture(parseISO(dateStr));
}

export function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    GROUP: "Group Stage",
    R32: "Round of 32",
    R16: "Round of 16",
    QF: "Quarter-finals",
    SF: "Semi-finals",
    FINAL: "Final",
    THIRD: "3rd Place",
  };
  return labels[stage] || stage;
}

export function getStagePts(stage: string): number {
  const pts: Record<string, number> = {
    R32: 2,
    R16: 4,
    QF: 8,
    SF: 16,
    FINAL: 20,
    THIRD: 8,
  };
  return pts[stage] || 0;
}

export function getRankColor(rank: number): string {
  if (rank === 1) return "text-yellow-400";
  if (rank === 2) return "text-gray-300";
  if (rank === 3) return "text-amber-600";
  return "text-gray-500";
}

export function getRankBg(rank: number): string {
  if (rank === 1) return "bg-yellow-400/10 border-yellow-400/40";
  if (rank === 2) return "bg-gray-400/10 border-gray-400/40";
  if (rank === 3) return "bg-amber-600/10 border-amber-600/40";
  return "bg-white/5 border-white/10";
}

export function getRankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

export function generatePlayerId(): string {
  return Math.random().toString(36).substring(2, 9);
}
