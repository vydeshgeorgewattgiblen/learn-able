import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { AppShell } from "@/components/learnable/AppShell";
import { getBadges, getScores, getUser, type Badge } from "@/lib/store";
import { SUBJECTS } from "@/lib/content";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Learn Able" },
      { name: "description", content: "Track your progress, scores and badges." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const nav = useNavigate();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    if (typeof window !== "undefined" && !getUser()) {
      nav({ to: "/auth" });
      return;
    }
    setBadges(getBadges());
    setScores(getScores());
  }, [nav]);

  const allPlaylists = SUBJECTS.flatMap((s) => s.playlists);
  const completed = Object.keys(scores).length;
  const progress = Math.round((completed / allPlaylists.length) * 100);

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Your dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Progress, scores and badges.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-card p-6 shadow-card">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Progress</div>
          <div className="font-display mt-2 text-3xl font-bold">{progress}%</div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="rounded-3xl bg-card p-6 shadow-card">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Quizzes taken</div>
          <div className="font-display mt-2 text-3xl font-bold">{completed}</div>
        </div>
        <div className="rounded-3xl bg-card p-6 shadow-card">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Badges</div>
          <div className="font-display mt-2 text-3xl font-bold">{badges.length}</div>
        </div>
      </div>

      {SUBJECTS.map((s) => (
        <div key={s.id}>
          <h2 className="font-display mt-10 text-xl font-semibold">{s.title}</h2>
          <div className="mt-3 rounded-3xl bg-card p-2 shadow-card">
            {s.playlists.map((p) => (
              <Link
                key={p.id}
                to="/playlist/$playlistId"
                params={{ playlistId: p.id }}
                className="flex items-center justify-between rounded-2xl px-4 py-3 hover:bg-secondary"
              >
                <span className="font-medium">{p.title}</span>
                <span className="text-sm text-muted-foreground">
                  {scores[p.title] != null ? `${scores[p.title]}%` : "—"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <h2 className="font-display mt-10 text-xl font-semibold">Badges</h2>
      {badges.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Score 75% on any quiz to earn your first badge.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {badges.map((b) => (
            <div key={b.topic} className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display font-semibold">{b.badge_name}</div>
                <div className="text-xs text-muted-foreground">{b.topic}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
