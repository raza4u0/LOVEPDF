import React from 'react';
import { 
  Files, 
  Scissors, 
  Minimize2, 
  FileText, 
  FileImage, 
  Image as ImageIcon,
  Sparkles,
  Presentation,
  ScanText,
  Sheet,
  FileType,
  AlignLeft,
  PenSquare,
  PenTool,
  Stamp,
  RotateCw,
  Shield,
  Film,
  RefreshCw,
  Unlock,
  Layers,
  Hash,
  Wrench,
  GalleryVerticalEnd,
  Camera,
  Crop,
  Globe,
  Droplet,
  Tag,
  FileCode,
  LayoutTemplate
} from 'lucide-react';
import { ToolInfo, ToolType } from '../types';

export const tools: ToolInfo[] = [
  {
    id: ToolType.PDF_TO_WORDPRESS,
    title: 'PDF to WordPress',
    description: 'Convert PDF content into a WordPress XML import file.',
    tooltip: 'Turn your PDF documents into WordPress posts or pages instantly ready for import.',
    icon: <LayoutTemplate size={40} />,
    color: 'text-blue-700',
    isNew: true
  },
  {
    id: ToolType.SCAN_PDF,
    title: 'Scan to PDF',
    description: 'Capture documents with your camera and save them as a PDF instantly.',
    tooltip: 'Use your device camera to scan physical documents, receipts, or notes and compile them into a PDF.',
    icon: <Camera size={40} />,
    color: 'text-indigo-500',
    isNew: true
  },
  {
    id: ToolType.EDIT_METADATA,
    title: 'Edit Metadata',
    description: 'View and edit metadata of PDF files. Change title, author, subject, and more.',
    tooltip: 'Modify hidden document properties like Title, Author, Subject, Keywords, Creator, and Producer.',
    icon: <Tag size={40} />,
    color: 'text-teal-500',
    isNew: true
  },
  {
    id: ToolType.HTML_TO_PDF,
    title: 'HTML to PDF',
    description: 'Convert webpages or HTML files to PDF documents.',
    tooltip: 'Upload an HTML file and convert it into a well-formatted PDF document.',
    icon: <FileCode size={40} />,
    color: 'text-indigo-600',
    isNew: true
  },
  {
    id: ToolType.CROP_PDF,
    title: 'Crop PDF',
    description: 'Trim margins or select a specific area of your PDF page to crop.',
    tooltip: 'Remove white margins or focus on specific content by cropping your PDF pages visually.',
    icon: <Crop size={40} />,
    color: 'text-emerald-500',
    isNew: true
  },
  {
    id: ToolType.ORGANIZE_PDF,
    title: 'Organize PDF',
    description: 'Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages to your document at will.',
    tooltip: 'Rearrange pages, rotate specific pages, or remove unnecessary pages from your document visually.',
    icon: <Layers size={40} />,
    color: 'text-indigo-600',
    isNew: true
  },
  {
    id: ToolType.MERGE,
    title: 'Merge PDF',
    description: 'Combine PDFs in the order you want with the easiest PDF merger available.',
    tooltip: 'Combine multiple PDF files into one single document in the order you want. Ideal for reports and archives.',
    icon: <Files size={40} />,
    color: 'text-brand-600'
  },
  {
    id: ToolType.SPLIT,
    title: 'Split PDF',
    description: 'Separate one page or a whole set for easy conversion into independent PDF files.',
    tooltip: 'Separate a large PDF into smaller files, or extract specific pages to share only what matters.',
    icon: <Scissors size={40} />,
    color: 'text-brand-600'
  },
  {
    id: ToolType.COMPRESS,
    title: 'Compress PDF',
    description: 'Reduce file size while optimizing for maximal PDF quality.',
    tooltip: 'Reduce file size significantly while maintaining visual quality. Perfect for emailing large documents.',
    icon: <Minimize2 size={40} />,
    color: 'text-green-500'
  },
  {
    id: ToolType.REPAIR_PDF,
    title: 'Repair PDF',
    description: 'Upload a corrupt PDF and we will try to fix it.',
    tooltip: 'Recover data from damaged or corrupted PDF files. Uses advanced reconstruction techniques to salvage content.',
    icon: <Wrench size={40} />,
    color: 'text-gray-500',
    isNew: true
  },
  {
    id: ToolType.GRAYSCALE_PDF,
    title: 'Grayscale PDF',
    description: 'Convert your PDF to black and white.',
    tooltip: 'Convert colored PDFs to grayscale to save ink during printing or reduce file size for archiving.',
    icon: <Droplet size={40} />,
    color: 'text-gray-600',
    isNew: true
  },
  {
    id: ToolType.FLATTEN_PDF,
    title: 'Flatten PDF',
    description: 'Merge layers and make fillable forms read-only.',
    tooltip: 'Flatten your PDF to merge form fields and annotations into the page content, preventing further editing.',
    icon: <GalleryVerticalEnd size={40} />,
    color: 'text-orange-500',
    isNew: true
  },
  {
    id: ToolType.ADD_PAGE_NUMBERS,
    title: 'Page Numbers',
    description: 'Add page numbers into your PDF documents with ease.',
    tooltip: 'Insert page numbers into your document. Customize position, dimensions, format and typography.',
    icon: <Hash size={40} />,
    color: 'text-red-500',
    isNew: true
  },
  {
    id: ToolType.SIGN_PDF,
    title: 'Sign PDF',
    description: 'Sign a document yourself or send a signature request to others.',
    tooltip: 'Create and apply your own digital signature to documents securely. No printing or scanning required.',
    icon: <PenTool size={40} />,
    color: 'text-brand-600',
    isNew: true
  },
  {
    id: ToolType.PROTECT_PDF,
    title: 'Protect PDF',
    description: 'Encrypt your PDF with a password to keep sensitive data confidential.',
    tooltip: 'Encrypt your PDF files with a password to prevent unauthorized access, copying, or printing.',
    icon: <Shield size={40} />,
    color: 'text-gray-700',
    isNew: true
  },
  {
    id: ToolType.UNLOCK_PDF,
    title: 'Unlock PDF',
    description: 'Remove password security from your PDF files.',
    tooltip: 'Remove the password from a PDF file so it can be freely used, edited, and printed.',
    icon: <Unlock size={40} />,
    color: 'text-pink-600',
    isNew: true
  },
  {
    id: ToolType.ROTATE_PDF,
    title: 'Rotate PDF',
    description: 'Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!',
    tooltip: 'Fix the orientation of your PDF pages. Rotate specific pages or the entire document permanently.',
    icon: <RotateCw size={40} />,
    color: 'text-violet-500',
    isNew: true
  },
  {
    id: ToolType.WATERMARK_PDF,
    title: 'Watermark PDF',
    description: 'Stamp an image or text over your PDF in seconds.',
    tooltip: 'Stamp your documents with text or images to indicate ownership, confidentiality, or status.',
    icon: <Stamp size={40} />,
    color: 'text-brand-600',
    isNew: true
  },
  {
    id: ToolType.EDIT_PDF,
    title: 'Edit PDF',
    description: 'Add text, images, shapes or freehand annotations to a PDF document.',
    tooltip: 'Add text, shapes, highlights, and annotations directly to your PDF pages to provide feedback or fill forms.',
    icon: <PenSquare size={40} />,
    color: 'text-brand-600',
    isNew: true
  },
  {
    id: ToolType.OCR_PDF,
    title: 'OCR PDF',
    description: 'Convert scanned PDF files into searchable and selectable text documents.',
    tooltip: 'Turn scanned documents and images into searchable, selectable, and editable text using advanced OCR technology.',
    icon: <ScanText size={40} />,
    color: 'text-blue-500',
    isNew: true
  },
  {
    id: ToolType.PDF_TO_POWERPOINT,
    title: 'PDF to PowerPoint',
    description: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.',
    tooltip: 'Transform your PDF slides back into editable PowerPoint (PPTX) presentations with layout preservation.',
    icon: <Presentation size={40} />,
    color: 'text-brand-600',
    isNew: true
  },
  {
    id: ToolType.PDF_TO_EXCEL,
    title: 'PDF to Excel',
    description: 'Convert PDF Data to EXCEL Spreadsheets.',
    tooltip: 'Pull data directly from PDF tables into Excel spreadsheets for easy analysis and calculation.',
    icon: <Sheet size={40} />,
    color: 'text-green-600',
    isNew: true
  },
  {
    id: ToolType.WORD_TO_PDF,
    title: 'Word to PDF',
    description: 'Make DOC and DOCX files easy to read by converting them to PDF.',
    tooltip: 'Convert DOC and DOCX files to PDF to ensure your document looks exactly the same on every screen.',
    icon: <FileType size={40} />,
    color: 'text-blue-600',
    isNew: true
  },
  {
    id: ToolType.POWERPOINT_TO_PDF,
    title: 'PowerPoint to PDF',
    description: 'Make PPT and PPTX slideshows easy to view by converting them to PDF.',
    tooltip: 'Save your presentations as PDFs to ensure fonts and layouts remain intact when sharing.',
    icon: <Presentation size={40} />,
    color: 'text-brand-600',
    isNew: true
  },
  {
    id: ToolType.JPG_TO_PDF,
    title: 'JPG to PDF',
    description: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.',
    tooltip: 'Combine multiple images into a single, polished PDF document. Great for receipts and portfolios.',
    icon: <ImageIcon size={40} />,
    color: 'text-yellow-500'
  },
  {
    id: ToolType.PDF_TO_JPG,
    title: 'PDF to JPG',
    description: 'Extract images from your PDF or save each page as a separate image.',
    tooltip: 'Turn PDF pages into high-quality image files, or extract individual images embedded in the document.',
    icon: <FileImage size={40} />,
    color: 'text-yellow-500'
  },
   {
    id: ToolType.PDF_TO_GIF,
    title: 'PDF to GIF',
    description: 'Convert PDF pages into an animated GIF or extract static GIFs.',
    tooltip: 'Turn your PDF presentation into an animated GIF loop for social media or previews.',
    icon: <Film size={40} />,
    color: 'text-purple-500',
    isNew: true
  },
  {
    id: ToolType.PDF_TO_WORD,
    title: 'PDF to Word',
    description: 'Convert your PDF to WORD documents with incredible accuracy.',
    tooltip: 'Convert your PDFs back to editable Word documents. Great for repurposing content from read-only files.',
    icon: <FileText size={40} />,
    color: 'text-blue-600'
  },
  {
    id: ToolType.PDF_TO_HTML,
    title: 'PDF to HTML',
    description: 'Convert your PDF documents to HTML webpages.',
    tooltip: 'Convert your PDF document content into a clean HTML webpage.',
    icon: <Globe size={40} />,
    color: 'text-indigo-600',
    isNew: true
  },
  {
    id: ToolType.PDF_TO_TEXT,
    title: 'PDF to Text',
    description: 'Extract text from your PDF to a simple text file.',
    tooltip: 'Extract raw text from PDF files for easy editing, copying, or analysis in other text-based tools.',
    icon: <AlignLeft size={40} />,
    color: 'text-gray-600',
    isNew: true
  },
  {
    id: ToolType.PARAGRAPH_REWRITER,
    title: 'Paragraph Rewriter',
    description: 'Rewrite your text instantly using our powerful paragraph rewriter.',
    tooltip: 'Use AI to paraphrase, change tone, or adjust the length of any text snippet instantly.',
    icon: <RefreshCw size={40} />,
    color: 'text-brand-500',
    isNew: true
  },
   {
    id: ToolType.AI_CHAT,
    title: 'Chat with PDF',
    description: 'Use AI to summarize, explain, and answer questions about your PDF documents.',
    tooltip: 'Leverage Gemini AI to summarize documents, ask complex questions, and extract key data instantly.',
    icon: <Sparkles size={40} />,
    color: 'text-brand-500',
    isNew: true
  },
];