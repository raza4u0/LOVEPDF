import React, { useState } from 'react';
import { ArrowLeft, Download, Layers, Loader2, AlertCircle, X, RotateCw, Trash2, Undo, ArrowRight, Move, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { convertPdfToImages, organizePdf, downloadPdf } from '../services/pdfService';
import { UploadedFile } from '../types';

interface PageItem {
  id: string;
  blob: Blob;
  originalIndex: number;
  rotation: number;
  isDeleted: boolean;
}

const OrganizePdf: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const handleFileSelected = async (newFiles: File[]) => {
    setErrorMessage(null);
    if (newFiles.length > 0) {
      const selectedFile = newFiles[0];
      setFile({
        id: Math.random().toString(36).substr(2, 9),
        file: selectedFile,
      });
      setIsDone(false);
      
      // Extract pages
      setIsProcessing(true);
      try {
          const images = await convertPdfToImages(selectedFile);
          const pageItems: PageItem[] = images.map((img, index) => ({
              id: Math.random().toString(36).substr(2, 9),
              blob: img.data,
              originalIndex: index,
              rotation: 0,
              isDeleted: false
          }));
          setPages(pageItems);
      } catch (e: any) {
          setErrorMessage("Failed to load PDF pages. " + e.message);
      } finally {
          setIsProcessing(false);
      }
    }
  };

  const rotatePage = (index: number, direction: 'left' | 'right') => {
      const delta = direction === 'right' ? 90 : -90;
      setPages(prev => prev.map((p, i) => {
          if (i !== index) return p;
          return { ...p, rotation: p.rotation + delta };
      }));
  };

  const deletePage = (index: number) => {
      setPages(prev => prev.map((p, i) => {
          if (i !== index) return p;
          return { ...p, isDeleted: true };
      }));
  };

  const restorePage = (index: number) => {
      setPages(prev => prev.map((p, i) => {
          if (i !== index) return p;
          return { ...p, isDeleted: false };
      }));
  };

  const handleOrganize = async () => {
      if (!file) return;
      const activePages = pages.filter(p => !p.isDeleted);
      if (activePages.length === 0) {
          setErrorMessage("You must keep at least one page.");
          return;
      }

      setIsOrganizing(true);
      setErrorMessage(null);
      try {
          // Pass the current order of pages to the service
          // The service expects { originalIndex, rotation, isDeleted }
          // We pass ALL pages (including deleted ones) in their CURRENT order
          // But actually, it's easier to pass just the current list structure
          const operations = pages.map(p => ({
              originalIndex: p.originalIndex,
              rotation: p.rotation,
              isDeleted: p.isDeleted
          }));

          const newPdfBytes = await organizePdf(file.file, operations);
          downloadPdf(newPdfBytes, `organized_${file.file.name}`);
          setIsDone(true);
      } catch (e: any) {
          setErrorMessage(e.message || "Error organizing PDF.");
      } finally {
          setIsOrganizing(false);
      }
  };

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, index: number) => {
      setDraggedItemIndex(index);
      e.dataTransfer.effectAllowed = "move";
      // Transparent drag image or default
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedItemIndex === null || draggedItemIndex === index) return;
      
      // Reorder locally
      const newPages = [...pages];
      const draggedItem = newPages[draggedItemIndex];
      newPages.splice(draggedItemIndex, 1);
      newPages.splice(index, 0, draggedItem);
      
      setPages(newPages);
      setDraggedItemIndex(index);
  };

  const handleDragEnd = () => {
      setDraggedItemIndex(null);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col">
      {/* Tool Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-16 z-40">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Organize PDF</h1>
        </div>
        {file && !isDone && (
            <button
            onClick={handleOrganize}
            disabled={isOrganizing || isProcessing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all
                ${isOrganizing || isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:scale-105'}
            `}
            >
            {isOrganizing ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Organizing...</span>
                </>
            ) : (
                'Organize'
            )}
            </button>
        )}
      </div>

      <div className="flex-grow p-4 sm:p-8 flex flex-col items-center">
        {errorMessage && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3 w-full max-w-4xl border border-red-200 shadow-sm animate-in fade-in slide-in-from-top-2">
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
                Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages to your document at will.
            </p>
          </div>
        ) : isDone ? (
             <div className="w-full max-w-2xl">
                <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-indigo-100 text-indigo-600 rounded-full mb-6">
                        <Layers size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">PDF Organized!</h2>
                    <p className="text-gray-600 mb-8">
                        Your new document is ready. The download should have started automatically.
                    </p>
                    <div className="flex justify-center gap-4">
                         <button 
                            onClick={() => { 
                                setFile(null); 
                                setPages([]); 
                                setIsDone(false); 
                            }} 
                            className="text-gray-500 font-medium hover:text-gray-900 px-6 py-3"
                        >
                            Organize another PDF
                        </button>
                    </div>
                </div>
             </div>
        ) : isProcessing ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Loader2 size={48} className="animate-spin mb-4 text-red-500" />
                <p className="text-lg font-medium">Loading pages...</p>
            </div>
        ) : (
            <div className="w-full max-w-6xl">
                 <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 flex items-center gap-3 border border-blue-100">
                     <Move size={20} />
                     <p className="text-sm">Drag and drop pages to reorder them. Hover over pages to rotate or delete.</p>
                 </div>

                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                     {pages.map((page, index) => {
                         const url = URL.createObjectURL(page.blob);
                         return (
                            <div 
                                key={page.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`group relative flex flex-col items-center transition-all duration-200 ${page.isDeleted ? 'opacity-40 grayscale' : ''}`}
                            >
                                {/* Card */}
                                <div className={`relative bg-white p-2 rounded-lg shadow-sm border-2 transition-transform duration-300 cursor-move
                                    ${draggedItemIndex === index ? 'border-red-500 scale-105 shadow-lg' : 'border-gray-200 hover:border-red-300'}
                                `}>
                                    <div 
                                        className="w-32 h-44 flex items-center justify-center overflow-hidden bg-gray-50 relative"
                                        style={{
                                            transform: `rotate(${page.rotation}deg)`,
                                            transition: 'transform 0.3s ease-in-out'
                                        }}
                                    >
                                        <img src={url} alt={`Page ${index + 1}`} className="max-w-full max-h-full object-contain select-none" />
                                    </div>
                                    
                                    {/* Page Number Badge */}
                                    <div className="absolute bottom-1 right-1 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-70">
                                        {index + 1}
                                    </div>

                                    {/* Restore Overlay (if deleted) */}
                                    {page.isDeleted && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
                                            <button 
                                                onClick={() => restorePage(index)}
                                                className="bg-gray-800 text-white p-2 rounded-full hover:bg-black transition-colors"
                                                title="Restore"
                                            >
                                                <Undo size={20} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Hover Controls (if active) */}
                                    {!page.isDeleted && (
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 pointer-events-none">
                                            <div className="flex justify-end pointer-events-auto">
                                                 <button 
                                                    onClick={() => deletePage(index)}
                                                    className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-sm"
                                                    title="Delete Page"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <div className="flex justify-center gap-2 pointer-events-auto">
                                                <button 
                                                    onClick={() => rotatePage(index, 'left')}
                                                    className="bg-white text-gray-700 p-1.5 rounded-full hover:text-red-600 shadow-sm"
                                                    title="Rotate Left"
                                                >
                                                    <RotateCcw size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => rotatePage(index, 'right')}
                                                    className="bg-white text-gray-700 p-1.5 rounded-full hover:text-red-600 shadow-sm"
                                                    title="Rotate Right"
                                                >
                                                    <RotateCw size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                         );
                     })}
                 </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default OrganizePdf;