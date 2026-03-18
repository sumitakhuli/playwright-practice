import { Page, Browser, expect } from '@playwright/test';
import { BUILDER_SELECTORS, ELEMENT_TYPE_SELECTORS, ANALYTICS_SELECTORS, QUESTION_SETTINGS_SELECTORS, DASHBOARD_SELECTORS, SETTINGS_SELECTORS, CONDITIONAL_LOGIC_SELECTORS, QUESTION_PROPERTIES_SELECTORS, PUBLISHED_FORM_SELECTORS, SUBMISSION_SELECTORS } from '@selectors';
import { PublishedFormPage } from './PublishedFormPage';
import { getPdfTextAndDeletePdf } from '@utils';

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
        await popup.waitForLoadState('networkidle');
        return new PublishedFormPage(popup);
    }

    triggerVisitAndStartMetrics = async (emailToFill?: string) => {
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByTestId(BUILDER_SELECTORS.previewButton).click();
        const popup = await popupPromise;
        await popup.waitForLoadState('networkidle');
        if (emailToFill) {
            await popup.getByTestId(PUBLISHED_FORM_SELECTORS.emailField).fill(emailToFill);
            await popup.waitForTimeout(2000);
        }
        await popup.close();
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

    addAccessControlWithPassword = async (password: string) => {
        await this.page.getByTestId(SETTINGS_SELECTORS.passwordProtectedRadio).check();

        await this.page.getByTestId(SETTINGS_SELECTORS.saveChangesButton).click();
        await expect(this.page.getByTestId(SETTINGS_SELECTORS.passwordInputError)).toBeVisible({ timeout: 5000 });

        await this.page.getByTestId(SETTINGS_SELECTORS.passwordInputField).fill(password);
        await this.page.getByTestId(SETTINGS_SELECTORS.saveChangesButton).click();
    }

    getPublishedFormUrl = async (): Promise<string> => {
        const previewHref = await this.page.getByTestId(BUILDER_SELECTORS.previewButton).getAttribute('href');
        const origin = new URL(this.page.url()).origin;
        return previewHref?.startsWith('http') ? previewHref : `${origin}${previewHref}`;
    }

    FillFormWithNewContext = async (browser: Browser, email: string, password: string) => {
        const formUrl = await this.getPublishedFormUrl();
        const newContext = await browser.newContext({ storageState: { cookies: [], origins: [] } });
        const newPage = await newContext.newPage();
        await newPage.goto(formUrl);
        await newPage.waitForLoadState('domcontentloaded');

        const publishedPage = new PublishedFormPage(newPage);
        await publishedPage.submitWithPassword(password, email);
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
        await publishedPage.verifyThankYou();
        await publishedPage.close();
    }

    submitFormInNewContext = async (browser: Browser, email: string) => {
        const formUrl = await this.page.getByTestId(BUILDER_SELECTORS.previewButton).getAttribute('href');

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
        await this.page.getByRole('button', { name: ELEMENT_TYPE_SELECTORS.email }).click();
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
        await this.page.getByRole('button', { name: ELEMENT_TYPE_SELECTORS.starRating }).click();
        await this.page.waitForTimeout(1500);
        await this.page.getByRole('button', { name: ELEMENT_TYPE_SELECTORS.opinionScale }).click();
        await this.page.waitForTimeout(1500);
        await this.page.getByRole('button', { name: ELEMENT_TYPE_SELECTORS.matrix }).click();
        await this.page.waitForTimeout(1500);
    }

    private editQuestionProperties = async (questionIndex: number, label: string, code: string) => {
        await this.page.getByRole('button', { name: ELEMENT_TYPE_SELECTORS.question }).nth(questionIndex).click();
        await this.page.getByTestId(QUESTION_PROPERTIES_SELECTORS.contentField).fill(label);
        await this.page.getByRole('button', { name: QUESTION_PROPERTIES_SELECTORS.advancedProperties }).click();
        await this.page.getByTestId(QUESTION_PROPERTIES_SELECTORS.fieldCodeField).fill(code);
    }

    editStarRating = async () => {
        await this.editQuestionProperties(1, 'Star Rating', 'sr');
    }

    editOpinionScale = async () => {
        await this.editQuestionProperties(2, 'Opinion Scale', 'os');
    }

    private selectQuestion = async (index: number) => {
        await this.page.getByRole('button', { name: ELEMENT_TYPE_SELECTORS.question }).nth(index).click();
    }

    private setQuestionLabel = async (label: string) => {
        await this.page.getByTestId(QUESTION_PROPERTIES_SELECTORS.questionTextInputLabel).click();
        await this.page.getByTestId(QUESTION_PROPERTIES_SELECTORS.contentField).fill(label);
    }

    private setMatrixRows = async () => {
        const rowContainer = this.page.getByTestId(QUESTION_PROPERTIES_SELECTORS.matrixRowContainer);
        await rowContainer.getByTestId(QUESTION_PROPERTIES_SELECTORS.optionInput(0)).click();
        await rowContainer.getByTestId(QUESTION_PROPERTIES_SELECTORS.optionInput(0)).fill('1');
        await rowContainer.getByTestId(QUESTION_PROPERTIES_SELECTORS.optionInput(1)).click();
        await rowContainer.getByTestId(QUESTION_PROPERTIES_SELECTORS.optionInput(1)).fill('2');
        await rowContainer.getByTestId(QUESTION_SETTINGS_SELECTORS.addOption).click();
        await this.page.getByTestId(QUESTION_PROPERTIES_SELECTORS.optionInput(2)).fill('3');
    }

    private setMatrixColumns = async () => {
        const columnContainer = this.page.getByTestId(QUESTION_PROPERTIES_SELECTORS.matrixColumnContainer);
        await columnContainer.getByTestId(QUESTION_PROPERTIES_SELECTORS.optionInput(0)).click();
        await columnContainer.getByTestId(QUESTION_PROPERTIES_SELECTORS.optionInput(0)).fill('one');
        await columnContainer.getByTestId(QUESTION_PROPERTIES_SELECTORS.optionInput(1)).click();
        await columnContainer.getByTestId(QUESTION_PROPERTIES_SELECTORS.optionInput(1)).fill('two');
        await columnContainer.getByTestId(QUESTION_SETTINGS_SELECTORS.addOption).click();
        await columnContainer.getByTestId(QUESTION_PROPERTIES_SELECTORS.optionInput(2)).fill('three');
    }

    editMatrix = async () => {
        await this.selectQuestion(3);
        await this.setQuestionLabel('Matrix');
        await this.setMatrixRows();
        await this.setMatrixColumns();
        await this.page.getByRole('button', { name: QUESTION_PROPERTIES_SELECTORS.advancedProperties }).click();
        await this.page.getByTestId(QUESTION_PROPERTIES_SELECTORS.fieldCodeField).fill('mf');
        await this.page.waitForTimeout(1500);
    }
    navigateToSubmissions = async () => {
        await this.page.getByTestId(BUILDER_SELECTORS.submissionsTab).click();
        await expect(this.page.getByTestId(SUBMISSION_SELECTORS.submittedResponse(1))).toBeVisible({ timeout: 15000 });
    }

    viewSubmission = async (index: number) => {
        await this.page.getByTestId(SUBMISSION_SELECTORS.submittedResponse(index)).hover();
        await this.page.getByTestId(SUBMISSION_SELECTORS.viewSubmissionButton(index)).click();
    }

    downloadSubmission = async (): Promise<Page> => {
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByTestId(SUBMISSION_SELECTORS.nuiDropdownIcon).click();
        await this.page.getByTestId(SUBMISSION_SELECTORS.pdfRadioLabel).click();
        await this.page.getByTestId(SUBMISSION_SELECTORS.actionDropdownBtn).click();
        const popup = await popupPromise;
        return popup;
    }

    closePanel = async () => {
        await this.page.getByTestId(SUBMISSION_SELECTORS.closePanelButton).click();
    }

    verifyDownloadedPdfContent = async (pdfPopup: Page, expectedStrings: (string | number)[]) => {
        // Fetch the PDF binary content using the popup's context
        const response = await pdfPopup.context().request.get(pdfPopup.url());
        expect(response.ok(), "Failed to download PDF binary from popup URL").toBeTruthy();

        const pdfText = await getPdfTextAndDeletePdf(await response.body());

        // Normalize text for reliable matching (lower-case and collapse multiple spaces/newlines)
        const normalizedText = pdfText.toLowerCase().replace(/\s+/g, ' ');

        for (const str of expectedStrings) {
            const target = str.toString().toLowerCase();
            expect(normalizedText, `PDF content did not contain expected value: ${str}`).toContain(target);
        }
    }
}
