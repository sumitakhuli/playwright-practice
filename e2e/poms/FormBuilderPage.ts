import { Page, Browser, expect } from '@playwright/test';
import { BUILDER_SELECTORS, ELEMENT_TYPE_SELECTORS, ANALYTICS_SELECTORS, QUESTION_SETTINGS_SELECTORS, DASHBOARD_SELECTORS, SETTINGS_SELECTORS, CONDITIONAL_LOGIC_SELECTORS } from '@selectors';
import { PublishedFormPage } from './PublishedFormPage';

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

        await expect(this.page.getByTestId(BUILDER_SELECTORS.submissionLabel).locator('div').filter({ hasText: email })).toBeVisible({ timeout: 15000 });
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

    getPublishedPage = async (): Promise<PublishedFormPage> => {
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByTestId(BUILDER_SELECTORS.previewButton).click();
        const popup = await popupPromise;
        await popup.waitForLoadState();
        return new PublishedFormPage(popup);
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

        const publishedPage = new PublishedFormPage(newPage);
        await publishedPage.submitWithPassword('test', email);
        await publishedPage.verifyThankYou();

        await newContext.close();
    }

    enableUniqueSubmission = async () => {
        await this.page.getByTestId(SETTINGS_SELECTORS.uniqueSubmissionLink).click();
        await expect(this.page.getByTestId(SETTINGS_SELECTORS.cookieTrackRadio)).toBeVisible({ timeout: 15000 });
    }

    trackByCookie = async () => {
        await this.page.getByTestId(SETTINGS_SELECTORS.cookieTrackRadio).check();
        await this.page.getByTestId(SETTINGS_SELECTORS.saveChangesButton).click();
    }

    trackByNoCheck = async () => {
        await this.page.getByTestId(SETTINGS_SELECTORS.noTrackRadio).check();
        await this.page.getByTestId(SETTINGS_SELECTORS.saveChangesButton).click();
    }

    createAndPublishForm = async (): Promise<string> => {
        await this.page.goto('/');
        await this.createNewForm();
        const formEditorUrl = this.page.url();
        await this.publishForm();
        return formEditorUrl;
    }

    enableUniqueSubmissionWithTracking = async (trackingType: 'cookie' | 'noCheck') => {
        await this.navigateToSettings();
        await this.enableUniqueSubmission();
        if (trackingType === 'cookie') {
            await this.trackByCookie();
        } else {
            await this.trackByNoCheck();
        }
    }

    submitPublishedForm = async (email: string) => {
        const publishedPage = await this.getPublishedPage();
        await publishedPage.fillEmailAndSubmit(email);
        return publishedPage;
    }

    submitFormInNewContext = async (browser: Browser, email: string) => {
        const previewHref = await this.page.getByTestId(BUILDER_SELECTORS.previewButton).getAttribute('href');
        const origin = new URL(this.page.url()).origin;
        const formUrl = previewHref?.startsWith('http') ? previewHref : `${origin}${previewHref}`;

        const newContext = await browser.newContext({ storageState: { cookies: [], origins: [] } });
        const newPage = await newContext.newPage();
        await newPage.goto(formUrl);
        await newPage.waitForLoadState('domcontentloaded');

        const publishedPage = new PublishedFormPage(newPage);
        await publishedPage.fillEmailAndSubmit(email);
        await publishedPage.verifyThankYou();

        await newContext.close();
    }

    deleteEmailField = async () => {
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.emailMoreDropdown).click();
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.deleteElementBtn).click();
        await this.page.waitForTimeout(1500);
    }

    addSingleChoiceWithTwoOptions = async () => {
        await this.page.getByTestId(BUILDER_SELECTORS.addElementButton).click();
        await this.page.getByRole('button', { name: ELEMENT_TYPE_SELECTORS.singleChoice }).click();
        await this.page.waitForTimeout(1500);
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.optionInput3).hover();
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.deleteOption3Btn).click();
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.optionInput2).hover();
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.deleteOption2Btn).click();
    }

    addEmailField = async () => {
        await this.page.getByRole('button', { name: 'Email' }).click(); // standard locator
        await expect(this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.emailTextField)).toBeVisible();
    }

    addCondition = async () => {
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.settingsLink).click();
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.noDataPrimaryBtn).click();
        await expect(this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.mainHeader)).toBeVisible();
    }

    addConditionalLogic = async () => {
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.selectValueContainer).first().click();
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.typeQuestionOption).click();
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.selectValueContainer).nth(1).click();
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.isEqualToOption).click();
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.selectValueContainer).nth(2).click();
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.option1Select).click();
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.selectValueContainer).nth(3).click();
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.showSelectOption).click();
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.selectValueContainer).nth(4).click();
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.emailSelectOption).click();
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.saveChangesBtn).click();
        await this.page.waitForTimeout(1500);
    }

    changeConditionalLogic = async() => {
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.conditionalLogicDropdown).click();
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.conditionsEditBtn).click();
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.disabledRadioInput).check();
        await this.page.getByTestId(CONDITIONAL_LOGIC_SELECTORS.saveChangesBtn).click();
        await this.page.waitForTimeout(1500);
    }

    addFieldforURLTest = async () => {
        await this.page.getByTestId(BUILDER_SELECTORS.addElementButton).click();
        await this.page.getByRole('button', { name: 'Star rating' }).click();
        await this.page.waitForTimeout(1500);
        await this.page.getByRole('button', { name: 'Opinion scale' }).click();
        await this.page.waitForTimeout(1500);
        await this.page.getByRole('button', { name: 'Matrix' }).click();
        await this.page.waitForTimeout(1500);
    }

    editStarRating = async () => {
        await this.page.getByRole('button', { name: 'Question' }).nth(1).click();
        await this.page.getByTestId('content-text-field').fill('Star Rating');
        await this.page.getByRole('button', { name: 'Advanced properties' }).click();
        await this.page.getByTestId('field-code-text-field').fill('sr');
    }

    editOpinionScale = async () => {
        await this.page.getByRole('button', { name: 'Question' }).nth(2).click();
        await this.page.getByTestId('content-text-field').fill('Opinion Scale');
        await this.page.getByRole('button', { name: 'Advanced properties' }).click();
        await this.page.getByTestId('field-code-text-field').fill('os');
    }

    editMatrix = async () => {
          await this.page.getByRole('button', { name: 'Question' }).nth(3).click();
          await this.page.getByTestId('question-text-input-label').click();
          await this.page.getByTestId('content-text-field').click();
          await this.page.getByTestId('content-text-field').fill('Matrix');
          await this.page.getByTestId('matrix-row-container').getByTestId('option-input-0').click();
          await this.page.getByTestId('matrix-row-container').getByTestId('option-input-0').fill('1');
          await this.page.getByTestId('matrix-row-container').getByTestId('option-input-1').click();
          await this.page.getByTestId('matrix-row-container').getByTestId('option-input-1').fill('2');
          await this.page.getByTestId('matrix-row-container').getByTestId('add-option-link').click();
          await this.page.getByTestId('option-input-2').fill('3');
          await this.page.getByTestId('matrix-column-container').getByTestId('option-input-0').click();
          await this.page.getByTestId('matrix-column-container').getByTestId('option-input-0').fill('one');
          await this.page.getByTestId('matrix-column-container').getByTestId('option-input-1').click();
          await this.page.getByTestId('matrix-column-container').getByTestId('option-input-1').fill('two');
          await this.page.getByTestId('matrix-column-container').getByTestId('add-option-link').click();
          await this.page.getByTestId('matrix-column-container').getByTestId('option-input-2').fill('three');
          await this.page.getByRole('button', { name: 'Advanced properties' }).click();
          await this.page.getByTestId('field-code-text-field').fill('mf');
          await this.page.waitForTimeout(1500);
    }

    verifyEmail = async (email: string) => {
        await expect(this.page.getByTestId('email-text-field')).toHaveValue(email);
    }

    verifyStarRating = async (starRating: number) => {
        await expect(
      this.page
        .getByTestId('star-rating-group')
        .locator(`input[value="${starRating}"]`),
    ).toBeChecked();
        // const testId = `rating-icon-${starRating}`;
        // await expect(this.page.getByTestId(testId)).toBeChecked();
    }

    verifyOpinionScale = async (opinionScale: number) => {
        const testId = `opinion-scale-item-${opinionScale}`;
        await expect(this.page.getByTestId(testId)).toBeChecked();
    }

    verifyMatrix = async () => {
        await expect(this.page.getByTestId('matrix-radio-label').first()).toBeChecked();
        await expect(this.page.getByTestId('matrix-radio-label').nth(4)).toBeChecked();
        await expect(this.page.locator('tr:nth-child(3) > td:nth-child(4) > .neeto-form-radio')).toBeChecked();
    }
}