import { expect, test } from "@playwright/test";

test("dashboard renders current race state and supporting panels", async ({
  page
}) => {
  await page.goto("/");

  await expect(page.getByText("Paddock Feed")).toBeVisible();
  await expect(page.getByText("Weekend Schedule")).toBeVisible();
  await expect(page.getByText("Standings")).toBeVisible();
  await expect(page.locator("img")).toHaveCount(1);
});
