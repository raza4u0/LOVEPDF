import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, PenTool, Image as ImageIcon, Type, Trash2, Check, AlertCircle, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Loader2, Move } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { getPdfJs, embedImagesInPdf, downloadPdf } from '../services/pdfService';
import { UploadedFile } from '../types';

interface SignaturePlacement {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const SignPdf: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  
  // Signature State
  const [signatureBase64, setSignatureBase64] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [placements, setPlacements] = useState<SignaturePlacement[]>([]);
  
  // Drag State
  const [draggedPlacementId, setDraggedPlacementId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
  
  // UI State
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'draw' | 'type' | 'upload'>('draw');
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [typedName, setTypedName] = useState('');

  // Initial Load
  const handleFileSelected = async (newFiles: File[]) => {
    setErrorMessage(null);
    if (newFiles.length > 0) {
      setFile({ id: '1', file: newFiles[0] });
      try {
        const pdfjs = await getPdfJs();
        const arrayBuffer = await newFiles[0].arrayBuffer();
        const loadedPdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        setPdfDoc(loadedPdf);
        setNumPages(loadedPdf.numPages);
        setCurrentPage(1);
        setPlacements([]);
      } catch (e: any) {
        setErrorMessage("Failed to load PDF. " + e.message);
      }
    }
  };

  // Render PDF Page
  useEffect(() => {
    let isCancelled = false;
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (!isCancelled) {
          await page.render({ canvasContext: context, viewport }).promise;
        }
      } catch (e) {
        console.error("Render error", e);
      }
    };
    renderPage();
    return () => { isCancelled = true; };
  }, [pdfDoc, currentPage, scale]);

  // --- Signature Creation Logic ---

  // Draw Tab: Capture mouse events
  const startDrawing = (e: React.MouseEvent) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !drawCanvasRef.current) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawnSignature = () => {
    if (!drawCanvasRef.current) return;
    const dataUrl = drawCanvasRef.current.toDataURL('image/png');
    setSignatureBase64(dataUrl);
    setIsModalOpen(false);
  };

  // Type Tab
  const saveTypedSignature = () => {
     // Render text to a temporary canvas
     const canvas = document.createElement('canvas');
     canvas.width = 400;
     canvas.height = 100;
     const ctx = canvas.getContext('2d');
     if(!ctx) return;
     
     // Font must be loaded in index.html
     ctx.font = "50px 'Dancing Script'"; 
     ctx.fillStyle = "black";
     ctx.textAlign = "center";
     ctx.textBaseline = "middle";
     ctx.fillText(typedName, canvas.width/2, canvas.height/2);
     
     setSignatureBase64(canvas.toDataURL('image/png'));
     setIsModalOpen(false);
  };

  // Upload Tab
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if(ev.target?.result) {
                  setSignatureBase64(ev.target.result as string);
                  setIsModalOpen(false);
              }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  // --- Placement Logic ---
  
  const handlePdfClick = (e: React.MouseEvent) => {
      // If dragging, don't place new signature
      if (draggedPlacementId) return;

      // If we have a signature selected, place it
      if (!signatureBase64 || !containerRef.current) {
          if(!signatureBase64 && file) setIsModalOpen(true);
          return;
      }

      // Calculate relative position within the canvas container
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Default signature size
      const width = 150; 
      const height = 60; // Approximate aspect ratio

      // Center the placement on click
      const newPlacement: SignaturePlacement = {
          id: Date.now().toString(),
          pageIndex: currentPage - 1,
          x: x - (width / 2),
          y: y - (height / 2),
          width,
          height
      };

      setPlacements([...placements, newPlacement]);
  };

  const removePlacement = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setPlacements(placements.filter(p => p.id !== id));
  };

  // --- Drag and Drop Logic ---

  const handleDragStart = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const placement = placements.find(p => p.id === id);
      if (!placement) return;

      setDraggedPlacementId(id);
      setDragStart({
          x: e.clientX - placement.x,
          y: e.clientY - placement.y
      });
  };

  const handleDragMove = (e: React.MouseEvent) => {
      if (!draggedPlacementId || !dragStart || !containerRef.current) return;
      e.stopPropagation();
      e.preventDefault();

      const containerRect = containerRef.current.getBoundingClientRect();
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Ideally verify boundaries here, but simple move is fine
      setPlacements(prev => prev.map(p => {
          if (p.id !== draggedPlacementId) return p;
          return { ...p, x: newX, y: newY };
      }));
  };

  const handleDragEnd = () => {
      setDraggedPlacementId(null);
      setDragStart(null);
  };

  // Add global event listeners for drag to handle fast movements outside the element
  useEffect(() => {
      if (draggedPlacementId) {
          window.addEventListener('mousemove', handleDragMove as any);
          window.addEventListener('mouseup', handleDragEnd);
      } else {
          window.removeEventListener('mousemove', handleDragMove as any);
          window.removeEventListener('mouseup', handleDragEnd);
      }
      return () => {
          window.removeEventListener('mousemove', handleDragMove as any);
          window.removeEventListener('mouseup', handleDragEnd);
      };
  }, [draggedPlacementId, dragStart]);


  const handleSignPdf = async () => {
    if (!file || placements.length === 0) return;
    setIsProcessing(true);
    try {
        const placementsWithImage = placements.map(p => ({
            ...p,
            imageBase64: signatureBase64!
        }));
        
        const signedPdfBytes = await embedImagesInPdf(file.file, placementsWithImage, scale);
        downloadPdf(signedPdfBytes, `signed_${file.file.name}`);
    } catch (e: any) {
        setErrorMessage(e.message);
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 flex flex-col relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between shrink-0 z-20">
         <div className="flex items-center gap-3">
          <Link to="/" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bold text-xl text-gray-900">Sign PDF</h1>
        </div>
        
        {file && (
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 text-gray-700 hover:text-red-600 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <PenTool size={18} />
                    {signatureBase64 ? 'Change Signature' : 'Create Signature'}
                </button>
                <button 
                    onClick={handleSignPdf}
                    disabled={isProcessing || placements.length === 0}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 'Sign & Download'}
                </button>
            </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-grow flex relative overflow-hidden justify-center bg-gray-100">
          {errorMessage && (
            <div className="absolute top-4 z-50 bg-red-50 text-red-700 p-4 rounded-lg shadow-lg border border-red-200 flex items-center gap-3">
                <AlertCircle size={20} />
                <span>{errorMessage}</span>
                <button onClick={() => setErrorMessage(null)}><X size={16} /></button>
            </div>
        )}

        {!file ? (
             <div className="flex items-center justify-center p-4 w-full">
                <div className="max-w-xl w-full">
                    <FileUploader 
                        onFilesSelected={handleFileSelected} 
                        title="Select PDF to Sign"
                        buttonText="Select PDF file"
                        multiple={false}
                    />
                </div>
            </div>
        ) : (
            <div className="relative flex flex-col items-center w-full h-full overflow-hidden">
                {/* PDF Canvas Container */}
                <div className="flex-grow overflow-auto p-8 w-full flex justify-center" ref={containerRef} onClick={handlePdfClick}>
                     <div className="relative shadow-xl bg-white" style={{ width: canvasRef.current?.width, height: canvasRef.current?.height, cursor: signatureBase64 ? 'crosshair' : 'default' }}>
                        <canvas ref={canvasRef} className="block pointer-events-none" />
                        
                        {/* Render Placements for Current Page */}
                        {placements.filter(p => p.pageIndex === currentPage - 1).map(p => (
                            <div 
                                key={p.id}
                                className={`absolute border-2 border-dashed ${draggedPlacementId === p.id ? 'border-indigo-500 bg-indigo-50/30' : 'border-red-500 bg-white/20 hover:bg-white/40'} group cursor-move`}
                                style={{
                                    left: p.x,
                                    top: p.y,
                                    width: p.width,
                                    height: p.height
                                }}
                                onMouseDown={(e) => handleDragStart(e, p.id)}
                                onClick={(e) => e.stopPropagation()} 
                            >
                                <img src={signatureBase64 || ''} alt="sig" className="w-full h-full object-contain pointer-events-none select-none" />
                                <button 
                                    onClick={(e) => removePlacement(e, p.id)}
                                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow hover:scale-110"
                                >
                                    <Trash2 size={12} />
                                </button>
                                <div className="absolute -bottom-3 -right-3 bg-white border border-gray-300 rounded-full p-1 shadow-sm cursor-se-resize hidden group-hover:block pointer-events-none">
                                     <Move size={10} className="text-gray-500" />
                                </div>
                            </div>
                        ))}
                     </div>
                </div>

                {/* Footer Navigation */}
                <div className="absolute bottom-6 bg-white rounded-full shadow-lg border border-gray-200 px-6 py-2 flex items-center gap-6 z-30">
                     <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-30"
                     >
                         <ChevronLeft size={24} />
                     </button>
                     <span className="text-sm font-medium text-gray-700">
                         Page {currentPage} of {numPages}
                     </span>
                     <button 
                        onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                        disabled={currentPage >= numPages}
                        className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-30"
                     >
                         <ChevronRight size={24} />
                     </button>
                     <div className="w-px h-6 bg-gray-300"></div>
                      <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} className="p-1 hover:bg-gray-100 rounded-full">
                         <ZoomOut size={20} />
                     </button>
                     <button onClick={() => setScale(s => Math.min(3, s + 0.25))} className="p-1 hover:bg-gray-100 rounded-full">
                         <ZoomIn size={20} />
                     </button>
                </div>
            </div>
        )}
      </div>

      {/* Signature Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex border-b border-gray-100">
                      <button 
                        className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 ${modalTab === 'draw' ? 'text-red-600 border-b-2 border-red-600 bg-red-50' : 'text-gray-500 hover:bg-gray-50'}`}
                        onClick={() => setModalTab('draw')}
                      >
                          <PenTool size={16} /> Draw
                      </button>
                      <button 
                        className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 ${modalTab === 'type' ? 'text-red-600 border-b-2 border-red-600 bg-red-50' : 'text-gray-500 hover:bg-gray-50'}`}
                        onClick={() => setModalTab('type')}
                      >
                          <Type size={16} /> Type
                      </button>
                       <button 
                        className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 ${modalTab === 'upload' ? 'text-red-600 border-b-2 border-red-600 bg-red-50' : 'text-gray-500 hover:bg-gray-50'}`}
                        onClick={() => setModalTab('upload')}
                      >
                          <ImageIcon size={16} /> Upload
                      </button>
                  </div>

                  <div className="p-6">
                      {modalTab === 'draw' && (
                          <div className="space-y-4">
                              <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 h-40 relative touch-none">
                                  <canvas 
                                    ref={drawCanvasRef} 
                                    width={450} 
                                    height={160} 
                                    className="w-full h-full cursor-crosshair rounded-xl"
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                  />
                                  <button onClick={clearDrawing} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1">
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                              <p className="text-center text-xs text-gray-400">Sign above</p>
                              <button onClick={saveDrawnSignature} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700">
                                  Save Signature
                              </button>
                          </div>
                      )}

                      {modalTab === 'type' && (
                          <div className="space-y-6">
                              <input 
                                type="text" 
                                placeholder="Your Name" 
                                value={typedName}
                                onChange={(e) => setTypedName(e.target.value)}
                                className="w-full border-b-2 border-gray-200 text-3xl text-center py-2 focus:outline-none focus:border-red-500 font-signature"
                              />
                              <div className="flex justify-center h-20 items-center">
                                  {typedName ? (
                                      <span className="font-signature text-4xl">{typedName}</span>
                                  ) : (
                                      <span className="text-gray-300 italic">Preview</span>
                                  )}
                              </div>
                              <button onClick={saveTypedSignature} disabled={!typedName} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 disabled:bg-gray-300">
                                  Save Signature
                              </button>
                          </div>
                      )}

                      {modalTab === 'upload' && (
                          <div className="space-y-4">
                               <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 h-40 flex flex-col items-center justify-center relative">
                                   <ImageIcon size={32} className="text-gray-300 mb-2" />
                                   <span className="text-sm text-gray-500">Click to upload image</span>
                                   <input 
                                    type="file" 
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleSignatureUpload}
                                   />
                               </div>
                               <button onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700">
                                  Select Image
                              </button>
                          </div>
                      )}
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-4 flex justify-end">
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800 font-medium">Cancel</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SignPdf;