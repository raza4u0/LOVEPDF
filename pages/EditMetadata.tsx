import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, Loader2, AlertCircle, X, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { getPdfMetadata, setPdfMetadata, downloadPdf } from '../services/pdfService';
import { UploadedFile, PdfMetadata } from '../types';

const EditMetadata: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [metadata, setMetadata] = useState<PdfMetadata>({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: '',
    producer: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = async (newFiles: File[]) => {
    setErrorMessage(null);
    if (newFiles.length > 0) {
      const selectedFile = newFiles[0];
      setFile({
        id: Math.random().toString(36).substr(2, 9),
        file: selectedFile,
      });
      
      // Load metadata
      try {
        const data = await getPdfMetadata(selectedFile);
        setMetadata({
            title: data.title || '',
            author: data.author || '',
            subject: data.subject || '',
            keywords: data.keywords || '',
            creator: data.creator || '',
            producer: data.producer || ''
        });
        setIsDone(false);
      } catch (e: any) {
        setErrorMessage("Failed to read PDF metadata. " + e.message);
      }
    }
  };

  const handleSave = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 800));
      const pdfBytes = await setPdfMetadata(file.file, metadata);
      downloadPdf(pdfBytes, `metadata_${file.file.name}`);
      setIsDone(true);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Error saving metadata.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setMetadata(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col">
      {/* Tool Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-16 z-40">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Edit PDF Metadata</h1>
        </div>
        {file && !isDone && (
            <button
            onClick={handleSave}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all
                ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:scale-105'}
            `}
            >
            {isProcessing ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Saving...</span>
                </>
            ) : (
                'Save PDF'
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
                View and edit metadata of PDF files. Change title, author, subject, keywords and more.
            </p>
          </div>
        ) : isDone ? (
             <div className="w-full max-w-2xl">
                <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-green-100 text-green-600 rounded-full mb-6">
                        <Tag size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Metadata Updated!</h2>
                    <p className="text-gray-600 mb-8">
                        Your file has been updated with new properties. The download should have started automatically.
                    </p>
                    <button 
                        onClick={() => { setFile(null); setIsDone(false); setMetadata({}); }} 
                        className="text-teal-600 font-medium hover:underline"
                    >
                        Edit another PDF
                    </button>
                </div>
             </div>
        ) : (
            <div className="flex flex-col md:flex-row w-full max-w-5xl gap-8">
                {/* Left: File Info */}
                <div className="md:w-1/3 flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 h-fit">
                     <div className="mb-4 text-teal-500">
                        <FileText size={64} />
                     </div>
                     <h3 className="text-lg font-bold text-gray-900 mb-1 text-center break-all">{file.file.name}</h3>
                     <p className="text-gray-500 text-sm mb-6">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                     <button 
                        onClick={() => setFile(null)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                     >
                         Change File
                     </button>
                </div>

                {/* Right: Form */}
                <div className="md:w-2/3 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Tag size={20} /> Properties
                    </h2>
                    
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={metadata.title}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                placeholder="PDF Document Title"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                <input
                                    type="text"
                                    name="author"
                                    value={metadata.author}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                    placeholder="Author Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={metadata.subject}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                    placeholder="Subject"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                            <input
                                type="text"
                                name="keywords"
                                value={metadata.keywords}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                placeholder="Comma, separated, keywords"
                            />
                            <p className="text-xs text-gray-400 mt-1">Separate keywords with commas.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-gray-100">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Creator Application</label>
                                <input
                                    type="text"
                                    name="creator"
                                    value={metadata.creator}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                                    placeholder="e.g. Microsoft Word"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">PDF Producer</label>
                                <input
                                    type="text"
                                    name="producer"
                                    value={metadata.producer}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                                    placeholder="e.g. Acrobat Distiller"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default EditMetadata;
