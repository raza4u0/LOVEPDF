import React, { useState } from 'react';
import { ArrowLeft, Download, Unlock, Loader2, AlertCircle, X, Eye, EyeOff, LockOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { unlockPdf, downloadPdf } from '../services/pdfService';
import { UploadedFile } from '../types';

const UnlockPdf: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [unlockedPdf, setUnlockedPdf] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = (newFiles: File[]) => {
    setErrorMessage(null);
    if (newFiles.length > 0) {
      setFile({
        id: Math.random().toString(36).substr(2, 9),
        file: newFiles[0],
      });
      setIsDone(false);
      setUnlockedPdf(null);
      setPassword('');
    }
  };

  const handleUnlock = async () => {
    if (!file || !password) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // UI delay
      const pdfBytes = await unlockPdf(file.file, password);
      setUnlockedPdf(pdfBytes);
      downloadPdf(pdfBytes, `unlocked_${file.file.name}`);
      setIsDone(true);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Error unlocking PDF. Please check the password.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (unlockedPdf && file) {
      downloadPdf(unlockedPdf, `unlocked_${file.file.name}`);
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
          <h1 className="text-xl font-bold text-gray-900">Unlock PDF</h1>
        </div>
        {file && !isDone && (
            <button
            onClick={handleUnlock}
            disabled={isProcessing || !password}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all
                ${isProcessing || !password ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:scale-105'}
            `}
            >
            {isProcessing ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Unlocking...</span>
                </>
            ) : (
                'Unlock PDF'
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
                Remove password security from your PDF files instantly.
            </p>
          </div>
        ) : isDone ? (
             <div className="w-full max-w-2xl">
                <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-green-100 text-green-600 rounded-full mb-6">
                        <LockOpen size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">PDF Unlocked!</h2>
                    <p className="text-gray-600 mb-8">
                        Your document is now unsecured. The download should have started automatically.
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
                            onClick={() => { setFile(null); setUnlockedPdf(null); setIsDone(false); setPassword(''); }} 
                            className="text-gray-500 font-medium hover:text-gray-900 px-6 py-3"
                        >
                            Unlock another PDF
                        </button>
                    </div>
                </div>
             </div>
        ) : (
            <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
                 <div className="mb-6 text-red-500">
                    <Unlock size={64} />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900 mb-2">{file.file.name}</h2>
                 <p className="text-gray-500 mb-8">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                 
                 <div className="w-full bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                    <h3 className="font-semibold text-gray-800 mb-4">Security Options</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Enter Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                placeholder="File Password"
                                autoFocus
                            />
                            <button 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Enter the correct password to create an unlocked copy.</p>
                    </div>
                 </div>

                 <button
                    onClick={handleUnlock}
                    disabled={!password}
                    className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-red-700 transition-transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Unlock PDF
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default UnlockPdf;