"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Customize your experience
      </p>

      <div className="mt-8 space-y-6">
        <div className="glass-card p-6">
          <h2 className="font-medium">Appearance</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Current theme: {theme}
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
            >
              Light
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
            >
              Dark
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              onClick={() => setTheme("system")}
            >
              System
            </Button>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-medium">API Configuration</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Backend URL:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">
              {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
            </code>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Set <code className="rounded bg-muted px-1">GOOGLE_API_KEY</code> in your
            backend <code className="rounded bg-muted px-1">.env</code> file.
          </p>
        </div>
      </div>
    </div>
  );
}
