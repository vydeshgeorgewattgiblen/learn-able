import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Search, Sparkles } from "lucide-react";
import { AppShell } from "@/components/learnable/AppShell";
import { CourseIcon } from "@/components/learnable/CourseIcon";
import { getUser, useUser } from "@/lib/store";
import { SUBJECTS, searchAll } from "@/lib/content";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Explore subjects — Learn Able" },
      { name: "description", content: "Browse Class 10 subjects: Mathematics, Biology and Chemistry." },
    ],
  }),
  component: Home,
});

function Home() {
  const user = useUser();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const chatbox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !getUser()) nav({ to: "/auth" });
  }, [nav]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reveal", { opacity: 0, y: 20, duration: 0.6, stagger: 0.08, ease: "power2.out" });
      gsap.from(".card", { opacity: 0, y: 40, stagger: 0.1, duration: 0.7, ease: "power3.out", delay: 0.15 });
      if (chatbox.current) {
        gsap.to(chatbox.current, {
          boxShadow: "0px 0px 24px rgba(0,0,0,0.25)",
          repeat: -1,
          yoyo: true,
          duration: 1.6,
          ease: "sine.inOut",
        });
      }
    }, root);
    return () => ctx.revert();
  }, []);

  const results = searchAll(q);

  return (
    <AppShell>
      <div ref={root}>
        <p className="reveal text-sm text-muted-foreground">Hey {user?.name ?? "there"},</p>
        <h1 className="reveal font-display mt-1 text-3xl font-bold sm:text-4xl">Explore subjects</h1>

        <div ref={chatbox} className="chatbox reveal mt-6 rounded-3xl bg-card p-2 shadow-card">
          <div className="flex items-center gap-3 px-4 py-3">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search topics fast..."
              aria-label="Search topics"
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          {q && (
            <div className="border-t border-border/60 p-2">
              {results.length === 0 ? (
                <div className="px-3 py-4 text-sm text-muted-foreground">No matches.</div>
              ) : (
                <ul className="max-h-72 overflow-y-auto">
                  {results.map((r) => (
                    <li key={`${r.type}-${r.id}`}>
                      {r.type === "playlist" ? (
                        <Link
                          to="/playlist/$playlistId"
                          params={{ playlistId: r.id }}
                          className="flex items-center justify-between rounded-2xl px-3 py-2 hover:bg-secondary"
                        >
                          <span className="font-medium">{r.title}</span>
                          <span className="text-xs text-muted-foreground">{r.subtitle} · playlist</span>
                        </Link>
                      ) : (
                        <Link
                          to="/video/$videoId"
                          params={{ videoId: r.id }}
                          className="flex items-center justify-between rounded-2xl px-3 py-2 hover:bg-secondary"
                        >
                          <span className="font-medium">{r.title}</span>
                          <span className="text-xs text-muted-foreground">{r.subtitle}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {SUBJECTS.map((s) => (
            <Link
              key={s.id}
              to="/subject/$subjectId"
              params={{ subjectId: s.id }}
              className="card group flex flex-col justify-between gap-6 rounded-3xl bg-card p-6 shadow-card transition-transform hover:-translate-y-1"
            >
              <CourseIcon name={s.icon} />
              <div>
                <div className="font-display text-lg font-semibold leading-tight">{s.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.playlists.length} playlists</div>
                <p className="mt-2 text-sm text-muted-foreground">{s.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
