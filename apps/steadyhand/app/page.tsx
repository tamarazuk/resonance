import { Button } from "@resonance/ui/components/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@resonance/ui/components/card"

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans">
      <main className="flex w-full max-w-lg flex-col items-center gap-8 py-32 px-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Steadyhand</CardTitle>
            <CardDescription>
              Your AI-powered career toolkit. Built with Base UI + shadcn.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Everything is wired up. Start building.
            </p>
            <div className="flex gap-3">
              <Button>Get Started</Button>
              <Button variant="outline">Documentation</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
