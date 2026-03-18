import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
// file:///Users/sumit/project/tests/upload.spec.ts
// ↓
// /Users/sumit/project/tests/upload.spec.ts

const __dirname = path.dirname(__filename);
// __filename:
// /Users/sumit/project/tests/upload.spec.ts

// __dirname:
// /Users/sumit/project/tests

test.describe("File Upload", () => {
  // Ensure this test doesn't use the global login state
  test.use({ storageState: { cookies: [], origins: [] } });

  let filePath: string;

  test.afterEach("Delete file", async () => {
    if (filePath) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log("File deletion failed: ", err);
          return;
        }
      });
    }
  });

  test("should upload a file using file chooser", async ({ page }) => {
    await page.goto("https://practice.expandtesting.com/upload");
    filePath = path.resolve(__dirname, "test-upload.txt");
    fs.writeFileSync(filePath, "This is a test file for upload.");

    await page.setInputFiles('input[type="file"]', filePath);
    await page.getByRole("button", { name: "Upload" }).click();

    await page.close();
  });
});