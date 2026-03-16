import { test } from '@fixtures';

test.describe("Customize form", () => {
    let formEditorUrl: string;

    test.afterEach(async ({ page, formBuilderPage }) => {
        if (formEditorUrl) {
            await page.goto(formEditorUrl);
            await page.waitForLoadState('domcontentloaded');
        }
        await formBuilderPage.safeDeleteForm();
    });

    test("Customize form's field elements: randomize and hide", async ({ page, formBuilderPage }) => {
        test.setTimeout(120000);

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
            await formBuilderPage.publishForm();
            const publishedPage = await formBuilderPage.getPublishedPage();

            await publishedPage.verifyOptionsRandomized();
            await publishedPage.verifyQuestionHidden('multiple');
            await publishedPage.close();
        });

        await test.step("Step 4: Unhide question and verify visibility", async () => {
            await page.goto(formEditorUrl);

            await formBuilderPage.selectMultipleChoiceQuestion();
            await formBuilderPage.hideQuestion();

            await formBuilderPage.publishForm();
            const publishedPage = await formBuilderPage.getPublishedPage();

            await publishedPage.verifyQuestionVisible('multiple');
            await publishedPage.close();
        });
    });
});