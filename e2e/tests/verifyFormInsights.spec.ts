import { test, expect } from '@fixtures';
import { BUILDER_SELECTORS, PUBLISHED_FORM_SELECTORS } from '@selectors';
import { PUBLISHED_FORM_TEXTS } from '@texts';

test.describe("Verify form insights", () => {
    let formEditorUrl: string;

    test.beforeEach(async ({ page, formBuilderPage }) => {
        await page.goto('/');
        await formBuilderPage.createNewForm();
        formEditorUrl = page.url();
        await formBuilderPage.publishForm();
    });

    test.afterEach(async ({ page, formBuilderPage }) => {
        if (formEditorUrl) {
            await page.goto(formEditorUrl);
            await page.waitForLoadState('domcontentloaded');
        }
        await formBuilderPage.safeDeleteForm();
    });

    test("Verify all insights fields in analytics", async ({ page, formBuilderPage }) => {
        test.setTimeout(120000);
        let analyticsURL: string;

        await test.step("Step 1: Navigate to analytics", async () => {
            await formBuilderPage.navigateToAnalytics();
            analyticsURL = page.url();
        });

        await test.step("Step 2: Verify all insights fields are 0", async () => {
            await formBuilderPage.verifyInsights('0', '0', '0', '0%');
        });

        await test.step("Step 3: Navigating to the published site completely", async () => {
            await formBuilderPage.triggerVisitAndStartMetrics();
        });

        await test.step("Step 4: Verify the visits count increases by 1", async () => {
            await page.goto(analyticsURL);
            await formBuilderPage.verifyInsights('1', '0', '0', '0%');
        });

        await test.step("Step 5: Open published form and type without submitting", async () => {
            await formBuilderPage.triggerVisitAndStartMetrics('hello');
        });

        await test.step("Step 6: Verify visits and starts increase", async () => {
            await page.goto(analyticsURL);
            await formBuilderPage.verifyInsights('2', '1', '0', '0%');
        });

        await test.step("Step 7: Open published form and submit it", async () => {
            await formBuilderPage.submitPublishedForm('test@mail.com');

        });

        await test.step("Step 8: Verify all metrics increase and completion rate calculates", async () => {
            await page.goto(analyticsURL);
            await formBuilderPage.verifyInsights('3', '1', '1', '100%');
        });
    });
});
