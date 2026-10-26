import { test, expect } from "@playwright/test";

test.describe("TFY public experience", () => {
  test("landing page loads with the TFY brand without exposing private communities", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /MEMBER LOGIN/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /TO FIND YOURSELF/i })).toBeVisible();
    await expect(page.locator("#community")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /ENTER COMMUNITY/i })).toHaveCount(0);
  });

  test("logged-out visitors cannot see any private community cards", async ({ page }) => {
    await page.goto("/#community");
    await expect(page.locator(".community-cards > article")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "ᥲᦔꪑ꠸ꪀડ ᥆ᠻ 𝘛𝘍𝘠" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "᥇ꪖ​ꪀꪀꫀ𝘳𝘴" })).toHaveCount(0);
  });

  test("logged-out homepage remains usable on a narrow mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#community");
    await expect(page.locator(".community-cards > article")).toHaveCount(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow, "the page should not overflow horizontally at 390px").toBe(false);
  });
});

test.describe("TFY authentication guardrails", () => {
  test("sign-in page shows email and password fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /SIGN IN/i })).toBeVisible();
  });

  test("unauthenticated visitors are redirected away from private messages", async ({ page }) => {
    await page.goto("/messages");
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
    await expect(page.getByRole("heading", { name: "Return to your circle." })).toBeVisible();
  });

  test("unauthenticated visitors are redirected away from a community chat", async ({ page }) => {
    await page.goto("/community/community-one");
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
  });
});

test.describe("Authenticated community chat theme checks", () => {
  const email = process.env.TFY_E2E_EMAIL;
  const password = process.env.TFY_E2E_PASSWORD;

  test("each community opens with its assigned chat theme", async ({ page }) => {
    test.skip(!email || !password, "Set TFY_E2E_EMAIL and TFY_E2E_PASSWORD to run this read-only authenticated check.");

    await page.goto("/login");
    await page.getByLabel("Email address").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: /SIGN IN/i }).click();
    await expect(page).toHaveURL(/\/member(?:\?|$)/);

    const cases = [
      { path: "/community/community-one", css: "community-theme-tfy", heading: "TFY COMMUNITY" },
      { path: "/community/community-two", css: "community-theme-admins", heading: "ADMINS TFY" },
      { path: "/community/community-three", css: "community-theme-banners", heading: "BANNERS TFY" },
    ];

    for (const item of cases) {
      await page.goto(item.path);
      await expect(page.locator(`main.${item.css}`)).toBeVisible();
      await expect(page.getByRole("heading", { name: item.heading, exact: true })).toBeVisible();
      const composer = page.getByPlaceholder(`Message ${item.heading}…`);
      if (await composer.count()) {
        await expect(composer).toBeVisible();
        await expect(page.getByRole("button", { name: "Send message" })).toBeVisible();
      } else {
        // A never-joined approved account sees the entry gate instead of a composer.
        await expect(page.getByRole("button", { name: /ENTER COMMUNITY/i })).toBeVisible();
      }
    }
  });
});
