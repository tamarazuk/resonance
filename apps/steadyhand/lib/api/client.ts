import type {
  Experience,
  Application,
  ParsedJD,
  FitAnalysis,
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

// ==================== Experiences ====================

export function listExperiences(): Promise<Experience[]> {
  return request<Experience[]>("/api/experiences")
}

export function getExperience(id: string): Promise<Experience> {
  return request<Experience>(`/api/experiences/${id}`)
}

export function createExperience(
  data: { rawInput: string },
): Promise<Experience> {
  return request<Experience>("/api/experiences", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function updateExperience(
  id: string,
  data: Partial<Pick<Experience, "rawInput" | "starStructure" | "skills">>,
): Promise<Experience> {
  return request<Experience>(`/api/experiences/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export function deleteExperience(id: string): Promise<void> {
  return request<void>(`/api/experiences/${id}`, { method: "DELETE" })
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

export function updateApplicationStatus(
  id: string,
  status: Application["status"],
): Promise<Application> {
  return request<Application>(`/api/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}

// ==================== Pipeline ====================

export function parseJobDescription(
  applicationId: string,
): Promise<ParsedJD> {
  return request<ParsedJD>(
    `/api/applications/${applicationId}/parse`,
    { method: "POST" },
  )
}

export function analyzeFit(
  applicationId: string,
): Promise<FitAnalysis> {
  return request<FitAnalysis>(
    `/api/applications/${applicationId}/fit`,
    { method: "POST" },
  )
}

export function generateDraft(
  applicationId: string,
): Promise<DraftedMaterials> {
  return request<DraftedMaterials>(
    `/api/applications/${applicationId}/draft`,
    { method: "POST" },
  )
}
