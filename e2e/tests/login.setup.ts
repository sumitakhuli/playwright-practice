import { test, expect } from "@playwright/test";
import { LOGIN_SELECTORS, BUILDER_SELECTORS } from "@selectors";

const STORAGE_STATE = "./auth/user.json";

test.describe('Login', () => {
    test('Login as Oliver', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('button', { name: LOGIN_SELECTORS.loginAsOliverButton }).click();

        // Wait for login to complete by checking for a dashboard element
        await expect(page.getByTestId(BUILDER_SELECTORS.addFormButton)).toBeVisible({ timeout: 15000 });
        await page.context().storageState({ path: STORAGE_STATE })
    })
})