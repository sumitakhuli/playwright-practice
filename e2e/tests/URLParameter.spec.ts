import { test, expect } from '@fixtures';
import { faker } from '@faker-js/faker';


test.describe("URL Parameter", () => {
    test.afterEach(async ({ formBuilderPage }) => {
        await formBuilderPage.safeDeleteForm();
    });

   test("Verify URL parameter", async ({ page, formBuilderPage, browser }) => {
    test.setTimeout(120000);
    const email = faker.internet.email();
    const starRating = faker.number.int({ min: 1, max: 5 });
    const opinionScale = faker.number.int({ min: 1, max: 10 });

    let Url : string;

    await test.step("Step 1: Create a new form and publish it", async () => {
        await page.goto('/');
        await formBuilderPage.createNewForm();
    });

    await test.step("Step 2: Add fields for URL parameter", async () => {
       await formBuilderPage.addFieldforURLTest();
    });

    await test.step("Step 3: Edit fields", async () => {
        await test.step("Step 3.1: Edit star rating", async () => {
            await formBuilderPage.editStarRating();
        });
        await test.step("Step 3.2: Edit opinion scale", async () => {
            await formBuilderPage.editOpinionScale();
        });
        await test.step("Step 3.3: Edit matrix", async () => {
            await formBuilderPage.editMatrix();
        });
    });

    await test.step("Step 4: Publishing form and get page URL", async () => {
        await formBuilderPage.publishForm();
        const publishedPage = await formBuilderPage.getPublishedPage();

        await test.step("Step 4.1: Get page URL", async () => {
            Url = publishedPage.page.url();
        });

        await test.step("Step 4.2: constructURL and navigate", async () => {
            const urlWithParams = new URL(Url);
            const params = {
                email: email,
                sr: starRating.toString(),
                os: opinionScale.toString(),
                'mf.1': 'one',
                'mf.2': 'two',
                'mf.3': 'three'
            };
            
            Object.entries(params).forEach(([key, value]) => {
                urlWithParams.searchParams.set(key, encodeURIComponent(value));
            });

            Url = urlWithParams.toString();
            await publishedPage.page.goto(Url);
            await publishedPage.page.waitForLoadState('domcontentloaded');
        });

        await test.step("Step 5: Verify URL parameters on published page", async () => {
            await test.step("Step 5.1: Verify email", async () => {
                await publishedPage.verifyEmail(email);
            });
            await test.step("Step 5.2: Verify star rating", async () => {
                await publishedPage.verifyStarRating(starRating);
            });
            await test.step("Step 5.3: Verify opinion scale", async () => {
                await publishedPage.verifyOpinionScale(opinionScale);
            });
            await test.step("Step 5.4: Verify matrix", async () => {
                await publishedPage.verifyMatrix();
            });
        });

        await test.step("Step 6: Close the published page", async () => {
            await publishedPage.close();
        });
    });
   });
});