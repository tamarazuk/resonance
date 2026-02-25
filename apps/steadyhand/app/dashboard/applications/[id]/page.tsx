import { notFound } from "next/navigation"
import { Separator } from "@resonance/ui/components/separator"
import { Badge } from "@resonance/ui/components/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@resonance/ui/components/card"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@resonance/ui/components/tabs"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from "@resonance/ui/components/empty-state"
import { Button } from "@resonance/ui/components/button"

/**
 * Application Detail — Parsed JD, Fit Analysis, Material Drafter
 *
 * Displays a single application's details with tabs for:
 * - Job Description (parsed)
 * - Fit Analysis results
 * - Drafted Materials (cover letter + tailored bullets)
 *
 * Data fetching and detail components (ParsedJD, FitAnalysis, CoverLetter,
 * SelectedBullets) will be built in Step 3.6.
 */
export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // TODO: Fetch application from API — for now render scaffold
  if (!id) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Application Detail
          </h1>
          <p className="text-sm text-muted-foreground">
            Application ID: {id}
          </p>
        </div>
        <Badge variant="outline">Draft</Badge>
      </div>

      <Separator />

      {/* Content tabs */}
      <Tabs defaultValue="jd">
        <TabsList>
          <TabsTrigger value="jd">Job Description</TabsTrigger>
          <TabsTrigger value="fit">Fit Analysis</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>

        {/* Parsed JD tab — placeholder for ParsedJD component */}
        <TabsContent value="jd" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parsed Job Description</CardTitle>
              <CardDescription>
                The AI-extracted requirements and details from the job posting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState>
                <EmptyStateIcon>
                  <FileTextIcon className="h-10 w-10" />
                </EmptyStateIcon>
                <EmptyStateTitle>Not yet parsed</EmptyStateTitle>
                <EmptyStateDescription>
                  The job description will appear here once the scraper
                  processes the posting URL.
                </EmptyStateDescription>
              </EmptyState>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fit Analysis tab — placeholder for FitAnalysis component */}
        <TabsContent value="fit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fit Analysis</CardTitle>
              <CardDescription>
                How your experiences match the requirements in this posting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState>
                <EmptyStateIcon>
                  <BarChartIcon className="h-10 w-10" />
                </EmptyStateIcon>
                <EmptyStateTitle>Analysis pending</EmptyStateTitle>
                <EmptyStateDescription>
                  The fit analysis will run after the job description is parsed
                  and compared against your Memory Bank.
                </EmptyStateDescription>
                <EmptyStateAction>
                  <Button variant="outline" disabled>
                    Run Analysis
                  </Button>
                </EmptyStateAction>
              </EmptyState>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials tab — placeholder for CoverLetter + SelectedBullets */}
        <TabsContent value="materials" className="mt-6">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cover Letter</CardTitle>
                <CardDescription>
                  AI-drafted cover letter tailored to this position.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState>
                  <EmptyStateIcon>
                    <PenIcon className="h-10 w-10" />
                  </EmptyStateIcon>
                  <EmptyStateTitle>Not yet drafted</EmptyStateTitle>
                  <EmptyStateDescription>
                    Generate a cover letter after the fit analysis is complete.
                  </EmptyStateDescription>
                  <EmptyStateAction>
                    <Button disabled>Generate Draft</Button>
                  </EmptyStateAction>
                </EmptyState>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tailored Bullets</CardTitle>
                <CardDescription>
                  Experience bullets rewritten to match this job&apos;s requirements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState>
                  <EmptyStateIcon>
                    <ListIcon className="h-10 w-10" />
                  </EmptyStateIcon>
                  <EmptyStateTitle>No bullets generated</EmptyStateTitle>
                  <EmptyStateDescription>
                    Tailored resume bullets will be generated from your matched
                    experiences.
                  </EmptyStateDescription>
                </EmptyState>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Inline icons ────────────────────────────────────────────────────────────

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  )
}

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  )
}

function PenIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
    </svg>
  )
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
      <path d="M3 6h.01" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M8 6h13" />
    </svg>
  )
}
