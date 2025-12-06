import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Download, Trash2, RefreshCcw, Loader2, AlertCircle, X, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { imagesToPdf, downloadPdf } from '../services/pdfService';

interface CapturedImage {
  id: string;
  blob: Blob;
  url: string;
}

const ScanPdf: React.FC = () => {
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setIsStreamActive(true);
      setPermissionError(null);
    } catch (err) {
      console.error("Camera error:", err);
      setPermissionError("Could not access camera. Please allow camera permissions to use this tool.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreamActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const captureImage = () => {
    if (!videoRef.current || !isStreamActive) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setImages(prev => [...prev, {
          id: Date.now().toString(),
          blob,
          url
        }]);
      }
    }, 'image/jpeg', 0.9);
  };

  const deleteImage = (id: string) => {
    setImages(prev => {
        const newImages = prev.filter(img => img.id !== id);
        // Revoke URL for memory management
        const imgToRemove = prev.find(img => img.id === id);
        if (imgToRemove) URL.revokeObjectURL(imgToRemove.url);
        return newImages;
    });
  };

  const handleCreatePdf = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    try {
      // Convert captured blobs to File objects for the service
      const imageFiles = images.map((img, i) => 
        new File([img.blob], `scan_${i + 1}.jpg`, { type: 'image/jpeg' })
      );
      
      const pdfBytes = await imagesToPdf(imageFiles);
      downloadPdf(pdfBytes, `scanned_document_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) {
      console.error("PDF generation error", error);
      alert("Failed to generate PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-black flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="bg-transparent absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center text-white bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-gray-300">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold">Scan to PDF</h1>
        </div>
        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium">
            {images.length} Page{images.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Main View */}
      <div className="flex-grow relative flex items-center justify-center bg-gray-900">
        {permissionError ? (
            <div className="text-center p-8 max-w-md">
                <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                <h3 className="text-white text-xl font-bold mb-2">Camera Access Denied</h3>
                <p className="text-gray-400 mb-6">{permissionError}</p>
                <button onClick={startCamera} className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700">
                    Try Again
                </button>
            </div>
        ) : (
            <>
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full object-contain"
                />
                {!isStreamActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                        <div className="text-center">
                            <Loader2 size={32} className="animate-spin text-white mb-2 mx-auto" />
                            <p className="text-gray-400">Starting camera...</p>
                        </div>
                    </div>
                )}
            </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-black/80 backdrop-blur-md p-6 pb-8 flex flex-col gap-6 z-20">
          
          {/* Gallery Strip */}
          {images.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img, idx) => (
                      <div key={img.id} className="relative shrink-0 w-20 h-28 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                          <img src={img.url} alt={`Scan ${idx}`} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => deleteImage(img.id)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-sm hover:bg-red-700"
                          >
                              <X size={12} />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                              {idx + 1}
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between max-w-md mx-auto w-full">
              <button 
                onClick={handleCreatePdf}
                disabled={images.length === 0 || isProcessing}
                className="flex flex-col items-center gap-1 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:text-green-400 transition-colors"
              >
                  {isProcessing ? <Loader2 size={28} className="animate-spin" /> : <FileText size={28} />}
                  <span className="text-xs font-medium">Create PDF</span>
              </button>

              <button 
                onClick={captureImage}
                disabled={!isStreamActive}
                className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
              >
                  <div className="w-12 h-12 rounded-full bg-red-600"></div>
              </button>

              <button 
                onClick={() => {
                    stopCamera();
                    startCamera();
                }}
                className="flex flex-col items-center gap-1 text-white hover:text-blue-400 transition-colors"
              >
                  <RefreshCcw size={28} />
                  <span className="text-xs font-medium">Restart</span>
              </button>
          </div>
      </div>
    </div>
  );
};

export default ScanPdf;