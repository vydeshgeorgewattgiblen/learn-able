import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Trophy, Volume2 } from "lucide-react";
import { AppShell } from "@/components/learnable/AppShell";
import { findPlaylist } from "@/lib/content";
import { awardBadge, getUser, saveScore, speak } from "@/lib/store";

export const Route = createFileRoute("/quiz/$playlistId")({
  head: ({ params }) => {
    const p = findPlaylist(params.playlistId);
    return {
      meta: [
        { title: `Quiz: ${p?.title ?? "Playlist"} — Learn Able` },
        { name: "description", content: `Take the ${p?.title ?? ""} quiz and earn a badge.` },
      ],
    };
  },
  loader: ({ params }) => {
    const p = findPlaylist(params.playlistId);
    if (!p) throw notFound();
    return p;
  },
  notFoundComponent: () => (
    <AppShell><p>Quiz not found.</p></AppShell>
  ),
  errorComponent: ({ error, reset }) => (
    <AppShell>
      <p className="text-destructive">{error.message}</p>
      <button onClick={reset} className="mt-4 rounded-full bg-primary px-5 py-2 text-primary-foreground">Retry</button>
    </AppShell>
  ),
  component: QuizPage,
});

function QuizPage() {
  const p = Route.useLoaderData();
  const nav = useNavigate();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !getUser()) nav({ to: "/auth" });
  }, [nav]);

  const q = p.quiz[i];

  // Ctrl+F1 read-aloud — reads current question + options.
  useEffect(() => {
    if (done) return;
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "F1" || e.code === "F1")) {
        e.preventDefault();
        const text = `${q.question}. Options: ${q.options.join(", ")}.`;
        speak(text);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [q, done]);

  const select = (opt: string) => {
    const a = [...answers, opt];
    setAnswers(a);
    if (i + 1 < p.quiz.length) {
      setI(i + 1);
    } else {
      const correct = a.filter((x, idx) => x === p.quiz[idx].correct_answer).length;
      const pct = Math.round((correct / p.quiz.length) * 100);
      saveScore(p.title, pct);
      if (pct >= 75) awardBadge({ badge_name: `${p.title} Master`, topic: p.title });
      setDone(true);
    }
  };

  const correct = answers.filter((x, idx) => x === p.quiz[idx]?.correct_answer).length;
  const pct = Math.round((correct / p.quiz.length) * 100);

  return (
    <AppShell>
      <Link to="/playlist/$playlistId" params={{ playlistId: p.id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to playlist
      </Link>

      {!done ? (
        <div className="mx-auto mt-6 max-w-xl rounded-3xl bg-card p-7 shadow-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{p.title}</span>
            <span>{i + 1} / {p.quiz.length}</span>
          </div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary transition-all" style={{ width: `${(i / p.quiz.length) * 100}%` }} />
          </div>

          <div className="mt-6 flex items-start justify-between gap-3">
            <h2 className="font-display text-2xl font-bold leading-snug">{q.question}</h2>
            <button
              onClick={() => speak(`${q.question}. Options: ${q.options.join(", ")}.`)}
              className="shrink-0 rounded-full border border-border p-2 text-muted-foreground hover:bg-secondary"
              aria-label="Read question aloud"
              title="Read aloud (Ctrl+F1)"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Tip: press Ctrl + F1 to read this question aloud.</p>

          <div className="mt-6 grid gap-3">
            {q.options.map((o) => (
              <button
                key={o}
                onClick={() => select(o)}
                className="rounded-2xl border border-border bg-background px-5 py-4 text-left transition-colors hover:bg-secondary"
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-6 max-w-xl rounded-3xl bg-card p-7 text-center shadow-card">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Trophy className="h-8 w-8" />
          </div>
          <h2 className="font-display mt-5 text-3xl font-bold">{pct}%</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {correct} of {p.quiz.length} correct
          </p>
          {pct >= 75 ? (
            <div className="mt-6 rounded-2xl bg-secondary p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Badge unlocked</div>
              <div className="font-display mt-1 text-lg font-semibold">{p.title} Master</div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">Score 75% or more to earn the badge. Try again!</p>
          )}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => { setI(0); setAnswers([]); setDone(false); }}
              className="flex-1 rounded-full border border-border py-3 hover:bg-secondary"
            >
              Retry
            </button>
            <Link to="/dashboard" className="flex-1 rounded-full bg-primary py-3 text-primary-foreground">
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </AppShell>
  );
}
