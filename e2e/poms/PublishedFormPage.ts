import { Page, expect } from '@playwright/test';
import { PUBLISHED_FORM_SELECTORS } from '@selectors';
import { PUBLISHED_FORM_TEXTS } from '@texts';

export class PublishedFormPage {
    constructor(private page: Page) { }

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
        await this.page.getByText('United States').click();
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.phoneNumberField).fill(data.phone);
        await expect(this.page.getByTestId(PUBLISHED_FORM_SELECTORS.submitButton)).toBeEnabled();
        await this.page.getByTestId(PUBLISHED_FORM_SELECTORS.submitButton).click();

        await expect(this.page.getByText(PUBLISHED_FORM_TEXTS.thankYou, { exact: false })).toBeVisible({ timeout: 15000 });
    }

    verifyOptionsRandomized = async () => {
        // The reference test uses 'single-choice-options-container' to find options
        const optionsContainer = this.page.getByTestId(PUBLISHED_FORM_SELECTORS.singleChoiceOptionsContainer);
        await expect(optionsContainer).toBeVisible({ timeout: 15000 });

        // Wait for labels to be present
        await expect(optionsContainer.locator('label').first()).toBeVisible({ timeout: 5000 });

        const optionsLabels = await optionsContainer.locator('label').allTextContents();
        const cleanOptions = optionsLabels.map(opt => opt.trim()).filter(opt => opt !== '');

        console.log('Found options in order:', cleanOptions);

        if (cleanOptions.length < 2) {
            throw new Error(`Not enough options found to check randomization. Found: ${cleanOptions.length}`);
        }

        // Sort numerically (Option 1, Option 2, ... Option N)
        const sorted = [...cleanOptions].sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] || '0');
            const numB = parseInt(b.match(/\d+/)?.[0] || '0');
            return numA - numB;
        });

        // Options MUST NOT be in sequential sorted order if randomized
        expect(cleanOptions, 'Options should be randomized but they appear in sorted order').not.toEqual(sorted);
    }

    verifyQuestionHidden = async (type: 'single' | 'multiple') => {
        // When a question is hidden, the group element should not be visible to the respondent
        const testId = type === 'single' ? PUBLISHED_FORM_SELECTORS.singleChoiceOptionsContainer : PUBLISHED_FORM_SELECTORS.multipleChoiceOptionsContainer;
        // Use not.toBeVisible() which passes both if hidden (display:none) and if not in DOM
        await expect(this.page.getByTestId(testId)).not.toBeVisible({ timeout: 10000 });
    }

    verifyQuestionVisible = async (type: 'single' | 'multiple') => {
        const testId = type === 'single' ? PUBLISHED_FORM_SELECTORS.singleChoiceOptionsContainer : PUBLISHED_FORM_SELECTORS.multipleChoiceOptionsContainer;
        await expect(this.page.getByTestId(testId)).toBeVisible({ timeout: 10000 });
    }
}
