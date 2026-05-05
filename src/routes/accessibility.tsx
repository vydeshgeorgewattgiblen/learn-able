import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/learnable/AppShell";
import { applyTheme, getUser, setUser, type Disability, useUser } from "@/lib/store";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility — Learn Able" },
      { name: "description", content: "Adjust your accessibility profile. Learn Able adapts the UI for you." },
    ],
  }),
  component: AccessibilityPage,
});

const opts: { value: Disability; label: string; desc: string }[] = [
  { value: "none", label: "Standard", desc: "Default experience" },
  { value: "blind", label: "Blind / low vision", desc: "Auto text-to-speech and high contrast" },
  { value: "deaf", label: "Deaf / hard of hearing", desc: "Captions on by default, transcripts" },
];

function AccessibilityPage() {
  const user = useUser();
  const nav = useNavigate();
  const [val, setVal] = useState<Disability>("none");

  useEffect(() => {
    if (typeof window !== "undefined" && !getUser()) nav({ to: "/auth" });
  }, [nav]);
  useEffect(() => { if (user) setVal(user.disability); }, [user]);

  const update = (d: Disability) => {
    if (!user) return;
    const next = { ...user, disability: d };
    setVal(d);
    setUser(next);
    applyTheme(next);
  };

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Accessibility</h1>
      <p className="mt-1 text-sm text-muted-foreground">Learn Able adapts to fit you.</p>

      <div className="mt-6 grid gap-3">
        {opts.map((o) => (
          <button
            key={o.value}
            onClick={() => update(o.value)}
            className={`rounded-3xl border p-5 text-left transition-colors ${
              val === o.value ? "border-foreground bg-secondary" : "border-border bg-card hover:bg-secondary"
            }`}
          >
            <div className="font-display font-semibold">{o.label}</div>
            <div className="mt-1 text-sm text-muted-foreground">{o.desc}</div>
          </button>
        ))}
      </div>
    </AppShell>
  );
}
