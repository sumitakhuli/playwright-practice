import { test, expect } from '@fixtures';
import { faker } from '@faker-js/faker';
import { TIMEOUT } from 'node:dns';

test.describe("Download Submission", () => {
    test.afterEach(async ({ formBuilderPage }) => {
        await formBuilderPage.safeDeleteForm();
    });

    test("Verify download submission", async ({ page, formBuilderPage }) => {
        test.setTimeout(180000);
        const email = faker.internet.email();
        const starRating = 4;
        const opinionScale = 7;

        await test.step("Step 1: Create a new form", async () => {
            await page.goto('/');
            await formBuilderPage.createNewForm();
        });

        await test.step("Step 2: Add fields", async () => {
            await formBuilderPage.addFieldforURLTest();
            await formBuilderPage.publishForm();
        });

        await test.step("Step 3: Fill and submit form as respondent", async () => {
            const publishedPage = await formBuilderPage.getPublishedPage();
            await publishedPage.fillAndSubmitForm({
                email,
                starRating,
                opinionScale,
            });
        });

        await test.step("Step 4: View and download submission", async () => {
            await page.waitForTimeout(3000); // Wait for submission to process and index
            await formBuilderPage.navigateToSubmissions();
            await formBuilderPage.viewSubmission(1);
            
            const pdfPopup = await formBuilderPage.downloadSubmission();
            // Verify content - checking if URL contains PDF related keywords or blob
            // await page.waitForTimeout(3000);
            await expect(pdfPopup).toHaveURL(/.*(pdf|blob).*/i);
            await pdfPopup.close();
        });

        await test.step("Step 5: Close side panel", async () => {
            await formBuilderPage.closePanel();
        });
    });
});