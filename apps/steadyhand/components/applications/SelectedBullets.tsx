"use client"

import { useState } from "react"
import type { TailoredBullet } from "@resonance/types"
import { Badge } from "@resonance/ui/components/badge"
import { Button } from "@resonance/ui/components/button"

/**
 * Displays tailored resume bullets with their matched keywords.
 *
 * Each bullet shows the tailored version by default with an option
 * to reveal the original for comparison. Keywords are shown as badges.
 */
export function SelectedBullets({
  bullets,
}: {
  bullets: TailoredBullet[]
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopyAll() {
    const text = bullets.map((b) => `• ${b.tailored}`).join("\n")
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {bullets.length} tailored bullet{bullets.length !== 1 ? "s" : ""}
        </p>
        <Button variant="outline" size="sm" onClick={handleCopyAll}>
          {copied ? "Copied" : "Copy All"}
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {bullets.map((bullet, i) => (
          <BulletItem key={i} bullet={bullet} />
        ))}
      </div>
    </div>
  )
}

function BulletItem({ bullet }: { bullet: TailoredBullet }) {
  const [showOriginal, setShowOriginal] = useState(false)

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
      <p className="text-sm leading-relaxed">
        {showOriginal ? bullet.original : bullet.tailored}
      </p>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {bullet.keywords.map((kw) => (
            <Badge key={kw} variant="secondary" className="text-[0.65rem]">
              {kw}
            </Badge>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowOriginal(!showOriginal)}
          className="shrink-0 text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          {showOriginal ? "Show tailored" : "Show original"}
        </button>
      </div>
    </div>
  )
}
