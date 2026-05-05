import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ChevronLeft, Camera, CameraOff } from "lucide-react";
import { AppShell } from "@/components/learnable/AppShell";
import { findSubject, findVideo } from "@/lib/content";
import { speak, useUser } from "@/lib/store";

export const Route = createFileRoute("/video/$videoId")({
  head: ({ params }) => {
    const found = findVideo(params.videoId);
    return {
      meta: [
        { title: `${found?.video.title ?? "Lesson"} — Learn Able` },
        { name: "description", content: found?.video.description ?? "Watch this lesson on Learn Able." },
      ],
    };
  },
  loader: ({ params }) => {
    const found = findVideo(params.videoId);
    if (!found) throw notFound();
    return found;
  },
  notFoundComponent: () => (
    <AppShell><p>Video not found.</p><Link to="/home" className="underline">Back</Link></AppShell>
  ),
  errorComponent: ({ error, reset }) => (
    <AppShell>
      <p className="text-destructive">{error.message}</p>
      <button onClick={reset} className="mt-4 rounded-full bg-primary px-5 py-2 text-primary-foreground">Retry</button>
    </AppShell>
  ),
  component: VideoPage,
});

function VideoPage() {
  const { video, playlist } = Route.useLoaderData();
  const subject = findSubject(playlist.subjectId)!;
  const user = useUser();
  const showCaptions = user?.disability === "deaf";

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoElRef = useRef<HTMLVideoElement>(null);
  const warningRef = useRef<HTMLDivElement>(null);
  const [camOn, setCamOn] = useState(false);
  const [absent, setAbsent] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const lastFrameRef = useRef<ImageData | null>(null);
  const lastSeenRef = useRef<number>(Date.now());

  useEffect(() => {
    if (user?.disability === "blind") {
      speak(`${video.title}. ${video.description}`);
    }
  }, [video, user]);

  // Animate warning
  useEffect(() => {
    if (absent && warningRef.current) {
      gsap.from(warningRef.current, { opacity: 0, scale: 0.85, duration: 0.4, ease: "back.out(1.6)" });
    }
  }, [absent]);

  // Send postMessage to YouTube to play/pause
  const ytCommand = (cmd: "playVideo" | "pauseVideo") => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: cmd, args: [] }),
      "*",
    );
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: false });
      if (videoElRef.current) {
        videoElRef.current.srcObject = stream;
        await videoElRef.current.play();
      }
      setCamOn(true);
      setCamError(null);
      lastSeenRef.current = Date.now();
    } catch (e) {
      setCamError(e instanceof Error ? e.message : "Camera unavailable");
    }
  };

  const stopCamera = () => {
    const v = videoElRef.current;
    if (v?.srcObject) {
      (v.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      v.srcObject = null;
    }
    setCamOn(false);
    setAbsent(false);
  };

  // Motion-based presence detection (frame diff). Lightweight, every 2.5s.
  useEffect(() => {
    if (!camOn) return;
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 48;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const interval = setInterval(() => {
      const v = videoElRef.current;
      if (!v || v.readyState < 2) return;
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const prev = lastFrameRef.current;
      lastFrameRef.current = frame;
      if (!prev) return;
      // Compute brightness variance and motion vs previous frame
      let diff = 0;
      let brightness = 0;
      for (let i = 0; i < frame.data.length; i += 4) {
        const lum = frame.data[i] * 0.3 + frame.data[i + 1] * 0.59 + frame.data[i + 2] * 0.11;
        brightness += lum;
        const plum = prev.data[i] * 0.3 + prev.data[i + 1] * 0.59 + prev.data[i + 2] * 0.11;
        diff += Math.abs(lum - plum);
      }
      const px = frame.data.length / 4;
      const avgDiff = diff / px;
      const avgBright = brightness / px;
      // Heuristic: a present user causes some motion AND scene isn't pitch-black/uniform.
      const present = avgDiff > 1.5 && avgBright > 15 && avgBright < 245;
      if (present) {
        lastSeenRef.current = Date.now();
        if (absent) {
          setAbsent(false);
          ytCommand("playVideo");
        }
      } else if (Date.now() - lastSeenRef.current > 5000 && !absent) {
        setAbsent(true);
        ytCommand("pauseVideo");
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [camOn, absent]);

  useEffect(() => () => stopCamera(), []);

  return (
    <AppShell>
      <Link to="/playlist/$playlistId" params={{ playlistId: playlist.id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> {playlist.title}
      </Link>

      <div className="mt-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{subject.title} · {playlist.title}</div>
        <h1 className="font-display mt-1 text-3xl font-bold">{video.title}</h1>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="relative overflow-hidden rounded-3xl bg-card shadow-card">
            <div className="aspect-video w-full">
              <iframe
                ref={iframeRef}
                title={video.title}
                src={`https://www.youtube.com/embed/${video.youtube}?enablejsapi=1&cc_load_policy=${showCaptions ? 1 : 0}&hl=en&cc_lang_pref=en`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            {absent && (
              <div ref={warningRef} className="warning absolute inset-0 flex items-center justify-center bg-black/70 p-6 text-center">
                <div className="rounded-3xl bg-destructive p-6 text-destructive-foreground shadow-soft">
                  <div className="font-display text-lg font-bold">Pay attention</div>
                  <p className="mt-2 text-sm">Be present in front of camera to resume the video.</p>
                </div>
              </div>
            )}
          </div>

          {showCaptions && (
            <div className="caption-bar mt-3 rounded-2xl">
              <div className="caption">{video.description}</div>
            </div>
          )}

          <div className="mt-5 rounded-3xl bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Transcript</h2>
              <button
                onClick={() => speak(video.description)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Read aloud
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{video.description}</p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl bg-card p-6 shadow-card">
            <h3 className="font-display text-base font-semibold">Attention camera</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We pause the video if you step away. Footage stays on your device.
            </p>
            <video ref={videoElRef} muted playsInline className={`mt-3 w-full rounded-2xl bg-secondary ${camOn ? "" : "hidden"}`} />
            {camError && <p className="mt-2 text-xs text-destructive">{camError}</p>}
            {camOn ? (
              <button onClick={stopCamera} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm hover:bg-secondary">
                <CameraOff className="h-4 w-4" /> Stop camera
              </button>
            ) : (
              <button onClick={startCamera} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm text-primary-foreground">
                <Camera className="h-4 w-4" /> Enable camera
              </button>
            )}
          </div>

          <div className="rounded-3xl bg-card p-6 shadow-card">
            <h3 className="font-display text-base font-semibold">Up next in playlist</h3>
            <ul className="mt-3 space-y-2">
              {playlist.videos.filter((v) => v.id !== video.id).slice(0, 4).map((v) => (
                <li key={v.id}>
                  <Link
                    to="/video/$videoId"
                    params={{ videoId: v.id }}
                    className="block truncate rounded-xl px-2 py-1 text-sm hover:bg-secondary"
                  >
                    {v.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/quiz/$playlistId"
              params={{ playlistId: playlist.id }}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground"
            >
              Start quiz
            </Link>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
