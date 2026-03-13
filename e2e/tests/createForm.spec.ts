import { test, expect } from '@fixtures';
import { faker } from '@faker-js/faker';
import { PublishedFormPage } from '@poms';

test.describe("Create and submit a form", () => {

    test("Complete flow: build, validate, submit and verify", async ({ page, formBuilderPage }) => {
        test.setTimeout(90000);
        let formEditorUrl: string;

        const userData = {
            firstName: faker.person.firstName().replace(/[^a-zA-Z]/g, ''),
            lastName: faker.person.lastName().replace(/[^a-zA-Z]/g, ''),
            email: `test-${Date.now()}@example.com`,
            phone: '3022223333'
        };

        await test.step("Step 1: Create a new form", async () => {
            await page.goto('/');
            await formBuilderPage.createNewForm();
        });

        await test.step("Step 2: Add fields and publish form", async () => {
            await formBuilderPage.addFields();
            formEditorUrl = page.url();
            const popup = await formBuilderPage.publishAndGetPage();

            const publishedPage = new PublishedFormPage(popup);

            await test.step("Step 2.1: Verify fields visibility", async () => {
                await publishedPage.verifyFieldsVisible();
            });

            await test.step("Step 2.2: Check validation errors", async () => {
                await publishedPage.checkValidation('invalid-email', '12345');
                await publishedPage.checkRequiredFields();
            });

            await test.step("Step 2.3: Fill and submit valid response", async () => {
                await publishedPage.submitForm(userData);
            });
        });

        await test.step("Step 3: Verify submission in builder", async () => {
            await page.goto(formEditorUrl);
            await page.waitForLoadState('domcontentloaded');
            await formBuilderPage.verifySubmissionVisible(userData.email);
        });

        await test.step("Step 4: Delete form and verify", async () => {
            const formTitle = await formBuilderPage.getFormTitle();
            await formBuilderPage.deleteForm();

            // Simplest and most reliable check: The button with the form title should no longer exist
            if (formTitle) {
                await expect(page.getByRole('button', { name: formTitle })).toBeHidden({ timeout: 15000 });
            }
        });
    });
});
