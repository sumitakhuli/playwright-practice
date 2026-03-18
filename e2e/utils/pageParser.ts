import * as fs from "fs";
import { PDFParse } from "pdf-parse";

export const getPdfTextAndDeletePdf = async (pdfBuffer: Buffer): Promise<string> => {
  const parser = new PDFParse({ data: pdfBuffer });
  const textResult = await parser.getText();
  await parser.destroy();
  console.log(`Extracted PDF text length: ${textResult.text.length}`);
  console.log(`Extracted PDF text: ${textResult.text}`);
  return textResult.text;
};