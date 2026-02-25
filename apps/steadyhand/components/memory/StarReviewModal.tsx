"use client"

import { useState } from "react"
import { Button } from "@resonance/ui/components/button"
import { Textarea } from "@resonance/ui/components/textarea"
import { Badge } from "@resonance/ui/components/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@resonance/ui/components/dialog"

/**
 * Human-in-the-loop approval dialog for AI-generated STAR stories.
 *
 * When the AI chat tool extracts and structures a STAR story, this modal
 * presents it for user review and editing before the experience is persisted
 * to the database. Ensures data quality and user trust.
 */
export function StarReviewModal({
  open,
  onOpenChange,
  data,
  onApprove,
  onReject,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: {
    rawInput: string
    situation: string
    task: string
    action: string
    result: string
    skills: string[]
  }
  onApprove: (edited: {
    rawInput: string
    situation: string
    task: string
    action: string
    result: string
    skills: string[]
  }) => void
  onReject: () => void
}) {
  const [rawInput, setRawInput] = useState(data.rawInput)
  const [situation, setSituation] = useState(data.situation)
  const [task, setTask] = useState(data.task)
  const [action, setAction] = useState(data.action)
  const [result, setResult] = useState(data.result)
  const [skillsText, setSkillsText] = useState(data.skills.join(", "))

  function handleApprove() {
    onApprove({
      rawInput,
      situation,
      task,
      action,
      result,
      skills: skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review AI-Generated Story</DialogTitle>
          <DialogDescription>
            The AI extracted this STAR story from your conversation. Review and
            edit before saving to your Memory Bank.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <ReviewField label="Summary">
            <Textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              rows={2}
            />
          </ReviewField>

          <ReviewField label="Situation">
            <Textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              rows={2}
            />
          </ReviewField>

          <ReviewField label="Task">
            <Textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              rows={2}
            />
          </ReviewField>

          <ReviewField label="Action">
            <Textarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              rows={2}
            />
          </ReviewField>

          <ReviewField label="Result">
            <Textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              rows={2}
            />
          </ReviewField>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Skills</span>
            <div className="flex flex-wrap gap-1 pb-1">
              {skillsText
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
            </div>
            <Textarea
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="React, Leadership, CI/CD (comma-separated)"
              rows={1}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onReject}>
            Discard
          </Button>
          <Button onClick={handleApprove}>Approve &amp; Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ReviewField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  )
}
