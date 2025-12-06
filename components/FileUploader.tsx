import React, { useRef, useState } from 'react';
import { UploadCloud, File as FileIcon, CheckCircle, Loader2, AlertCircle, X } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: string; // e.g., "application/pdf, .pdf"
  multiple?: boolean;
  title?: string;
  buttonText?: string;
}

interface FileProgress {
  file: File;
  progress: number;
  id: string;
  status: 'uploading' | 'completed' | 'error';
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  acceptedFileTypes = 'application/pdf',
  multiple = true,
  title = 'Drop PDF files here',
  buttonText = 'Select PDF files'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [filesProgress, setFilesProgress] = useState<FileProgress[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we are leaving the main container
    // Because children have pointer-events-none, this usually works fine
    setIsDragging(false);
  };

  const validateFile = (file: File): string | null => {
    // 1. Check Size (e.g., 50MB limit for browser performance)
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
        return `File "${file.name}" is too large. Max size is 50MB.`;
    }
    if (file.size === 0) {
        return `File "${file.name}" is empty.`;
    }

    // 2. Check Type if acceptedFileTypes is provided
    if (acceptedFileTypes && acceptedFileTypes !== '*') {
        const types = acceptedFileTypes.split(',').map(t => t.trim().toLowerCase());
        const fileType = file.type.toLowerCase();
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        
        // Simple check: mime type matches OR extension matches
        const isValid = types.some(t => {
            if (t.startsWith('.')) return t === extension;
            // Handle wildcards like image/*
            if (t.endsWith('/*')) {
                const baseType = t.slice(0, -2);
                return fileType.startsWith(baseType);
            }
            return fileType === t;
        });

        if (!isValid) {
            const prettyTypes = acceptedFileTypes
                .replace(/application\//g, '')
                .replace(/image\//g, '')
                .replace(/vnd.openxmlformats-officedocument./g, '')
                .replace(/\./g, '')
                .toUpperCase()
                .split(',')
                .join(', ');
            
            return `File "${file.name}" has an unsupported format (${extension}). Allowed formats: ${prettyTypes}`;
        }
    }
    return null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setValidationError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFiles = (newFiles: File[]) => {
    // 1. Validation Pass
    const validFiles: File[] = [];
    let errorMsg = null;

    for (const file of newFiles) {
        const error = validateFile(file);
        if (error) {
            errorMsg = error; // Capture the first error
            break; 
        }
        validFiles.push(file);
    }

    if (errorMsg) {
        setValidationError(errorMsg);
        return; // Stop processing if any file is invalid
    }

    if (validFiles.length === 0) return;

    // 2. Limit check (Multiple vs Single)
    const filesToProcess = multiple ? validFiles : [validFiles[0]];
    
    // 3. Process
    const newProgressEntries: FileProgress[] = filesToProcess.map(file => ({
      file,
      progress: 0,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading'
    }));

    setFilesProgress(prev => multiple ? [...prev, ...newProgressEntries] : newProgressEntries);

    // Simulate upload for each file
    newProgressEntries.forEach(entry => {
      simulateUpload(entry.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 10; 
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFilesProgress(prev => {
          const updated = prev.map(p => 
            p.id === fileId ? { ...p, progress: 100, status: 'completed' as const } : p
          );
          
          const currentFile = updated.find(p => p.id === fileId);
          if (currentFile && currentFile.status === 'completed') {
             setTimeout(() => {
                onFilesSelected([currentFile.file]);
                 setFilesProgress(prev => prev.filter(p => p.id !== fileId));
             }, 500);
          }
          return updated;
        });
      } else {
        setFilesProgress(prev => 
          prev.map(p => p.id === fileId ? { ...p, progress } : p)
        );
      }
    }, 150);
  };

  return (
    <div className="w-full">
      <div
        className={`relative flex flex-col items-center justify-center w-full h-64 sm:h-80 rounded-xl border-2 border-dashed transition-all duration-200 ease-in-out cursor-pointer overflow-hidden
          ${isDragging 
            ? 'border-brand-500 bg-brand-50 scale-[1.01] shadow-lg' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-brand-400'
          }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={acceptedFileTypes}
          multiple={multiple}
          onChange={handleFileInput}
        />
        
        <div className="z-10 flex flex-col items-center pointer-events-none p-6 text-center">
          <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-brand-100 text-brand-600' : 'bg-brand-600 text-white'}`}>
             <UploadCloud size={48} />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">
            {title}
          </h3>
          <p className="text-gray-500 mb-6">or</p>
          <button className="bg-brand-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-brand-700 transition-transform transform active:scale-95 pointer-events-auto">
            {buttonText}
          </button>
        </div>

        {/* Validation Error Overlay */}
        {validationError && (
             <div className="absolute inset-x-4 bottom-4 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 z-20">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <AlertCircle size={18} />
                    {validationError}
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); setValidationError(null); }}
                    className="text-red-500 hover:text-red-800 p-1"
                >
                    <X size={16} />
                </button>
             </div>
        )}
      </div>

      {/* Progress Bars for Uploading Files */}
      {filesProgress.length > 0 && (
        <div className="mt-6 space-y-3 w-full max-w-lg mx-auto">
          {filesProgress.map((fileProg) => (
            <div key={fileProg.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
               <div className="bg-brand-50 p-2 rounded-lg text-brand-500">
                  <FileIcon size={24} />
               </div>
               <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-sm font-medium text-gray-700 truncate block max-w-[200px]">{fileProg.file.name}</span>
                     <span className="text-xs text-gray-500">{Math.round(fileProg.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                     <div 
                        className="bg-brand-500 h-1.5 rounded-full transition-all duration-100 ease-out"
                        style={{ width: `${fileProg.progress}%` }}
                     ></div>
                  </div>
               </div>
               <div className="text-gray-400">
                  {fileProg.status === 'completed' ? (
                      <CheckCircle size={20} className="text-green-500" />
                  ) : (
                      <Loader2 size={20} className="animate-spin" />
                  )}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;