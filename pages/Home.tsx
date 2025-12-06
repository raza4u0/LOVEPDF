import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Files, 
  FileText, 
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { ToolType } from '../types';
import { tools } from '../data/tools';

const Home: React.FC = () => {
  const getToolLink = (id: string) => {
    if (id === ToolType.EDIT_PDF) return '/edit-pdf';
    if (id === ToolType.SIGN_PDF) return '/sign-pdf';
    if (id === ToolType.WATERMARK_PDF) return '/watermark-pdf';
    if (id === ToolType.ROTATE_PDF) return '/rotate-pdf';
    if (id === ToolType.PROTECT_PDF) return '/protect-pdf';
    if (id === ToolType.UNLOCK_PDF) return '/unlock-pdf';
    if (id === ToolType.ORGANIZE_PDF) return '/organize-pdf';
    if (id === ToolType.ADD_PAGE_NUMBERS) return '/page-numbers';
    if (id === ToolType.REPAIR_PDF) return '/repair-pdf';
    if (id === ToolType.AI_CHAT) return '/ai-chat';
    if (id === ToolType.JPG_TO_PDF) return '/jpg-to-pdf';
    if (id === ToolType.PDF_TO_JPG) return '/pdf-to-jpg';
    if (id === ToolType.PDF_TO_POWERPOINT) return '/pdf-to-powerpoint';
    if (id === ToolType.PDF_TO_WORD) return '/pdf-to-word';
    if (id === ToolType.PDF_TO_EXCEL) return '/pdf-to-excel';
    if (id === ToolType.WORD_TO_PDF) return '/word-to-pdf';
    if (id === ToolType.POWERPOINT_TO_PDF) return '/powerpoint-to-pdf';
    if (id === ToolType.OCR_PDF) return '/ocr-pdf';
    if (id === ToolType.PDF_TO_TEXT) return '/pdf-to-text';
    if (id === ToolType.PDF_TO_HTML) return '/pdf-to-html';
    if (id === ToolType.PDF_TO_GIF) return '/pdf-to-gif';
    if (id === ToolType.FLATTEN_PDF) return '/flatten-pdf';
    if (id === ToolType.PARAGRAPH_REWRITER) return '/paragraph-rewriter';
    if (id === ToolType.SCAN_PDF) return '/scan-pdf';
    if (id === ToolType.CROP_PDF) return '/crop-pdf';
    if (id === ToolType.GRAYSCALE_PDF) return '/grayscale-pdf';
    return `/${id.split('-')[0]}`;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <div className="text-center py-16 px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-6 drop-shadow-sm">
          Every tool you need to work with PDFs in one place
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, edit and chat with your PDFs.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <div key={tool.id} className="relative group">
              <Link
                to={getToolLink(tool.id)}
                className="block bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-white/50 hover:border-brand-200 hover:-translate-y-1 hover:z-20 relative h-full"
              >
                {tool.isNew && (
                  <div className="absolute top-4 left-4 bg-brand-100 text-brand-700 text-xs font-bold px-2 py-1 rounded-full">
                    NEW
                  </div>
                )}
                
                {/* Tooltip Icon & Popup */}
                <div className="absolute top-4 right-4 z-30" onClick={(e) => e.preventDefault()}>
                  <div className="group/info relative">
                    <Info size={20} className="text-gray-300 hover:text-brand-600 cursor-help transition-colors" />
                    <div className="absolute right-0 w-72 p-3 bg-gray-900 text-white text-xs leading-relaxed rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 translate-y-2 z-50 pointer-events-none">
                       {tool.tooltip}
                       <div className="absolute -top-1 right-1.5 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  </div>
                </div>

                <div className={`mb-6 ${tool.color} group-hover:scale-110 transition-transform duration-300`}>
                  {tool.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors pr-6">
                  {tool.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {tool.description}
                </p>
                <div className="absolute bottom-6 left-8 flex items-center text-brand-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                  Start Now <ArrowRight size={16} className="ml-2" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      
      {/* Feature Highlight */}
      <div className="w-full bg-white/60 backdrop-blur-md py-16 border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-brand-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
                <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center relative z-10">
                    <div className="inline-flex items-center gap-2 text-brand-200 font-semibold mb-2">
                        <Sparkles size={20} />
                        <span>Powered by Gemini 2.5</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Unlock the knowledge in your PDFs
                    </h2>
                    <p className="text-brand-100 text-lg mb-8">
                        Don't just read PDFs—talk to them. Our new AI Assistant allows you to summarize documents, extract key data, and ask questions instantly.
                    </p>
                    <Link to="/ai-chat" className="inline-block bg-white text-brand-700 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-brand-50 transition-colors self-start">
                        Try AI Assistant
                    </Link>
                </div>
                <div className="md:w-1/2 bg-brand-600 relative min-h-[300px]">
                    {/* Abstract visual representation of AI scanning a doc */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                         <FileText size={200} className="text-white" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-700 to-transparent"></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Home;