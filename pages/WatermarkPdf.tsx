import React, { useState } from 'react';
import { ArrowLeft, Download, Stamp, Loader2, AlertCircle, X, Type, Image as ImageIcon, RotateCw, Grid3X3, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { watermarkPdf, downloadPdf } from '../services/pdfService';
import { UploadedFile, WatermarkSettings } from '../types';

const WatermarkPdf: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Configuration State
  const [config, setConfig] = useState<WatermarkSettings>({
    type: 'text',
    text: 'CONFIDENTIAL',
    imageFile: null,
    imagePreviewUrl: null,
    position: 'middle-center',
    opacity: 0.5,
    rotation: 0,
    fontSize: 48,
    color: '#ff0000',
    imageScale: 0.5,
    layer: 'over'
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imgFile = e.target.files[0];
      const url = URL.createObjectURL(imgFile);
      setConfig(prev => ({
        ...prev,
        type: 'image',
        imageFile: imgFile,
        imagePreviewUrl: url
      }));
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      // Simulate delay for effect
      await new Promise(resolve => setTimeout(resolve, 500));
      const watermarkedPdf = await watermarkPdf(file.file, config);
      downloadPdf(watermarkedPdf, `watermarked_${file.file.name}`);
      setIsDone(true);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Error adding watermark.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper for grid UI selection
  const positions: Array<WatermarkSettings['position']> = [
      'top-left', 'top-center', 'top-right',
      'middle-left', 'middle-center', 'middle-right',
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
          <h1 className="text-xl font-bold text-gray-900">Add Watermark</h1>
        </div>
        {file && !isDone && (
            <button
            onClick={handleProcess}
            disabled={isProcessing || (config.type === 'image' && !config.imageFile)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all
                ${isProcessing || (config.type === 'image' && !config.imageFile) ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:scale-105'}
            `}
            >
            {isProcessing ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Processing...</span>
                </>
            ) : (
                'Add Watermark'
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
                        Stamp an image or text over your PDF in seconds.
                    </p>
                </div>
            </div>
        ) : isDone ? (
             <div className="w-full flex items-center justify-center p-4">
                <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100 max-w-xl w-full">
                    <div className="inline-flex items-center justify-center p-4 bg-green-100 text-green-600 rounded-full mb-6">
                        <Stamp size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Watermark Added!</h2>
                    <p className="text-gray-600 mb-8">
                        Your document is ready. The download should have started automatically.
                    </p>
                    <button 
                        onClick={() => { setFile(null); setIsDone(false); }} 
                        className="text-red-600 font-medium hover:underline"
                    >
                        Watermark another PDF
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
                        {/* Fake Content Lines to look like a doc */}
                        <div className="absolute inset-0 p-8 space-y-4 opacity-10 pointer-events-none">
                             {[...Array(12)].map((_, i) => (
                                 <div key={i} className="h-2 bg-gray-400 rounded w-full"></div>
                             ))}
                        </div>

                        {/* The Watermark Element */}
                        <div className="absolute inset-0 flex p-8"
                             style={{
                                 alignItems: config.position.includes('top') ? 'flex-start' : config.position.includes('bottom') ? 'flex-end' : 'center',
                                 justifyContent: config.position.includes('left') ? 'flex-start' : config.position.includes('right') ? 'flex-end' : 'center',
                             }}
                        >
                            <div 
                                style={{
                                    opacity: config.opacity,
                                    transform: `rotate(${config.rotation}deg)`,
                                    transformOrigin: 'center center',
                                    zIndex: 10
                                }}
                            >
                                {config.type === 'text' ? (
                                    <span style={{ 
                                        fontSize: `${config.fontSize / 2}px`, // Scale down for preview
                                        color: config.color,
                                        fontWeight: 'bold',
                                        fontFamily: 'Helvetica, sans-serif',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {config.text}
                                    </span>
                                ) : (
                                    config.imagePreviewUrl ? (
                                        <img 
                                            src={config.imagePreviewUrl} 
                                            alt="watermark"
                                            style={{
                                                width: `${config.imageScale * 200}px`, // Base width scaled
                                                height: 'auto'
                                            }} 
                                        />
                                    ) : (
                                        <div className="bg-gray-200 border-2 border-dashed border-gray-400 p-4 text-xs text-gray-500">
                                            No Image
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Settings Sidebar */}
                <div className="w-full md:w-80 lg:w-96 bg-white border-l border-gray-200 p-6 flex flex-col overflow-y-auto">
                    
                    {/* Type Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
                        <button 
                            onClick={() => setConfig(p => ({ ...p, type: 'text' }))}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${config.type === 'text' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            <Type size={16} /> Text
                        </button>
                        <button 
                             onClick={() => setConfig(p => ({ ...p, type: 'image' }))}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${config.type === 'image' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            <ImageIcon size={16} /> Image
                        </button>
                    </div>

                    {/* Specific Settings */}
                    {config.type === 'text' ? (
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">TEXT</label>
                                <input 
                                    type="text" 
                                    value={config.text}
                                    onChange={(e) => setConfig(p => ({ ...p, text: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">COLOR</label>
                                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                                        <input 
                                            type="color" 
                                            value={config.color}
                                            onChange={(e) => setConfig(p => ({ ...p, color: e.target.value }))}
                                            className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                                        />
                                        <span className="text-xs text-gray-600">{config.color}</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">SIZE</label>
                                    <input 
                                        type="number" 
                                        value={config.fontSize}
                                        onChange={(e) => setConfig(p => ({ ...p, fontSize: Number(e.target.value) }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        min={8}
                                        max={200}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 mb-6">
                            <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 hover:border-red-400 transition-colors">
                                <span className="text-sm text-gray-600 font-medium">Click to upload image</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                            
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">SCALE</label>
                                <input 
                                    type="range" 
                                    min="0.1" 
                                    max="2.0" 
                                    step="0.1"
                                    value={config.imageScale} 
                                    onChange={(e) => setConfig(p => ({ ...p, imageScale: Number(e.target.value) }))}
                                    className="w-full accent-red-600"
                                />
                            </div>
                        </div>
                    )}

                    {/* Common Settings */}
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

                        {/* Transparency */}
                        <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-2">
                                <Layers size={14} /> TRANSPARENCY ({Math.round(config.opacity * 100)}%)
                             </label>
                             <input 
                                type="range" 
                                min="0.1" 
                                max="1.0" 
                                step="0.1"
                                value={config.opacity} 
                                onChange={(e) => setConfig(p => ({ ...p, opacity: Number(e.target.value) }))}
                                className="w-full accent-red-600"
                            />
                        </div>

                         {/* Rotation */}
                        <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-2 flex items-center gap-2">
                                <RotateCw size={14} /> ROTATION
                             </label>
                             <div className="flex gap-2">
                                 {[0, 45, 90, 315].map(deg => (
                                     <button
                                        key={deg}
                                        onClick={() => setConfig(p => ({ ...p, rotation: deg }))}
                                        className={`flex-1 py-2 rounded border text-xs font-medium ${config.rotation === deg ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-300 hover:bg-gray-50'}`}
                                     >
                                         {deg === 0 ? '0°' : deg === 315 ? '-45°' : `${deg}°`}
                                     </button>
                                 ))}
                             </div>
                        </div>
                    </div>

                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default WatermarkPdf;
