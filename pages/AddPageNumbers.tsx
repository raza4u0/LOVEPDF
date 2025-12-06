import React, { useState } from 'react';
import { ArrowLeft, Download, Hash, Loader2, AlertCircle, X, Grid3X3, Type, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { addPageNumbers, downloadPdf } from '../services/pdfService';
import { UploadedFile, PageNumberSettings } from '../types';

const AddPageNumbers: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Configuration State
  const [config, setConfig] = useState<PageNumberSettings>({
    position: 'bottom-center',
    margin: 30,
    startFrom: 1,
    format: 'n',
    fontSize: 12,
    fontFamily: 'Helvetica'
  });

  const handleFileSelected = (newFiles: File[]) => {
    setErrorMessage(null);
    if (newFiles.length > 0) {
      setFile({
        id: Math.random().toString(36).substr(2, 9),
        file: newFiles[0],
      });
      setIsDone(false);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const numberedPdf = await addPageNumbers(file.file, config);
      downloadPdf(numberedPdf, `numbered_${file.file.name}`);
      setIsDone(true);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Error adding page numbers.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper for grid UI selection
  const positions: Array<PageNumberSettings['position']> = [
      'top-left', 'top-center', 'top-right',
      'bottom-left', 'bottom-center', 'bottom-right'
  ];

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 flex flex-col">
      {/* Tool Header */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Page Numbers</h1>
        </div>
        {file && !isDone && (
            <button
            onClick={handleProcess}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all
                ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:scale-105'}
            `}
            >
            {isProcessing ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Processing...</span>
                </>
            ) : (
                'Add Numbers'
            )}
            </button>
        )}
      </div>

      {/* Main Area */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
         {errorMessage && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-50 text-red-700 p-4 rounded-lg shadow-lg border border-red-200 flex items-center gap-3 max-w-lg">
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
                        title="Select PDF file"
                        buttonText="Select PDF file"
                        multiple={false}
                    />
                    <p className="text-center mt-6 text-gray-500">
                        Add page numbers into your PDF with ease. Choose your position, dimensions, typography.
                    </p>
                </div>
            </div>
        ) : isDone ? (
             <div className="w-full flex items-center justify-center p-4">
                <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100 max-w-xl w-full">
                    <div className="inline-flex items-center justify-center p-4 bg-green-100 text-green-600 rounded-full mb-6">
                        <Hash size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Numbers Added!</h2>
                    <p className="text-gray-600 mb-8">
                        Your document is ready. The download should have started automatically.
                    </p>
                    <button 
                        onClick={() => { setFile(null); setIsDone(false); }} 
                        className="text-red-600 font-medium hover:underline"
                    >
                        Process another PDF
                    </button>
                </div>
             </div>
        ) : (
            <>
                {/* Left: Preview Area */}
                <div className="flex-grow bg-gray-100 p-8 flex items-center justify-center overflow-auto">
                    {/* Simulated A4 Page */}
                    <div className="bg-white shadow-xl relative overflow-hidden transition-all duration-300" 
                         style={{ 
                             width: '400px', 
                             height: '565px', // Approx A4 Ratio
                         }}
                    >
                        {/* Fake Content Lines */}
                        <div className="absolute inset-0 p-12 space-y-4 opacity-10 pointer-events-none">
                             {[...Array(15)].map((_, i) => (
                                 <div key={i} className="h-2 bg-gray-400 rounded w-full"></div>
                             ))}
                        </div>

                        {/* The Page Number Element */}
                        <div className="absolute inset-0 p-0" style={{ pointerEvents: 'none' }}>
                            <div 
                                style={{
                                    position: 'absolute',
                                    left: config.position.includes('left') ? config.margin : undefined,
                                    right: config.position.includes('right') ? config.margin : undefined,
                                    top: config.position.includes('top') ? config.margin : undefined,
                                    bottom: config.position.includes('bottom') ? config.margin : undefined,
                                    // Center horizontal alignment
                                    ...(config.position.includes('center') && {
                                        left: '50%',
                                        transform: 'translateX(-50%)'
                                    }),
                                    fontFamily: config.fontFamily === 'Times-Roman' ? 'Times New Roman, serif' : config.fontFamily === 'Courier' ? 'Courier New, monospace' : 'Arial, sans-serif',
                                    fontSize: `${config.fontSize}px`,
                                    color: 'black'
                                }}
                            >
                                {config.format.replace('n', '1').replace('total', '5')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Settings Sidebar */}
                <div className="w-full md:w-80 lg:w-96 bg-white border-l border-gray-200 p-6 flex flex-col overflow-y-auto">
                    
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Settings2 size={20} /> Settings
                    </h2>

                    <div className="space-y-6">
                        {/* Position Grid */}
                        <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-2 flex items-center gap-2">
                                <Grid3X3 size={14} /> POSITION
                             </label>
                             <div className="grid grid-cols-3 gap-2 w-32 mx-auto">
                                 {positions.map(pos => (
                                     <button
                                        key={pos}
                                        onClick={() => setConfig(p => ({ ...p, position: pos }))}
                                        className={`w-10 h-10 rounded border transition-all ${config.position === pos ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-300 hover:bg-gray-100'}`}
                                     >
                                         <div className={`w-2 h-2 rounded-full mx-auto ${config.position === pos ? 'bg-white' : 'bg-gray-300'}`}></div>
                                     </button>
                                 ))}
                             </div>
                        </div>

                        {/* Format */}
                        <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-2 flex items-center gap-2">
                                <Hash size={14} /> TEXT FORMAT
                             </label>
                             <div className="space-y-2">
                                 {['n', 'Page n', 'n of total'].map(fmt => (
                                     <label key={fmt} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                         <input 
                                            type="radio" 
                                            name="format" 
                                            checked={config.format === fmt} 
                                            onChange={() => setConfig(p => ({ ...p, format: fmt as any }))}
                                            className="accent-red-600"
                                         />
                                         <span className="text-sm text-gray-700">
                                             {fmt.replace('n', '1').replace('total', '10')}
                                         </span>
                                     </label>
                                 ))}
                             </div>
                        </div>

                        {/* Typography */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">FONT SIZE</label>
                                <input 
                                    type="number" 
                                    value={config.fontSize}
                                    onChange={(e) => setConfig(p => ({ ...p, fontSize: Number(e.target.value) }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    min={8}
                                    max={72}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">MARGIN</label>
                                <input 
                                    type="number" 
                                    value={config.margin}
                                    onChange={(e) => setConfig(p => ({ ...p, margin: Number(e.target.value) }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    min={0}
                                    max={200}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">FONT FAMILY</label>
                            <select
                                value={config.fontFamily}
                                onChange={(e) => setConfig(p => ({ ...p, fontFamily: e.target.value as any }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="Helvetica">Helvetica (Arial)</option>
                                <option value="Times-Roman">Times New Roman</option>
                                <option value="Courier">Courier</option>
                            </select>
                        </div>

                    </div>

                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default AddPageNumbers;