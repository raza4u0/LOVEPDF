import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, Crop, Loader2, AlertCircle, X, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { getPdfJs, cropPdf, downloadPdf } from '../services/pdfService';
import { UploadedFile } from '../types';

const CropPdf: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pageViewport, setPageViewport] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Crop Selection State (in percentages 0-1)
  const [crop, setCrop] = useState({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

  const handleFileSelected = async (newFiles: File[]) => {
    setErrorMessage(null);
    if (newFiles.length > 0) {
      setFile({
        id: Math.random().toString(36).substr(2, 9),
        file: newFiles[0],
      });
      // Load and render page 1 for crop preview
      renderPage(newFiles[0]);
    }
  };

  const renderPage = async (file: File) => {
    try {
      const pdfjs = await getPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      
      const scale = 1.0; 
      const viewport = page.getViewport({ scale });
      setPageViewport(viewport);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;
    } catch (e: any) {
      setErrorMessage("Failed to load PDF preview. " + e.message);
    }
  };

  const handleCrop = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      // Small delay for UI
      await new Promise(resolve => setTimeout(resolve, 800));
      const croppedPdf = await cropPdf(file.file, crop);
      downloadPdf(croppedPdf, `cropped_${file.file.name}`);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Error cropping PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Interaction Logic ---

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      return {
          x: (clientX - rect.left) / rect.width,
          y: (clientY - rect.top) / rect.height
      };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, handle: string | null = null) => {
      e.stopPropagation();
      setIsDragging(true);
      setActiveHandle(handle);
      const pos = getPointerPos(e);
      setDragStart(pos);
      setCropStart({ ...crop });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault(); // Prevent scroll on touch
      const pos = getPointerPos(e);
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;

      let newCrop = { ...cropStart };

      if (activeHandle === 'move') {
          newCrop.x = Math.max(0, Math.min(1 - newCrop.width, newCrop.x + dx));
          newCrop.y = Math.max(0, Math.min(1 - newCrop.height, newCrop.y + dy));
      } else if (activeHandle === 'se') {
          newCrop.width = Math.max(0.1, Math.min(1 - newCrop.x, newCrop.width + dx));
          newCrop.height = Math.max(0.1, Math.min(1 - newCrop.y, newCrop.height + dy));
      } else if (activeHandle === 'sw') {
          const maxWidth = cropStart.x + cropStart.width;
          newCrop.x = Math.max(0, Math.min(maxWidth - 0.1, newCrop.x + dx));
          newCrop.width = maxWidth - newCrop.x;
          newCrop.height = Math.max(0.1, Math.min(1 - newCrop.y, newCrop.height + dy));
      } else if (activeHandle === 'nw') {
          const maxWidth = cropStart.x + cropStart.width;
          const maxHeight = cropStart.y + cropStart.height;
          newCrop.x = Math.max(0, Math.min(maxWidth - 0.1, newCrop.x + dx));
          newCrop.y = Math.max(0, Math.min(maxHeight - 0.1, newCrop.y + dy));
          newCrop.width = maxWidth - newCrop.x;
          newCrop.height = maxHeight - newCrop.y;
      } else if (activeHandle === 'ne') {
          const maxHeight = cropStart.y + cropStart.height;
          newCrop.width = Math.max(0.1, Math.min(1 - newCrop.x, newCrop.width + dx));
          newCrop.y = Math.max(0, Math.min(maxHeight - 0.1, newCrop.y + dy));
          newCrop.height = maxHeight - newCrop.y;
      }

      setCrop(newCrop);
  };

  const handleMouseUp = () => {
      setIsDragging(false);
      setActiveHandle(null);
  };

  useEffect(() => {
      if(isDragging) {
          window.addEventListener('mousemove', handleMouseMove as any);
          window.addEventListener('mouseup', handleMouseUp);
          window.addEventListener('touchmove', handleMouseMove as any, { passive: false });
          window.addEventListener('touchend', handleMouseUp);
      } else {
          window.removeEventListener('mousemove', handleMouseMove as any);
          window.removeEventListener('mouseup', handleMouseUp);
          window.removeEventListener('touchmove', handleMouseMove as any);
          window.removeEventListener('touchend', handleMouseUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleMouseMove as any);
          window.removeEventListener('mouseup', handleMouseUp);
          window.removeEventListener('touchmove', handleMouseMove as any);
          window.removeEventListener('touchend', handleMouseUp);
      };
  }, [isDragging]);


  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col">
      {/* Tool Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-16 z-40">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Crop PDF</h1>
        </div>
        {file && (
            <button
            onClick={handleCrop}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all
                ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 hover:scale-105'}
            `}
            >
            {isProcessing ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Cropping...</span>
                </>
            ) : (
                'Crop PDF'
            )}
            </button>
        )}
      </div>

      <div className="flex-grow p-4 sm:p-8 flex flex-col items-center overflow-hidden">
        {errorMessage && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3 w-full max-w-2xl border border-red-200 shadow-sm">
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
                title="Drop PDF file to Crop"
                buttonText="Select PDF file"
                multiple={false}
            />
            <p className="text-center mt-6 text-gray-500">
                Trim margins or select a specific area of your PDF page to crop.
            </p>
          </div>
        ) : (
            <div className="flex flex-col items-center w-full h-full">
                <div className="mb-4 text-center">
                    <p className="text-sm text-gray-600">Adjust the box to define the crop area.</p>
                    <p className="text-xs text-gray-400">This will be applied to all pages.</p>
                </div>

                <div className="relative overflow-auto max-w-full max-h-[70vh] shadow-xl bg-gray-200 border border-gray-300">
                    <div ref={containerRef} className="relative inline-block select-none">
                        <canvas ref={canvasRef} className="block pointer-events-none" />
                        
                        {/* Dark Overlay Outside */}
                        <div className="absolute inset-0 bg-black/50">
                            {/* Cutout for crop area using clip-path could be complex, using divs instead */}
                            <div 
                                style={{
                                    position: 'absolute',
                                    left: `${crop.x * 100}%`,
                                    top: `${crop.y * 100}%`,
                                    width: `${crop.width * 100}%`,
                                    height: `${crop.height * 100}%`,
                                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                                }}
                            ></div>
                        </div>

                        {/* Crop Box */}
                        <div 
                            className="absolute border-2 border-brand-500 cursor-move"
                            style={{
                                left: `${crop.x * 100}%`,
                                top: `${crop.y * 100}%`,
                                width: `${crop.width * 100}%`,
                                height: `${crop.height * 100}%`,
                            }}
                            onMouseDown={(e) => handleMouseDown(e, 'move')}
                            onTouchStart={(e) => handleMouseDown(e, 'move')}
                        >
                            {/* Grid Lines */}
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30">
                                <div className="border-r border-brand-300"></div>
                                <div className="border-r border-brand-300"></div>
                                <div></div>
                                <div className="border-r border-t border-brand-300"></div>
                                <div className="border-r border-t border-brand-300"></div>
                                <div className="border-t border-brand-300"></div>
                                <div className="border-r border-t border-brand-300"></div>
                                <div className="border-r border-t border-brand-300"></div>
                                <div className="border-t border-brand-300"></div>
                            </div>

                            {/* Handles */}
                            <div 
                                className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-brand-600 border-2 border-white cursor-nw-resize"
                                onMouseDown={(e) => handleMouseDown(e, 'nw')}
                                onTouchStart={(e) => handleMouseDown(e, 'nw')}
                            ></div>
                            <div 
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-600 border-2 border-white cursor-ne-resize"
                                onMouseDown={(e) => handleMouseDown(e, 'ne')}
                                onTouchStart={(e) => handleMouseDown(e, 'ne')}
                            ></div>
                            <div 
                                className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-brand-600 border-2 border-white cursor-sw-resize"
                                onMouseDown={(e) => handleMouseDown(e, 'sw')}
                                onTouchStart={(e) => handleMouseDown(e, 'sw')}
                            ></div>
                            <div 
                                className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-brand-600 border-2 border-white cursor-se-resize"
                                onMouseDown={(e) => handleMouseDown(e, 'se')}
                                onTouchStart={(e) => handleMouseDown(e, 'se')}
                            ></div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 flex gap-4">
                    <button 
                        onClick={() => { setFile(null); setCrop({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 }); }}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => setCrop({ x: 0, y: 0, width: 1, height: 1 })}
                        className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 font-medium flex items-center gap-2"
                    >
                        <RotateCcw size={16} /> Reset
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CropPdf;