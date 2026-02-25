"use client";

import { useState } from "react";
import type { TailoredBullet } from "@resonance/types";

/**
 * Displays tailored resume bullets with their matched keywords.
 *
 * Each bullet shows the tailored version by default with an option
 * to reveal the original for comparison. Keywords are shown as badges.
 */
export function SelectedBullets({ bullets }: { bullets: TailoredBullet[] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopyAll() {
    const text = bullets.map((b) => `\u2022 ${b.tailored}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {bullets.length} tailored bullet{bullets.length !== 1 ? "s" : ""}
        </p>
        <button
          type="button"
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
        >
          {copied ? "Copied" : "Copy All"}
        </button>
      </div>

      <div className="space-y-3">
        {bullets.map((bullet, i) => (
          <BulletItem key={i} bullet={bullet} />
        ))}
      </div>
    </div>
  );
}

function BulletItem({ bullet }: { bullet: TailoredBullet }) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="space-y-2 rounded-xl border border-border bg-background p-4">
      <p className="text-sm font-light leading-relaxed text-foreground">
        {showOriginal ? bullet.original : bullet.tailored}
      </p>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {bullet.keywords.map((kw) => (
            <span
              key={kw}
              className="rounded-full border border-primary/20 bg-secondary px-2.5 py-0.5 text-[0.65rem] font-medium text-primary"
            >
              {kw}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowOriginal(!showOriginal)}
          className="shrink-0 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          {showOriginal ? "Show tailored" : "Show original"}
        </button>
      </div>
    </div>
  );
}
