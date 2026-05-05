import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Mic, Play, Search } from "lucide-react";
import { AppShell } from "@/components/learnable/AppShell";
import { CourseIcon } from "@/components/learnable/CourseIcon";
import { COURSES, getUser, useUser } from "@/lib/store";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Explore courses — Learn Able" },
      { name: "description", content: "Browse Class 10 courses: Math, Science, English and more." },
    ],
  }),
  component: Home,
});

function Home() {
  const user = useUser();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !getUser()) nav({ to: "/auth" });
  }, [nav]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reveal", { opacity: 0, y: 20, duration: 0.6, stagger: 0.08, ease: "power2.out" });
      gsap.from(".card", { opacity: 0, y: 40, stagger: 0.1, duration: 0.7, ease: "power3.out", delay: 0.15 });
    }, root);
    return () => ctx.revert();
  }, []);

  const filtered = COURSES.filter((c) =>
    c.title.toLowerCase().includes(q.toLowerCase()),
  );
  const cont = COURSES[0];

  return (
    <AppShell>
      <div ref={root}>
        <p className="reveal text-sm text-muted-foreground">Hey {user?.name ?? "there"},</p>
        <h1 className="reveal font-display mt-1 text-3xl font-bold sm:text-4xl">Explore courses</h1>

        <div className="reveal mt-6 flex items-center gap-3 rounded-full bg-card px-5 py-4 shadow-card">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for..."
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <button aria-label="Voice search" className="text-muted-foreground hover:text-foreground">
            <Mic className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {filtered.map((c) => (
            <Link
              key={c.id}
              to="/course/$courseId"
              params={{ courseId: c.id }}
              className="card group flex aspect-square flex-col justify-between rounded-3xl bg-card p-5 shadow-card transition-transform hover:-translate-y-1"
            >
              <CourseIcon name={c.icon} />
              <div>
                <div className="font-display text-base font-semibold leading-tight">{c.title}</div>
                <div className="text-xs text-muted-foreground">{c.lessons} lessons</div>
              </div>
            </Link>
          ))}
          <Link
            to="/dashboard"
            className="card flex aspect-square flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 p-5 text-sm text-muted-foreground hover:bg-card"
          >
            View all
          </Link>
        </div>

        <Link
          to="/course/$courseId"
          params={{ courseId: cont.id }}
          className="card mt-6 flex items-center gap-5 rounded-3xl bg-card p-5 shadow-card transition-transform hover:-translate-y-1"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Play className="h-5 w-5 fill-current" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground">Continue learning</div>
            <div className="font-display text-base font-semibold">{cont.title}</div>
            <div className="text-xs text-muted-foreground">Module 1 · Programming Languages</div>
          </div>
          <CourseIcon name="video" className="hidden h-12 w-12 sm:block" />
        </Link>
      </div>
    </AppShell>
  );
}
