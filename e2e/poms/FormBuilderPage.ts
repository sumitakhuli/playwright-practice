import { Page, Browser, expect } from '@playwright/test';
import { BUILDER_SELECTORS, ELEMENT_TYPE_SELECTORS, ANALYTICS_SELECTORS, QUESTION_SETTINGS_SELECTORS, DASHBOARD_SELECTORS, SETTINGS_SELECTORS, PUBLISHED_FORM_SELECTORS } from '@selectors';

export class FormBuilderPage {
    constructor(private page: Page) { }

    createNewForm = async () => {
        await this.page.getByTestId(DASHBOARD_SELECTORS.addFormButton).click();
        await this.page.getByTestId(BUILDER_SELECTORS.startFromScratchButton).click();
        await expect(this.page.getByTestId(BUILDER_SELECTORS.addElementButton)).toBeVisible({ timeout: 20000 });
    }

    addFields = async () => {
        await this.page.getByTestId(BUILDER_SELECTORS.addElementButton).click();
        await this.page.getByRole('button', { name: ELEMENT_TYPE_SELECTORS.name, exact: true }).first().click();
        await this.page.getByTestId(BUILDER_SELECTORS.elementsContainer).click();
        await this.page.getByRole('button', { name: ELEMENT_TYPE_SELECTORS.phone, exact: true }).first().click();
    }

    verifySubmissionVisible = async (email: string) => {
        await expect(this.page.getByTestId(BUILDER_SELECTORS.submissionsTab)).toBeVisible({ timeout: 15000 });
        await this.page.getByTestId(BUILDER_SELECTORS.submissionsTab).click();

        await expect(this.page.getByTestId('submission-label').locator('div').filter({ hasText: email })).toBeVisible({ timeout: 15000 });
    }

    publishForm = async () => {
        await this.page.getByTestId(BUILDER_SELECTORS.publishButton).click();
        await expect(this.page.getByTestId(BUILDER_SELECTORS.previewButton)).toBeEnabled({ timeout: 15000 });
    }

    navigateToAnalytics = async () => {
        await this.page.getByTestId(BUILDER_SELECTORS.analyticsTab).click();
        await expect(this.page.getByTestId(ANALYTICS_SELECTORS.visitsMetric)).toBeVisible({ timeout: 15000 });
    }

    verifyInsights = async (visits: string, starts: string, submissions: string, completionRate: string) => {
        await expect(this.page.getByTestId(ANALYTICS_SELECTORS.visitsMetric).getByTestId(ANALYTICS_SELECTORS.insightsCount)).toHaveText(visits, { timeout: 15000 });
        await expect(this.page.getByTestId(ANALYTICS_SELECTORS.startsMetric).getByTestId(ANALYTICS_SELECTORS.insightsCount)).toHaveText(starts, { timeout: 15000 });
        await expect(this.page.getByTestId(ANALYTICS_SELECTORS.submissionsMetric).getByTestId(ANALYTICS_SELECTORS.insightsCount)).toHaveText(submissions, { timeout: 15000 });
        await expect(this.page.getByTestId(ANALYTICS_SELECTORS.completionRateMetric).getByTestId(ANALYTICS_SELECTORS.insightsCount)).toHaveText(completionRate, { timeout: 15000 });
    }

    publishAndGetPage = async (): Promise<Page> => {
        await this.page.getByTestId(BUILDER_SELECTORS.publishButton).click();
        await expect(this.page.getByTestId(BUILDER_SELECTORS.previewButton)).toBeEnabled({ timeout: 15000 });
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByTestId(BUILDER_SELECTORS.previewButton).click();
        const popup = await popupPromise;
        await popup.waitForLoadState();
        return popup;
    }

    getFormTitle = async () => {
        const title = await this.page.getByTestId(BUILDER_SELECTORS.formTitle).textContent();
        return title?.trim() || '';
    }

    deleteForm = async () => {
        await this.page.getByTestId(BUILDER_SELECTORS.menuButton).click();
        await this.page.getByTestId(BUILDER_SELECTORS.deleteButton).click();
        await this.page.getByTestId(BUILDER_SELECTORS.archiveCheckbox).check();
        await this.page.getByTestId(BUILDER_SELECTORS.confirmDeleteButton).click();
        await expect(this.page.getByTestId(DASHBOARD_SELECTORS.addFormButton)).toBeVisible({ timeout: 20000 });
    }

    safeDeleteForm = async () => {
        try {
            await this.deleteForm();
        } catch {
            // Silently ignore — form may not have been created if the test failed early
        }
    }

    addSingleChoiceQuestion = async () => {
        await this.page.getByTestId(BUILDER_SELECTORS.addElementButton).click();
        await this.page.getByRole('button', { name: ELEMENT_TYPE_SELECTORS.singleChoice, exact: true }).first().click();
        await expect(this.page.getByTestId(QUESTION_SETTINGS_SELECTORS.addOption)).toBeVisible({ timeout: 10000 });

        for (let i = 0; i < 6; i++) {
            await this.page.getByTestId(QUESTION_SETTINGS_SELECTORS.addOption).click();
        }
    }

    addMultipleChoiceQuestion = async () => {
        const multipleChoiceBtn = this.page.getByRole('button', { name: ELEMENT_TYPE_SELECTORS.multipleChoice, exact: true });
        if (!(await multipleChoiceBtn.first().isVisible())) {
            await this.page.getByTestId(BUILDER_SELECTORS.elementsContainer).click();
            await expect(multipleChoiceBtn.first()).toBeVisible({ timeout: 5000 });
        }

        await multipleChoiceBtn.first().click();

        await this.page.getByRole('button', { name: ELEMENT_TYPE_SELECTORS.question }).nth(2).click();

        await expect(this.page.getByTestId(QUESTION_SETTINGS_SELECTORS.addOption)).toBeVisible({ timeout: 10000 });

        for (let i = 0; i < 6; i++) {
            await this.page.getByTestId(QUESTION_SETTINGS_SELECTORS.addOption).click();
        }
    }

    selectMultipleChoiceQuestion = async () => {
        await this.page.getByRole('button', { name: ELEMENT_TYPE_SELECTORS.typeQuestion }).nth(1).click();
        await expect(this.page.getByTestId(QUESTION_SETTINGS_SELECTORS.addOption)).toBeVisible({ timeout: 10000 });
    }

    hideQuestion = async () => {
        await this.page.getByTestId(QUESTION_SETTINGS_SELECTORS.hideSwitch).getByTestId(QUESTION_SETTINGS_SELECTORS.nuiSwitch).click();
        await this.page.waitForTimeout(1500);
    }

    randomizeQuestion = async () => {
        await this.page.getByTestId(QUESTION_SETTINGS_SELECTORS.randomizeSwitch).filter({ visible: true }).first().click();
        await this.page.waitForTimeout(1500);
    }

    navigateToSettings = async () => {
        await this.page.getByTestId(SETTINGS_SELECTORS.settingsTab).click();
        await expect(this.page.getByTestId(SETTINGS_SELECTORS.accessControlLink)).toBeVisible({ timeout: 15000 });
    }

    addAccessControl = async () => {
        await this.page.getByTestId(SETTINGS_SELECTORS.accessControlLink).click();
        await expect(this.page.getByTestId(SETTINGS_SELECTORS.passwordProtectedRadio)).toBeVisible({ timeout: 15000 });
    }

    addAccessControlWithPassword = async () => {
        await this.page.getByTestId(SETTINGS_SELECTORS.passwordProtectedRadio).check();

        await this.page.getByTestId(SETTINGS_SELECTORS.saveChangesButton).click();
        await expect(this.page.getByTestId(SETTINGS_SELECTORS.passwordInputError)).toBeVisible({ timeout: 5000 });

        await this.page.getByTestId(SETTINGS_SELECTORS.passwordInputField).fill('test');
        await this.page.getByTestId(SETTINGS_SELECTORS.saveChangesButton).click();
    }

    FillFormWithNewContext = async (browser: Browser, email: string) => {
        const previewHref = await this.page.getByTestId(BUILDER_SELECTORS.previewButton).getAttribute('href');
        const origin = new URL(this.page.url()).origin;
        const formUrl = previewHref?.startsWith('http') ? previewHref : `${origin}${previewHref}`;

        const newContext = await browser.newContext({
            storageState: { cookies: [], origins: [] }
        });

        const newPage = await newContext.newPage();
        await newPage.goto(formUrl);
        await newPage.waitForLoadState('domcontentloaded');

        await expect(newPage.getByTestId(PUBLISHED_FORM_SELECTORS.passwordField)).toBeVisible({ timeout: 15000 });
        await newPage.getByTestId(PUBLISHED_FORM_SELECTORS.passwordField).fill('test');
        await newPage.getByTestId(PUBLISHED_FORM_SELECTORS.continueButton).click();

        await newPage.getByTestId(PUBLISHED_FORM_SELECTORS.emailField).fill(email);
        await newPage.getByTestId(PUBLISHED_FORM_SELECTORS.submitButton).click();

        await newContext.close();
    }
}