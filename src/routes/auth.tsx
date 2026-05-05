import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/learnable/Logo";
import { setUser, type Disability } from "@/lib/store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Learn Able" },
      { name: "description", content: "Tell Learn Able about you to personalize your learning experience." },
    ],
  }),
  component: Auth,
});

const options: { value: Disability; label: string; desc: string }[] = [
  { value: "none", label: "None", desc: "Standard experience" },
  { value: "blind", label: "Blind / low vision", desc: "Text-to-speech, high contrast" },
  { value: "deaf", label: "Deaf / hard of hearing", desc: "Captions and transcripts" },
  { value: "learning", label: "Learning support", desc: "Simplified UI" },
];

function Auth() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [disability, setDisability] = useState<Disability>("none");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ name: name.trim() || "Student", disability });
    nav({ to: "/home" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-[2.5rem] bg-card p-7 shadow-soft"
      >
        <Logo />
        <h1 className="font-display mt-8 text-3xl font-bold leading-tight">
          Welcome.
          <br />
          Let&apos;s personalize.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We adapt the interface to fit you.
        </p>

        <label className="mt-8 block text-sm font-medium">Your name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jerry"
          className="mt-2 w-full rounded-2xl border border-border bg-background px-5 py-4 outline-none focus:border-foreground"
        />

        <p className="mt-6 text-sm font-medium">Accessibility profile</p>
        <div className="mt-3 space-y-2">
          {options.map((o) => (
            <label
              key={o.value}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                disability === o.value ? "border-foreground bg-secondary" : "border-border"
              }`}
            >
              <input
                type="radio"
                name="d"
                checked={disability === o.value}
                onChange={() => setDisability(o.value)}
                className="mt-1 accent-foreground"
              />
              <div>
                <div className="text-sm font-medium">{o.label}</div>
                <div className="text-xs text-muted-foreground">{o.desc}</div>
              </div>
            </label>
          ))}
        </div>

        <button
          type="submit"
          className="mt-8 w-full rounded-full bg-primary py-4 text-primary-foreground transition-transform hover:scale-[1.01] active:scale-95"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
