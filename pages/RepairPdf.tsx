import React, { useState } from 'react';
import { ArrowLeft, Download, Wrench, Loader2, AlertCircle, X, CheckCircle, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { repairPdf, downloadPdf } from '../services/pdfService';
import { UploadedFile } from '../types';

const RepairPdf: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [repairedBlob, setRepairedBlob] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleFileSelected = (newFiles: File[]) => {
    setErrorMessage(null);
    if (newFiles.length > 0) {
      setFile({
        id: Math.random().toString(36).substr(2, 9),
        file: newFiles[0],
      });
      setIsDone(false);
      setRepairedBlob(null);
    }
  };

  const handleRepair = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);
    
    try {
      setStatusMessage('Analyzing file structure...');
      await new Promise(resolve => setTimeout(resolve, 800)); // UI delay
      
      setStatusMessage('Attempting to recover content...');
      const pdfBytes = await repairPdf(file.file);
      
      setRepairedBlob(pdfBytes);
      downloadPdf(pdfBytes, `repaired_${file.file.name}`);
      setIsDone(true);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Unable to repair this PDF. The damage might be too severe.");
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const handleDownload = () => {
    if (repairedBlob && file) {
      downloadPdf(repairedBlob, `repaired_${file.file.name}`);
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
          <h1 className="text-xl font-bold text-gray-900">Repair PDF</h1>
        </div>
        {file && !isDone && (
            <button
            onClick={handleRepair}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all
                ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-800 hover:scale-105'}
            `}
            >
            {isProcessing ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Repairing...</span>
                </>
            ) : (
                'Repair PDF'
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
                title="Drop corrupted PDF file here"
                buttonText="Select PDF file"
                multiple={false}
            />
            <p className="text-center mt-6 text-gray-500">
                Upload a corrupt PDF and we will try to fix it. We use multiple recovery strategies to salvage your data.
            </p>
          </div>
        ) : isDone ? (
             <div className="w-full max-w-2xl">
                <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-green-100 text-green-600 rounded-full mb-6">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">PDF Repaired!</h2>
                    <p className="text-gray-600 mb-8">
                        We've successfully reconstructed your document. The download should have started automatically.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            onClick={handleDownload}
                            className="bg-gray-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                        >
                            <Download size={20} />
                            Download PDF
                        </button>
                         <button 
                            onClick={() => { setFile(null); setRepairedBlob(null); setIsDone(false); }} 
                            className="text-gray-500 font-medium hover:text-gray-900 px-6 py-3"
                        >
                            Repair another PDF
                        </button>
                    </div>
                </div>
             </div>
        ) : (
            <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
                 <div className="mb-6 text-gray-500">
                    <Wrench size={64} />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900 mb-2">{file.file.name}</h2>
                 <p className="text-gray-500 mb-8">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                 
                 <div className="w-full bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                    <h3 className="font-semibold text-gray-800 mb-4">Diagnostic Information</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Activity size={16} className="text-gray-400" />
                            <span>Status: {isProcessing ? statusMessage : 'Ready to analyze'}</span>
                        </div>
                    </div>
                 </div>

                 <button
                    onClick={handleRepair}
                    disabled={isProcessing}
                    className="w-full bg-gray-700 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-gray-800 transition-transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isProcessing ? 'Repairing...' : 'Repair PDF'}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default RepairPdf;