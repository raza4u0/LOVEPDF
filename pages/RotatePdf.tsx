import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, RotateCw, RotateCcw, Trash2, Plus, Loader2, AlertCircle, X, FileText, AlertTriangle, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { convertPdfToImages, rotatePdfsBatch, downloadPdf } from '../services/pdfService';
import { UploadedFile } from '../types';

interface PageThumbnail {
  id: string; // unique ID
  blob: Blob; // Image blob
  rotation: number; // 0, 90, 180, 270
  fileIndex: number;
  pageIndex: number;
  originalFileName: string;
}

const RotatePdf: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [pages, setPages] = useState<PageThumbnail[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // When files are added, convert them to images for preview
  const handleFilesSelected = async (newFiles: File[]) => {
    setErrorMessage(null);
    setIsProcessingImages(true);
    
    // We add to existing files (merge scenario)
    const existingFileCount = files.length;
    
    // Create UploadedFile wrappers
    const newUploadedFiles: UploadedFile[] = newFiles.map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f
    }));
    
    setFiles(prev => [...prev, ...newUploadedFiles]);

    try {
        const newPages: PageThumbnail[] = [];
        
        for (let i = 0; i < newFiles.length; i++) {
            const file = newFiles[i];
            const images = await convertPdfToImages(file);
            
            images.forEach((img, pageIdx) => {
                newPages.push({
                    id: Math.random().toString(36).substr(2, 9),
                    blob: img.data,
                    rotation: 0,
                    fileIndex: existingFileCount + i,
                    pageIndex: pageIdx,
                    originalFileName: file.name
                });
            });
        }
        
        setPages(prev => [...prev, ...newPages]);
        setIsDone(false);
    } catch (e: any) {
        setErrorMessage(e.message);
    } finally {
        setIsProcessingImages(false);
    }
  };

  const removeAll = () => {
      setFiles([]);
      setPages([]);
      setIsDone(false);
  };

  const rotatePage = (id: string, direction: 'left' | 'right') => {
      setPages(prev => prev.map(p => {
          if (p.id !== id) return p;
          const delta = direction === 'right' ? 90 : -90;
          let newRot = p.rotation + delta;
          // Normalize to 0-360
          // Actually usually just tracking 0, 90, 180, 270 is fine visually
          return { ...p, rotation: newRot };
      }));
  };

  const rotateAll = (direction: 'left' | 'right') => {
      const delta = direction === 'right' ? 90 : -90;
      setPages(prev => prev.map(p => ({ ...p, rotation: p.rotation + delta })));
  };

  const executeRotation = async () => {
      setShowConfirm(false);
      if (files.length === 0) return;
      setIsProcessingPdf(true);
      try {
          // Group rotations by file for batch processing
          const rotationsByFile: number[][] = [];
          
          for (let i = 0; i < files.length; i++) {
              // Get pages for this file index, sorted by pageIndex
              const filePages = pages
                  .filter(p => p.fileIndex === i)
                  .sort((a, b) => a.pageIndex - b.pageIndex);
                  
              const fileRotations = filePages.map(p => p.rotation);
              rotationsByFile.push(fileRotations);
          }
          
          // Use the batch function which handles ZIP creation if multiple files
          const { data, isZip } = await rotatePdfsBatch(files.map(f => f.file), rotationsByFile);
          
          const filename = isZip ? 'rotated_files.zip' : `rotated_${files[0].file.name}`;
          downloadPdf(data, filename);
          setIsDone(true);
      } catch (e: any) {
          setErrorMessage(e.message);
      } finally {
          setIsProcessingPdf(false);
      }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 flex flex-col relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between shrink-0 z-20">
         <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Rotate PDF</h1>
        </div>
        
        {files.length > 1 && !isDone && (
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <Archive size={16} /> Batch Mode Active
            </div>
        )}
        
        {files.length > 0 && !isDone && (
             <div className="flex gap-4">
                 <button 
                    onClick={removeAll}
                    className="text-gray-500 hover:text-red-500 font-medium px-3 py-2"
                 >
                     Remove All
                 </button>
                 <button 
                    onClick={() => setShowConfirm(true)}
                    disabled={isProcessingPdf || isProcessingImages}
                    className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                 >
                    {isProcessingPdf ? <Loader2 size={20} className="animate-spin" /> : 'Rotate PDF'}
                 </button>
             </div>
        )}
      </div>

      <div className="flex-grow flex relative overflow-hidden">
          {/* Main Area */}
          {files.length === 0 ? (
               <div className="w-full flex items-center justify-center p-4">
                    <div className="max-w-xl w-full">
                        <FileUploader 
                            onFilesSelected={handleFilesSelected} 
                            title="Select PDF files"
                            buttonText="Select PDF files"
                            multiple={true}
                        />
                        <p className="text-center mt-6 text-gray-500">
                            Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!
                        </p>
                    </div>
               </div>
          ) : isDone ? (
               <div className="w-full flex items-center justify-center p-4">
                    <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100 max-w-xl w-full">
                        <div className="inline-flex items-center justify-center p-4 bg-indigo-100 text-indigo-600 rounded-full mb-6">
                            <RotateCw size={48} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            {files.length > 1 ? 'PDFs Rotated!' : 'PDF Rotated!'}
                        </h2>
                        <p className="text-gray-600 mb-8">
                             {files.length > 1 
                                ? "Your documents have been rotated and downloaded as a ZIP archive." 
                                : "Your document has been rotated and downloaded."}
                        </p>
                        <button 
                            onClick={removeAll} 
                            className="text-red-600 font-medium hover:underline"
                        >
                            Rotate more PDFs
                        </button>
                    </div>
               </div>
          ) : (
              <>
                 {/* Left: Preview Grid */}
                 <div className="flex-grow bg-gray-100 p-8 overflow-y-auto">
                      {errorMessage && (
                            <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg shadow-sm border border-red-200 flex items-center gap-3">
                                <AlertCircle size={20} />
                                <span>{errorMessage}</span>
                                <button onClick={() => setErrorMessage(null)}><X size={16} /></button>
                            </div>
                        )}
                      
                      {isProcessingImages ? (
                           <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                               <Loader2 size={40} className="animate-spin mb-4 text-red-500" />
                               <p>Processing PDF pages...</p>
                           </div>
                      ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                              {pages.map((page) => {
                                  const url = URL.createObjectURL(page.blob);
                                  return (
                                      <div key={page.id} className="group relative flex flex-col items-center">
                                          {/* Card */}
                                          <div className="bg-white p-2 rounded shadow-sm border border-gray-200 transition-transform duration-300">
                                              <div 
                                                className="w-40 h-56 flex items-center justify-center overflow-hidden bg-gray-50"
                                                style={{
                                                    transform: `rotate(${page.rotation}deg)`,
                                                    transition: 'transform 0.3s ease-in-out'
                                                }}
                                              >
                                                  <img src={url} alt="Page thumbnail" className="max-w-full max-h-full object-contain" />
                                              </div>
                                          </div>
                                          
                                          {/* Hover Controls */}
                                          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded">
                                              <button 
                                                onClick={() => rotatePage(page.id, 'left')}
                                                className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 hover:scale-110 transition-all"
                                                title="Rotate Left"
                                              >
                                                  <RotateCcw size={20} />
                                              </button>
                                              <button 
                                                onClick={() => rotatePage(page.id, 'right')}
                                                className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 hover:scale-110 transition-all"
                                                title="Rotate Right"
                                              >
                                                  <RotateCw size={20} />
                                              </button>
                                          </div>
                                          
                                          <span className="mt-2 text-xs text-gray-500 font-medium truncate max-w-full px-2">
                                              {page.originalFileName} - P{page.pageIndex + 1}
                                          </span>
                                      </div>
                                  );
                              })}

                               {/* Add More */}
                                <div className="relative flex flex-col items-center justify-center w-40 h-60 rounded border-2 border-dashed border-gray-300 hover:border-red-400 hover:bg-gray-50 transition-colors cursor-pointer bg-white/50">
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
                      )}
                 </div>

                 {/* Right: Sidebar */}
                 <div className="w-64 bg-white border-l border-gray-200 p-6 flex flex-col shrink-0">
                     <h3 className="font-bold text-gray-800 mb-4 text-lg">Rotation options</h3>
                     <p className="text-sm text-gray-500 mb-6">Hover over a page to rotate it individually.</p>
                     
                     <div className="space-y-4">
                         <button 
                            onClick={() => rotateAll('right')}
                            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all group"
                         >
                             <span className="font-medium text-gray-700">Right</span>
                             <div className="bg-gray-100 p-2 rounded-full group-hover:bg-white group-hover:shadow-sm text-gray-600">
                                 <RotateCw size={24} />
                             </div>
                         </button>
                         
                         <button 
                            onClick={() => rotateAll('left')}
                            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all group"
                         >
                             <span className="font-medium text-gray-700">Left</span>
                             <div className="bg-gray-100 p-2 rounded-full group-hover:bg-white group-hover:shadow-sm text-gray-600">
                                 <RotateCcw size={24} />
                             </div>
                         </button>
                     </div>
                 </div>
              </>
          )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 transform scale-100 animate-in zoom-in-95 duration-200">
                  <div className="flex flex-col items-center text-center">
                      <div className="bg-yellow-100 p-3 rounded-full text-yellow-600 mb-4">
                          <AlertTriangle size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Apply Changes?</h3>
                      <p className="text-sm text-gray-500 mb-6">
                          Are you sure you want to apply these rotations? This will generate {files.length > 1 ? 'a ZIP archive containing your rotated files' : 'a new PDF file'}.
                      </p>
                      <div className="flex gap-3 w-full">
                          <button 
                              onClick={() => setShowConfirm(false)}
                              className="flex-1 py-2.5 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={executeRotation}
                              className="flex-1 py-2.5 rounded-lg bg-red-600 font-bold text-white hover:bg-red-700 shadow-md"
                          >
                              Apply
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default RotatePdf;