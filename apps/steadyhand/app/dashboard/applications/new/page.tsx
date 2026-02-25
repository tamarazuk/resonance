"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@resonance/ui/components/button"
import { Input } from "@resonance/ui/components/input"
import { Textarea } from "@resonance/ui/components/textarea"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@resonance/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@resonance/ui/components/dialog"

/**
 * New Application — URL input + Manual Entry fallback
 *
 * Centered, single-column layout. Primary action is a URL input that triggers
 * Firecrawl to scrape and parse the JD. A "Enter Manually" link opens a
 * dialog for pasting/typing the JD directly.
 */
export default function NewApplicationPage() {
  const router = useRouter()

  const [url, setUrl] = useState("")
  const [manualJD, setManualJD] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ externalUrl: url }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Failed to create application")
      return
    }

    const application = await res.json()
    router.push(`/dashboard/applications/${application.id}`)
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // TODO: Add manual JD submission endpoint when ready
    // For now, close dialog and show placeholder
    setLoading(false)
    setDialogOpen(false)
  }

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>New Application</CardTitle>
            <CardDescription>
              Paste a job posting URL to get started. We&apos;ll scrape the listing,
              parse the job description, and analyze your fit.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <form onSubmit={handleUrlSubmit} className="flex flex-col gap-4">
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <div className="flex flex-col gap-2">
                <label htmlFor="url" className="text-sm font-medium">
                  Job posting URL
                </label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/jobs/software-engineer"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Scraping..." : "Analyze Job Posting"}
              </Button>
            </form>

            {/* Manual entry fallback */}
            <div className="text-center">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger
                  render={
                    <button
                      type="button"
                      className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                    />
                  }
                >
                  Enter manually instead
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <form onSubmit={handleManualSubmit}>
                    <DialogHeader>
                      <DialogTitle>Enter Job Description</DialogTitle>
                      <DialogDescription>
                        Paste or type the job description directly.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Textarea
                        placeholder="Paste the job description here..."
                        value={manualJD}
                        onChange={(e) => setManualJD(e.target.value)}
                        rows={12}
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={loading}>
                        {loading ? "Processing..." : "Submit"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
