import type {
  Experience,
  Application,
  DraftedMaterials,
} from "@resonance/types"

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  })

  if (!response.ok) {
    const body = await response.text().catch(() => "Unknown error")
    throw new ApiError(body, response.status)
  }

  return response.json() as Promise<T>
}

// ==================== Experiences (read-only) ====================
// Experience creation is handled by the chat AI tool — no POST/PUT/DELETE.
// The chat interface uses `useChat()` from `ai/react`, not this client.

export function listExperiences(): Promise<Experience[]> {
  return request<Experience[]>("/api/experiences")
}

// ==================== Applications ====================

export function listApplications(): Promise<Application[]> {
  return request<Application[]>("/api/applications")
}

export function getApplication(id: string): Promise<Application> {
  return request<Application>(`/api/applications/${id}`)
}

export function createApplication(
  data: { externalUrl: string },
): Promise<Application> {
  return request<Application>("/api/applications", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function deleteApplication(id: string): Promise<void> {
  return request<void>(`/api/applications/${id}`, { method: "DELETE" })
}

// ==================== Pipeline ====================

export function generateDraft(
  applicationId: string,
): Promise<DraftedMaterials> {
  return request<DraftedMaterials>(
    `/api/applications/${applicationId}/draft`,
    { method: "POST" },
  )
}
