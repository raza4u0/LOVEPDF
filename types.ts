import React from 'react';

export enum ToolType {
  MERGE = 'merge',
  SPLIT = 'split',
  COMPRESS = 'compress',
  OFFICE_TO_PDF = 'office-pdf',
  PDF_TO_JPG = 'pdf-jpg',
  JPG_TO_PDF = 'jpg-pdf',
  AI_CHAT = 'ai-chat',
  PDF_TO_POWERPOINT = 'pdf-powerpoint',
  PDF_TO_WORD = 'pdf-word',
  PDF_TO_EXCEL = 'pdf-excel',
  WORD_TO_PDF = 'word-pdf',
  POWERPOINT_TO_PDF = 'powerpoint-pdf',
  PDF_TO_TEXT = 'pdf-text',
  PDF_TO_HTML = 'pdf-html',
  HTML_TO_PDF = 'html-pdf',
  OCR_PDF = 'ocr-pdf',
  EDIT_PDF = 'edit-pdf',
  SIGN_PDF = 'sign-pdf',
  WATERMARK_PDF = 'watermark-pdf',
  ROTATE_PDF = 'rotate-pdf',
  PROTECT_PDF = 'protect-pdf',
  UNLOCK_PDF = 'unlock-pdf',
  ORGANIZE_PDF = 'organize-pdf',
  PDF_TO_GIF = 'pdf-gif',
  PARAGRAPH_REWRITER = 'paragraph-rewriter',
  ADD_PAGE_NUMBERS = 'page-numbers',
  REPAIR_PDF = 'repair-pdf',
  FLATTEN_PDF = 'flatten-pdf',
  SCAN_PDF = 'scan-pdf',
  CROP_PDF = 'crop-pdf',
  GRAYSCALE_PDF = 'grayscale-pdf',
  EDIT_METADATA = 'edit-metadata',
  PDF_TO_WORDPRESS = 'pdf-wordpress',
}

export interface ToolInfo {
  id: ToolType;
  title: string;
  description: string;
  tooltip: string;
  icon: React.ReactNode;
  color: string;
  isNew?: boolean;
}

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface PdfEditAction {
  id: string;
  type: 'text' | 'image' | 'rectangle' | 'highlight' | 'draw';
  pageIndex: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color?: string; // hex
  size?: number; // font size or stroke width
  opacity?: number;
  points?: { x: number; y: number }[]; // For freehand drawing
}

export interface WatermarkSettings {
  type: 'text' | 'image';
  text: string;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  position: 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  opacity: number; // 0-1
  rotation: number; // degrees
  fontSize: number;
  color: string; // hex
  imageScale: number; // 0.1 - 2.0
  layer: 'over' | 'under';
}

export interface PageNumberSettings {
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  margin: number;
  startFrom: number;
  format: 'n' | 'Page n' | 'n of total';
  fontSize: number;
  fontFamily: 'Helvetica' | 'Times-Roman' | 'Courier';
}

export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string; // pdf-lib handles as string[] but we'll manage as comma-separated string for UI
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}