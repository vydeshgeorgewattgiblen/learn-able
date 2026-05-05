// Subjects → Playlists → 10 videos each. Plus per-playlist quiz.

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtube: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
}

export interface Playlist {
  id: string;
  subjectId: SubjectId;
  title: string;
  description: string;
  videos: VideoItem[];
  quiz: QuizQuestion[];
}

export type SubjectId = "math" | "biology" | "chemistry";

export interface Subject {
  id: SubjectId;
  title: string;
  tagline: string;
  icon: "math" | "science" | "english";
  playlists: Playlist[];
}

// Pool of real working YouTube IDs (educational content). Rotate across videos.
const YT_POOL = [
  "NybHckSEQBI",
  "QnQe0xW_JY4",
  "8m6FbFGNlAg",
  "dGcsHMXbSOA",
  "WUvTyaaNkzM",
  "NHeJxnXIODw",
  "l-g-D6yQwYE",
  "M7lc1UVf-VE",
  "JGwWNGJdvx8",
  "kffacxfA7G4",
];

function makeVideos(prefix: string, baseTitle: string): VideoItem[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `${prefix}-v${i + 1}`,
    title: `${baseTitle} — Lesson ${i + 1}`,
    description: `Lesson ${i + 1} of ${baseTitle}. Core concepts explained step by step for Class 10 students.`,
    youtube: YT_POOL[(i + prefix.length) % YT_POOL.length],
  }));
}

function genericQuiz(topic: string): QuizQuestion[] {
  return [
    {
      question: `Which best describes ${topic}?`,
      options: ["A core Class 10 topic", "An unrelated subject", "An optional extra", "Pre-school content"],
      correct_answer: "A core Class 10 topic",
    },
    {
      question: `What is the recommended way to study ${topic}?`,
      options: ["Skip videos", "Watch lessons in order", "Only read titles", "Memorise nothing"],
      correct_answer: "Watch lessons in order",
    },
    {
      question: `How many videos are in this ${topic} playlist?`,
      options: ["5", "8", "10", "12"],
      correct_answer: "10",
    },
    {
      question: `What unlocks a ${topic} badge?`,
      options: ["50%", "60%", "70%", "75% or more"],
      correct_answer: "75% or more",
    },
  ];
}

function pl(
  subjectId: SubjectId,
  id: string,
  title: string,
  description: string,
  customQuiz?: QuizQuestion[],
): Playlist {
  return {
    id,
    subjectId,
    title,
    description,
    videos: makeVideos(id, title),
    quiz: customQuiz ?? genericQuiz(title),
  };
}

export const SUBJECTS: Subject[] = [
  {
    id: "math",
    title: "Mathematics",
    tagline: "Algebra to geometry, made clear.",
    icon: "math",
    playlists: [
      pl("math", "math-algebra", "Algebra", "Variables, expressions, identities and equations.", [
        { question: "If 2x = 10, x = ?", options: ["2", "5", "10", "20"], correct_answer: "5" },
        { question: "Simplify (a+b)²", options: ["a²+b²", "a²+2ab+b²", "a²-b²", "2ab"], correct_answer: "a²+2ab+b²" },
        { question: "Factor x² - 9", options: ["(x-3)(x+3)", "(x-9)(x+1)", "(x-3)²", "x(x-9)"], correct_answer: "(x-3)(x+3)" },
        { question: "Degree of 3x² + x", options: ["1", "2", "3", "0"], correct_answer: "2" },
      ]),
      pl("math", "math-matrices", "Matrices", "Rows, columns, addition, multiplication, determinants."),
      pl("math", "math-trig", "Trigonometry", "Sin, cos, tan and their applications."),
      pl("math", "math-quadratic", "Quadratic Equations", "Roots, discriminant, factoring and the quadratic formula.", [
        { question: "Discriminant of ax²+bx+c?", options: ["b²-4ac", "2ab", "a²+c", "4ac-b²"], correct_answer: "b²-4ac" },
        { question: "Roots of x²-5x+6=0?", options: ["1,6", "2,3", "-2,-3", "0,5"], correct_answer: "2,3" },
        { question: "Number of roots of a quadratic?", options: ["1", "2", "3", "0"], correct_answer: "2" },
        { question: "If D<0, roots are?", options: ["Real", "Equal", "Complex", "Zero"], correct_answer: "Complex" },
      ]),
      pl("math", "math-ap", "Arithmetic Progressions", "Common difference, nth term, and sum formulas."),
      pl("math", "math-geometry", "Geometry", "Triangles, circles, similarity and theorems."),
    ],
  },
  {
    id: "biology",
    title: "Biology",
    tagline: "Life, cells, systems and the world around us.",
    icon: "science",
    playlists: [
      pl("biology", "bio-life", "Life Processes", "Nutrition, respiration, transport and excretion.", [
        { question: "Powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Vacuole"], correct_answer: "Mitochondria" },
        { question: "Plants make food via?", options: ["Respiration", "Digestion", "Photosynthesis", "Excretion"], correct_answer: "Photosynthesis" },
        { question: "Site of gas exchange?", options: ["Stomach", "Alveoli", "Liver", "Skin"], correct_answer: "Alveoli" },
        { question: "Excretory unit of kidney?", options: ["Neuron", "Nephron", "Alveolus", "Villi"], correct_answer: "Nephron" },
      ]),
      pl("biology", "bio-eye", "Human Eye", "Structure, vision, defects and corrections."),
      pl("biology", "bio-control", "Control & Coordination", "Nervous system, reflexes, hormones."),
      pl("biology", "bio-reproduction", "Reproduction", "Asexual and sexual reproduction in living things."),
      pl("biology", "bio-heredity", "Heredity", "Genes, chromosomes and inheritance."),
      pl("biology", "bio-environment", "Environment", "Ecosystems, food chains and conservation."),
    ],
  },
  {
    id: "chemistry",
    title: "Chemistry",
    tagline: "Reactions, elements and the world of matter.",
    icon: "science",
    playlists: [
      pl("chemistry", "chem-reactions", "Chemical Reactions", "Types, equations and balancing.", [
        { question: "Rusting is a?", options: ["Physical change", "Chemical change", "Nuclear change", "None"], correct_answer: "Chemical change" },
        { question: "Combustion needs?", options: ["Water", "Oxygen", "Nitrogen", "Hydrogen"], correct_answer: "Oxygen" },
        { question: "A + B → AB is?", options: ["Decomposition", "Displacement", "Combination", "Redox"], correct_answer: "Combination" },
        { question: "Symbol for Sodium?", options: ["So", "Na", "S", "N"], correct_answer: "Na" },
      ]),
      pl("chemistry", "chem-acids", "Acids & Bases", "pH, indicators and neutralisation.", [
        { question: "pH of pure water?", options: ["1", "7", "10", "14"], correct_answer: "7" },
        { question: "Acid + Base →?", options: ["Salt + Water", "Gas only", "Acid only", "Nothing"], correct_answer: "Salt + Water" },
        { question: "Indicator turns red in?", options: ["Base", "Acid", "Neutral", "Salt"], correct_answer: "Acid" },
        { question: "Common base in soap?", options: ["HCl", "NaOH", "H₂SO₄", "CO₂"], correct_answer: "NaOH" },
      ]),
      pl("chemistry", "chem-carbon", "Carbon Compounds", "Hydrocarbons, functional groups and isomers."),
      pl("chemistry", "chem-metals", "Metals & Non-metals", "Properties, reactivity and uses."),
      pl("chemistry", "chem-periodic", "Periodic Table", "Groups, periods and trends."),
      pl("chemistry", "chem-env", "Environmental Chemistry", "Pollution, ozone and sustainability."),
    ],
  },
];

export function findSubject(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function findPlaylist(id: string): Playlist | undefined {
  for (const s of SUBJECTS) {
    const p = s.playlists.find((pl) => pl.id === id);
    if (p) return p;
  }
  return undefined;
}

export function findVideo(id: string): { video: VideoItem; playlist: Playlist } | undefined {
  for (const s of SUBJECTS) {
    for (const p of s.playlists) {
      const v = p.videos.find((x) => x.id === id);
      if (v) return { video: v, playlist: p };
    }
  }
  return undefined;
}

export function recommendedPlaylists(playlistId: string, count = 4): Playlist[] {
  const current = findPlaylist(playlistId);
  if (!current) return [];
  const subject = findSubject(current.subjectId)!;
  const sameSubject = subject.playlists.filter((p) => p.id !== current.id);
  const others = SUBJECTS.flatMap((s) => s.id === current.subjectId ? [] : s.playlists);
  return [...sameSubject, ...others].slice(0, count);
}

export function searchAll(q: string): { type: "playlist" | "video"; id: string; title: string; subtitle: string }[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const out: { type: "playlist" | "video"; id: string; title: string; subtitle: string }[] = [];
  for (const s of SUBJECTS) {
    for (const p of s.playlists) {
      if (p.title.toLowerCase().includes(needle)) {
        out.push({ type: "playlist", id: p.id, title: p.title, subtitle: s.title });
      }
      for (const v of p.videos) {
        if (v.title.toLowerCase().includes(needle)) {
          out.push({ type: "video", id: v.id, title: v.title, subtitle: `${s.title} · ${p.title}` });
        }
      }
    }
  }
  return out.slice(0, 20);
}