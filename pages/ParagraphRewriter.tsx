import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Copy, Check, Sparkles, AlertCircle, X, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { rewriteText } from '../services/geminiService';

const TONES = [
  'Standard',
  'Professional',
  'Casual',
  'Academic',
  'Creative',
  'Persuasive',
  'Fluent'
];

const MODES = [
  'Standard',
  'Shorten',
  'Expand',
  'Simplify'
];

const ParagraphRewriter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [tone, setTone] = useState('Standard');
  const [mode, setMode] = useState('Standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRewrite = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setOutput('');

    try {
      const result = await rewriteText(input, tone, mode);
      setOutput(result);
    } catch (error: any) {
      console.error(error);
      setErrorMessage("Failed to rewrite text. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-16 z-40">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-brand-100 p-1.5 rounded-md text-brand-600">
              <RefreshCw size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Paragraph Rewriter</h1>
          </div>
        </div>
      </div>

      <div className="flex-grow p-4 sm:p-8 max-w-6xl mx-auto w-full flex flex-col">
        
        {/* Error Banner */}
        {errorMessage && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3 w-full border border-red-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                <div className="flex-grow text-sm font-medium">{errorMessage}</div>
                <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
                    <X size={16} />
                </button>
            </div>
        )}

        {/* Controls */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
           <div className="flex flex-wrap gap-4">
               <div>
                   <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Tone</label>
                   <select 
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-40 p-2.5"
                   >
                       {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
               </div>
               <div>
                   <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Mode</label>
                   <select 
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-40 p-2.5"
                   >
                       {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                   </select>
               </div>
           </div>

           <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
               <button
                  onClick={handleClear}
                  className="px-4 py-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
               >
                   <RotateCcw size={16} /> Clear
               </button>
               <button 
                    onClick={handleRewrite}
                    disabled={!input.trim() || isProcessing}
                    className={`px-6 py-2.5 rounded-lg font-bold text-white shadow-md flex items-center gap-2 transition-all
                        ${!input.trim() || isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 hover:scale-105'}
                    `}
                >
                    {isProcessing ? (
                        <RefreshCw size={18} className="animate-spin" />
                    ) : (
                        <Sparkles size={18} />
                    )}
                    {isProcessing ? 'Rewriting...' : 'Rewrite'}
                </button>
           </div>
        </div>

        {/* Editor Area */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[500px]">
            
            {/* Input */}
            <div className="flex flex-col h-full">
                <div className="bg-white rounded-t-xl border border-gray-200 border-b-0 p-3 bg-gray-50 flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-600">Original Text</span>
                    <span className="text-xs text-gray-400">{input.length} chars</span>
                </div>
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste or type your text here..."
                    className="w-full flex-grow p-4 border border-gray-200 rounded-b-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none shadow-sm text-gray-700 text-lg leading-relaxed"
                />
            </div>

            {/* Output */}
            <div className="flex flex-col h-full">
                <div className="bg-white rounded-t-xl border border-gray-200 border-b-0 p-3 bg-brand-50 flex justify-between items-center">
                    <span className="text-sm font-semibold text-brand-700">Rewritten Text</span>
                    <button 
                        onClick={handleCopy}
                        disabled={!output}
                        className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${isCopied ? 'text-green-600 bg-green-100' : 'text-gray-500 hover:text-brand-600 hover:bg-white'}`}
                    >
                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                        {isCopied ? 'Copied' : 'Copy'}
                    </button>
                </div>
                <div className="relative w-full flex-grow">
                    <textarea 
                        readOnly
                        value={output}
                        placeholder="Your rewritten text will appear here..."
                        className="w-full h-full p-4 border border-gray-200 rounded-b-xl bg-gray-50 outline-none resize-none shadow-sm text-gray-800 text-lg leading-relaxed"
                    />
                    {isProcessing && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-b-xl">
                            <div className="flex flex-col items-center gap-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                                <span className="text-sm font-medium text-brand-700">AI is thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ParagraphRewriter;