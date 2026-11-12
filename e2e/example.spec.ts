import { test, expect, type FrameLocator } from '@playwright/test'

test('Portal renders inside the Apps Script iframes.', async ({ page }) => {
  await page.goto('')

  // Web apps in Apps Script render inside '#sandboxFrame' > '#userHtmlFrame'.
  const app: FrameLocator = page
    .frameLocator('#sandboxFrame')
    .frameLocator('#userHtmlFrame')

  await expect(app.getByText('Hello, World!')).toBeVisible()
})
