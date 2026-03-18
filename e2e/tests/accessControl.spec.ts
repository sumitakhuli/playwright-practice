import { test, expect } from '@fixtures';
import { faker } from '@faker-js/faker';

test.describe("Access Control", () => {
    test.afterEach(async ({ formBuilderPage }) => {
        await formBuilderPage.safeDeleteForm();
    });

    test("Verify password protected form", async ({ page, formBuilderPage, browser }) => {
        test.setTimeout(120000);
        const email = faker.internet.email();
        const password = faker.internet.password();

        let formEditorUrl = '';

        await test.step("Step 1: Create a new form and publish it", async () => {
            formEditorUrl = await formBuilderPage.createAndPublishForm();
        });

        await test.step("Step 2: Navigate to settings and configure access control", async () => {
            await formBuilderPage.navigateToSettings();
            await formBuilderPage.addAccessControl();
            await formBuilderPage.addAccessControlWithPassword(password);
        });

        await test.step("Step 3: Open form in new context and submit with generated email", async () => {
            await formBuilderPage.FillFormWithNewContext(browser, email, password);
        });

        await test.step("Step 4: Verify submission is visible in submissions tab", async () => {
            await formBuilderPage.verifySubmissionVisible(email);
        });
    });
});


