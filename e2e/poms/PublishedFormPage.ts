import { Page, expect } from '@playwright/test';
import { PUBLISHED_FORM_SELECTORS } from '@selectors';
import { PUBLISHED_FORM_TEXTS } from '@texts';

export class PublishedFormPage {
    constructor(public page: Page) { }

    verifyFieldsVisible = async () => {
        await expect(this.page.getByTestId(PUBLISHED_FORM_SELECTORS.emailField)).toBeVisible();
        await expect(this.page.getByTestId(PUBLISHED_FORM_SELECTORS.firstNameField)).toBeVisible();
        await expect(this.page.getByTestId(PUBLISHED_FORM_SELECTORS.lastNameField)).toBeVisible();
        await expect(this.page.getByTestId(PUBLISHED_FORM_SELECTORS.phoneNumberField)).toBeVisible();
    }

    checkValidation = async (invalidEmail: string, invalidPhone: string) => {
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.emailField).fill(invalidEmail);
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.phoneNumberField).fill(invalidPhone);
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.submitButton).click();

        await expect(this.page.getByText(PUBLISHED_FORM_TEXTS.emailInvalid)).toBeVisible();
        await expect(this.page.getByText(PUBLISHED_FORM_TEXTS.phoneInvalid)).toBeVisible();
    }

    checkRequiredFields = async () => {
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.emailField).clear();
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.phoneNumberField).clear();
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.submitButton).click();

        await expect(this.page.getByText(PUBLISHED_FORM_TEXTS.emailRequired)).toBeVisible();
        await expect(this.page.getByText(PUBLISHED_FORM_TEXTS.firstNameRequired)).toBeVisible();
        await expect(this.page.getByText(PUBLISHED_FORM_TEXTS.lastNameRequired)).toBeVisible();
        await expect(this.page.getByText(PUBLISHED_FORM_TEXTS.phoneInvalid)).toBeVisible();
    }

    submitForm = async (data: { email: string; firstName: string; lastName: string; phone: string }) => {
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.emailField).fill(data.email);
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.firstNameField).fill(data.firstName);
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.lastNameField).fill(data.lastName);
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.countryCodeDropdown).locator('svg').click();
        await this.page.getByText(PUBLISHED_FORM_TEXTS.unitedStates).click();
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.phoneNumberField).fill(data.phone);
        await expect(this.page.getByTestId(PUBLISHED_FORM_SELECTORS.submitButton)).toBeEnabled();
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.submitButton).click();
        await this.verifyThankYou();
    }

    verifyOptionsRandomized = async () => {
        const optionsContainer = this.page.getByTestId(PUBLISHED_FORM_SELECTORS.singleChoiceOptionsContainer);
        await expect(optionsContainer).toBeVisible({ timeout: 15000 });

        await expect(optionsContainer.locator('label').first()).toBeVisible({ timeout: 5000 });

        const optionsLabels = await optionsContainer.locator('label').allTextContents();

        if (optionsLabels.length < 2) {
            throw new Error(`Not enough options found to check randomization. Found: ${optionsLabels.length}`);
        }

        const sorted = [...optionsLabels].sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] || '0');
            const numB = parseInt(b.match(/\d+/)?.[0] || '0');
            // return a.localeCompare(b);
            return numA - numB;
        });

        expect(optionsLabels, 'Options should be randomized but they appear in sorted order').not.toEqual(sorted);
    }

    verifyQuestionHidden = async (type: 'single' | 'multiple') => {
        const testId = type === 'single' ? PUBLISHED_FORM_SELECTORS.singleChoiceOptionsContainer : PUBLISHED_FORM_SELECTORS.multipleChoiceOptionsContainer;
        await expect(this.page.getByTestId(testId)).not.toBeVisible({ timeout: 10000 });
    }

    verifyQuestionVisible = async (type: 'single' | 'multiple') => {
        const testId = type === 'single' ? PUBLISHED_FORM_SELECTORS.singleChoiceOptionsContainer : PUBLISHED_FORM_SELECTORS.multipleChoiceOptionsContainer;
        await expect(this.page.getByTestId(testId)).toBeVisible({ timeout: 10000 });
    }

    fillEmailAndSubmit = async (email: string) => {
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.emailField).fill(email);
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.submitButton).click();
    }

    submitWithPassword = async (password: string, email: string) => {
        await expect(this.page.getByTestId(PUBLISHED_FORM_SELECTORS.passwordField)).toBeVisible({ timeout: 15000 });
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.passwordField).fill(password);
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.continueButton).click();

        await this.fillEmailAndSubmit(email);
    }

    verifyThankYou = async () => {
        await expect(this.page.getByRole('heading', { name: PUBLISHED_FORM_TEXTS.thankYou, exact: false })).toBeVisible({ timeout: 15000 });
    }

    verifySubmissionBlocked = async () => {
        await expect(this.page.getByRole('heading', { name: PUBLISHED_FORM_TEXTS.submissionBlocked })).toBeVisible({ timeout: 15000 });
    }

    verifyConditionalLogic = async () => {
        await expect(this.page.getByTestId(PUBLISHED_FORM_SELECTORS.formGroupQuestion)).toBeVisible({timeout: 15000});
        await expect(this.page.getByTestId(PUBLISHED_FORM_SELECTORS.emailGroup).getByTestId(PUBLISHED_FORM_SELECTORS.formGroupQuestion)).toBeHidden({timeout: 15000});
        await this.page.locator('label').filter({ hasText: 'Option 1' }).click();
        await expect(this.page.getByTestId(PUBLISHED_FORM_SELECTORS.emailGroup).getByTestId(PUBLISHED_FORM_SELECTORS.formGroupQuestion)).toBeVisible({timeout: 15000});
        await this.page.locator('label').filter({ hasText: 'Option 2' }).click();
        await expect(this.page.getByTestId(PUBLISHED_FORM_SELECTORS.emailGroup).getByTestId(PUBLISHED_FORM_SELECTORS.formGroupQuestion)).toBeHidden({timeout: 15000});
    }

    verifyNewConditionalLogic = async () => {
        await expect(this.page.getByTestId(PUBLISHED_FORM_SELECTORS.multipleChoiceGroup).getByTestId(PUBLISHED_FORM_SELECTORS.formGroupQuestion)).toBeVisible({timeout: 15000});
        await expect(this.page.getByTestId(PUBLISHED_FORM_SELECTORS.emailGroup).getByTestId(PUBLISHED_FORM_SELECTORS.formGroupQuestion)).toBeVisible({timeout: 15000});
    }

    verifyEmail = async (email: string) => {
        await expect(this.page.getByTestId(PUBLISHED_FORM_SELECTORS.emailField)).toHaveValue(email);
    }

    verifyStarRating = async (starRating: number) => {
        await expect(
            this.page
                .getByTestId(PUBLISHED_FORM_SELECTORS.starRatingGroup)
                .locator(`input[value="${starRating}"]`),
        ).toBeChecked();
    }

    verifyOpinionScale = async (opinionScale: number) => {
        const testId = `opinion-scale-item-${opinionScale}`;
        await expect(this.page.getByTestId(testId)).toBeChecked();
    }

    verifyMatrix = async () => {
        await expect(this.page.getByTestId(PUBLISHED_FORM_SELECTORS.matrixRadioLabel).first()).toBeChecked();
        await expect(this.page.getByTestId(PUBLISHED_FORM_SELECTORS.matrixRadioLabel).nth(4)).toBeChecked();
        await expect(this.page.locator('tr:nth-child(3) > td:nth-child(4) > .neeto-form-radio')).toBeChecked();
    }

    fillStarRating = async (rating: number) => {
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.starRatingGroup).locator('label').filter({ hasText: rating.toString() }).click();
    }

    fillOpinionScale = async (scale: number) => {
        await this.page.getByTestId(`opinion-scale-item-${scale}`).click();
    }

    fillMatrix = async (row: number, col: number) => {
        // This is a simple implementation assuming the matrix has radio-labels
        // Adjusted to match the specific selector the user had: tr:nth-child(2) > td:nth-child(3) > .neeto-form-radio > .neeto-form-radio__checkmark
        await this.page.locator(`tr:nth-child(${row}) > td:nth-child(${col}) > .neeto-form-radio`).click();
    }

    fillAndSubmitForm = async (data: { email: string; starRating: number; opinionScale: number; }) => {
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.emailField).fill(data.email);
        await this.fillStarRating(data.starRating);
        await this.fillOpinionScale(data.opinionScale);
        await this.page.getByTestId('matrix-radio-label').first().click();
        await this.page.locator('tr:nth-child(2) > td:nth-child(3) > .neeto-form-radio > .neeto-form-radio__checkmark').click();
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.submitButton).click();
        await expect(this.page.getByRole('heading', { name: PUBLISHED_FORM_TEXTS.thankYou, exact: false })).toBeVisible({ timeout: 15000 });
        await this.page.close();
    }

    close = async () => {
        await this.page.close();
    }
}
