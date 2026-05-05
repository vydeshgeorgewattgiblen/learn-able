import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft, ListVideo } from "lucide-react";
import { AppShell } from "@/components/learnable/AppShell";
import { CourseIcon } from "@/components/learnable/CourseIcon";
import { findSubject } from "@/lib/content";

export const Route = createFileRoute("/subject/$subjectId")({
  head: ({ params }) => {
    const s = findSubject(params.subjectId);
    return {
      meta: [
        { title: `${s?.title ?? "Subject"} — Learn Able` },
        { name: "description", content: `Browse playlists in ${s?.title ?? "this subject"}.` },
      ],
    };
  },
  loader: ({ params }) => {
    const s = findSubject(params.subjectId);
    if (!s) throw notFound();
    return s;
  },
  notFoundComponent: () => (
    <AppShell><p>Subject not found.</p><Link to="/home" className="underline">Back</Link></AppShell>
  ),
  errorComponent: ({ error, reset }) => (
    <AppShell>
      <p className="text-destructive">{error.message}</p>
      <button onClick={reset} className="mt-4 rounded-full bg-primary px-5 py-2 text-primary-foreground">Retry</button>
    </AppShell>
  ),
  component: SubjectPage,
});

function SubjectPage() {
  const s = Route.useLoaderData();
  return (
    <AppShell>
      <Link to="/home" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>
      <div className="mt-4 flex items-start gap-5">
        <CourseIcon name={s.icon} />
        <div>
          <h1 className="font-display text-3xl font-bold">{s.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{s.playlists.length} playlists · {s.tagline}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {s.playlists.map((p: { id: string; title: string; description: string; videos: unknown[] }) => (
          <Link
            key={p.id}
            to="/playlist/$playlistId"
            params={{ playlistId: p.id }}
            className="flex items-start gap-4 rounded-3xl bg-card p-5 shadow-card transition-transform hover:-translate-y-0.5"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary">
              <ListVideo className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-base font-semibold">{p.title}</div>
              <div className="text-xs text-muted-foreground">{p.videos.length} videos</div>
              <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
