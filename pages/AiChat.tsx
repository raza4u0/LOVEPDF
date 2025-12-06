import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, FileText, Loader2, Bot, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { fileToBase64, analyzePdf } from '../services/geminiService';
import { ChatMessage, UploadedFile } from '../types';

const AiChat: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [base64Pdf, setBase64Pdf] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelected = async (newFiles: File[]) => {
    if (newFiles.length > 0) {
      const selectedFile = newFiles[0];
      setFile({
        id: '1',
        file: selectedFile
      });

      // Prepare file for API immediately
      try {
        const b64 = await fileToBase64(selectedFile);
        setBase64Pdf(b64);
        
        // Trigger initial summary with a visible user message to establish context
        const initialPrompt = "Provide a short summary of this document and list 3 key takeaways.";
        
        // Add User Message (Summary Request)
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: initialPrompt,
            timestamp: Date.now()
        };
        setMessages([userMsg]);
        setIsLoading(true);
        
        const summary = await analyzePdf(b64, initialPrompt, []);
        
        // Add Model Message (Response)
        const modelMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: summary || "I've read the document. What would you like to know?",
            timestamp: Date.now() + 1
        };
        setMessages(prev => [...prev, modelMsg]);
        setIsLoading(false);

      } catch (error) {
        console.error(error);
        addMessage('model', "Sorry, I couldn't read that PDF. Please try another one.");
        setIsLoading(false);
      }
    }
  };

  const addMessage = (role: 'user' | 'model', text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      role,
      text,
      timestamp: Date.now()
    }]);
  };

  const handleSend = async () => {
    if (!input.trim() || !base64Pdf || isLoading) return;

    const userText = input;
    setInput('');
    addMessage('user', userText);
    setIsLoading(true);

    try {
      // Map current messages to history format (excluding timestamps/IDs)
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      
      const response = await analyzePdf(base64Pdf, userText, history);
      addMessage('model', response || "I couldn't generate a response.");
    } catch (error) {
      addMessage('model', "Sorry, something went wrong with the AI request.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-3">
          <Link to="/" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-1.5 rounded-md text-indigo-600">
                <Sparkles size={18} />
            </div>
            <h1 className="font-bold text-gray-900">AI Assistant</h1>
          </div>
        </div>
        {file && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                <FileText size={14} />
                <span className="truncate max-w-[150px] sm:max-w-[300px]">{file.file.name}</span>
                <button 
                    onClick={() => {
                        setFile(null);
                        setMessages([]);
                        setBase64Pdf(null);
                    }} 
                    className="ml-2 hover:text-red-500"
                >
                    Change
                </button>
            </div>
        )}
      </div>

      {/* Main Content */}
      {!file ? (
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="max-w-xl w-full">
            <FileUploader 
                onFilesSelected={handleFileSelected} 
                multiple={false}
                title="Chat with your PDF"
                buttonText="Select PDF to analyze"
            />
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                    <div className="bg-indigo-50 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText size={20} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Summarize</h3>
                    <p className="text-sm text-gray-500">Get a quick overview of long documents instantly.</p>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                    <div className="bg-indigo-50 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bot size={20} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Ask Questions</h3>
                    <p className="text-sm text-gray-500">Find specific information without searching.</p>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                    <div className="bg-indigo-50 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Sparkles size={20} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Extract Data</h3>
                    <p className="text-sm text-gray-500">Pull out tables, dates, and key figures easily.</p>
                 </div>
            </div>
          </div>
        </div>
      ) : (
        <>
            {/* Chat Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                <div className="max-w-3xl mx-auto w-full space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                                ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-indigo-100 text-indigo-600'}
                            `}>
                                {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                            </div>
                            <div className={`rounded-2xl px-5 py-3.5 max-w-[80%] leading-relaxed shadow-sm
                                ${msg.role === 'user' 
                                    ? 'bg-gray-900 text-white rounded-tr-none' 
                                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}
                            `}>
                                <div className="whitespace-pre-wrap">{msg.text}</div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4">
                             <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                                <Sparkles size={16} />
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-3.5 shadow-sm">
                                <div className="flex gap-1.5 items-center h-6">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4 shrink-0">
                <div className="max-w-3xl mx-auto w-full relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask something about your PDF..."
                        disabled={isLoading}
                        className="w-full pl-5 pr-14 py-4 bg-gray-50 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                    >
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                </div>
                 <p className="text-center text-xs text-gray-400 mt-2">
                    AI can make mistakes. Verify important information.
                </p>
            </div>
        </>
      )}
    </div>
  );
};

export default AiChat;
