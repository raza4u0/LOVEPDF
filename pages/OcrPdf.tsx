import React, { useState } from 'react';
import { ArrowLeft, Download, ScanText, Loader2, FileSearch, Globe, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { ocrPdf } from '../services/ocrService';
import { downloadPdf } from '../services/pdfService';
import { UploadedFile } from '../types';

const LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'spa', name: 'Spanish' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
  { code: 'ita', name: 'Italian' },
  { code: 'por', name: 'Portuguese' },
  { code: 'rus', name: 'Russian' },
  { code: 'chi_sim', name: 'Chinese (Simplified)' },
  { code: 'jpn', name: 'Japanese' },
];

const OcrPdf: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [selectedLang, setSelectedLang] = useState<string>('eng');
  const [resultPdf, setResultPdf] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = (newFiles: File[]) => {
    setErrorMessage(null);
    if (newFiles.length > 0) {
      setFile({
        id: Math.random().toString(36).substr(2, 9),
        file: newFiles[0],
      });
      setIsDone(false);
      setResultPdf(null);
      setProgressPercent(0);
    }
  };

  const handleOcr = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgressPercent(0);
    setErrorMessage(null);
    
    try {
      const pdfBytes = await ocrPdf(file.file, selectedLang, (status, percent) => {
        setProgressStatus(status);
        setProgressPercent(percent);
      });
      
      setResultPdf(pdfBytes);
      downloadPdf(pdfBytes, `${file.file.name.replace('.pdf', '')}_ocr.pdf`);
      setIsDone(true);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Error performing OCR. Note: Very large files might fail due to browser memory limits.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultPdf && file) {
      downloadPdf(resultPdf, `${file.file.name.replace('.pdf', '')}_ocr.pdf`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col">
      {/* Tool Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-16 z-40">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">OCR PDF</h1>
        </div>
        {file && !isDone && (
            <button
            onClick={handleOcr}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all
                ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:scale-105'}
            `}
            >
            {isProcessing ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Processing...</span>
                </>
            ) : (
                'Start OCR'
            )}
            </button>
        )}
      </div>

      <div className="flex-grow p-4 sm:p-8 flex flex-col items-center">
        {errorMessage && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3 w-full max-w-2xl border border-red-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                <div className="flex-grow text-sm font-medium">{errorMessage}</div>
                <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
                    <X size={16} />
                </button>
            </div>
        )}

        {!file ? (
          <div className="max-w-xl w-full">
            <FileUploader 
                onFilesSelected={handleFileSelected} 
                title="Drop PDF file here"
                buttonText="Select PDF file"
                multiple={false}
            />
            <p className="text-center mt-6 text-gray-500">
                Convert scanned PDF files into selectable and searchable text documents.
            </p>
          </div>
        ) : isDone ? (
             <div className="w-full max-w-2xl">
                <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-blue-100 text-blue-600 rounded-full mb-6">
                        <FileSearch size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">OCR Completed!</h2>
                    <p className="text-gray-600 mb-8">
                        Your document is now searchable. The download should have started automatically.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            onClick={handleDownload}
                            className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Download size={20} />
                            Download PDF
                        </button>
                         <button 
                            onClick={() => { setFile(null); setResultPdf(null); setIsDone(false); }} 
                            className="text-gray-500 font-medium hover:text-gray-900 px-6 py-3"
                        >
                            OCR another PDF
                        </button>
                    </div>
                </div>
             </div>
        ) : (
            <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
                 <div className="mb-6 text-red-500">
                    <ScanText size={64} />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900 mb-2">{file.file.name}</h2>
                 <p className="text-gray-500 mb-8">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                 
                 {isProcessing ? (
                     <div className="w-full mb-8">
                         <div className="flex justify-between text-sm text-gray-600 mb-2">
                             <span>{progressStatus}</span>
                             <span className="font-semibold">{progressPercent}%</span>
                         </div>
                         <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className="bg-red-600 h-2.5 rounded-full transition-all duration-300" 
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                         </div>
                     </div>
                 ) : (
                    <div className="w-full bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                        <h3 className="font-semibold text-gray-800 mb-4">OCR Options</h3>
                        <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div className="p-2 bg-gray-100 text-gray-600 rounded-full">
                                <Globe size={20} />
                            </div>
                            <div className="flex-grow">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Document Language</label>
                                <select 
                                    value={selectedLang} 
                                    onChange={(e) => setSelectedLang(e.target.value)}
                                    className="block w-full text-sm border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                >
                                    {LANGUAGES.map(lang => (
                                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                 )}

                 <button
                    onClick={handleOcr}
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2
                        ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:-translate-y-0.5'}
                    `}
                >
                    {isProcessing ? 'Processing...' : 'Recognize Text'}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default OcrPdf;