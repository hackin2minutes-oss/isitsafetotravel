import { test, expect } from '@playwright/test';

test('Mobile Planner flow', async ({ page }) => {
  // Start in mobile viewport
  await page.goto('/');
  await page.setViewportSize({ width: 390, height: 844 });

  // Open Planner tab (bottom navigation)
  await page.click('text=Planner');
  // Planner sheet should appear; wait for a key element
  await page.waitForSelector('text=Generate My Trip', { timeout: 10000 });

  // Fill first destination
  await page.fill('input[placeholder="City or country..."]', 'Paris');

  // Optional: set a date range
  const dateInputs = await page.$$('input[type="date"]');
  if (dateInputs.length > 0) {
    await dateInputs[0].fill('2026-06-01');
  }

  // Select a couple of interests
  await page.click('text=Culture');
  await page.click('text=Food & Dining');

  // Move to next step and generate
  await page.click('text=Next');
  await page.click('text=Generate My Trip');

  // Expect itinerary data from API or UI update
  const resp = await page.waitForResponse((r) => r.url.includes('/api/trip-planner') && r.status() === 200, { timeout: 20000 });
  const data = await resp.json();
  expect(data).toBeTruthy();
  expect(Array.isArray(data.itinerary)).toBe(true);
});
