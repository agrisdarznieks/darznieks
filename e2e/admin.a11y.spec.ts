import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const token = "local-e2e-token-not-for-vercel-01";
const artifacts = "/opt/cursor/artifacts";

async function axe(page: Page, name: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations, `${name}: ${JSON.stringify(results.violations, null, 2)}`).toEqual([]);
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${artifacts}/${name}.png`, fullPage: true });
}

async function signIn(page: Page, fixture: "populated" | "empty") {
  await page.context().addCookies([
    { name: "darznieks_admin_e2e", value: token, url: "http://127.0.0.1:3000" },
    { name: "darznieks_admin_fixture", value: fixture, url: "http://127.0.0.1:3000" },
  ]);
}

test("login screen has no axe violations", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: "Desk" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with GitHub" })).toBeVisible();
  await axe(page, "login light desktop");
  await shot(page, "admin-login-light-desktop");
  await page.getByRole("button", { name: /dark mode/i }).click();
  await axe(page, "login dark desktop");
  await shot(page, "admin-login-dark-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await shot(page, "admin-login-dark-mobile");
  await page.getByRole("button", { name: /light mode/i }).click();
  await shot(page, "admin-login-light-mobile");
});

test("desk, integrity, and empty states", async ({ page }) => {
  await signIn(page, "populated");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByText("Sample records for review")).toBeVisible();
  await axe(page, "overview light desktop");
  await shot(page, "admin-overview-light-desktop");

  await page.getByRole("button", { name: /dark mode/i }).click();
  await axe(page, "overview dark desktop");
  await shot(page, "admin-overview-dark-desktop");

  await page.setViewportSize({ width: 390, height: 844 });
  await axe(page, "overview dark mobile");
  await shot(page, "admin-overview-dark-mobile");
  await page.getByRole("button", { name: /light mode/i }).click();
  await shot(page, "admin-overview-light-mobile");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(overflow).toBe(false);

  await page.setViewportSize({ width: 320, height: 700 });
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("link", { name: "Integrity" })).toBeVisible();
  const narrow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(narrow).toBe(false);

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/admin/integrity");
  await expect(page.getByRole("heading", { level: 1, name: "Integrity" })).toBeVisible();
  await axe(page, "integrity light");
  await shot(page, "admin-integrity-light-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await shot(page, "admin-integrity-light-mobile");

  await page.context().clearCookies();
  await signIn(page, "empty");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/admin/content");
  await expect(page.getByText("no posts, case studies")).toBeVisible();
  await axe(page, "empty content");
  await shot(page, "admin-empty-light-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await shot(page, "admin-empty-light-mobile");

  await page.goto("/admin/questions");
  await expect(page.getByText("No open questions")).toBeVisible();
  await axe(page, "empty questions");
});

test("anonymous visitors cannot open the desk", async ({ page, request }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  const response = await request.post("/api/admin/revalidate");
  expect(response.status()).toBe(401);
});

test("the public homepage does not render the desk", async ({ page }) => {
  const response = await page.goto("/en");
  expect(response?.status()).toBe(200);
  const html = await page.content();
  expect(html).not.toContain("Continue with GitHub");
  expect(html).not.toContain("Sample records for review");
  expect(html).not.toContain("SANITY_API_WRITE_TOKEN");
});
