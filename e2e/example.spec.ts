import { test, expect, type FrameLocator } from '@playwright/test'

test('Sheet editor renders inside the Apps Script iframes.', async ({ page }) => {
  await page.goto('')

  // Web apps in Apps Script render inside '#sandboxFrame' > '#userHtmlFrame'.
  const appFrame: FrameLocator = page
    .frameLocator('#sandboxFrame')
    .frameLocator('#userHtmlFrame')

  await expect(appFrame.getByRole('button', { name: 'Add Sheet' })).toBeVisible()
})
