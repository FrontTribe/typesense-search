import { expect, test } from '@playwright/test'

// this is an example Playwright e2e test
test('should render admin panel logo', async ({ page }) => {
  await page.goto('/admin')

  // login
  await page.fill('#field-email', 'dev@payloadcms.com')
  await page.fill('#field-password', 'test')
  await page.click('.form-submit button')

  // should show dashboard
  await expect(page).toHaveTitle(/Dashboard/)
  await expect(page.locator('.graphic-icon')).toBeVisible()
})

test('should display Typesense search interface', async ({ page }) => {
  await page.goto('/admin')

  // login
  await page.fill('#field-email', 'dev@payloadcms.com')
  await page.fill('#field-password', 'test')
  await page.click('.form-submit button')

  // should show search interface
  await expect(page.locator('h2:has-text("Typesense Search")')).toBeVisible()
  await expect(page.locator('input[placeholder="Search..."]')).toBeVisible()
  await expect(page.locator('select')).toBeVisible()
  await expect(page.locator('button:has-text("Search")')).toBeVisible()
})

test('should perform search and display results', async ({ page }) => {
  await page.goto('/admin')

  // login
  await page.fill('#field-email', 'dev@payloadcms.com')
  await page.fill('#field-password', 'test')
  await page.click('.form-submit button')

  // perform search
  await page.fill('input[placeholder="Search..."]', 'test')
  await page.click('button:has-text("Search")')

  // should show search results or no results message
  await expect(
    page
      .locator('h3:has-text("Search Results")')
      .or(page.locator('p:has-text("No results found")')),
  ).toBeVisible()
})

test('should show collection statistics', async ({ page }) => {
  await page.goto('/admin')

  // login
  await page.fill('#field-email', 'dev@payloadcms.com')
  await page.fill('#field-password', 'test')
  await page.click('.form-submit button')

  // should show collection stats
  await expect(page.locator('h2:has-text("Collection Statistics")')).toBeVisible()
  await expect(page.locator('text=Posts:')).toBeVisible()
  await expect(page.locator('text=Media:')).toBeVisible()
})
