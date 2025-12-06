import React, { useState } from 'react';
import { ArrowLeft, Trash2, Download, FileText, Plus, CheckCircle, Settings, Zap, ShieldCheck, Image as ImageIcon, AlertCircle, X, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { compressPdfsBatch, downloadPdf } from '../services/pdfService';
import { UploadedFile } from '../types';

type CompressionLevel = 'extreme' | 'recommended' | 'less';

const CompressPdf: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('recommended');
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

  const handleCompress = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      // Simulate a slight delay to make it feel like "work" is happening since client-side is instant
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { data, isZip } = await compressPdfsBatch(files.map(f => f.file), compressionLevel);
      
      const filename = isZip ? 'compressed_files.zip' : `compressed_${files[0].file.name}`;
      downloadPdf(data, filename);
      setIsDone(true);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Error compressing PDF.");
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
          <h1 className="text-xl font-bold text-gray-900">Compress PDF file</h1>
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
                    title="Drop PDF file here"
                    buttonText="Select PDF file"
                    multiple={true}
                />
                <p className="text-center mt-6 text-gray-500">
                    Reduce file size while optimizing for maximal PDF quality.
                </p>
             </div>
          </div>
        ) : isDone ? (
             <div className="flex-grow flex items-center justify-center p-4">
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl w-full">
                    <div className="inline-flex items-center justify-center p-4 bg-green-100 text-green-600 rounded-full mb-6">
                        <Download size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {files.length > 1 ? 'PDFs have been compressed!' : 'PDF has been compressed!'}
                    </h2>
                    <p className="text-gray-600 mb-8">
                        {files.length > 1 
                            ? "Your compressed files have been downloaded as a ZIP archive." 
                            : "Your compressed PDF has been downloaded."} 
                        <br/>
                        <span className="text-sm text-gray-400">(Note: Actual size reduction depends on file content)</span>
                    </p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => { setFiles([]); setIsDone(false); }} className="text-red-600 font-medium hover:underline">
                            Compress more PDFs
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

                {/* Right Side - Sidebar Controls */}
                <div className="w-full md:w-80 lg:w-96 bg-white border-l border-gray-200 p-6 flex flex-col shrink-0 z-10 shadow-xl md:shadow-none">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Compression level</h2>
                    
                    <div className="space-y-4 mb-8">
                        {/* Extreme Compression */}
                        <div 
                            onClick={() => setCompressionLevel('extreme')}
                            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-3
                                ${compressionLevel === 'extreme' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-200'}
                            `}
                        >
                            <div className="mt-1 text-gray-500">
                                <Zap size={24} className={compressionLevel === 'extreme' ? 'text-red-500' : ''} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Extreme Compression</h3>
                                <p className="text-xs text-gray-500 mt-1">Less quality, high compression</p>
                            </div>
                            {compressionLevel === 'extreme' && (
                                <div className="absolute top-4 right-4 text-green-500">
                                    <CheckCircle size={20} fill="currentColor" className="text-white bg-green-500 rounded-full" />
                                </div>
                            )}
                        </div>

                        {/* Recommended Compression */}
                         <div 
                            onClick={() => setCompressionLevel('recommended')}
                            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-3
                                ${compressionLevel === 'recommended' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-200'}
                            `}
                        >
                            <div className="mt-1 text-gray-500">
                                <Settings size={24} className={compressionLevel === 'recommended' ? 'text-red-500' : ''} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Recommended Compression</h3>
                                <p className="text-xs text-gray-500 mt-1">Good quality, good compression</p>
                            </div>
                            {compressionLevel === 'recommended' && (
                                <div className="absolute top-4 right-4 text-green-500">
                                    <CheckCircle size={20} fill="currentColor" className="text-white bg-green-500 rounded-full" />
                                </div>
                            )}
                        </div>

                        {/* Less Compression */}
                         <div 
                            onClick={() => setCompressionLevel('less')}
                            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-3
                                ${compressionLevel === 'less' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-200'}
                            `}
                        >
                            <div className="mt-1 text-gray-500">
                                <ShieldCheck size={24} className={compressionLevel === 'less' ? 'text-red-500' : ''} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Less Compression</h3>
                                <p className="text-xs text-gray-500 mt-1">High quality, less compression</p>
                            </div>
                            {compressionLevel === 'less' && (
                                <div className="absolute top-4 right-4 text-green-500">
                                    <CheckCircle size={20} fill="currentColor" className="text-white bg-green-500 rounded-full" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-auto">
                        <button
                            onClick={handleCompress}
                            disabled={isProcessing}
                            className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all flex items-center justify-center gap-2
                                ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:-translate-y-1'}
                            `}
                        >
                            {isProcessing ? 'Compressing PDF...' : `Compress PDF${files.length > 1 ? 's' : ''}`}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CompressPdf;