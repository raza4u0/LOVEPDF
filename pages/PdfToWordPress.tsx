import React, { useState } from 'react';
import { ArrowLeft, Download, LayoutTemplate, Loader2, AlertCircle, X, FileText, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { convertPdfToWordPress, downloadPdf } from '../services/pdfService';
import { UploadedFile } from '../types';

const PdfToWordPress: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [xmlBlob, setXmlBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [postType, setPostType] = useState<'post' | 'page'>('post');

  const handleFileSelected = (newFiles: File[]) => {
    setErrorMessage(null);
    if (newFiles.length > 0) {
      setFile({
        id: Math.random().toString(36).substr(2, 9),
        file: newFiles[0],
      });
      setIsDone(false);
      setXmlBlob(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const blob = await convertPdfToWordPress(file.file, postType);
      setXmlBlob(blob);
      downloadPdf(blob, `${file.file.name.replace('.pdf', '')}.xml`);
      setIsDone(true);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Error converting PDF to WordPress XML.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (xmlBlob && file) {
      downloadPdf(xmlBlob, `${file.file.name.replace('.pdf', '')}.xml`);
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
          <h1 className="text-xl font-bold text-gray-900">PDF to WordPress</h1>
        </div>
        {file && !isDone && (
            <button
            onClick={handleConvert}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all
                ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800 hover:scale-105'}
            `}
            >
            {isProcessing ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Converting...</span>
                </>
            ) : (
                'Convert to XML'
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
                Convert PDF content into a WordPress XML import file for easy blog posting.
            </p>
          </div>
        ) : isDone ? (
             <div className="w-full max-w-2xl">
                <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-green-100 text-green-600 rounded-full mb-6">
                        <LayoutTemplate size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready for WordPress!</h2>
                    <p className="text-gray-600 mb-8">
                        Your WXR XML file is ready. Import this file into WordPress under <strong>Tools &gt; Import</strong>.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            onClick={handleDownload}
                            className="bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <Download size={20} />
                            Download XML
                        </button>
                         <button 
                            onClick={() => { setFile(null); setXmlBlob(null); setIsDone(false); }} 
                            className="text-gray-500 font-medium hover:text-gray-900 px-6 py-3"
                        >
                            Convert another PDF
                        </button>
                    </div>
                </div>
             </div>
        ) : (
            <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
                 <div className="mb-6 text-blue-700">
                    <FileText size={64} />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900 mb-2">{file.file.name}</h2>
                 <p className="text-gray-500 mb-8">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                 
                 <div className="w-full bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                    <h3 className="font-semibold text-gray-800 mb-4">WordPress Options</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div 
                            onClick={() => setPostType('post')}
                            className={`p-4 rounded-lg border cursor-pointer flex items-center gap-3 transition-all ${postType === 'post' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                        >
                            <div className={`p-2 rounded-full ${postType === 'post' ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                                <FileText size={20} />
                            </div>
                            <div>
                                <span className="block font-bold text-gray-900">Import as Post</span>
                                <span className="text-xs text-gray-500">Standard blog post</span>
                            </div>
                            {postType === 'post' && <Check size={20} className="ml-auto text-blue-600" />}
                        </div>

                        <div 
                            onClick={() => setPostType('page')}
                            className={`p-4 rounded-lg border cursor-pointer flex items-center gap-3 transition-all ${postType === 'page' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                        >
                            <div className={`p-2 rounded-full ${postType === 'page' ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                                <LayoutTemplate size={20} />
                            </div>
                            <div>
                                <span className="block font-bold text-gray-900">Import as Page</span>
                                <span className="text-xs text-gray-500">Static website page</span>
                            </div>
                            {postType === 'page' && <Check size={20} className="ml-auto text-blue-600" />}
                        </div>
                    </div>
                 </div>

                 <button
                    onClick={handleConvert}
                    className="w-full bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-blue-800 transition-transform hover:-translate-y-0.5"
                >
                    Convert to WordPress
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default PdfToWordPress;