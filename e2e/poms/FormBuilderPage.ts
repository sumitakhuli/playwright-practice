import { Page, expect } from '@playwright/test';
import { BUILDER_SELECTORS, BUILDER_ROLE_SELECTORS } from '@selectors';

export class FormBuilderPage {
    constructor(private page: Page) { }

    createNewForm = async () => {
        await expect(this.page.getByTestId(BUILDER_SELECTORS.addFormButton)).toBeVisible({ timeout: 15000 });
        await this.page.getByTestId(BUILDER_SELECTORS.addFormButton).click();
        await expect(this.page.getByTestId(BUILDER_SELECTORS.startFromScratchButton)).toBeVisible({ timeout: 10000 });
        await this.page.getByTestId(BUILDER_SELECTORS.startFromScratchButton).click();
    }

    addFields = async () => {
        await this.page.getByTestId(BUILDER_SELECTORS.addElementButton).click();
        await this.page.getByRole('button', { name: BUILDER_ROLE_SELECTORS.nameElement }).click();
        await this.page.getByRole('button', { name: BUILDER_ROLE_SELECTORS.phoneNumberElement }).click();
    }

    publishAndGetPage = async (): Promise<Page> => {
        await this.page.getByTestId(BUILDER_SELECTORS.publishButton).click();
        await expect(this.page.getByTestId(BUILDER_SELECTORS.previewButton)).toBeEnabled({ timeout: 10000 });
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByTestId(BUILDER_SELECTORS.previewButton).click();
        const popup = await popupPromise;
        await popup.waitForLoadState();
        return popup;
    }

    verifySubmissionVisible = async (email: string) => {
        await expect(this.page.getByTestId(BUILDER_SELECTORS.submissionsTab)).toBeVisible({ timeout: 15000 });
        await this.page.getByTestId(BUILDER_SELECTORS.submissionsTab).click();

        // Playwright's expect will automatically retry until the email is visible or timeout is reached.
        await expect(this.page.locator('div').filter({ hasText: new RegExp(`^${email}$`) }).nth(1)).toBeVisible({ timeout: 15000 });
    }
}
