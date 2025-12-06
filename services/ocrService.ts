import { PDFDocument } from 'pdf-lib';
import { convertPdfToImages } from './pdfService';

/**
 * Performs OCR on a PDF file.
 */
export const ocrPdf = async (
  file: File, 
  lang: string = 'eng', 
  onProgress: (status: string, progress: number) => void
): Promise<Uint8Array> => {
  try {
    // Dynamic import
    const { createWorker } = await import('tesseract.js');

    // 1. Convert PDF to images
    onProgress('Converting PDF pages to images...', 10);
    let images;
    try {
        images = await convertPdfToImages(file);
    } catch (e: any) {
        throw new Error("Failed to read PDF pages. " + e.message);
    }
    
    if (images.length === 0) {
      throw new Error("No images could be extracted from this PDF.");
    }

    // 2. Initialize Tesseract Worker
    onProgress('Initializing OCR engine...', 20);
    const worker = await createWorker(lang);
    
    // We will collect individual PDF bytes for each page
    const pagePdfBytes: Uint8Array[] = [];

    // 3. Process each page
    for (let i = 0; i < images.length; i++) {
      const progressPercent = 20 + Math.floor(((i) / images.length) * 70);
      onProgress(`Recognizing text on page ${i + 1} of ${images.length}...`, progressPercent);
      
      const imgBlob = images[i].data;
      const imgUrl = URL.createObjectURL(imgBlob);

      try {
        // Recognize text and extract PDF
        await worker.recognize(imgUrl);
        const { data: pdfData } = await worker.getPDF('Tesseract OCR Result');
        pagePdfBytes.push(new Uint8Array(pdfData));
      } catch (err) {
         console.warn(`OCR failed for page ${i + 1}`, err);
         // Continue to next page but log warning? Or fail? 
         // Failing is safer for "OCR" tool expectation.
         throw new Error(`Failed to recognize text on page ${i + 1}.`);
      } finally {
        URL.revokeObjectURL(imgUrl);
      }
    }

    onProgress('Finalizing document...', 90);
    await worker.terminate();

    // 4. Merge all single-page PDFs into one document
    const mergedPdf = await PDFDocument.create();
    
    for (const pdfBytes of pagePdfBytes) {
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    onProgress('Done!', 100);
    return await mergedPdf.save();
    
  } catch (error: any) {
    console.error("OCR Error:", error);
    throw new Error(error.message || "An unexpected error occurred during OCR.");
  }
};