import { test, expect, type Page } from "@playwright/test"

/**
 * Generate a unique test email to avoid collisions between test runs.
 */
function testEmail(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.local`
}

const TEST_PASSWORD = "TestPassword1"

/**
 * Helper: fill and submit the signup form, returning the email used.
 */
async function signup(
  page: Page,
  overrides: { email?: string; password?: string; fullName?: string } = {},
): Promise<string> {
  const email = overrides.email ?? testEmail()
  const password = overrides.password ?? TEST_PASSWORD
  const fullName = overrides.fullName ?? "E2E Test User"

  await page.goto("/signup")
  await page.getByLabel("Full name").fill(fullName)
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill(password)
  await page.getByRole("button", { name: "Create account" }).click()

  return email
}

// ─── Signup ──────────────────────────────────────────────────────────────────

test.describe("Signup", () => {
  test("creates an account and redirects to dashboard", async ({ page }) => {
    await signup(page)
    await page.waitForURL("**/dashboard")
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test("shows error for duplicate email", async ({ browser }) => {
    const email = testEmail()

    // First signup in a throwaway context — creates the account
    const setupPage = await browser.newPage()
    await signup(setupPage, { email })
    await setupPage.waitForURL("**/dashboard")
    await setupPage.close()

    // Second signup in a fresh (unauthenticated) context with the same email
    const page = await browser.newPage()
    await page.goto("/signup")
    await page.getByLabel("Email").fill(email)
    await page.getByLabel("Password").fill(TEST_PASSWORD)
    await page.getByRole("button", { name: "Create account" }).click()

    await expect(
      page.getByText("An account with this email already exists"),
    ).toBeVisible()
    await page.close()
  })

  test("shows validation for short password", async ({ page }) => {
    await page.goto("/signup")
    await page.getByLabel("Email").fill(testEmail())
    await page.getByLabel("Password").fill("short")
    await page.getByRole("button", { name: "Create account" }).click()

    // The HTML minLength=8 attribute prevents submission; the form should stay on /signup
    await expect(page).toHaveURL(/\/signup/)
  })

  test("has a link to sign in", async ({ page }) => {
    await page.goto("/signup")
    const link = page.getByRole("link", { name: "Sign in" })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute("href", "/login")
  })
})

// ─── Login ───────────────────────────────────────────────────────────────────

test.describe("Login", () => {
  let testUserEmail: string

  test.beforeAll(async ({ browser }) => {
    // Create a test user to log in with
    const page = await browser.newPage()
    testUserEmail = await signup(page)
    await page.waitForURL("**/dashboard")
    await page.close()
  })

  test("signs in with valid credentials and reaches dashboard", async ({
    page,
  }) => {
    await page.goto("/login")
    await page.getByLabel("Email").fill(testUserEmail)
    await page.getByLabel("Password").fill(TEST_PASSWORD)
    await page.getByRole("button", { name: "Sign in" }).click()

    await page.waitForURL("**/dashboard")
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("Email").fill("nobody@invalid.test")
    await page.getByLabel("Password").fill("WrongPassword1")
    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(page.getByText("Invalid email or password")).toBeVisible()
  })

  test("has a link to sign up", async ({ page }) => {
    await page.goto("/login")
    const link = page.getByRole("link", { name: "Sign up" })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute("href", "/signup")
  })
})
