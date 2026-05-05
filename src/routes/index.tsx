import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import student from "@/assets/student-coding.png";
import { Logo } from "@/components/learnable/Logo";
import { getUser } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Learn Able — Learn to study. Free for students" },
      { name: "description", content: "Welcome to Learn Able, the accessibility-first AI personalized learning platform for Class 10 students." },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const nav = useNavigate();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".illustration", { opacity: 0, y: 50, duration: 1, ease: "power3.out" });
      gsap.from(".text > *", { opacity: 0, y: 20, delay: 0.3, stagger: 0.15, duration: 0.8, ease: "power3.out" });
      gsap.from(".start-btn", { opacity: 0, scale: 0.8, delay: 0.9, duration: 0.6, ease: "back.out(1.7)" });
      gsap.from(".top-bar > *", { opacity: 0, y: -10, stagger: 0.1, duration: 0.5 });
    }, root);
    return () => ctx.revert();
  }, []);

  const start = () => {
    if (getUser()) nav({ to: "/home" });
    else nav({ to: "/auth" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <div
        ref={root}
        className="relative flex w-full max-w-md flex-col rounded-[2.5rem] bg-card p-7 shadow-soft min-h-[640px]"
      >
        <div className="top-bar flex items-center justify-between">
          <Logo />
          <button
            onClick={start}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Skip
          </button>
        </div>

        <div className="text mt-10">
          <h1 className="font-display text-4xl font-bold leading-tight text-foreground">
            Learn to study.
            <br />
            Free for students
          </h1>
        </div>

        <div className="illustration relative my-6 flex flex-1 items-center justify-center">
          <img
            src={student}
            alt="Student learning with a laptop"
            width={1024}
            height={1024}
            className="h-auto w-full max-w-sm object-contain"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={start}
            aria-label="Start"
            className="start-btn flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
          >
            <span className="font-display text-base font-medium">Start</span>
          </button>
        </div>

        <Link to="/auth" className="mt-4 text-center text-xs text-muted-foreground hover:text-foreground">
          Already a student? Sign in
        </Link>
      </div>
    </div>
  );
}
