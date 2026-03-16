import { test, expect } from '@fixtures';
import { faker } from '@faker-js/faker';
import { PublishedFormPage } from '@poms';

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
            const popup = await formBuilderPage.getPublishedPage();
            const publishedPage = new PublishedFormPage(popup);
            await publishedPage.fillEmailAndSubmit(faker.internet.email());
            await expect(popup.getByRole('heading', { name: 'Thank you' })).toBeVisible({ timeout: 15000 });
            await popup.close();
        });

        await test.step("Step 4: Open the form again in the same browser — should be blocked by cookie", async () => {
            const popup = await formBuilderPage.getPublishedPage();
            await expect(popup.getByRole('heading', { name: 'You cannot submit this form' })).toBeVisible({ timeout: 15000 });
            await popup.close();
        });

        await test.step("Step 5: Submit the form from a new browser context — should succeed (different cookie)", async () => {
            const previewHref = await page.getByTestId('publish-preview-button').getAttribute('href');
            const origin = new URL(page.url()).origin;
            const formUrl = previewHref?.startsWith('http') ? previewHref : `${origin}${previewHref}`;

            const newContext = await browser.newContext({ storageState: { cookies: [], origins: [] } });
            const newPage = await newContext.newPage();
            await newPage.goto(formUrl);
            await newPage.waitForLoadState('domcontentloaded');

            const publishedPage = new PublishedFormPage(newPage);
            await publishedPage.fillEmailAndSubmit(faker.internet.email());
            await expect(newPage.getByRole('heading', { name: 'Thank you' })).toBeVisible({ timeout: 15000 });
            await newContext.close();
        });

        await test.step("Step 6: Switch to No check — disable unique submission tracking", async () => {
            await page.goto(formEditorUrl);
            await page.waitForLoadState('domcontentloaded');
            await formBuilderPage.navigateToSettings();
            await formBuilderPage.enableUniqueSubmission();
            await formBuilderPage.trackByNoCheck();
        });

        await test.step("Step 7: Same browser can now submit multiple times without restriction", async () => {
            const popup1 = await formBuilderPage.getPublishedPage();
            const publishedPage1 = new PublishedFormPage(popup1);
            await publishedPage1.fillEmailAndSubmit(faker.internet.email());
            await popup1.close();

            const popup2 = await formBuilderPage.getPublishedPage();
            const publishedPage2 = new PublishedFormPage(popup2);
            await publishedPage2.fillEmailAndSubmit(faker.internet.email());
            await popup2.close();
        });
    });
});