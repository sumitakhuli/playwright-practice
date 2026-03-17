import { test } from '@fixtures';
import { faker } from '@faker-js/faker';
import { PublishedFormPage } from '@poms/PublishedFormPage';

test.describe("Conditional logic", () => {
    let formEditorUrl: string;

    test.afterEach(async ({ page, formBuilderPage }) => {
        if (formEditorUrl) {
            await page.goto(formEditorUrl);
            await page.waitForLoadState('domcontentloaded');
        }
        await formBuilderPage.safeDeleteForm();
    });

    test("Conditional Logic for form", async ({ page, formBuilderPage }) => {
        test.setTimeout(90000);

        await test.step("Step 1: Create a new form", async () => {
            await page.goto('/');
            await formBuilderPage.createNewForm();
        });

        await test.step("Step 2: Add option and email fields to the form", async () => {
            await formBuilderPage.deleteEmailField();
            await formBuilderPage.addSingleChoiceWithTwoOptions();
            await formBuilderPage.addEmailField();
        });

        await test.step("Step 3: Moving to the conditional logic tab", async () => {
            await formBuilderPage.navigateToSettings();
            await formBuilderPage.addCondition();
            formEditorUrl = page.url();
        });

        await test.step("Step 4: Adding conditions", async () => {
            await formBuilderPage.addConditionalLogic();
            formEditorUrl = page.url();
        });

        await test.step("Step 5: Publishing the form", async () => {
            await formBuilderPage.publishForm();      
            const publishedPage = await formBuilderPage.getPublishedPage();
            
            await test.step("Step 5.1: Verifying the conditional logic", async () => {
                await publishedPage.verifyConditionalLogic();               
            });    
            
            await test.step("Step 5.2: Close the form", async () => {
                await publishedPage.close();               
            });
        });

        await test.step("Step 6: Change conditonal Logic", async () => {
            await formBuilderPage.changeConditionalLogic();
            const publishedPage = await formBuilderPage.getPublishedPage();

            await test.step("Step 6.1: Verifying the new conditional logic", async () => {
                await publishedPage.verifyNewConditionalLogic();               
            });    
            
            await test.step("Step 6.2: Close the form", async () => {
                await publishedPage.close();               
            });
        });
    });
});

