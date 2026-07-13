/**
 * Required end-to-end scenario: savings projection → comparison with a CD →
 * three-rung ladder, confirming outputs update at every step.
 */

import { expect, test } from "@playwright/test";

test("plan savings, compare with a CD, and build a 3-rung ladder", async ({ page }) => {
  // 1–2. Open the app and go to the savings calculator.
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("could grow");
  await page.getByRole("link", { name: "Try the savings calculator" }).click();
  await expect(page.getByRole("heading", { name: "Savings Calculator" })).toBeVisible();

  // 3–6. Enter balance, APY, monthly contribution, and a five-year term.
  // spinbutton = <input type="number">; getByLabel would also match chart
  // legend icons whose accessible names contain the field label.
  await page.getByRole("spinbutton", { name: "Starting balance" }).fill("10000");
  await page.getByRole("spinbutton", { name: "Annual rate" }).fill("4.5");
  await page.getByRole("spinbutton", { name: "Monthly contribution" }).fill("250");
  await page.getByRole("spinbutton", { name: "Time horizon" }).fill("60");

  // 7. Review the projection: $10k at 4.5% APY + $250/mo ≈ $29.2k after 5y.
  const projected = page.getByText("Projected balance").locator("xpath=following-sibling::dd");
  await expect(projected).toContainText("$29,2");

  // Invalid input never silently corrects — it surfaces a message instead.
  await page.getByRole("spinbutton", { name: "Annual rate" }).fill("250");
  await expect(page.getByText("Rate above 100% per year isn't supported.")).toBeVisible();
  await page.getByRole("spinbutton", { name: "Annual rate" }).fill("4.5");

  // 8–10. Open the comparison tool, add a CD scenario, compare results.
  await page.getByRole("link", { name: "Compare" }).first().click();
  await expect(page.getByRole("heading", { name: "Compare Scenarios" })).toBeVisible();
  await page.getByRole("button", { name: "+ Add a scenario (up to 3)" }).click();
  await expect(page.getByRole("table")).toContainText("24-month CD");
  await expect(page.getByText("highest projected balance")).toBeVisible();
  await expect(page.getByText("most flexible")).toBeVisible();

  // 11–12. Open the ladder planner and create a three-rung ladder.
  await page.getByRole("link", { name: "CD Ladder" }).first().click();
  await expect(page.getByRole("heading", { name: "CD Ladder Planner" })).toBeVisible();
  await page.getByRole("button", { name: "3-rung ladder (1–3 yrs)" }).click();
  await page.getByRole("spinbutton", { name: "Total amount to allocate" }).fill("30000");
  await expect(page.getByText("$10,000.00 each")).toBeVisible();

  // 13. Outputs update when an assumption changes.
  const totalInterest = page
    .getByText("Total projected interest")
    .locator("xpath=following-sibling::dd");
  const before = await totalInterest.textContent();
  await page.getByRole("spinbutton", { name: "Total amount to allocate" }).fill("60000");
  await expect(totalInterest).not.toHaveText(before ?? "");
});
