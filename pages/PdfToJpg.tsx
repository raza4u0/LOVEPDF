import React, { useState } from 'react';
import { ArrowLeft, Download, FileText, Loader2, Image as ImageIcon, Archive, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { convertPdfToImages, createZip, downloadPdf } from '../services/pdfService';
import { UploadedFile } from '../types';

const PdfToJpg: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ name: string, data: Blob }[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = (newFiles: File[]) => {
    setErrorMessage(null);
    if (newFiles.length > 0) {
      setFile({
        id: Math.random().toString(36).substr(2, 9),
        file: newFiles[0],
      });
      setIsDone(false);
      setGeneratedImages([]);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const images = await convertPdfToImages(file.file);
      if (images.length === 0) throw new Error("No images generated.");
      setGeneratedImages(images);
      setIsDone(true);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Error converting PDF to Images.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadZip = async () => {
    if (generatedImages.length === 0) return;
    try {
      const zipBlob = await createZip(generatedImages);
      downloadPdf(zipBlob, `${file?.file.name.replace('.pdf', '')}_images.zip`);
    } catch (error: any) {
      console.error(error);
      setErrorMessage("Failed to create ZIP archive.");
    }
  };

  const handleDownloadSingle = (image: { name: string, data: Blob }) => {
    downloadPdf(image.data, image.name);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col">
      {/* Tool Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-16 z-40">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">PDF to JPG</h1>
        </div>
        {file && !isDone && (
            <button
            onClick={handleConvert}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all
                ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:scale-105'}
            `}
            >
            {isProcessing ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Converting...</span>
                </>
            ) : (
                'Convert to JPG'
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
                Convert each PDF page into a JPG or extract all images contained in a PDF.
            </p>
          </div>
        ) : isDone ? (
             <div className="w-full max-w-5xl">
                <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-green-100 text-green-600 rounded-full mb-6">
                        <ImageIcon size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">PDF converted to JPGs!</h2>
                    <p className="text-gray-600 mb-8">
                        We've extracted {generatedImages.length} images from your PDF.
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
                            onClick={() => { setFile(null); setGeneratedImages([]); setIsDone(false); }} 
                            className="text-gray-500 font-medium hover:text-gray-900 px-6 py-3"
                        >
                            Convert another PDF
                        </button>
                    </div>
                </div>

                {/* Grid of Images */}
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Individual Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {generatedImages.map((img, index) => {
                        const url = URL.createObjectURL(img.data);
                        return (
                            <div key={index} className="group relative bg-white p-2 rounded-xl shadow-sm border border-gray-200 aspect-[3/4] flex flex-col items-center overflow-hidden">
                                <img src={url} alt={`Page ${index + 1}`} className="w-full h-full object-contain" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => handleDownloadSingle(img)}
                                        className="bg-white text-gray-900 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                                        title="Download this image"
                                    >
                                        <Download size={20} />
                                    </button>
                                </div>
                                <div className="absolute bottom-0 w-full bg-white/90 py-1 px-2">
                                     <span className="text-xs text-center text-gray-600 font-medium line-clamp-1 block">
                                        Page {index + 1}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
             </div>
        ) : (
            <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
                 <div className="mb-6 text-red-500">
                    <FileText size={64} />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900 mb-2">{file.file.name}</h2>
                 <p className="text-gray-500 mb-8">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                 
                 <div className="w-full bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                    <h3 className="font-semibold text-gray-800 mb-4">Conversion Options</h3>
                    <div className="flex items-center gap-3 p-3 bg-white border border-red-200 rounded-lg shadow-sm">
                        <div className="p-2 bg-red-50 text-red-600 rounded-full">
                            <ImageIcon size={20} />
                        </div>
                        <div className="flex-grow">
                            <p className="font-medium text-gray-900">Page to JPG</p>
                            <p className="text-xs text-gray-500">Every page of this PDF will be converted into a JPG file.</p>
                        </div>
                        <div className="w-4 h-4 rounded-full border-4 border-red-500"></div>
                    </div>
                 </div>

                 <button
                    onClick={handleConvert}
                    className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-red-700 transition-transform hover:-translate-y-0.5"
                >
                    Convert to JPG
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default PdfToJpg;