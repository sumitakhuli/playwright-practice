import { test, expect } from '@fixtures';
import { PublishedFormPage } from '@poms';

test.describe("Customize form", () => {
    test("Customize form's field elements: randomize and hide", async ({ page, formBuilderPage }) => {
        test.setTimeout(120000);
        let formEditorUrl: string;

        await test.step("Step 1: Create a new form", async () => {
            await page.goto('/');
            await formBuilderPage.createNewForm();
            formEditorUrl = page.url();
        });

        await test.step("Step 2: Add single and multi choice questions with options", async () => {
            await formBuilderPage.addSingleChoiceQuestion();
            await formBuilderPage.randomizeQuestion();

            await formBuilderPage.addMultipleChoiceQuestion();
            await formBuilderPage.hideQuestion();
        });

        await test.step("Step 3: Publish and verify randomization and hidden status", async () => {
            const popup = await formBuilderPage.publishAndGetPage();
            const publishedPage = new PublishedFormPage(popup);

            await publishedPage.verifyOptionsRandomized();
            await publishedPage.verifyQuestionHidden('multiple');
            await popup.close();
        });

        await test.step("Step 4: Unhide question and verify visibility", async () => {
            // Ensure we are on the builder page
            await page.goto(formEditorUrl);

            // Select the multiple choice question to show its settings
            await formBuilderPage.selectMultipleChoiceQuestion();
            await formBuilderPage.hideQuestion(); // Unclick the hide switch

            const popup = await formBuilderPage.publishAndGetPage();
            const publishedPage = new PublishedFormPage(popup);

            await publishedPage.verifyQuestionVisible('multiple');
            await popup.close();
        });

        await test.step("Step 5: Cleanup", async () => {
            await page.goto(formEditorUrl);
            await formBuilderPage.deleteForm();
        });
    });
});