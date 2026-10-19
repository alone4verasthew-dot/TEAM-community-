import { test, expect } from "@playwright/test";

test.describe("TFY public experience", () => {
  test("landing page loads with the TFY brand and community section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /MEMBER LOGIN/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /THE COMMUNITY/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "🦅:𝘛𝘌𝘈𝘔 (;™🕷️∆)𝘛 𝘍 𝘠🍁" })).toBeVisible();
  });

  test("all three community cards have an Enter Community button", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator(".community-cards > article");
    await expect(cards).toHaveCount(3);
    await expect(page.getByRole("heading", { name: "ᥲᦔꪑ꠸ꪀડ ᥆ᠻ 𝘛𝘍𝘠" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "᥇ꪖ​ꪀꪀꫀ𝘘𝘴" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "᥇ꪖ​ꪀꪀꫀ𝘳𝘴" })).toBeVisible();
    await expect(cards.getByRole("button", { name: /ENTER COMMUNITY/i })).toHaveCount(3);
  });

  test("community cards remain accessible on a narrow mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#community");
    await expect(page.locator(".community-cards > article")).toHaveCount(3);
    await expect(page.locator(".community-cards").getByRole("button", { name: /ENTER COMMUNITY/i })).toHaveCount(3);
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
      await expect(page.getByRole("heading", { name: item.heading })).toBeVisible();
      await expect(page.getByPlaceholder(`Message ${item.heading}…`)).toHaveCount(0);
    }
  });
});
