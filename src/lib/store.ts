import { useEffect, useState } from "react";

export type Disability = "none" | "blind" | "deaf";

export interface UserState {
  name: string;
  disability: Disability;
}

export interface Badge {
  badge_name: string;
  topic: string;
}

const USER_KEY = "learnable.user";
const BADGES_KEY = "learnable.badges";
const SCORES_KEY = "learnable.scores";

export function getUser(): UserState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserState) : null;
  } catch {
    return null;
  }
}

export function setUser(user: UserState) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("learnable:user"));
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("learnable:user"));
}

export function useUser() {
  const [user, setU] = useState<UserState | null>(null);
  useEffect(() => {
    setU(getUser());
    const fn = () => setU(getUser());
    window.addEventListener("learnable:user", fn);
    return () => window.removeEventListener("learnable:user", fn);
  }, []);
  return user;
}

export function getBadges(): Badge[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BADGES_KEY);
    return raw ? (JSON.parse(raw) as Badge[]) : [];
  } catch {
    return [];
  }
}

export function awardBadge(b: Badge) {
  const list = getBadges();
  if (!list.find((x) => x.topic === b.topic)) {
    list.push(b);
    localStorage.setItem(BADGES_KEY, JSON.stringify(list));
  }
}

export function getScores(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveScore(topic: string, pct: number) {
  const s = getScores();
  s[topic] = Math.max(s[topic] ?? 0, pct);
  localStorage.setItem(SCORES_KEY, JSON.stringify(s));
}

/** Theme engine — applyTheme based on disability */
export function applyTheme(user: UserState | null) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("a11y-high-contrast", "a11y-captions", "a11y-tts");
  if (!user) return;
  if (user.disability === "blind") {
    root.classList.add("a11y-high-contrast", "a11y-tts");
  }
  if (user.disability === "deaf") {
    root.classList.add("a11y-captions");
  }
}

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  } catch {
    // ignore
  }
}

// Course/playlist data lives in src/lib/content.ts