import { test } from '@fixtures';
import { faker } from '@faker-js/faker';

test.describe("Create and submit a form", () => {
    let formEditorUrl: string;

    test.afterEach(async ({ page, formBuilderPage }) => {
        if (formEditorUrl) {
            await page.goto(formEditorUrl);
            await page.waitForLoadState('domcontentloaded');
        }
        await formBuilderPage.safeDeleteForm();
    });

    test("Complete flow: build, validate, submit and verify", async ({ page, formBuilderPage }) => {
        test.setTimeout(90000);

        const userData = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            phone: '3022223333'
        };

        await test.step("Step 1: Create a new form", async () => {
            await page.goto('/');
            await formBuilderPage.createNewForm();
            formEditorUrl = page.url();
        });

        await test.step("Step 2: Add fields and publish form", async () => {
            await formBuilderPage.addFields();
            await formBuilderPage.publishForm();
            const publishedPage = await formBuilderPage.getPublishedPage();

            await test.step("Step 2.1: Verify fields visibility", async () => {
                await publishedPage.verifyFieldsVisible();
            });

            await test.step("Step 2.2: Check validation errors", async () => {
                await publishedPage.checkValidation('invalid-email', '12345');
                await publishedPage.checkRequiredFields();
            });

            await test.step("Step 2.3: Fill and submit valid response", async () => {
                await publishedPage.submitForm(userData);
                await publishedPage.close();
            });
        });

        await test.step("Step 3: Verify submission in builder", async () => {
            await page.goto(formEditorUrl);
            await page.waitForLoadState('domcontentloaded');
            await formBuilderPage.verifySubmissionVisible(userData.email);
        });
    });
});

