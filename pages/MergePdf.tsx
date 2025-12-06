import React, { useState } from 'react';
import { ArrowLeft, Trash2, Download, FileText, Plus, ArrowRight, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { mergePdfs, downloadPdf } from '../services/pdfService';
import { UploadedFile } from '../types';

const MergePdf: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setErrorMessage(null);
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
    }));
    setFiles((prev) => [...prev, ...uploadedFiles]);
    setIsDone(false);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const mergedPdfBytes = await mergePdfs(files.map(f => f.file));
      downloadPdf(mergedPdfBytes, 'merged_document.pdf');
      setIsDone(true);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Error merging PDFs.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Tool Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-16 z-40">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Merge PDF files</h1>
        </div>
        {files.length > 0 && !isDone && (
            <button
            onClick={handleMerge}
            disabled={files.length < 2 || isProcessing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all
                ${files.length < 2 || isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 hover:scale-105'}
            `}
            >
            {isProcessing ? 'Merging...' : 'Merge PDFs'}
            {!isProcessing && <ArrowRight size={20} className="hidden sm:inline" />}
            </button>
        )}
      </div>

      <div className="flex-grow p-4 sm:p-8 flex flex-col items-center">
        {errorMessage && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3 w-full max-w-5xl border border-red-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                <div className="flex-grow text-sm font-medium">{errorMessage}</div>
                <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
                    <X size={16} />
                </button>
            </div>
        )}

        {files.length === 0 ? (
          <div className="max-w-xl w-full">
            <FileUploader 
                onFilesSelected={handleFilesSelected} 
                title="Drop PDF files here"
                buttonText="Select PDF files"
            />
            <p className="text-center mt-6 text-gray-500">
                Combine PDFs in the order you want with the easiest PDF merger available.
            </p>
          </div>
        ) : (
            <div className="w-full max-w-5xl">
                {isDone ? (
                     <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="inline-flex items-center justify-center p-4 bg-green-100 text-green-600 rounded-full mb-6">
                            <Download size={48} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">PDFs have been merged!</h2>
                        <p className="text-gray-600 mb-8">Your file has been downloaded automatically.</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setFiles([])} className="text-brand-600 font-medium hover:underline">
                                Merge more PDFs
                            </button>
                        </div>
                     </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {files.map((file, index) => (
                            <div key={file.id} className="relative group bg-white p-4 rounded-xl shadow-sm border border-gray-200 aspect-[3/4] flex flex-col items-center justify-center cursor-move hover:shadow-md transition-shadow">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button 
                                        onClick={() => removeFile(file.id)}
                                        className="bg-brand-500 text-white p-1.5 rounded-full hover:bg-brand-600 shadow-sm"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="text-brand-500 mb-2">
                                    <FileText size={48} />
                                </div>
                                <span className="text-xs text-center text-gray-600 font-medium line-clamp-2 break-all w-full px-2">
                                    {file.file.name}
                                </span>
                                <div className="absolute bottom-2 bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full">
                                    Page {index + 1}
                                </div>
                            </div>
                        ))}
                        
                        {/* Add more button */}
                        <div className="relative flex flex-col items-center justify-center aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-400 hover:bg-gray-50 transition-colors cursor-pointer">
                             <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept="application/pdf"
                                multiple
                                onChange={(e) => {
                                    if(e.target.files) handleFilesSelected(Array.from(e.target.files))
                                }}
                            />
                            <div className="bg-brand-500 text-white p-2 rounded-full mb-2">
                                <Plus size={24} />
                            </div>
                            <span className="text-sm font-medium text-gray-600">Add more</span>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default MergePdf;