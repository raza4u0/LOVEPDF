import React from 'react';
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import MergePdf from './pages/MergePdf';
import CompressPdf from './pages/CompressPdf';
import JpgToPdf from './pages/JpgToPdf';
import PdfToJpg from './pages/PdfToJpg';
import SplitPdf from './pages/SplitPdf';
import AiChat from './pages/AiChat';
import PdfToPowerPoint from './pages/PdfToPowerPoint';
import PdfToWord from './pages/PdfToWord';
import PdfToExcel from './pages/PdfToExcel';
import OcrPdf from './pages/OcrPdf';
import WordToPdf from './pages/WordToPdf';
import PdfToText from './pages/PdfToText';
import PdfToHtml from './pages/PdfToHtml';
import HtmlToPdf from './pages/HtmlToPdf';
import PowerPointToPdf from './pages/PowerPointToPdf';
import EditPdf from './pages/EditPdf';
import SignPdf from './pages/SignPdf';
import WatermarkPdf from './pages/WatermarkPdf';
import RotatePdf from './pages/RotatePdf';
import ProtectPdf from './pages/ProtectPdf';
import UnlockPdf from './pages/UnlockPdf';
import OrganizePdf from './pages/OrganizePdf';
import PdfToGif from './pages/PdfToGif';
import RepairPdf from './pages/RepairPdf';
import FlattenPdf from './pages/FlattenPdf';
import ParagraphRewriter from './pages/ParagraphRewriter';
import AddPageNumbers from './pages/AddPageNumbers';
import ScanPdf from './pages/ScanPdf';
import CropPdf from './pages/CropPdf';
import GrayscalePdf from './pages/GrayscalePdf';
import EditMetadata from './pages/EditMetadata';
import PdfToWordPress from './pages/PdfToWordPress';
import Contact from './pages/Contact';
import About from './pages/About';
import Security from './pages/Security';
import CookiePolicy from './pages/CookiePolicy';
import Press from './pages/Press';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import Feedback from './pages/Feedback';
import { ThemeProvider } from './components/ThemeContext';

// Layout wrapper for standard pages that need the footer
const StandardLayout = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
  </>
);

// Layout for tools that might want full height or different structure
const ToolLayout = () => (
    <>
        <Navbar />
        <Outlet />
        {/* Footer is handled inside specific pages if needed, or we omit it for full-screen tools like Chat */}
    </>
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route element={<StandardLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/security" element={<Security />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/press" element={<Press />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/feedback" element={<Feedback />} />
          </Route>
          
          {/* Tool Routes */}
          <Route element={<ToolLayout />}>
              <Route path="/merge" element={<MergePdf />} />
              <Route path="/split" element={<SplitPdf />} />
              <Route path="/compress" element={<CompressPdf />} />
              <Route path="/jpg-to-pdf" element={<JpgToPdf />} />
              <Route path="/pdf-to-jpg" element={<PdfToJpg />} />
              <Route path="/ai-chat" element={<AiChat />} />
              <Route path="/pdf-to-powerpoint" element={<PdfToPowerPoint />} />
              <Route path="/pdf-to-word" element={<PdfToWord />} />
              <Route path="/pdf-to-excel" element={<PdfToExcel />} />
              <Route path="/ocr-pdf" element={<OcrPdf />} />
              <Route path="/word-to-pdf" element={<WordToPdf />} />
              <Route path="/pdf-to-text" element={<PdfToText />} />
              <Route path="/pdf-to-html" element={<PdfToHtml />} />
              <Route path="/html-to-pdf" element={<HtmlToPdf />} />
              <Route path="/powerpoint-to-pdf" element={<PowerPointToPdf />} />
              <Route path="/edit-pdf" element={<EditPdf />} />
              <Route path="/sign-pdf" element={<SignPdf />} />
              <Route path="/watermark-pdf" element={<WatermarkPdf />} />
              <Route path="/rotate-pdf" element={<RotatePdf />} />
              <Route path="/protect-pdf" element={<ProtectPdf />} />
              <Route path="/unlock-pdf" element={<UnlockPdf />} />
              <Route path="/organize-pdf" element={<OrganizePdf />} />
              <Route path="/pdf-to-gif" element={<PdfToGif />} />
              <Route path="/repair-pdf" element={<RepairPdf />} />
              <Route path="/flatten-pdf" element={<FlattenPdf />} />
              <Route path="/paragraph-rewriter" element={<ParagraphRewriter />} />
              <Route path="/page-numbers" element={<AddPageNumbers />} />
              <Route path="/scan-pdf" element={<ScanPdf />} />
              <Route path="/crop-pdf" element={<CropPdf />} />
              <Route path="/grayscale-pdf" element={<GrayscalePdf />} />
              <Route path="/edit-metadata" element={<EditMetadata />} />
              <Route path="/pdf-to-wordpress" element={<PdfToWordPress />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;