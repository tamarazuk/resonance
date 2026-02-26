export function getErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") {
    return fallback;
  }

  const payload = data as { error?: unknown; details?: unknown };
  const detailMessages = collectDetailMessages(payload.details);

  if (typeof payload.error === "string" && detailMessages.length > 0) {
    return `${payload.error}: ${detailMessages.join(", ")}`;
  }

  if (detailMessages.length > 0) {
    return detailMessages.join(", ");
  }

  return typeof payload.error === "string" ? payload.error : fallback;
}

export function collectDetailMessages(details: unknown): string[] {
  if (typeof details === "string") {
    const value = details.trim();
    return value.length > 0 ? [value] : [];
  }

  if (Array.isArray(details)) {
    return details
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  }

  if (!details || typeof details !== "object") {
    return [];
  }

  return Object.values(details as Record<string, unknown>)
    .flatMap((value) => {
      if (typeof value === "string") {
        return [value];
      }
      if (Array.isArray(value)) {
        return value.filter(
          (entry): entry is string => typeof entry === "string",
        );
      }
      return [];
    })
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function hasApplicationId(data: unknown): data is { id: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    typeof data.id === "string"
  );
}
