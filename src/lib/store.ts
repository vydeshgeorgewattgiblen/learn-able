import { useEffect, useState } from "react";

export type Disability = "none" | "blind" | "deaf" | "learning";

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
  root.classList.remove("a11y-high-contrast", "a11y-simple", "a11y-captions", "a11y-tts");
  if (!user) return;
  if (user.disability === "blind") {
    root.classList.add("a11y-high-contrast", "a11y-tts");
  }
  if (user.disability === "deaf") {
    root.classList.add("a11y-captions");
  }
  if (user.disability === "learning") {
    root.classList.add("a11y-simple");
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

export const COURSES = [
  {
    id: "math-basics",
    title: "Math Basics",
    lessons: 20,
    icon: "math",
    youtube: "NybHckSEQBI",
    quiz: {
      topic: "Math Basics",
      questions: [
        { question: "What is 12 × 8?", options: ["86", "96", "108", "112"], correct_answer: "96" },
        { question: "Square root of 144?", options: ["10", "11", "12", "13"], correct_answer: "12" },
        { question: "Value of π (approx)?", options: ["3.14", "2.71", "1.61", "4.20"], correct_answer: "3.14" },
        { question: "If 2x = 10, x = ?", options: ["2", "5", "10", "20"], correct_answer: "5" },
      ],
    },
  },
  {
    id: "biology-intro",
    title: "Biology Intro",
    lessons: 18,
    icon: "science",
    youtube: "QnQe0xW_JY4",
    quiz: {
      topic: "Biology Intro",
      questions: [
        { question: "Powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Vacuole"], correct_answer: "Mitochondria" },
        { question: "Plants make food via?", options: ["Respiration", "Digestion", "Photosynthesis", "Excretion"], correct_answer: "Photosynthesis" },
        { question: "DNA is found in?", options: ["Cytoplasm", "Cell wall", "Nucleus", "Membrane"], correct_answer: "Nucleus" },
        { question: "Humans have how many chromosomes?", options: ["23", "44", "46", "48"], correct_answer: "46" },
      ],
    },
  },
  {
    id: "chemistry-reactions",
    title: "Chemistry Reactions",
    lessons: 16,
    icon: "science",
    youtube: "8m6FbFGNlAg",
    quiz: {
      topic: "Chemistry Reactions",
      questions: [
        { question: "pH of pure water?", options: ["1", "7", "10", "14"], correct_answer: "7" },
        { question: "Chemical formula of salt?", options: ["NaCl", "KCl", "HCl", "CaCl"], correct_answer: "NaCl" },
        { question: "Rusting is a?", options: ["Physical change", "Chemical change", "Nuclear change", "None"], correct_answer: "Chemical change" },
        { question: "Symbol for Gold?", options: ["Go", "Gd", "Au", "Ag"], correct_answer: "Au" },
      ],
    },
  },
  {
    id: "english-grammar",
    title: "English Grammar",
    lessons: 14,
    icon: "english",
    youtube: "dGcsHMXbSOA",
    quiz: {
      topic: "English Grammar",
      questions: [
        { question: "Plural of 'child'?", options: ["childs", "children", "childes", "child"], correct_answer: "children" },
        { question: "Past tense of 'go'?", options: ["goed", "gone", "went", "going"], correct_answer: "went" },
        { question: "Synonym of 'happy'?", options: ["sad", "joyful", "angry", "tired"], correct_answer: "joyful" },
        { question: "Article before 'hour'?", options: ["a", "an", "the", "no article"], correct_answer: "an" },
      ],
    },
  },
] as const;

export type Course = (typeof COURSES)[number];
export const findCourse = (id: string) => COURSES.find((c) => c.id === id);