import { test } from '@fixtures';
import { faker } from '@faker-js/faker';

test.describe("Unique Submission", () => {
    let formEditorUrl: string;

    test.afterEach(async ({ page, formBuilderPage }) => {
        if (formEditorUrl) {
            await page.goto(formEditorUrl);
            await page.waitForLoadState('domcontentloaded');
        }
        await formBuilderPage.safeDeleteForm();
    });

    test("Verify unique submission behaviour", async ({ page, formBuilderPage, browser }) => {
        test.setTimeout(120000);

        await test.step("Step 1: Create a new form and publish it", async () => {
            await page.goto('/');
            await formBuilderPage.createNewForm();
            formEditorUrl = page.url();
            await formBuilderPage.publishForm();
        });

        await test.step("Step 2: Navigate to settings and enable Unique Submission with cookie tracking", async () => {
            await formBuilderPage.navigateToSettings();
            await formBuilderPage.enableUniqueSubmission();
            await formBuilderPage.trackByCookie();
        });

        await test.step("Step 3: Submit the form once from the same browser (first submission should succeed)", async () => {
            const publishedPage = await formBuilderPage.getPublishedPage();
            await publishedPage.fillEmailAndSubmit(faker.internet.email());
            await publishedPage.verifyThankYou();
            await publishedPage.close();
        });

        await test.step("Step 4: Open the form again in the same browser — should be blocked by cookie", async () => {
            const publishedPage = await formBuilderPage.getPublishedPage();
            await publishedPage.verifySubmissionBlocked();
            await publishedPage.close();
        });

        await test.step("Step 5: Submit the form from a new browser context — should succeed (different cookie)", async () => {
            await formBuilderPage.submitFormInNewContext(browser, faker.internet.email());
        });

        await test.step("Step 6: Switch to No check — disable unique submission tracking", async () => {
            await page.goto(formEditorUrl);
            await page.waitForLoadState('domcontentloaded');
            await formBuilderPage.navigateToSettings();
            await formBuilderPage.enableUniqueSubmission();
            await formBuilderPage.trackByNoCheck();
        });

        await test.step("Step 7: Same browser can now submit multiple times without restriction", async () => {
            const publishedPage1 = await formBuilderPage.getPublishedPage();
            await publishedPage1.fillEmailAndSubmit(faker.internet.email());
            await publishedPage1.verifyThankYou();
            await publishedPage1.close();

            const publishedPage2 = await formBuilderPage.getPublishedPage();
            await publishedPage2.fillEmailAndSubmit(faker.internet.email());
            await publishedPage2.verifyThankYou();
            await publishedPage2.close();
        });
    });
});