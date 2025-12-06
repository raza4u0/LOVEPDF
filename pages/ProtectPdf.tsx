import React, { useState } from 'react';
import { ArrowLeft, Download, Shield, Loader2, AlertCircle, X, Eye, EyeOff, Lock, FileText, Plus, Trash2, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { protectPdfsBatch, downloadPdf } from '../services/pdfService';
import { UploadedFile } from '../types';

const ProtectPdf: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [encryptionLevel, setEncryptionLevel] = useState<128 | 256>(128);
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

  const handleProtect = async () => {
    if (files.length === 0) return;
    if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
    }
    if (password.length < 3) {
        setErrorMessage("Password must be at least 3 characters long.");
        return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // UI delay
      const { data, isZip } = await protectPdfsBatch(files.map(f => f.file), password, encryptionLevel);
      
      const filename = isZip ? 'protected_files.zip' : `protected_${files[0].file.name}`;
      downloadPdf(data, filename);
      setIsDone(true);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Error protecting PDF.");
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
          <h1 className="text-xl font-bold text-gray-900">Protect PDF</h1>
        </div>
        {files.length > 1 && !isDone && (
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <Archive size={16} /> Batch Mode Active
            </div>
        )}
      </div>

      <div className="flex-grow flex flex-col">
        {files.length === 0 ? (
           <div className="flex-grow flex flex-col items-center justify-center p-4">
             {errorMessage && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3 w-full max-w-xl border border-red-200 shadow-sm">
                    <AlertCircle className="shrink-0 mt-0.5" size={20} />
                    <div className="flex-grow text-sm font-medium">{errorMessage}</div>
                    <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
                        <X size={16} />
                    </button>
                </div>
             )}
             <div className="max-w-xl w-full">
                <FileUploader 
                    onFilesSelected={handleFilesSelected} 
                    title="Drop PDF files here"
                    buttonText="Select PDF files"
                    multiple={true}
                />
                <p className="text-center mt-6 text-gray-500">
                    Encrypt your PDF with a password to keep sensitive data confidential.
                </p>
             </div>
          </div>
        ) : isDone ? (
             <div className="flex-grow flex items-center justify-center p-4">
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl w-full">
                    <div className="inline-flex items-center justify-center p-4 bg-gray-100 text-gray-700 rounded-full mb-6">
                        <Shield size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {files.length > 1 ? 'PDFs Protected!' : 'PDF Protected!'}
                    </h2>
                    <p className="text-gray-600 mb-8">
                        {files.length > 1 
                            ? "Your documents are now encrypted and downloaded as a ZIP archive." 
                            : "Your document is now encrypted and downloaded."}
                    </p>
                    <div className="flex justify-center gap-4">
                         <button 
                            onClick={() => { setFiles([]); setIsDone(false); setPassword(''); setConfirmPassword(''); }} 
                            className="text-gray-500 font-medium hover:text-gray-900 px-6 py-3"
                        >
                            Protect more PDFs
                        </button>
                    </div>
                </div>
             </div>
        ) : (
             <div className="flex flex-col md:flex-row flex-grow h-full">
                {/* Left Side - File List */}
                <div className="flex-grow p-8 bg-gray-100 flex flex-col items-center overflow-y-auto">
                    {errorMessage && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3 w-full max-w-4xl border border-red-200 shadow-sm sticky top-0 z-50">
                            <AlertCircle className="shrink-0 mt-0.5" size={20} />
                            <div className="flex-grow text-sm font-medium">{errorMessage}</div>
                            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
                                <X size={16} />
                            </button>
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
                        {files.map((file) => (
                            <div key={file.id} className="relative group bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center aspect-[3/4]">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button 
                                        onClick={() => removeFile(file.id)}
                                        className="bg-gray-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-sm"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="text-gray-700 mb-4">
                                    <Shield size={64} />
                                </div>
                                <span className="text-sm text-center text-gray-700 font-medium line-clamp-2 px-2 break-all">
                                    {file.file.name}
                                </span>
                                <span className="text-xs text-gray-400 mt-1">
                                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                            </div>
                        ))}
                         <div className="relative flex flex-col items-center justify-center aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-500 hover:bg-gray-50 transition-colors cursor-pointer bg-white/50">
                             <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept="application/pdf"
                                multiple
                                onChange={(e) => {
                                    if(e.target.files) handleFilesSelected(Array.from(e.target.files))
                                }}
                            />
                            <div className="bg-gray-500 text-white p-2 rounded-full mb-2">
                                <Plus size={24} />
                            </div>
                            <span className="text-sm font-medium text-gray-600">Add more</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Sidebar Controls */}
                <div className="w-full md:w-80 lg:w-96 bg-white border-l border-gray-200 p-6 flex flex-col shrink-0 z-10 shadow-xl md:shadow-none">
                 <h2 className="text-xl font-bold text-gray-800 mb-6">Protection Settings</h2>
                 
                 <div className="w-full space-y-4 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Set a Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all"
                                placeholder="Enter password"
                            />
                            <button 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Repeat Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all"
                            placeholder="Confirm password"
                        />
                    </div>

                    <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Encryption Level</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setEncryptionLevel(128)}
                                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                                    encryptionLevel === 128 
                                    ? 'border-gray-800 bg-gray-50 text-gray-900' 
                                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}
                            >
                                <span className="text-sm font-bold">128-bit AES</span>
                                <span className="text-xs mt-1">Standard</span>
                            </button>
                            <button
                                onClick={() => setEncryptionLevel(256)}
                                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                                    encryptionLevel === 256 
                                    ? 'border-gray-800 bg-gray-50 text-gray-900' 
                                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-bold">256-bit AES</span>
                                    <Lock size={12} />
                                </div>
                                <span className="text-xs mt-1">High Security</span>
                            </button>
                        </div>
                    </div>
                 </div>

                 <div className="mt-auto">
                    <button
                        onClick={handleProtect}
                        disabled={!password || !confirmPassword || isProcessing}
                        className="w-full bg-gray-800 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-gray-900 transition-transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                             <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            `Protect PDF${files.length > 1 ? 's' : ''}`
                        )}
                    </button>
                 </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProtectPdf;