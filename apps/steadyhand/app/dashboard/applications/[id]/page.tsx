import { cookies } from "next/headers"
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
import type { Application, ApplicationStatus } from "@resonance/types"
import { ParsedJD } from "@/components/applications/ParsedJD"
import { FitAnalysis } from "@/components/applications/FitAnalysis"
import { CoverLetter } from "@/components/applications/CoverLetter"
import { SelectedBullets } from "@/components/applications/SelectedBullets"

async function getApplication(id: string): Promise<Application | null> {
  try {
    const cookieStore = await cookies()
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/applications/${id}`,
      {
        headers: { cookie: cookieStore.toString() },
        cache: "no-store",
      },
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

const statusLabels: Record<ApplicationStatus, string> = {
  draft: "Draft",
  ready_to_apply: "Ready to Apply",
  applied: "Applied",
  phone_screen: "Phone Screen",
  technical_interview: "Technical Interview",
  final_interview: "Final Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const application = await getApplication(id)

  if (!application) {
    notFound()
  }

  const title = application.parsedJD?.title ?? "Application Detail"
  const company = application.parsedJD?.company

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {company ? `${company} · ` : ""}Application ID: {id}
          </p>
        </div>
        <Badge variant="outline">{statusLabels[application.status]}</Badge>
      </div>

      <Separator />

      {/* Content tabs */}
      <Tabs defaultValue="jd">
        <TabsList>
          <TabsTrigger value="jd">Job Description</TabsTrigger>
          <TabsTrigger value="fit">Fit Analysis</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>

        {/* Parsed JD tab */}
        <TabsContent value="jd" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parsed Job Description</CardTitle>
              <CardDescription>
                The AI-extracted requirements and details from the job posting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {application.parsedJD ? (
                <ParsedJD data={application.parsedJD} />
              ) : (
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fit Analysis tab */}
        <TabsContent value="fit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fit Analysis</CardTitle>
              <CardDescription>
                How your experiences match the requirements in this posting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {application.fitAnalysis ? (
                <FitAnalysis data={application.fitAnalysis} />
              ) : (
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials tab */}
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
                {application.draftedMaterials?.coverLetterParagraphs?.length ? (
                  <CoverLetter
                    paragraphs={application.draftedMaterials.coverLetterParagraphs}
                  />
                ) : (
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
                )}
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
                {application.draftedMaterials?.resumeBullets?.length ? (
                  <SelectedBullets
                    bullets={application.draftedMaterials.resumeBullets}
                  />
                ) : (
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
                )}
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
