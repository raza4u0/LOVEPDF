import React, { useState } from 'react';
import { ArrowLeft, Download, FileText, Loader2, Scissors, Archive, Check, AlertCircle, X, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { splitPdf, createZip, downloadPdf } from '../services/pdfService';
import { UploadedFile } from '../types';

const SplitPdf: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [splitFiles, setSplitFiles] = useState<{ name: string, data: Blob }[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setErrorMessage(null);
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
    }));
    setFiles((prev) => [...prev, ...uploadedFiles]);
    setIsDone(false);
    setSplitFiles([]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSplit = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      // Small delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const allSplitFiles: { name: string, data: Blob }[] = [];
      
      for (const uploadedFile of files) {
          try {
            const pdfs = await splitPdf(uploadedFile.file);
            allSplitFiles.push(...pdfs);
          } catch (e: any) {
              console.error(`Error splitting ${uploadedFile.file.name}`, e);
              // We could choose to fail hard or continue. Let's continue but warn? 
              // For now, let the service throw and we catch below.
              throw e;
          }
      }
      
      if (allSplitFiles.length === 0) {
          throw new Error("No pages could be extracted.");
      }

      setSplitFiles(allSplitFiles);
      setIsDone(true);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Error splitting PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadZip = async () => {
    if (splitFiles.length === 0) return;
    try {
      const zipBlob = await createZip(splitFiles);
      const filename = files.length === 1 
        ? `${files[0].file.name.replace('.pdf', '')}_split.zip` 
        : 'split_files.zip';
      downloadPdf(zipBlob, filename);
    } catch (error: any) {
      console.error(error);
      setErrorMessage("Failed to create ZIP archive.");
    }
  };

  const handleDownloadSingle = (pdf: { name: string, data: Blob }) => {
    downloadPdf(pdf.data, pdf.name);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col">
      {/* Tool Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-16 z-40">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Split PDF</h1>
        </div>
        {files.length > 1 && !isDone && (
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <Archive size={16} /> Batch Mode Active
            </div>
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

        {files.length === 0 ? (
          <div className="max-w-xl w-full">
            <FileUploader 
                onFilesSelected={handleFilesSelected} 
                title="Drop PDF files here"
                buttonText="Select PDF files"
                multiple={true}
            />
            <p className="text-center mt-6 text-gray-500">
                Separate one page or a whole set for easy conversion into independent PDF files.
            </p>
          </div>
        ) : isDone ? (
             <div className="w-full max-w-5xl">
                <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-green-100 text-green-600 rounded-full mb-6">
                        <Scissors size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">PDFs have been split!</h2>
                    <p className="text-gray-600 mb-8">
                        We've created {splitFiles.length} independent PDF files.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            onClick={handleDownloadZip}
                            className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Archive size={20} />
                            Download ZIP Archive
                        </button>
                         <button 
                            onClick={() => { setFiles([]); setSplitFiles([]); setIsDone(false); }} 
                            className="text-gray-500 font-medium hover:text-gray-900 px-6 py-3"
                        >
                            Split more PDFs
                        </button>
                    </div>
                </div>

                {/* Grid of Results */}
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Extracted Pages ({splitFiles.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {splitFiles.map((pdf, index) => (
                        <div key={index} className="group relative bg-white p-4 rounded-xl shadow-sm border border-gray-200 aspect-[3/4] flex flex-col items-center justify-between hover:shadow-md transition-all">
                            <div className="w-full flex justify-center text-red-100 group-hover:text-red-500 transition-colors mt-4">
                                <FileText size={64} />
                            </div>
                            <div className="w-full text-center">
                                <span className="text-xs text-gray-500 font-medium block truncate px-1" title={pdf.name}>
                                    {pdf.name}
                                </span>
                                <button
                                    onClick={() => handleDownloadSingle(pdf)}
                                    className="mt-3 w-full flex items-center justify-center gap-1 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                >
                                    <Download size={14} /> Download
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        ) : (
            <div className="flex flex-col md:flex-row flex-grow w-full max-w-6xl gap-6">
                {/* Left Side - File List */}
                <div className="flex-grow flex flex-col">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {files.map((file) => (
                            <div key={file.id} className="relative group bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center aspect-[3/4]">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button 
                                        onClick={() => removeFile(file.id)}
                                        className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-sm"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="text-red-500 mb-4">
                                    <FileText size={64} />
                                </div>
                                <span className="text-sm text-center text-gray-700 font-medium line-clamp-2 px-2 break-all">
                                    {file.file.name}
                                </span>
                                <span className="text-xs text-gray-400 mt-1">
                                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                            </div>
                        ))}
                         <div className="relative flex flex-col items-center justify-center aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 hover:border-red-400 hover:bg-gray-50 transition-colors cursor-pointer bg-white/50">
                             <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept="application/pdf"
                                multiple
                                onChange={(e) => {
                                    if(e.target.files) handleFilesSelected(Array.from(e.target.files))
                                }}
                            />
                            <div className="bg-red-500 text-white p-2 rounded-full mb-2">
                                <Plus size={24} />
                            </div>
                            <span className="text-sm font-medium text-gray-600">Add more</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Controls */}
                <div className="w-full md:w-80 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit sticky top-24">
                     <h2 className="text-xl font-bold text-gray-900 mb-6">Split Options</h2>
                     
                     <div className="w-full bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8">
                        <div className="flex items-center gap-3 p-3 bg-white border border-red-200 rounded-lg shadow-sm">
                            <div className="p-2 bg-red-50 text-red-600 rounded-full">
                                <Check size={20} />
                            </div>
                            <div className="flex-grow">
                                <p className="font-medium text-gray-900">Extract all pages</p>
                                <p className="text-xs text-gray-500">All pages will be extracted as separate files.</p>
                            </div>
                            <div className="w-4 h-4 rounded-full border-4 border-red-500"></div>
                        </div>
                     </div>

                     <button
                        onClick={handleSplit}
                        disabled={isProcessing}
                        className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-md transition-all flex items-center justify-center gap-2
                            ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:-translate-y-0.5'}
                        `}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                <span>Splitting...</span>
                            </>
                        ) : (
                            <>
                                <span>Split PDF{files.length > 1 ? 's' : ''}</span>
                                <Scissors size={20} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SplitPdf;