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

        // Playwright handles waiting for the element to appear. 
        // If the click didn't work, Playwright will retry the whole test if configured.
        await expect(this.page.getByText(PUBLISHED_FORM_TEXTS.thankYou, { exact: false })).toBeVisible({ timeout: 15000 });
    }
}
