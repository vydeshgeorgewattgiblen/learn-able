import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, User } from "lucide-react";
import { Logo } from "./Logo";
import { useUser, applyTheme, clearUser } from "@/lib/store";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    applyTheme(user);
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle><Logo /></SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-1 text-base">
                {[
                  { to: "/home", label: "Home" },
                  { to: "/dashboard", label: "Dashboard" },
                  { to: "/accessibility", label: "Accessibility" },
                ].map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-4 py-3 hover:bg-secondary"
                  >
                    {l.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    clearUser();
                    setOpen(false);
                    nav({ to: "/" });
                  }}
                  className="mt-4 rounded-2xl px-4 py-3 text-left text-muted-foreground hover:bg-secondary"
                >
                  Sign out
                </button>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/home"><Logo /></Link>

          <Link
            to="/dashboard"
            aria-label="Profile"
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-secondary"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-6">{children}</main>
    </div>
  );
}
