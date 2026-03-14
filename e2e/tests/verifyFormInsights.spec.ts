import { test, expect } from '@fixtures';
import { BUILDER_SELECTORS, PUBLISHED_FORM_SELECTORS } from '@selectors';
import { PUBLISHED_FORM_TEXTS } from '@texts';

test.describe("Verify form insights", () => {
    test("Verify all insights fields in analytics", async ({ page, formBuilderPage }) => {
        test.setTimeout(120000);
        let analyticsURL: string;

        await test.step("Step 1: Create a new form and publish it", async () => {
            await page.goto('/');
            await formBuilderPage.createNewForm();
            await formBuilderPage.publishForm();
        });

        await test.step("Step 2: Navigate to analytics", async () => {
            await formBuilderPage.navigateToAnalytics();
            analyticsURL = page.url();
        });

        await test.step("Step 3: Verify all insights fields are 0", async () => {
            await formBuilderPage.verifyInsights('0', '0', '0', '0%');
        });

        await test.step("Step 4: Navigating to the published site completely", async () => {
            const page1Promise = page.waitForEvent('popup');
            await page.getByTestId(BUILDER_SELECTORS.previewButton).click();
            const page1 = await page1Promise;
            await page1.waitForLoadState('networkidle');
            await page1.close();
        });

        await test.step("Step 5: Verify the visits count increases by 1", async () => {
            await page.goto(analyticsURL);
            await formBuilderPage.verifyInsights('1', '0', '0', '0%');
        });

        await test.step("Step 6: Open published form and type without submitting", async () => {
            const page2Promise = page.waitForEvent('popup');
            await page.getByTestId(BUILDER_SELECTORS.previewButton).click();
            const page2 = await page2Promise;
            await page2.waitForLoadState('networkidle');
            await page2.getByTestId(PUBLISHED_FORM_SELECTORS.emailField).click();
            await page2.getByTestId(PUBLISHED_FORM_SELECTORS.emailField).fill('hello');
            await page2.waitForTimeout(2000); // Give tracker time to record interaction as "start"
            await page2.close();
        });

        await test.step("Step 7: Verify visits and starts increase", async () => {
            await page.goto(analyticsURL);
            await formBuilderPage.verifyInsights('2', '1', '0', '0%');
        });

        await test.step("Step 8: Open published form and submit it", async () => {
            const page3Promise = page.waitForEvent('popup');
            await page.getByTestId(BUILDER_SELECTORS.previewButton).click();
            const page3 = await page3Promise;
            await page3.waitForLoadState('networkidle');
            await page3.getByTestId(PUBLISHED_FORM_SELECTORS.emailField).click();
            await page3.getByTestId(PUBLISHED_FORM_SELECTORS.emailField).fill('test@mail.com');
            await page3.getByTestId(PUBLISHED_FORM_SELECTORS.submitButton).click();
            await expect(page3.getByRole('heading', { name: PUBLISHED_FORM_TEXTS.thankYou, exact: false })).toBeVisible({ timeout: 15000 });
            await page3.waitForTimeout(2000);
            await page3.close();
        });

        await test.step("Step 9: Verify all metrics increase and completion rate calculates", async () => {
            await page.goto(analyticsURL);
            await formBuilderPage.verifyInsights('3', '1', '1', '100%');
        });

        await test.step("Step 10: Delete the form", async () => {
            await formBuilderPage.deleteForm();
        });
    });
});