import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Play } from "lucide-react";
import { AppShell } from "@/components/learnable/AppShell";
import { CourseIcon } from "@/components/learnable/CourseIcon";
import { findCourse, getUser, speak, useUser } from "@/lib/store";

export const Route = createFileRoute("/course/$courseId")({
  head: ({ params }) => {
    const c = findCourse(params.courseId);
    return {
      meta: [
        { title: `${c?.title ?? "Course"} — Learn Able` },
        { name: "description", content: `Watch lessons, take the quiz and earn a badge for ${c?.title ?? "this course"}.` },
      ],
    };
  },
  loader: ({ params }) => {
    const c = findCourse(params.courseId);
    if (!c) throw notFound();
    return c;
  },
  notFoundComponent: () => (
    <AppShell>
      <p>Course not found.</p>
      <Link to="/home" className="underline">Back to courses</Link>
    </AppShell>
  ),
  errorComponent: ({ error, reset }) => (
    <AppShell>
      <p className="text-destructive">{error.message}</p>
      <button onClick={reset} className="mt-4 rounded-full bg-primary px-5 py-2 text-primary-foreground">Retry</button>
    </AppShell>
  ),
  component: CoursePage,
});

function CoursePage() {
  const c = Route.useLoaderData();
  const user = useUser();
  const nav = useNavigate();
  const [showCaptions, setShowCaptions] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !getUser()) nav({ to: "/auth" });
  }, [nav]);

  useEffect(() => {
    if (user?.disability === "blind") {
      speak(`${c.title}. ${c.lessons} lessons. Press play to start.`);
    }
    if (user?.disability === "deaf") setShowCaptions(true);
  }, [c, user]);

  const transcript = `Welcome to ${c.title}. In this module we cover the core concepts of ${c.title} for Class 10 students. Take notes as you watch, then try the quiz to earn a badge.`;

  return (
    <AppShell>
      <Link to="/home" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>

      <div className="mt-4 flex items-start gap-5">
        <CourseIcon name={c.icon} />
        <div>
          <h1 className="font-display text-3xl font-bold">{c.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Module 1 · {c.lessons} lessons</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="overflow-hidden rounded-3xl bg-card shadow-card">
            <div className="aspect-video w-full">
              <iframe
                title={`${c.title} video`}
                src={`https://www.youtube.com/embed/${c.youtube}?cc_load_policy=${showCaptions ? 1 : 0}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>

          <div className="mt-5 rounded-3xl bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Transcript</h2>
              <button
                onClick={() => speak(transcript)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Read aloud
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{transcript}</p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl bg-card p-6 shadow-card">
            <h3 className="font-display text-base font-semibold">AI Tutor</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Ready to test your knowledge? Take a short quiz and earn a badge if you score 75% or more.
            </p>
            <Link
              to="/quiz/$courseId"
              params={{ courseId: c.id }}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              <Play className="h-4 w-4 fill-current" /> Start quiz
            </Link>
          </div>

          <div className="rounded-3xl bg-card p-6 shadow-card a11y-hide-on-simple">
            <h3 className="font-display text-base font-semibold">Suggested</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="text-muted-foreground">· Practice problems</li>
              <li className="text-muted-foreground">· Worksheet PDF</li>
              <li className="text-muted-foreground">· Discussion notes</li>
            </ul>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
