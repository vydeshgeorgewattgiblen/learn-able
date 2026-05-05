import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft, Play, Trophy } from "lucide-react";
import { AppShell } from "@/components/learnable/AppShell";
import { findPlaylist, findSubject, recommendedPlaylists } from "@/lib/content";

export const Route = createFileRoute("/playlist/$playlistId")({
  head: ({ params }) => {
    const p = findPlaylist(params.playlistId);
    return {
      meta: [
        { title: `${p?.title ?? "Playlist"} — Learn Able` },
        { name: "description", content: p?.description ?? "Watch lessons and earn badges." },
      ],
    };
  },
  loader: ({ params }) => {
    const p = findPlaylist(params.playlistId);
    if (!p) throw notFound();
    return p;
  },
  notFoundComponent: () => (
    <AppShell><p>Playlist not found.</p><Link to="/home" className="underline">Back</Link></AppShell>
  ),
  errorComponent: ({ error, reset }) => (
    <AppShell>
      <p className="text-destructive">{error.message}</p>
      <button onClick={reset} className="mt-4 rounded-full bg-primary px-5 py-2 text-primary-foreground">Retry</button>
    </AppShell>
  ),
  component: PlaylistPage,
});

function PlaylistPage() {
  const p = Route.useLoaderData();
  const subject = findSubject(p.subjectId)!;
  const recs = recommendedPlaylists(p.id, 6);

  return (
    <AppShell>
      <Link to="/subject/$subjectId" params={{ subjectId: subject.id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> {subject.title}
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">{p.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{p.videos.length} videos · {p.description}</p>
        </div>
        <Link
          to="/quiz/$playlistId"
          params={{ playlistId: p.id }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground"
        >
          <Trophy className="h-4 w-4" /> Take quiz
        </Link>
      </div>

      <ol className="mt-6 grid gap-3">
        {p.videos.map((v: any, i: number) => (
          <li key={v.id}>
            <Link
              to="/video/$videoId"
              params={{ videoId: v.id }}
              className="flex items-center gap-4 rounded-3xl bg-card p-4 shadow-card transition-transform hover:-translate-y-0.5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display truncate text-base font-semibold">{v.title}</div>
                <div className="truncate text-xs text-muted-foreground">{v.description}</div>
              </div>
              <Play className="h-4 w-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ol>

      <h2 className="font-display mt-10 text-xl font-semibold">Recommended next</h2>
      <div className="mt-3 -mx-5 overflow-x-auto px-5">
        <div className="flex gap-3 pb-2">
          {recs.map((r) => (
            <Link
              key={r.id}
              to="/playlist/$playlistId"
              params={{ playlistId: r.id }}
              className="w-64 shrink-0 rounded-3xl bg-card p-5 shadow-card transition-transform hover:-translate-y-0.5"
            >
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{findSubject(r.subjectId)?.title}</div>
              <div className="font-display mt-1 text-base font-semibold">{r.title}</div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
