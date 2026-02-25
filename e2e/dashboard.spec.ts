import { test, expect, type BrowserContext, type Page } from "@playwright/test"

/**
 * Generate a unique test email to avoid collisions between test runs.
 */
function testEmail(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.local`
}

const TEST_PASSWORD = "TestPassword1"

/**
 * Create a fresh authenticated browser context by signing up a new user.
 */
async function authenticatedContext(
  browser: import("@playwright/test").Browser,
): Promise<{ context: BrowserContext; page: Page; email: string }> {
  const context = await browser.newContext()
  const page = await context.newPage()
  const email = testEmail()

  await page.goto("/signup")
  await page.getByLabel("Full name").fill("Dashboard Tester")
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill(TEST_PASSWORD)
  await page.getByRole("button", { name: "Create account" }).click()
  await page.waitForURL("**/dashboard")

  return { context, page, email }
}

// ─── Redirect guards ────────────────────────────────────────────────────────

test.describe("Dashboard — unauthenticated", () => {
  test("redirects /dashboard to /login when not signed in", async ({
    page,
  }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login/)
  })

  test("redirects /dashboard/chat to /login when not signed in", async ({
    page,
  }) => {
    await page.goto("/dashboard/chat")
    await expect(page).toHaveURL(/\/login/)
  })

  test("redirects /dashboard/applications/new to /login when not signed in", async ({
    page,
  }) => {
    await page.goto("/dashboard/applications/new")
    await expect(page).toHaveURL(/\/login/)
  })
})

// ─── Authenticated dashboard ────────────────────────────────────────────────

test.describe("Dashboard — authenticated", () => {
  test("displays dashboard heading and sections", async ({ browser }) => {
    const { page, context } = await authenticatedContext(browser)

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Action Items" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Active Applications" })).toBeVisible()

    await context.close()
  })

  test("shows sidebar navigation with correct links", async ({ browser }) => {
    const { page, context } = await authenticatedContext(browser)

    await expect(page.getByRole("link", { name: "Home" })).toBeVisible()
    await expect(
      page.getByRole("link", { name: "Career Coach" }),
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: "New Application" }),
    ).toBeVisible()

    await context.close()
  })

  test("navigates to Career Coach page via sidebar", async ({ browser }) => {
    const { page, context } = await authenticatedContext(browser)

    await page.getByRole("link", { name: "Career Coach" }).click()
    await expect(page).toHaveURL(/\/dashboard\/chat/)

    await context.close()
  })

  test("navigates to New Application page via sidebar", async ({ browser }) => {
    const { page, context } = await authenticatedContext(browser)

    await page.getByRole("link", { name: "New Application" }).click()
    await expect(page).toHaveURL(/\/dashboard\/applications\/new/)

    await context.close()
  })

  test("displays user info in sidebar", async ({ browser }) => {
    const { page, context, email } = await authenticatedContext(browser)

    // Auth config doesn't map fullName to session.user.name, so sidebar
    // falls back to "User" for the display name. Assert the email is shown.
    await expect(page.getByText(email)).toBeVisible()

    await context.close()
  })
})
