import { test as base } from "@playwright/test";
import { FormBuilderPage } from "@poms";

interface ExtendedFixtures {
    formBuilderPage: FormBuilderPage;
}

export const test = base.extend<ExtendedFixtures>({
    formBuilderPage: async ({ page }, use) => {
        const formBuilderPage = new FormBuilderPage(page);
        await use(formBuilderPage);
    },
});

export { expect } from "@playwright/test";