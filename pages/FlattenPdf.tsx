import React, { useState } from 'react';
import { ArrowLeft, Download, Layers, Loader2, AlertCircle, X, FileText, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { flattenPdf, downloadPdf } from '../services/pdfService';
import { UploadedFile } from '../types';

const FlattenPdf: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [mode, setMode] = useState<'form' | 'raster'>('form');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = (newFiles: File[]) => {
    setErrorMessage(null);
    if (newFiles.length > 0) {
      setFile({
        id: Math.random().toString(36).substr(2, 9),
        file: newFiles[0],
      });
      setIsDone(false);
    }
  };

  const handleFlatten = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // UI delay
      const flattenedPdf = await flattenPdf(file.file, mode);
      downloadPdf(flattenedPdf, `flattened_${file.file.name}`);
      setIsDone(true);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Error flattening PDF.");
    } finally {
      setIsProcessing(false);
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
          <h1 className="text-xl font-bold text-gray-900">Flatten PDF</h1>
        </div>
        {file && !isDone && (
            <button
            onClick={handleFlatten}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all
                ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 hover:scale-105'}
            `}
            >
            {isProcessing ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Flattening...</span>
                </>
            ) : (
                'Flatten PDF'
            )}
            </button>
        )}
      </div>

      <div className="flex-grow flex flex-col">
        {errorMessage && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg m-4 flex items-start gap-3 max-w-2xl mx-auto border border-red-200 shadow-sm">
                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                <div className="flex-grow text-sm font-medium">{errorMessage}</div>
                <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
                    <X size={16} />
                </button>
            </div>
        )}

        {!file ? (
          <div className="flex-grow flex flex-col items-center justify-center p-4">
             <div className="max-w-xl w-full">
                <FileUploader 
                    onFilesSelected={handleFileSelected} 
                    title="Drop PDF file here"
                    buttonText="Select PDF file"
                    multiple={false}
                />
                <p className="text-center mt-6 text-gray-500">
                    Flatten your PDF to merge layers and make fillable forms read-only.
                </p>
             </div>
          </div>
        ) : isDone ? (
             <div className="flex-grow flex items-center justify-center p-4">
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl w-full">
                    <div className="inline-flex items-center justify-center p-4 bg-green-100 text-green-600 rounded-full mb-6">
                        <Layers size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">PDF Flattened!</h2>
                    <p className="text-gray-600 mb-8">
                        Your document has been processed. The download should have started automatically.
                    </p>
                    <div className="flex justify-center gap-4">
                         <button 
                            onClick={() => { setFile(null); setIsDone(false); }} 
                            className="text-orange-600 font-medium hover:text-orange-800 hover:underline"
                        >
                            Flatten another PDF
                        </button>
                    </div>
                </div>
             </div>
        ) : (
             <div className="flex flex-col md:flex-row flex-grow h-full">
                {/* Left Side - Preview */}
                <div className="flex-grow p-8 bg-gray-100 flex flex-col items-center justify-center">
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 flex flex-col items-center">
                        <div className="text-orange-500 mb-4">
                            <FileText size={80} />
                        </div>
                        <h3 className="font-bold text-xl text-gray-800 mb-2">{file.file.name}</h3>
                        <p className="text-gray-500 text-sm">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                </div>

                {/* Right Side - Settings */}
                <div className="w-full md:w-96 bg-white border-l border-gray-200 p-8 flex flex-col shrink-0 z-10 shadow-xl md:shadow-none">
                 <h2 className="text-xl font-bold text-gray-800 mb-6">Flatten Settings</h2>
                 
                 <div className="space-y-4 mb-8">
                    <div 
                        onClick={() => setMode('form')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${mode === 'form' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'}`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-full ${mode === 'form' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                                <CheckCircle2 size={20} />
                            </div>
                            <span className="font-bold text-gray-800">Flatten Forms Only</span>
                        </div>
                        <p className="text-sm text-gray-500 pl-11">
                            Merges form fields into the document content. Text remains selectable and searchable. Best for finalizing forms.
                        </p>
                    </div>

                    <div 
                        onClick={() => setMode('raster')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${mode === 'raster' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'}`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-full ${mode === 'raster' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                                <ImageIcon size={20} />
                            </div>
                            <span className="font-bold text-gray-800">Flatten Everything</span>
                        </div>
                        <p className="text-sm text-gray-500 pl-11">
                            Converts all pages to images. Makes the document completely non-editable and text non-selectable.
                        </p>
                    </div>
                 </div>

                 <div className="mt-auto">
                    <button
                        onClick={handleFlatten}
                        disabled={isProcessing}
                        className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-orange-700 transition-transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? 'Processing...' : 'Flatten PDF'}
                    </button>
                 </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default FlattenPdf;