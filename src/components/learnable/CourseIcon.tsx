import math from "@/assets/icon-math.png";
import science from "@/assets/icon-science.png";
import english from "@/assets/icon-english.png";
import video from "@/assets/icon-video.png";

const map: Record<string, string> = { math, science, english, video };

export function CourseIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <img
      src={map[name] ?? video}
      alt=""
      loading="lazy"
      width={64}
      height={64}
      className={`h-16 w-16 object-contain ${className}`}
    />
  );
}
