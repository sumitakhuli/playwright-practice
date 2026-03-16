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

        await expect(this.page.getByText(PUBLISHED_FORM_TEXTS.thankYou, { exact: false })).toBeVisible({ timeout: 15000 });
    }

    verifyOptionsRandomized = async () => {
        const optionsContainer = this.page.getByTestId(PUBLISHED_FORM_SELECTORS.singleChoiceOptionsContainer);
        await expect(optionsContainer).toBeVisible({ timeout: 15000 });

        await expect(optionsContainer.locator('label').first()).toBeVisible({ timeout: 5000 });

        const optionsLabels = await optionsContainer.locator('label').allTextContents();
        const cleanOptions = optionsLabels.map(opt => opt.trim()).filter(opt => opt !== '');

        console.log('Found options in order:', cleanOptions);

        if (cleanOptions.length < 2) {
            throw new Error(`Not enough options found to check randomization. Found: ${cleanOptions.length}`);
        }

        const sorted = [...cleanOptions].sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] || '0');
            const numB = parseInt(b.match(/\d+/)?.[0] || '0');
            return numA - numB;
        });

        expect(cleanOptions, 'Options should be randomized but they appear in sorted order').not.toEqual(sorted);
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

    verifyThankYou = async () => {
        await expect(this.page.getByRole('heading', { name: PUBLISHED_FORM_TEXTS.thankYou, exact: false })).toBeVisible({ timeout: 15000 });
    }

    verifySubmissionBlocked = async () => {
        await expect(this.page.getByRole('heading', { name: PUBLISHED_FORM_TEXTS.submissionBlocked })).toBeVisible({ timeout: 15000 });
    }

    close = async () => {
        await this.page.close();
    }
}
