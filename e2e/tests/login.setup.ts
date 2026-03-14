import { test, expect } from "@playwright/test";
import { LOGIN_SELECTORS, DASHBOARD_SELECTORS } from "@selectors";

import { STORAGE_STATE } from "../../playwright.config";

test.describe('Login', () => {
    test('Login as Oliver', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('button', { name: LOGIN_SELECTORS.loginAsOliverButton }).click();

        // Wait for login to complete by checking for a dashboard element
        await expect(page.getByTestId(DASHBOARD_SELECTORS.addFormButton)).toBeVisible({ timeout: 15000 });
        await page.context().storageState({ path: STORAGE_STATE })
    })
})