import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Type, Square, Highlighter, Undo, Trash2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, AlertCircle, X, Move, Loader2, Pen, Layers, ListFilter, RectangleHorizontal, Circle, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { getPdfJs, saveEditedPdf, downloadPdf } from '../services/pdfService';
import { PdfEditAction, UploadedFile } from '../types';

type Tool = 'select' | 'text' | 'rectangle' | 'square' | 'highlight' | 'draw' | 'circle' | 'line';

const EditPdf: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [actions, setActions] = useState<PdfEditAction[]>([]);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pageInputValue, setPageInputValue] = useState('1');
  
  // Sidebar State
  const [showLayers, setShowLayers] = useState(false);
  const [filterPage, setFilterPage] = useState<'all' | number>('all');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawId, setCurrentDrawId] = useState<string | null>(null);
  const [shapeStart, setShapeStart] = useState<{x: number, y: number} | null>(null);

  // Settings for new tools
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentFontSize, setCurrentFontSize] = useState(16); // Acts as stroke width for Pen/Shapes

  const handleFileSelected = async (newFiles: File[]) => {
    setErrorMessage(null);
    if (newFiles.length > 0) {
      const f = newFiles[0];
      setFile({ id: '1', file: f });
      
      try {
        const pdfjs = await getPdfJs();
        const arrayBuffer = await f.arrayBuffer();
        const loadedPdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        setPdfDoc(loadedPdf);
        setNumPages(loadedPdf.numPages);
        setCurrentPage(1);
        setPageInputValue('1');
        setActions([]);
      } catch (e: any) {
        setErrorMessage("Failed to load PDF. " + e.message);
      }
    }
  };

  // Update input when page changes
  useEffect(() => {
    setPageInputValue(currentPage.toString());
  }, [currentPage]);

  const handlePageInput = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        let page = parseInt(pageInputValue);
        if (isNaN(page)) page = 1;
        page = Math.max(1, Math.min(page, numPages));
        setCurrentPage(page);
    }
  };

  // Render Page
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
             await page.render({
                canvasContext: context,
                viewport: viewport,
            }).promise;
        }
      } catch (e) {
        console.error("Render error", e);
      }
    };

    renderPage();
    return () => { isCancelled = true; };
  }, [pdfDoc, currentPage, scale]);


  // Add Item Helpers
  const addText = () => {
    const id = Date.now().toString();
    const newAction: PdfEditAction = {
      id,
      type: 'text',
      pageIndex: currentPage - 1,
      x: 50,
      y: 50,
      text: 'Type here',
      color: currentColor,
      size: currentFontSize,
    };
    setActions([...actions, newAction]);
    setSelectedActionId(id);
    setActiveTool('select');
  };

  const addHighlight = () => {
    const id = Date.now().toString();
    const newAction: PdfEditAction = {
      id,
      type: 'highlight',
      pageIndex: currentPage - 1,
      x: 100,
      y: 100,
      width: 150,
      height: 20,
      color: '#ffff00', // Yellow
      opacity: 0.4
    };
    setActions([...actions, newAction]);
    setSelectedActionId(id);
    setActiveTool('select');
  };

  const updateAction = (id: string, updates: Partial<PdfEditAction>) => {
    setActions(actions.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAction = (id: string) => {
    setActions(actions.filter(a => a.id !== id));
    setSelectedActionId(null);
  };

  const handleSave = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
        const savedPdf = await saveEditedPdf(file.file, actions, scale);
        downloadPdf(savedPdf, `edited_${file.file.name}`);
    } catch (e: any) {
        setErrorMessage(e.message);
    } finally {
        setIsProcessing(false);
    }
  };

  // --- Interaction Logic ---

  const handleMouseDown = (e: React.MouseEvent) => {
      // General container click logic
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;

      // Clicked on background means deselect unless dragging tool
      if (activeTool === 'select') {
          setSelectedActionId(null);
          return;
      }

      // Shape Tools
      if (activeTool === 'rectangle' || activeTool === 'square' || activeTool === 'circle') {
          setIsDrawing(true);
          const id = Date.now().toString();
          setCurrentDrawId(id);
          setShapeStart({ x: relativeX, y: relativeY });
          
          const newAction: PdfEditAction = {
              id,
              type: activeTool === 'square' ? 'rectangle' : activeTool, // Square saves as rect
              pageIndex: currentPage - 1,
              x: relativeX,
              y: relativeY,
              width: 0,
              height: 0,
              color: currentColor,
              size: Math.max(1, currentFontSize / 4),
              opacity: 1
          };
          setActions(prev => [...prev, newAction]);
          setSelectedActionId(id);
      }

      // Line Tool
      if (activeTool === 'line') {
          setIsDrawing(true);
          const id = Date.now().toString();
          setCurrentDrawId(id);
          const newAction: PdfEditAction = {
              id,
              type: 'line',
              pageIndex: currentPage - 1,
              x: 0,
              y: 0,
              points: [{ x: relativeX, y: relativeY }, { x: relativeX, y: relativeY }],
              color: currentColor,
              size: Math.max(1, currentFontSize / 4),
              opacity: 1
          };
          setActions(prev => [...prev, newAction]);
          setSelectedActionId(id);
      }

      // Drawing Tool (Freehand)
      if (activeTool === 'draw') {
          setIsDrawing(true);
          const id = Date.now().toString();
          setCurrentDrawId(id);
          const newAction: PdfEditAction = {
              id,
              type: 'draw',
              pageIndex: currentPage - 1,
              x: 0, // Not used for draw path
              y: 0, 
              points: [{ x: relativeX, y: relativeY }],
              color: currentColor,
              size: Math.max(1, currentFontSize / 4),
              opacity: 1
          };
          setActions(prev => [...prev, newAction]);
      }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDrawing || !currentDrawId || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (activeTool === 'draw') {
          setActions(prev => prev.map(a => {
              if (a.id === currentDrawId && a.points) {
                  return { ...a, points: [...a.points, { x, y }] };
              }
              return a;
          }));
      } else if (activeTool === 'line') {
          setActions(prev => prev.map(a => {
              if (a.id === currentDrawId && a.points) {
                  return { ...a, points: [a.points[0], { x, y }] };
              }
              return a;
          }));
      } else if ((activeTool === 'rectangle' || activeTool === 'square' || activeTool === 'circle') && shapeStart) {
          const dx = x - shapeStart.x;
          const dy = y - shapeStart.y;
          
          setActions(prev => prev.map(a => {
              if (a.id === currentDrawId) {
                  let newX = shapeStart.x;
                  let newY = shapeStart.y;
                  let newW = Math.abs(dx);
                  let newH = Math.abs(dy);

                  if (activeTool === 'square' || activeTool === 'circle') {
                      const maxDim = Math.max(newW, newH);
                      newW = maxDim;
                      newH = maxDim;
                  }

                  // Handle dragging backwards (negative width/height logic)
                  if (dx < 0) newX = shapeStart.x - newW;
                  if (dy < 0) newY = shapeStart.y - newH;

                  return { ...a, x: newX, y: newY, width: newW, height: newH };
              }
              return a;
          }));
      }
  };

  const handleMouseUp = () => {
      if (isDrawing) {
          setIsDrawing(false);
          setCurrentDrawId(null);
          setShapeStart(null);
      }
  };

  // Dragging Logic for Elements
  const handleElementMouseDown = (e: React.MouseEvent, actionId: string) => {
      e.stopPropagation();
      if (activeTool !== 'select') return;
      
      setSelectedActionId(actionId);
      const startX = e.clientX;
      const startY = e.clientY;
      const action = actions.find(a => a.id === actionId);
      if (!action) return;
      const initX = action.x;
      const initY = action.y;

      const handleElementMouseMove = (moveEvent: MouseEvent) => {
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;
          updateAction(actionId, { x: initX + dx, y: initY + dy });
      };

      const handleElementMouseUp = () => {
          window.removeEventListener('mousemove', handleElementMouseMove);
          window.removeEventListener('mouseup', handleElementMouseUp);
      };

      window.addEventListener('mousemove', handleElementMouseMove);
      window.addEventListener('mouseup', handleElementMouseUp);
  };

    // Resizing Logic (Simple bottom-right corner)
    const handleResizeMouseDown = (e: React.MouseEvent, actionId: string) => {
        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;
        const action = actions.find(a => a.id === actionId);
        if (!action) return;
        const initW = action.width || 0;
        const initH = action.height || 0;

        const handleElementMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            updateAction(actionId, { width: Math.max(10, initW + dx), height: Math.max(10, initH + dy) });
        };

        const handleElementMouseUp = () => {
            window.removeEventListener('mousemove', handleElementMouseMove);
            window.removeEventListener('mouseup', handleElementMouseUp);
        };

        window.addEventListener('mousemove', handleElementMouseMove);
        window.addEventListener('mouseup', handleElementMouseUp);
    };
    
    // Generate SVG Path D attribute
    const getPathD = (points?: { x: number; y: number }[]) => {
        if (!points || points.length === 0) return '';
        const d = [`M ${points[0].x} ${points[0].y}`];
        for (let i = 1; i < points.length; i++) {
            d.push(`L ${points[i].x} ${points[i].y}`);
        }
        return d.join(' ');
    };


  return (
    <div className="h-[calc(100vh-64px)] bg-gray-100 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 p-2 flex items-center justify-between shrink-0 shadow-sm z-20">
         <div className="flex items-center gap-2">
            <Link to="/" className="text-gray-500 hover:text-gray-900 p-2">
                <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-bold text-gray-800 hidden sm:block">Edit PDF</h1>
         </div>
         
         {file && (
             <div className="flex items-center gap-2 md:gap-4 overflow-x-auto px-2 scrollbar-hide">
                 {/* Tools */}
                 <button 
                    onClick={() => setActiveTool('select')}
                    className={`p-2 rounded-lg flex flex-col items-center gap-1 text-xs font-medium transition-colors ${activeTool === 'select' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 text-gray-600'}`}
                    title="Select"
                 >
                     <Move size={20} />
                 </button>
                 <button 
                    onClick={addText}
                    className={`p-2 rounded-lg flex flex-col items-center gap-1 text-xs font-medium transition-colors ${activeTool === 'text' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 text-gray-600'}`}
                    title="Add Text"
                 >
                     <Type size={20} />
                 </button>
                 <button 
                    onClick={() => setActiveTool(activeTool === 'draw' ? 'select' : 'draw')}
                    className={`p-2 rounded-lg flex flex-col items-center gap-1 text-xs font-medium transition-colors ${activeTool === 'draw' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 text-gray-600'}`}
                    title="Freehand Draw"
                 >
                     <Pen size={20} />
                 </button>
                 <div className="w-px h-8 bg-gray-200 mx-1"></div>
                 <button 
                    onClick={() => setActiveTool(activeTool === 'rectangle' ? 'select' : 'rectangle')}
                    className={`p-2 rounded-lg flex flex-col items-center gap-1 text-xs font-medium transition-colors ${activeTool === 'rectangle' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 text-gray-600'}`}
                    title="Draw Rectangle"
                 >
                     <RectangleHorizontal size={20} />
                 </button>
                 <button 
                    onClick={() => setActiveTool(activeTool === 'square' ? 'select' : 'square')}
                    className={`p-2 rounded-lg flex flex-col items-center gap-1 text-xs font-medium transition-colors ${activeTool === 'square' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 text-gray-600'}`}
                    title="Draw Square"
                 >
                     <Square size={20} />
                 </button>
                 <button 
                    onClick={() => setActiveTool(activeTool === 'circle' ? 'select' : 'circle')}
                    className={`p-2 rounded-lg flex flex-col items-center gap-1 text-xs font-medium transition-colors ${activeTool === 'circle' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 text-gray-600'}`}
                    title="Draw Circle"
                 >
                     <Circle size={20} />
                 </button>
                 <button 
                    onClick={() => setActiveTool(activeTool === 'line' ? 'select' : 'line')}
                    className={`p-2 rounded-lg flex flex-col items-center gap-1 text-xs font-medium transition-colors ${activeTool === 'line' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 text-gray-600'}`}
                    title="Draw Line"
                 >
                     <Minus size={20} className="rotate-45" />
                 </button>
                 <div className="w-px h-8 bg-gray-200 mx-1"></div>
                 <button 
                    onClick={addHighlight}
                    className={`p-2 rounded-lg flex flex-col items-center gap-1 text-xs font-medium transition-colors ${activeTool === 'highlight' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 text-gray-600'}`}
                    title="Highlight"
                 >
                     <Highlighter size={20} />
                 </button>
                 
                 <div className="w-px h-8 bg-gray-200 mx-1"></div>

                 <div className="flex items-center gap-2">
                    <input 
                        type="color" 
                        value={currentColor} 
                        onChange={(e) => setCurrentColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                        title="Color"
                    />
                    <select 
                        value={currentFontSize}
                        onChange={(e) => setCurrentFontSize(Number(e.target.value))}
                        className="border border-gray-300 rounded-md text-sm p-1"
                        title="Size / Thickness"
                    >
                        <option value={12}>Small</option>
                        <option value={16}>Medium</option>
                        <option value={24}>Large</option>
                        <option value={32}>X-Large</option>
                    </select>
                 </div>
             </div>
         )}

         <div className="flex items-center gap-3">
             {file && (
                <>
                    <button
                        onClick={() => setShowLayers(!showLayers)}
                        className={`p-2 rounded-lg flex flex-col items-center gap-1 text-xs font-medium transition-colors ${showLayers ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 text-gray-600'}`}
                        title="Layers / Elements"
                    >
                        <Layers size={20} />
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isProcessing}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span className="hidden sm:inline">Save PDF</span>
                    </button>
                </>
             )}
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex relative overflow-hidden">
        
        {/* Error Banner */}
        {errorMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 text-red-700 p-4 rounded-lg shadow-lg border border-red-200 flex items-center gap-3 max-w-lg">
                <AlertCircle size={20} />
                <span className="text-sm">{errorMessage}</span>
                <button onClick={() => setErrorMessage(null)}><X size={16} /></button>
            </div>
        )}

        {!file ? (
            <div className="w-full flex items-center justify-center p-4">
                 <div className="max-w-xl w-full">
                    <FileUploader 
                        onFilesSelected={handleFileSelected} 
                        title="Open PDF to Edit"
                        buttonText="Select PDF file"
                        multiple={false}
                    />
                </div>
            </div>
        ) : (
            <>
                {/* Canvas Container */}
                <div 
                    className="flex-grow bg-gray-200 overflow-auto flex justify-center p-8 relative" 
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ cursor: (activeTool === 'draw' || activeTool === 'rectangle' || activeTool === 'square' || activeTool === 'circle' || activeTool === 'line') ? 'crosshair' : 'default' }}
                >
                    <div ref={containerRef} className="relative shadow-xl bg-white" style={{ width: canvasRef.current?.width, height: canvasRef.current?.height }}>
                        <canvas ref={canvasRef} className="block pointer-events-none" />
                        
                        {/* SVG Layer for Drawings and Shapes */}
                        <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', zIndex: 5 }}>
                             {actions
                                .filter(a => a.pageIndex === currentPage - 1)
                                .map(action => {
                                    const strokeWidth = action.size || 2;
                                    
                                    if (action.type === 'draw') {
                                        return (
                                            <path 
                                                key={action.id}
                                                d={getPathD(action.points)}
                                                stroke={action.color}
                                                strokeWidth={strokeWidth}
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                opacity={action.opacity}
                                            />
                                        );
                                    } else if (action.type === 'line' && action.points && action.points.length >= 2) {
                                        return (
                                            <line 
                                                key={action.id}
                                                x1={action.points[0].x}
                                                y1={action.points[0].y}
                                                x2={action.points[1].x}
                                                y2={action.points[1].y}
                                                stroke={action.color}
                                                strokeWidth={strokeWidth}
                                                opacity={action.opacity}
                                            />
                                        );
                                    } else if (action.type === 'rectangle') {
                                        return (
                                            <rect
                                                key={action.id}
                                                x={action.x}
                                                y={action.y}
                                                width={action.width}
                                                height={action.height}
                                                stroke={action.color}
                                                strokeWidth={strokeWidth}
                                                fill="none"
                                                opacity={action.opacity}
                                            />
                                        );
                                    } else if (action.type === 'circle') {
                                        // Render as circle or ellipse based on width/height
                                        // For now, enforce Circle tool draws 1:1, so it's a circle
                                        const r = Math.min(action.width || 0, action.height || 0) / 2;
                                        return (
                                            <circle
                                                key={action.id}
                                                cx={action.x + r}
                                                cy={action.y + r}
                                                r={r}
                                                stroke={action.color}
                                                strokeWidth={strokeWidth}
                                                fill="none"
                                                opacity={action.opacity}
                                            />
                                        );
                                    }
                                    return null;
                                })
                             }
                        </svg>

                        {/* Overlay Layer for interactive elements (selection, text input, highlight div) */}
                        <div className="absolute inset-0 overflow-hidden">
                            {actions.filter(a => a.pageIndex === currentPage - 1).map(action => {
                                // Draw, Line, Circle, Rect are visually in SVG, but we need hit areas for selection
                                // Text and Highlight are fully in Div
                                const isSvgShape = ['draw', 'line', 'rectangle', 'circle'].includes(action.type);
                                
                                return (
                                <div
                                    key={action.id}
                                    style={{
                                        position: 'absolute',
                                        left: action.type === 'line' && action.points ? Math.min(action.points[0].x, action.points[1].x) : action.x,
                                        top: action.type === 'line' && action.points ? Math.min(action.points[0].y, action.points[1].y) : action.y,
                                        width: action.type === 'line' && action.points ? Math.abs(action.points[1].x - action.points[0].x) : action.width,
                                        height: action.type === 'line' && action.points ? Math.abs(action.points[1].y - action.points[0].y) : action.height,
                                        // Text Styles
                                        color: action.color,
                                        fontSize: action.type === 'text' ? action.size : undefined,
                                        // Highlight Fill
                                        backgroundColor: action.type === 'highlight' ? action.color : undefined,
                                        opacity: action.type === 'highlight' ? (action.opacity || 1) : 1, // Only apply opacity to highlight container, others handle it in SVG
                                        cursor: activeTool === 'select' ? 'move' : 'default',
                                        // Selection Box
                                        border: selectedActionId === action.id ? '1px dashed #6366f1' : 'none',
                                        padding: action.type === 'text' ? '4px' : '0',
                                        zIndex: 10,
                                        // For SVG shapes, this div is transparent and acts as hit box
                                        pointerEvents: isSvgShape ? (activeTool === 'select' ? 'auto' : 'none') : 'auto'
                                    }}
                                    onMouseDown={(e) => handleElementMouseDown(e, action.id)}
                                >
                                    {action.type === 'text' ? (
                                        <input
                                            type="text"
                                            value={action.text}
                                            onChange={(e) => updateAction(action.id, { text: e.target.value })}
                                            className="bg-transparent border-none outline-none w-full h-full font-sans"
                                            style={{ fontSize: action.size, color: action.color }}
                                            autoFocus={selectedActionId === action.id}
                                        />
                                    ) : null}

                                    {/* Selection Controls */}
                                    {selectedActionId === action.id && (
                                        <>
                                            <button 
                                                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-sm hover:scale-110 transition-transform z-50"
                                                onClick={(e) => { e.stopPropagation(); deleteAction(action.id); }}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                            {action.type !== 'text' && action.type !== 'draw' && action.type !== 'line' && (
                                                <div 
                                                    className="absolute bottom-0 right-0 w-4 h-4 bg-indigo-500 cursor-se-resize rounded-tl-sm z-50"
                                                    onMouseDown={(e) => handleResizeMouseDown(e, action.id)}
                                                />
                                            )}
                                        </>
                                    )}
                                </div>
                            )})}
                        </div>
                    </div>
                </div>

                {/* Layers / Elements Sidebar */}
                {showLayers && (
                    <div className="w-64 bg-white border-l border-gray-200 shadow-xl z-30 flex flex-col shrink-0">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                            <Layers size={16}/> Elements
                        </h3>
                        <button onClick={() => setShowLayers(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                    </div>

                    {/* Filter */}
                    <div className="p-3 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <ListFilter size={12} /> Filter by Page
                        </div>
                        <select
                            value={filterPage}
                            onChange={(e) => setFilterPage(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            className="w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="all">All Pages</option>
                            {Array.from({length: numPages}, (_, i) => i + 1).map(p => (
                                <option key={p} value={p}>Page {p}</option>
                            ))}
                        </select>
                    </div>

                    {/* List */}
                    <div className="flex-grow overflow-y-auto p-2 space-y-2">
                        {actions
                            .filter(a => filterPage === 'all' || a.pageIndex === (filterPage as number) - 1)
                            .map(action => (
                                <div
                                    key={action.id}
                                    onClick={() => {
                                        setCurrentPage(action.pageIndex + 1);
                                        setSelectedActionId(action.id);
                                    }}
                                    className={`p-2 rounded-lg border text-sm cursor-pointer flex items-center gap-2 group ${selectedActionId === action.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-gray-300'}`}
                                >
                                    <div className="text-gray-500">
                                        {action.type === 'text' && <Type size={14} />}
                                        {action.type === 'draw' && <Pen size={14} />}
                                        {action.type === 'rectangle' && <Square size={14} />}
                                        {action.type === 'highlight' && <Highlighter size={14} />}
                                        {action.type === 'circle' && <Circle size={14} />}
                                        {action.type === 'line' && <Minus size={14} />}
                                    </div>
                                    
                                    <div className="flex-grow min-w-0">
                                        <div className="font-medium text-gray-700 truncate">
                                            {action.type === 'text' ? (action.text || 'Text') : 
                                            action.type.charAt(0).toUpperCase() + action.type.slice(1)}
                                        </div>
                                        <div className="text-xs text-gray-400">Page {action.pageIndex + 1}</div>
                                    </div>

                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteAction(action.id); }}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        }
                        {actions.length === 0 && (
                            <div className="text-center text-gray-400 text-xs py-8">
                                No elements added yet.
                            </div>
                        )}
                        {actions.length > 0 && actions.filter(a => filterPage === 'all' || a.pageIndex === (filterPage as number) - 1).length === 0 && (
                             <div className="text-center text-gray-400 text-xs py-8">
                                No elements on this page.
                            </div>
                        )}
                    </div>
                    </div>
                )}

                {/* Bottom Bar (Navigation) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-4 z-30">
                     <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-30"
                     >
                         <ChevronLeft size={20} />
                     </button>
                     <div className="flex items-center gap-1">
                        <input 
                            type="text" 
                            value={pageInputValue}
                            onChange={(e) => setPageInputValue(e.target.value)}
                            onKeyDown={handlePageInput}
                            onBlur={() => {
                                let page = parseInt(pageInputValue);
                                if (isNaN(page)) page = 1;
                                page = Math.max(1, Math.min(page, numPages));
                                setCurrentPage(page);
                                setPageInputValue(page.toString());
                            }}
                            className="w-10 text-center text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-600">
                             / {numPages}
                        </span>
                     </div>
                     <button 
                        onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                        disabled={currentPage >= numPages}
                        className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-30"
                     >
                         <ChevronRight size={20} />
                     </button>
                     <div className="w-px h-4 bg-gray-300"></div>
                     <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} className="p-1 hover:bg-gray-100 rounded-full">
                         <ZoomOut size={18} />
                     </button>
                     <span className="text-xs text-gray-500 w-12 text-center">{Math.round(scale * 100)}%</span>
                     <button onClick={() => setScale(s => Math.min(3, s + 0.25))} className="p-1 hover:bg-gray-100 rounded-full">
                         <ZoomIn size={18} />
                     </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default EditPdf;