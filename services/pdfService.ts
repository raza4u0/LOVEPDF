import { PDFDocument, rgb, StandardFonts, PDFFont, degrees, grayscale, LineCapStyle, LineJoinStyle } from 'pdf-lib';
import { PdfEditAction, WatermarkSettings, PageNumberSettings, PdfMetadata } from '../types';

/**
 * Helper to handle errors uniformly with context.
 */
const handleServiceError = (error: any, action: string, fileName?: string) => {
  console.error(`Error during ${action}:`, error);
  
  let prefix = fileName ? `Error processing "${fileName}": ` : '';
  let message = `Failed to ${action}.`;
  
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    
    // Check for specific known issues
    if (msg.includes('password') || error.name === 'PasswordException') {
      message = `${prefix}The file is password protected. Please unlock it and try again.`;
    } else if (msg.includes('invalid pdf') || error.name === 'InvalidPDFException' || msg.includes('pdf header') || msg.includes('implausible file header')) {
      message = `${prefix}The file appears to be corrupted or is not a valid PDF.`;
    } else if (msg.includes('structure') || msg.includes('xref')) {
       message = `${prefix}The document structure is damaged or too complex to process.`;
    } else if (msg.includes('encrypted')) {
       message = `${prefix}The file is encrypted. Please decrypt it first.`;
    } else if (msg.includes('fetch') || msg.includes('network')) {
       message = "A network error occurred while loading resources. Please check your connection.";
    } else if (msg.includes('empty') || msg.includes('0 bytes')) {
       message = `${prefix}The file is empty or has no content.`;
    } else if (msg.includes('canvas')) {
        message = `${prefix}Failed to render the document. It might be too complex for the browser.`;
    } else {
        // Fallback for other errors, but clean up "Error: " prefix if present
        message = `${prefix}${error.message.replace(/^Error:\s*/i, '')}`;
    }
  }
  throw new Error(message);
};

/**
 * Helper to lazy load PDF.js and configure the worker.
 */
export const getPdfJs = async () => {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    // Handle default export mismatch
    const pdfjs = (pdfjsLib as any).default || pdfjsLib;
    
    if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    }
    return pdfjs;
  } catch (e) {
    throw new Error("Failed to load PDF engine. Please reload the page.");
  }
};

/**
 * Merges multiple PDF files into a single PDF.
 */
export const mergePdfs = async (files: File[]): Promise<Uint8Array> => {
  try {
    if (files.some(f => f.size === 0)) throw new Error("One of the selected files is empty.");
    
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      } catch (innerError) {
          handleServiceError(innerError, "load PDF for merging", file.name);
      }
    }

    return await mergedPdf.save();
  } catch (error) {
    // If it's already a handled error, rethrow, otherwise wrap
    if (error instanceof Error && error.message.startsWith("Error processing")) throw error;
    handleServiceError(error, "merge PDFs");
    return new Uint8Array(); // unreachable
  }
};

/**
 * Converts images to a single PDF.
 */
export const imagesToPdf = async (files: File[]): Promise<Uint8Array> => {
  try {
    if (files.some(f => f.size === 0)) throw new Error("One of the selected files is empty.");
    
    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        let imageEmbed;
        
        if (file.type === 'image/png') {
            imageEmbed = await pdfDoc.embedPng(arrayBuffer);
        } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            imageEmbed = await pdfDoc.embedJpg(arrayBuffer);
        } else {
             // Fallback try-catch for extension mismatches
             try {
                imageEmbed = await pdfDoc.embedJpg(arrayBuffer);
             } catch {
                imageEmbed = await pdfDoc.embedPng(arrayBuffer);
             }
        }

        const page = pdfDoc.addPage([imageEmbed.width, imageEmbed.height]);
        page.drawImage(imageEmbed, {
            x: 0,
            y: 0,
            width: imageEmbed.width,
            height: imageEmbed.height,
        });
      } catch (imgError) {
         handleServiceError(imgError, "process image", file.name);
      }
    }

    return await pdfDoc.save();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Error processing")) throw error;
    handleServiceError(error, "convert images to PDF");
    return new Uint8Array();
  }
};

/**
 * Compresses multiple PDFs. 
 * If single file: returns PDF bytes.
 * If multiple files: returns ZIP bytes.
 */
export const compressPdfsBatch = async (files: File[], level: 'extreme' | 'recommended' | 'less'): Promise<{ data: Uint8Array | Blob, isZip: boolean }> => {
  try {
    if (files.some(f => f.size === 0)) throw new Error("One of the selected files is empty.");
    
    // Helper to compress a single file bytes
    const compressSingle = async (file: File): Promise<Uint8Array> => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        // useObjectStreams reduces size slightly (basic optimization)
        return await pdf.save({ useObjectStreams: true });
      } catch (e) {
        handleServiceError(e, "compress PDF", file.name);
        return new Uint8Array(); // unreachable
      }
    };

    if (files.length === 1) {
      const compressedBytes = await compressSingle(files[0]);
      return { data: compressedBytes, isZip: false };
    } else {
      // Dynamic import JSZip
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();

      for (const file of files) {
        const compressedBytes = await compressSingle(file);
        zip.file(file.name, compressedBytes);
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      return { data: zipBlob, isZip: true };
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Error processing")) throw error;
    handleServiceError(error, "compress PDFs");
    return { data: new Uint8Array(), isZip: false };
  }
};

/**
 * Splits a PDF file into individual PDF files for each page.
 */
export const splitPdf = async (file: File): Promise<{ name: string, data: Blob }[]> => {
  try {
    if (file.size === 0) throw new Error("File is empty.");
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pageCount = pdf.getPageCount();
    const splitFiles: { name: string, data: Blob }[] = [];

    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(copiedPage);
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      const pageNum = (i + 1).toString().padStart(3, '0');
      splitFiles.push({
        name: `${file.name.replace('.pdf', '')}_page_${pageNum}.pdf`,
        data: blob
      });
    }

    return splitFiles;
  } catch (error) {
    handleServiceError(error, "split PDF", file.name);
    return [];
  }
};

/**
 * Converts a PDF file to an array of JPG Blob images.
 */
export const convertPdfToImages = async (file: File): Promise<{ name: string, data: Blob }[]> => {
  try {
    if (file.size === 0) throw new Error("File is empty.");
    
    const pdfjs = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    
    let pdf;
    try {
        pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    } catch (e) {
        throw new Error("Invalid PDF structure. Ensure the file is a valid PDF document.");
    }
    
    const images: { name: string, data: Blob }[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); // Good quality for export
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) throw new Error("Could not create canvas context");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
            canvasContext: context,
            viewport: viewport,
        }).promise;

        const blob = await new Promise<Blob | null>((resolve) => 
            canvas.toBlob(resolve, 'image/jpeg', 0.8)
        );

        if (blob) {
            const pageNum = i.toString().padStart(3, '0');
            images.push({
            name: `${file.name.replace('.pdf', '')}_page_${pageNum}.jpg`,
            data: blob
            });
        }
      } catch (pageError) {
         console.warn(`Failed to render page ${i}`, pageError);
         // Continue to next page? Or fail? Let's fail for now to be safe.
         throw new Error(`Failed to render page ${i}.`);
      }
    }

    return images;
  } catch (error) {
    handleServiceError(error, "convert PDF to images", file.name);
    return [];
  }
};

/**
 * Helper to convert Blob to Base64
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => reject(new Error("Failed to read blob data"));
    reader.readAsDataURL(blob);
  });
};

/**
 * Converts a PDF file to a PowerPoint (.pptx) file.
 */
export const convertPdfToPowerPoint = async (file: File): Promise<Blob> => {
  try {
    if (file.size === 0) throw new Error("File is empty.");

    // Dynamic import
    const { default: PptxGenJS } = await import('pptxgenjs');
    
    const pptx = new PptxGenJS();
    const images = await convertPdfToImages(file); // This will handle its own errors

    if (images.length === 0) {
        throw new Error("No pages extracted from the PDF.");
    }

    for (const img of images) {
      const slide = pptx.addSlide();
      const base64Data = await blobToBase64(img.data);
      
      slide.addImage({ 
        data: base64Data, 
        x: 0, 
        y: 0, 
        w: '100%', 
        h: '100%' 
      });
    }

    return await pptx.write({ outputType: 'blob' }) as Blob;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Error processing")) throw error;
    handleServiceError(error, "convert PDF to PowerPoint", file.name);
    return new Blob();
  }
};

/**
 * Converts a PDF file to a Word (.doc) file (HTML-based).
 */
export const convertPdfToWord = async (file: File): Promise<Blob> => {
  try {
    if (file.size === 0) throw new Error("File is empty.");

    const pdfjs = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>
    `;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      
      htmlContent += `<p>${pageText}</p><br style="page-break-after:always;" />`;
    }
    
    htmlContent += "</body></html>";
    
    return new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
  } catch (error) {
    handleServiceError(error, "convert PDF to Word", file.name);
    return new Blob();
  }
};

/**
 * Converts a PDF file to an HTML file.
 */
export const convertPdfToHtml = async (file: File): Promise<Blob> => {
  try {
    if (file.size === 0) throw new Error("File is empty.");

    const pdfjs = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${file.name}</title>
    <style>
        body { 
            background: #f3f4f6; 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            padding: 40px 20px;
            margin: 0;
        }
        .page-container {
            background: white;
            width: 100%;
            max-width: 800px;
            padding: 60px;
            margin-bottom: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border-radius: 4px;
            line-height: 1.6;
            color: #333;
            white-space: pre-wrap;
        }
        .page-number {
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            margin-top: 20px;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
        }
        @media print {
            body { background: none; padding: 0; }
            .page-container { box-shadow: none; margin: 0; max-width: none; page-break-after: always; }
        }
    </style>
</head>
<body>
`;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      
      html += `
    <div class="page-container">
        ${pageText}
        <div class="page-number">Page ${i}</div>
    </div>`;
    }
    
    html += '</body></html>';
    
    return new Blob([html], { type: 'text/html' });
  } catch (error) {
    handleServiceError(error, "convert PDF to HTML", file.name);
    return new Blob();
  }
};

/**
 * Converts a PDF file to a WordPress XML import file.
 */
export const convertPdfToWordPress = async (file: File, type: 'post' | 'page'): Promise<Blob> => {
  try {
    if (file.size === 0) throw new Error("File is empty.");

    const pdfjs = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let htmlContent = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      
      htmlContent += `<!-- wp:paragraph -->
<p>${pageText}</p>
<!-- /wp:paragraph -->
<!-- wp:separator -->
<hr class="wp-block-separator has-alpha-channel-opacity"/>
<!-- /wp:separator -->
`;
    }

    const title = file.name.replace(/\.pdf$/i, '');
    const date = new Date().toUTCString();
    const pubDate = new Date().toUTCString();

    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"
	xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
	xmlns:content="http://purl.org/rss/1.0/modules/content/"
	xmlns:wfw="http://wellformedweb.org/CommentAPI/"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:wp="http://wordpress.org/export/1.2/"
>
<channel>
	<title>PDF Import</title>
	<link>http://localhost</link>
	<description></description>
	<pubDate>${pubDate}</pubDate>
	<language>en-US</language>
	<wp:wxr_version>1.2</wp:wxr_version>
	<wp:base_site_url>http://localhost</wp:base_site_url>
	<wp:base_blog_url>http://localhost</wp:base_blog_url>

	<item>
		<title><![CDATA[${title}]]></title>
		<link></link>
		<pubDate>${date}</pubDate>
		<dc:creator><![CDATA[admin]]></dc:creator>
		<guid isPermaLink="false"></guid>
		<description></description>
		<content:encoded><![CDATA[${htmlContent}]]></content:encoded>
		<excerpt:encoded><![CDATA[]]></excerpt:encoded>
		<wp:post_id>1</wp:post_id>
		<wp:post_date><![CDATA[${new Date().toISOString().replace('T', ' ').slice(0, 19)}]]></wp:post_date>
		<wp:post_date_gmt><![CDATA[${new Date().toISOString().replace('T', ' ').slice(0, 19)}]]></wp:post_date_gmt>
		<wp:comment_status>open</wp:comment_status>
		<wp:ping_status>open</wp:ping_status>
		<wp:post_name><![CDATA[${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}]]></wp:post_name>
		<wp:status>publish</wp:status>
		<wp:post_parent>0</wp:post_parent>
		<wp:menu_order>0</wp:menu_order>
		<wp:post_type><![CDATA[${type}]]></wp:post_type>
		<wp:post_password><![CDATA[]]></wp:post_password>
		<wp:is_sticky>0</wp:is_sticky>
	</item>
</channel>
</rss>`;

    return new Blob([xml], { type: 'text/xml' });
  } catch (error) {
    handleServiceError(error, "convert PDF to WordPress XML", file.name);
    return new Blob();
  }
};

/**
 * Converts an HTML file to PDF.
 */
export const convertHtmlToPdf = async (file: File): Promise<Blob> => {
  try {
    if (file.size === 0) throw new Error("File is empty.");

    const { jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    
    // Ensure html2canvas is globally available for jsPDF
    if (!(window as any).html2canvas) {
        (window as any).html2canvas = html2canvas;
    }

    const text = await file.text();
    
    // Create a temporary container to render the HTML
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px'; 
    // Basic styling reset for the container
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '12pt';
    container.style.color = '#000';
    container.innerHTML = text;
    document.body.appendChild(container);

    const doc = new jsPDF({
      unit: 'pt',
      format: 'a4',
      orientation: 'portrait'
    });

    const options = {
        callback: () => {
            // Callback placeholder, handled by promise below in some versions, 
            // but we need to wait for the process to finish.
        },
        x: 20,
        y: 20,
        width: 555, // A4 width (595) - 40px margin
        windowWidth: 800,
        html2canvas: {
            scale: 0.8, // Adjust scale to fit content better
            useCORS: true // Attempt to load cross-origin images if any
        }
    };

    // doc.html is async and returns a promise in newer versions
    await doc.html(container, options);
    
    document.body.removeChild(container);
    return doc.output('blob');
  } catch (error) {
    handleServiceError(error, "convert HTML to PDF", file.name);
    return new Blob();
  }
};

/**
 * Converts a PDF file to an Excel (.xlsx) file.
 */
export const convertPdfToExcel = async (file: File): Promise<Blob> => {
  try {
    if (file.size === 0) throw new Error("File is empty.");

    // Dynamic import
    const XLSX = await import('xlsx');
    const pdfjs = await getPdfJs();
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    // Handle default export if necessary
    const xlsxLib = (XLSX as any).default || XLSX;
    const wb = xlsxLib.utils.book_new();

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const items = textContent.items as any[];
      
      items.sort((a, b) => {
        const yDiff = b.transform[5] - a.transform[5];
        if (Math.abs(yDiff) > 5) return yDiff; 
        return a.transform[4] - b.transform[4];
      });

      const rows: string[][] = [];
      let currentRow: string[] = [];
      let currentY: number | null = null;

      items.forEach((item) => {
        const y = item.transform[5];
        const text = item.str.trim();
        
        if (!text) return; 

        if (currentY === null) {
          currentY = y;
          currentRow.push(text);
        } else if (Math.abs(y - currentY) <= 5) {
           currentRow.push(text);
        } else {
          rows.push(currentRow);
          currentRow = [text];
          currentY = y;
        }
      });
      if (currentRow.length > 0) rows.push(currentRow);

      const ws = xlsxLib.utils.aoa_to_sheet(rows);
      xlsxLib.utils.book_append_sheet(wb, ws, `Page ${i}`);
    }

    const wbout = xlsxLib.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  } catch (error) {
    handleServiceError(error, "convert PDF to Excel", file.name);
    return new Blob();
  }
};

/**
 * Converts a Word (.doc/.docx) file to PDF.
 */
export const convertWordToPdf = async (file: File): Promise<Blob> => {
  try {
    if (file.size === 0) throw new Error("File is empty.");

    // Dynamic imports
    const mammoth = await import('mammoth');
    const { jsPDF } = await import('jspdf');

    const arrayBuffer = await file.arrayBuffer();
    
    // Extract raw text
    let text = "";
    try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
    } catch (e) {
        throw new Error("Failed to parse Word document. Ensure it is a valid .docx file.");
    }

    if (!text.trim()) {
        throw new Error("Could not extract meaningful text from the Word document.");
    }

    // Create PDF
    const doc = new jsPDF();
    
    const fontSize = 12;
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - (margin * 2);
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.getHeight();
    
    doc.setFontSize(fontSize);
    
    const splitText = doc.splitTextToSize(text, maxLineWidth);
    
    let cursorY = margin;
    
    for (const line of splitText) {
      if (cursorY + lineHeight > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    }

    return doc.output('blob');
  } catch (error) {
    handleServiceError(error, "convert Word to PDF", file.name);
    return new Blob();
  }
};

/**
 * Converts a PowerPoint (.pptx) file to PDF.
 */
export const convertPowerPointToPdf = async (file: File): Promise<Blob> => {
  try {
    if (file.size === 0) throw new Error("File is empty.");

    const { default: JSZip } = await import('jszip');
    const { jsPDF } = await import('jspdf');

    let zip;
    try {
        zip = await JSZip.loadAsync(file);
    } catch (e) {
        throw new Error("Failed to read PowerPoint file. Ensure it is a valid .pptx file.");
    }
    
    // Default to landscape A4-ish
    const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Find slide files in the structure
    const slideFiles: string[] = [];
    zip.folder("ppt/slides")?.forEach((relativePath, file) => {
      if (relativePath.match(/^slide\d+\.xml$/)) {
        slideFiles.push(relativePath);
      }
    });

    if (slideFiles.length === 0) {
        throw new Error("No slides found in this PowerPoint file.");
    }

    // Sort natural order
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)![0]);
      const numB = parseInt(b.match(/\d+/)![0]);
      return numA - numB;
    });

    for (let i = 0; i < slideFiles.length; i++) {
      if (i > 0) doc.addPage();
      
      const slideXml = await zip.file(`ppt/slides/${slideFiles[i]}`)?.async("text");
      if (!slideXml) continue;

      // Extract Text Paragraphs (<a:p>)
      // Inside <a:p>, there are <a:r> (runs) containing <a:t> (text)
      const paragraphs = slideXml.match(/<a:p[\s\S]*?<\/a:p>/g) || [];
      
      let y = 20;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      
      // Simple visual indicator for slide number
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Slide ${i + 1}`, 10, 10);
      
      doc.setFontSize(12);
      doc.setTextColor(0);

      paragraphs.forEach((p) => {
          const textMatches = p.match(/<a:t>(.*?)<\/a:t>/g);
          if (textMatches) {
              const lineText = textMatches.map(t => t.replace(/<\/?a:t>/g, '')).join('');
              if (lineText.trim()) {
                  // Wrap text
                  const lines = doc.splitTextToSize(lineText, pageWidth - 40);
                  doc.text(lines, 20, y);
                  y += (lines.length * 7) + 5; // Line height + paragraph gap
                  
                  if (y > pageHeight - 20) {
                      doc.addPage();
                      y = 20;
                  }
              }
          }
      });
      
      if (paragraphs.length === 0) {
           // Fallback to simple extraction if structure is flat/unusual
           const rawText = slideXml.match(/<a:t>(.*?)<\/a:t>/g);
           if (rawText) {
               const combinedText = rawText.map(t => t.replace(/<\/?a:t>/g, '')).join(' ');
               const lines = doc.splitTextToSize(combinedText, pageWidth - 40);
               doc.text(lines, 20, 20);
           } else {
               doc.setTextColor(150);
               doc.text("(No text content detected on this slide)", pageWidth/2, pageHeight/2, { align: 'center' });
           }
      }
    }

    return doc.output('blob');
  } catch (error) {
    handleServiceError(error, "convert PowerPoint to PDF", file.name);
    return new Blob();
  }
};

/**
 * Converts a PDF file to a plain text (.txt) file.
 */
export const convertPdfToText = async (file: File): Promise<Blob> => {
  try {
    if (file.size === 0) throw new Error("File is empty.");

    const pdfjs = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += `--- Page ${i} ---\n\n${pageText}\n\n`;
    }
    
    return new Blob([fullText], { type: 'text/plain' });
  } catch (error) {
    handleServiceError(error, "convert PDF to text", file.name);
    return new Blob();
  }
};


/**
 * Creates a ZIP file from a list of files.
 */
export const createZip = async (files: { name: string, data: Blob }[]): Promise<Blob> => {
  try {
    // Dynamic import
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    
    files.forEach(file => {
      zip.file(file.name, file.data);
    });
    
    return await zip.generateAsync({ type: 'blob' });
  } catch (error) {
    handleServiceError(error, "create ZIP archive");
    return new Blob();
  }
};

/**
 * Helper to download a Uint8Array or Blob as a file.
 */
export const downloadPdf = (data: Uint8Array | Blob, filename: string) => {
  try {
    const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed", error);
    alert("Failed to initiate download.");
  }
};

/**
 * Saves edited PDF with annotations.
 */
export const saveEditedPdf = async (
  file: File, 
  actions: PdfEditAction[], 
  scale: number
): Promise<Uint8Array> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Group actions by page
    const actionsByPage: { [key: number]: PdfEditAction[] } = {};
    actions.forEach(action => {
      if (!actionsByPage[action.pageIndex]) actionsByPage[action.pageIndex] = [];
      actionsByPage[action.pageIndex].push(action);
    });

    const pages = pdfDoc.getPages();

    for (const [pageIndexStr, pageActions] of Object.entries(actionsByPage)) {
      const pageIndex = parseInt(pageIndexStr);
      if (pageIndex >= pages.length) continue;

      const page = pages[pageIndex];
      const { height } = page.getSize();
      
      for (const action of pageActions) {
         const color = hexToRgb(action.color || '#000000');
         
         if (action.type === 'draw' && action.points && action.points.length > 1) {
            // Drawing logic
            const thickness = (action.size || 2) / scale;
            
            for (let i = 0; i < action.points.length - 1; i++) {
                const p1 = action.points[i];
                const p2 = action.points[i + 1];
                
                const x1 = p1.x / scale;
                const y1 = height - (p1.y / scale);
                const x2 = p2.x / scale;
                const y2 = height - (p2.y / scale);

                page.drawLine({
                    start: { x: x1, y: y1 },
                    end: { x: x2, y: y2 },
                    thickness: thickness,
                    color: color,
                    opacity: action.opacity || 1,
                    lineCap: LineCapStyle.Round,
                    lineJoin: LineJoinStyle.Round
                });
            }
         } else {
             const x = action.x / scale;
             const h = (action.height || 0) / scale;
             const y = height - (action.y / scale) - h;

             if (action.type === 'text' && action.text) {
                 const size = (action.size || 16) / scale; 
                 const adjustedY = height - (action.y / scale) - size + (size * 0.2); 

                 page.drawText(action.text, {
                     x: x,
                     y: adjustedY,
                     size: size,
                     font: helveticaFont,
                     color: color
                 });
             } else if (action.type === 'rectangle' || action.type === 'highlight') {
                 const w = (action.width || 0) / scale;
                 page.drawRectangle({
                     x: x,
                     y: y,
                     width: w,
                     height: h,
                     color: color,
                     opacity: action.opacity || 1
                 });
             }
         }
      }
    }

    return await pdfDoc.save();
  } catch (error) {
    handleServiceError(error, "save edited PDF", file.name);
    return new Uint8Array();
  }
};

/**
 * Embeds images (signatures) into a PDF at specific coordinates.
 */
export const embedImagesInPdf = async (
  file: File,
  placements: { 
    pageIndex: number; 
    x: number; 
    y: number; 
    width: number; 
    height: number; 
    imageBase64: string 
  }[],
  scale: number
): Promise<Uint8Array> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    for (const p of placements) {
      if (p.pageIndex >= pages.length) continue;
      const page = pages[p.pageIndex];
      const { height } = page.getSize();

      let imageEmbed;
      // Strip Data URI prefix if present
      const base64Data = p.imageBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
      
      // Determine format or try both
      if (p.imageBase64.startsWith('data:image/jpeg') || p.imageBase64.startsWith('data:image/jpg')) {
          imageEmbed = await pdfDoc.embedJpg(base64Data);
      } else if (p.imageBase64.startsWith('data:image/png')) {
          imageEmbed = await pdfDoc.embedPng(base64Data);
      } else {
          // Fallback: try PNG then JPG
          try {
              imageEmbed = await pdfDoc.embedPng(base64Data);
          } catch {
              imageEmbed = await pdfDoc.embedJpg(base64Data);
          }
      }
      
      const pdfX = p.x / scale;
      const pdfW = p.width / scale;
      const pdfH = p.height / scale;
      const pdfY = height - (p.y / scale) - pdfH;

      page.drawImage(imageEmbed, {
        x: pdfX,
        y: pdfY,
        width: pdfW,
        height: pdfH,
      });
    }

    return await pdfDoc.save();
  } catch (error) {
     handleServiceError(error, "sign PDF", file.name);
     return new Uint8Array();
  }
};

/**
 * Applies a watermark (text or image) to a PDF.
 */
export const watermarkPdf = async (
  file: File,
  config: WatermarkSettings
): Promise<Uint8Array> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Prepare Image if needed
    let imageEmbed: any = null;
    let imgDims = { width: 0, height: 0 };
    
    if (config.type === 'image' && config.imageFile) {
      const imgBuffer = await config.imageFile.arrayBuffer();
      try {
         imageEmbed = config.imageFile.type === 'image/png' 
           ? await pdfDoc.embedPng(imgBuffer)
           : await pdfDoc.embedJpg(imgBuffer);
         imgDims = imageEmbed.scale(config.imageScale || 1);
      } catch (e) {
         throw new Error("Invalid image format. Please use JPG or PNG.");
      }
    }

    for (const page of pages) {
      const { width, height } = page.getSize();
      
      let x = 0;
      let y = 0;
      let contentWidth = 0;
      let contentHeight = 0;

      // 1. Calculate Content Dimensions
      if (config.type === 'text') {
        contentWidth = helveticaFont.widthOfTextAtSize(config.text, config.fontSize);
        contentHeight = config.fontSize;
      } else if (imageEmbed) {
        contentWidth = imgDims.width;
        contentHeight = imgDims.height;
      }

      // 2. Calculate Position (standard 3x3 grid)
      const margin = 20;
      
      if (config.position.includes('left')) {
        x = margin;
      } else if (config.position.includes('right')) {
        x = width - contentWidth - margin;
      } else { // center
        x = (width - contentWidth) / 2;
      }
      
      if (config.position.includes('top')) {
         y = height - margin - contentHeight;
         if (config.type === 'text') y += (config.fontSize * 0.2); 
      } else if (config.position.includes('bottom')) {
         y = margin;
         if (config.type === 'text') y += (config.fontSize * 0.2);
      } else { // middle
         y = (height - contentHeight) / 2;
         if (config.type === 'text') y += (config.fontSize * 0.3); // visual centering
      }

      // 3. Draw
      const opacity = config.opacity;
      const rotation = degrees(config.rotation);

      if (config.type === 'text') {
        const color = hexToRgb(config.color);
        page.drawText(config.text, {
          x,
          y,
          size: config.fontSize,
          font: helveticaFont,
          color: color,
          opacity,
          rotate: rotation,
        });
      } else if (imageEmbed) {
         page.drawImage(imageEmbed, {
            x,
            y,
            width: contentWidth,
            height: contentHeight,
            opacity,
            rotate: rotation
         });
      }
    }

    return await pdfDoc.save();
  } catch (error) {
    handleServiceError(error, "add watermark", file.name);
    return new Uint8Array();
  }
};

/**
 * Adds page numbers to a PDF.
 */
export const addPageNumbers = async (
  file: File,
  config: PageNumberSettings
): Promise<Uint8Array> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    
    // Choose font
    let font;
    if (config.fontFamily === 'Times-Roman') font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    else if (config.fontFamily === 'Courier') font = await pdfDoc.embedFont(StandardFonts.Courier);
    else font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const totalPages = pages.length;

    for (let i = 0; i < totalPages; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();
      const pageNum = config.startFrom + i;
      
      // Format text
      let text = config.format
        .replace('n', pageNum.toString())
        .replace('total', totalPages.toString());
        
      const textWidth = font.widthOfTextAtSize(text, config.fontSize);
      const textHeight = config.fontSize;
      
      // Calculate Position
      let x = 0;
      let y = 0;
      const margin = config.margin;

      if (config.position.includes('left')) {
        x = margin;
      } else if (config.position.includes('right')) {
        x = width - textWidth - margin;
      } else { // center
        x = (width - textWidth) / 2;
      }
      
      if (config.position.includes('top')) {
         y = height - margin - textHeight;
      } else { // bottom
         y = margin;
      }

      page.drawText(text, {
        x,
        y,
        size: config.fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    }

    return await pdfDoc.save();
  } catch (error) {
    handleServiceError(error, "add page numbers", file.name);
    return new Uint8Array();
  }
};

/**
 * Rotates specific pages in a set of PDF files and returns a merged PDF.
 * @deprecated Use rotatePdfsBatch instead for non-merging behavior.
 */
export const rotatePdfs = async (files: File[], rotations: number[]): Promise<Uint8Array> => {
  try {
    const mergedPdf = await PDFDocument.create();
    let globalPageIndex = 0;

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        copiedPages.forEach((page) => {
            if (globalPageIndex < rotations.length) {
                const addedRotation = rotations[globalPageIndex];
                const currentRotation = page.getRotation().angle;
                page.setRotation(degrees(currentRotation + addedRotation));
            }
            mergedPdf.addPage(page);
            globalPageIndex++;
        });
      } catch (innerError) {
          handleServiceError(innerError, "rotate PDF", file.name);
      }
    }

    return await mergedPdf.save();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Error processing")) throw error;
    handleServiceError(error, "rotate PDF");
    return new Uint8Array();
  }
};

/**
 * Rotates pages in PDF files in batch mode.
 * Returns a ZIP file if multiple files, or a single PDF if one file.
 * `rotations` is an array of number arrays, where rotations[i] contains page rotations for files[i].
 */
export const rotatePdfsBatch = async (files: File[], rotations: number[][]): Promise<{ data: Uint8Array | Blob, isZip: boolean }> => {
  try {
    if (files.some(f => f.size === 0)) throw new Error("One of the selected files is empty.");
    
    const processSingle = async (file: File, fileRotations: number[]): Promise<Uint8Array> => {
       try {
         const arrayBuffer = await file.arrayBuffer();
         const pdf = await PDFDocument.load(arrayBuffer);
         const pages = pdf.getPages();
         
         pages.forEach((page, idx) => {
             if (idx < fileRotations.length) {
                 const rotation = fileRotations[idx];
                 const currentRotation = page.getRotation().angle;
                 page.setRotation(degrees(currentRotation + rotation));
             }
         });
         
         return await pdf.save();
       } catch(e) {
           handleServiceError(e, "rotate PDF", file.name);
           return new Uint8Array();
       }
    };

    if (files.length === 1) {
        const result = await processSingle(files[0], rotations[0]);
        return { data: result, isZip: false };
    } else {
         const { default: JSZip } = await import('jszip');
         const zip = new JSZip();
         
         for (let i = 0; i < files.length; i++) {
             const result = await processSingle(files[i], rotations[i]);
             zip.file(files[i].name, result);
         }
         
         const zipBlob = await zip.generateAsync({ type: 'blob' });
         return { data: zipBlob, isZip: true };
    }
  } catch (error) {
     if (error instanceof Error && error.message.startsWith("Error processing")) throw error;
     handleServiceError(error, "rotate PDFs");
     return { data: new Uint8Array(), isZip: false };
  }
};

/**
 * Reorders, rotates, or deletes pages in a PDF.
 */
export const organizePdf = async (
  file: File, 
  pageOperations: { originalIndex: number, rotation: number, isDeleted: boolean }[]
): Promise<Uint8Array> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const newPdf = await PDFDocument.create();

        // Filter out deleted pages
        const activePages = pageOperations.filter(op => !op.isDeleted);
        
        if (activePages.length === 0) {
            throw new Error("Cannot save an empty PDF. Please keep at least one page.");
        }

        // Copy pages in the new order
        // We need an array of indices to copy
        const indicesToCopy = activePages.map(op => op.originalIndex);
        const copiedPages = await newPdf.copyPages(pdfDoc, indicesToCopy);

        // Add pages and apply rotation
        copiedPages.forEach((page, i) => {
            const op = activePages[i];
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees(currentRotation + op.rotation));
            newPdf.addPage(page);
        });

        return await newPdf.save();
    } catch (error) {
        handleServiceError(error, "organize PDF", file.name);
        return new Uint8Array();
    }
};

/**
 * Encrypts a PDF file with a password.
 */
export const protectPdf = async (file: File, password: string, keyLength: 128 | 256 = 128): Promise<Uint8Array> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // Encrypt the document
    pdfDoc.encrypt({
      userPassword: password,
      ownerPassword: password,
      keyLength: keyLength,
      permissions: {
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: false,
        documentAssembly: false,
      },
    });

    return await pdfDoc.save();
  } catch (error) {
    handleServiceError(error, "protect PDF", file.name);
    return new Uint8Array();
  }
};

/**
 * Batch encrypts multiple PDFs. 
 */
export const protectPdfsBatch = async (files: File[], password: string, keyLength: 128 | 256 = 128): Promise<{ data: Uint8Array | Blob, isZip: boolean }> => {
    try {
        if (files.some(f => f.size === 0)) throw new Error("One of the selected files is empty.");
        
        const protectSingle = (f: File) => protectPdf(f, password, keyLength);

        if (files.length === 1) {
            const protectedBytes = await protectSingle(files[0]);
            return { data: protectedBytes, isZip: false };
        } else {
            const { default: JSZip } = await import('jszip');
            const zip = new JSZip();

            for (const file of files) {
                try {
                    const protectedBytes = await protectSingle(file);
                    zip.file(file.name, protectedBytes);
                } catch (e) {
                     handleServiceError(e, "protect PDF", file.name);
                }
            }
            
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            return { data: zipBlob, isZip: true };
        }
    } catch (error) {
        if (error instanceof Error && error.message.startsWith("Error processing")) throw error;
        handleServiceError(error, "protect PDFs in batch");
        return { data: new Uint8Array(), isZip: false };
    }
};

/**
 * Unlocks a PDF file by removing the password.
 */
export const unlockPdf = async (file: File, password: string): Promise<Uint8Array> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Load with password. If incorrect, this will throw.
        const pdfDoc = await PDFDocument.load(arrayBuffer, { password });
        
        // Save without encryption options creates a standard PDF
        return await pdfDoc.save();
    } catch (error) {
        // Provide specific error message for wrong password
        if (error instanceof Error && error.message.toLowerCase().includes('password')) {
            throw new Error("Incorrect password. Please try again.");
        }
        handleServiceError(error, "unlock PDF", file.name);
        return new Uint8Array();
    }
};

/**
 * Attempts to repair a corrupted PDF by stripping metadata and resaving.
 */
export const repairPdf = async (file: File): Promise<Uint8Array> => {
  try {
    // Strategy A: Load with ignoreEncryption to be lenient and re-save
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      return await pdfDoc.save();
    } catch (e) {
      console.warn("Strategy A failed, trying Strategy B (Reconstruction)", e);
    }

    // Strategy B: Visual Reconstruction
    const images = await convertPdfToImages(file);
    if (images.length === 0) throw new Error("Could not recover any content from this file.");
    
    const pdfDoc = await PDFDocument.create();
    for (const img of images) {
        const imageEmbed = await pdfDoc.embedJpg(img.data.arrayBuffer());
        const page = pdfDoc.addPage([imageEmbed.width, imageEmbed.height]);
        page.drawImage(imageEmbed, {
            x: 0, 
            y: 0, 
            width: imageEmbed.width, 
            height: imageEmbed.height
        });
    }
    
    return await pdfDoc.save();

  } catch (error) {
    handleServiceError(error, "repair PDF", file.name);
    return new Uint8Array();
  }
};

/**
 * Flattens PDF forms or rasterizes the entire PDF.
 */
export const flattenPdf = async (file: File, mode: 'form' | 'raster'): Promise<Uint8Array> => {
  try {
    if (mode === 'form') {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const form = pdfDoc.getForm();
      
      // Flatten all fields
      form.flatten();
      
      return await pdfDoc.save();
    } else {
      // Raster mode: Convert to images then back to PDF
      const images = await convertPdfToImages(file);
      if (images.length === 0) throw new Error("Could not extract pages for rasterization.");
      
      // Convert blobs back to files for imagesToPdf
      const imageFiles = images.map(img => new File([img.data], img.name, { type: 'image/jpeg' }));
      return await imagesToPdf(imageFiles);
    }
  } catch (error) {
    handleServiceError(error, "flatten PDF", file.name);
    return new Uint8Array();
  }
};

/**
 * Crops a PDF file based on normalized percentage coordinates (0-1).
 */
export const cropPdf = async (
  file: File, 
  cropArea: { x: number, y: number, width: number, height: number }
): Promise<Uint8Array> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // Convert normalized percentage to PDF points
      const cropX = cropArea.x * width;
      const cropW = cropArea.width * width;
      const cropH = cropArea.height * height;
      
      // PDF Y-axis starts from bottom, UI starts from top
      // cropArea.y is from top
      const cropY = height - (cropArea.y * height) - cropH;

      page.setCropBox(cropX, cropY, cropW, cropH);
    }

    return await pdfDoc.save();
  } catch (error) {
    handleServiceError(error, "crop PDF", file.name);
    return new Uint8Array();
  }
};

/**
 * Converts a PDF file to an Animated GIF.
 */
export const convertPdfToGif = async (
  file: File, 
  delay: number = 500
): Promise<Blob> => {
  try {
    if (file.size === 0) throw new Error("File is empty.");
    
    const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
    const images = await convertPdfToImages(file);
    
    if (images.length === 0) throw new Error("No images extracted.");

    const firstImage = await createImageBitmap(images[0].data);
    const width = firstImage.width;
    const height = firstImage.height;
    
    const gif = new GIFEncoder();
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) throw new Error("Canvas context failed.");

    for (let i = 0; i < images.length; i++) {
        const imgBitmap = await createImageBitmap(images[i].data);
        ctx.drawImage(imgBitmap, 0, 0, width, height);
        
        const { data } = ctx.getImageData(0, 0, width, height);
        const palette = quantize(data, 256);
        const index = applyPalette(data, palette);
        
        gif.writeFrame(index, width, height, { 
            palette, 
            delay: delay, 
            transparent: false,
            dispose: -1 
        });
    }

    gif.finish();
    return new Blob([gif.bytes()], { type: 'image/gif' });

  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Error processing")) throw error;
    handleServiceError(error, "convert PDF to GIF", file.name);
    return new Blob();
  }
};

/**
 * Convert PDF to Grayscale (Rasterize)
 */
export const saveAsGrayscalePdf = async (file: File): Promise<Uint8Array> => {
  try {
    if (file.size === 0) throw new Error("File is empty.");
    
    const pdfjs = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    const pdfDoc = await PDFDocument.create();

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error("Canvas context failed");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render page
      await page.render({ canvasContext: context, viewport }).promise;

      // Convert to grayscale using CSS filter style on context (not standard) 
      // or pixel manipulation. 
      // Most robust: Draw image again with filter.
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) throw new Error("Canvas context failed");

      tempCtx.filter = 'grayscale(100%)';
      tempCtx.drawImage(canvas, 0, 0);

      // Export as JPG
      const blob = await new Promise<Blob | null>(resolve => tempCanvas.toBlob(resolve, 'image/jpeg', 0.8));
      if (!blob) throw new Error("Failed to create image blob");

      const imageEmbed = await pdfDoc.embedJpg(await blob.arrayBuffer());
      const newPage = pdfDoc.addPage([imageEmbed.width, imageEmbed.height]);
      newPage.drawImage(imageEmbed, {
          x: 0, 
          y: 0, 
          width: imageEmbed.width, 
          height: imageEmbed.height
      });
    }

    return await pdfDoc.save();
  } catch (error) {
    handleServiceError(error, "convert PDF to grayscale", file.name);
    return new Uint8Array();
  }
};

/**
 * Reads PDF metadata.
 */
export const getPdfMetadata = async (file: File): Promise<PdfMetadata> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    return {
      title: pdfDoc.getTitle(),
      author: pdfDoc.getAuthor(),
      subject: pdfDoc.getSubject(),
      keywords: pdfDoc.getKeywords(),
      creator: pdfDoc.getCreator(),
      producer: pdfDoc.getProducer(),
      creationDate: pdfDoc.getCreationDate(),
      modificationDate: pdfDoc.getModificationDate(),
    };
  } catch (error) {
    handleServiceError(error, "read PDF metadata", file.name);
    return {};
  }
};

/**
 * Sets PDF metadata and returns new PDF.
 */
export const setPdfMetadata = async (file: File, metadata: PdfMetadata): Promise<Uint8Array> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    if (metadata.title !== undefined) pdfDoc.setTitle(metadata.title);
    if (metadata.author !== undefined) pdfDoc.setAuthor(metadata.author);
    if (metadata.subject !== undefined) pdfDoc.setSubject(metadata.subject);
    if (metadata.keywords !== undefined) {
       // PDF-lib expects string[] for keywords, but simple strings are often handled or we split
       const keywords = metadata.keywords.split(',').map(k => k.trim()).filter(k => k);
       pdfDoc.setKeywords(keywords);
    }
    if (metadata.creator !== undefined) pdfDoc.setCreator(metadata.creator);
    if (metadata.producer !== undefined) pdfDoc.setProducer(metadata.producer);
    
    // Dates are complex to manage via UI correctly (timezones), skipping for now to keep it simple
    // or we can just update modification date to now
    pdfDoc.setModificationDate(new Date());

    return await pdfDoc.save();
  } catch (error) {
    handleServiceError(error, "update PDF metadata", file.name);
    return new Uint8Array();
  }
};

/**
 * Deprecated: Legacy wrapper
 */
export const compressPdf = async (files: File[], level: 'extreme' | 'recommended' | 'less'): Promise<Uint8Array> => {
    try {
      if (files.some(f => f.size === 0)) throw new Error("One of the selected files is empty.");
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        } catch (e) {
            handleServiceError(e, "compress PDF", file.name);
        }
      }
      return await mergedPdf.save({ useObjectStreams: true });
    } catch (error) {
       if (error instanceof Error && error.message.startsWith("Error processing")) throw error;
       handleServiceError(error, "compress PDF");
       return new Uint8Array();
    }
};

// Helper to convert hex to PDFLib RGB
const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? rgb(
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
    ) : rgb(0, 0, 0);
};