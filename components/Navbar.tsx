import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, Palette, Search, ChevronRight, Files, Scissors, Minimize2, RefreshCw, Sparkles } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { tools } from '../data/tools';
import { ToolType } from '../types';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  
  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const themes = [
    { id: 'red', name: 'Original', color: 'bg-red-500' },
    { id: 'blue', name: 'Business', color: 'bg-blue-500' },
    { id: 'purple', name: 'Creative', color: 'bg-purple-500' },
    { id: 'green', name: 'Nature', color: 'bg-green-500' },
    { id: 'orange', name: 'Warm', color: 'bg-orange-500' },
  ] as const;

  // Filter tools based on query
  const filteredTools = searchQuery.trim() === '' ? [] : tools.filter(tool => 
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5); // Limit results

  // Helper to get link (duplicate logic from Home, should be shared utility in future)
  const getToolLink = (id: string) => {
    if (id === ToolType.EDIT_PDF) return '/edit-pdf';
    if (id === ToolType.SIGN_PDF) return '/sign-pdf';
    if (id === ToolType.WATERMARK_PDF) return '/watermark-pdf';
    if (id === ToolType.ROTATE_PDF) return '/rotate-pdf';
    if (id === ToolType.PROTECT_PDF) return '/protect-pdf';
    if (id === ToolType.UNLOCK_PDF) return '/unlock-pdf';
    if (id === ToolType.ORGANIZE_PDF) return '/organize-pdf';
    if (id === ToolType.ADD_PAGE_NUMBERS) return '/page-numbers';
    if (id === ToolType.REPAIR_PDF) return '/repair-pdf';
    if (id === ToolType.AI_CHAT) return '/ai-chat';
    if (id === ToolType.JPG_TO_PDF) return '/jpg-to-pdf';
    if (id === ToolType.PDF_TO_JPG) return '/pdf-to-jpg';
    if (id === ToolType.PDF_TO_POWERPOINT) return '/pdf-to-powerpoint';
    if (id === ToolType.PDF_TO_WORD) return '/pdf-to-word';
    if (id === ToolType.PDF_TO_EXCEL) return '/pdf-to-excel';
    if (id === ToolType.WORD_TO_PDF) return '/word-to-pdf';
    if (id === ToolType.POWERPOINT_TO_PDF) return '/powerpoint-to-pdf';
    if (id === ToolType.OCR_PDF) return '/ocr-pdf';
    if (id === ToolType.PDF_TO_TEXT) return '/pdf-to-text';
    if (id === ToolType.PDF_TO_HTML) return '/pdf-to-html';
    if (id === ToolType.PDF_TO_GIF) return '/pdf-to-gif';
    if (id === ToolType.FLATTEN_PDF) return '/flatten-pdf';
    if (id === ToolType.PARAGRAPH_REWRITER) return '/paragraph-rewriter';
    if (id === ToolType.SCAN_PDF) return '/scan-pdf';
    if (id === ToolType.CROP_PDF) return '/crop-pdf';
    if (id === ToolType.GRAYSCALE_PDF) return '/grayscale-pdf';
    return `/${id.split('-')[0]}`;
  };

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
        searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close search on navigation
  useEffect(() => {
      setIsSearchOpen(false);
      setSearchQuery('');
  }, [location]);

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-4 lg:gap-8 flex-grow">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group mr-2">
              <div className="bg-brand-600 text-white p-1.5 rounded-md group-hover:bg-brand-700 transition-colors">
                 <Heart size={24} fill="currentColor" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:block">
                LOVE<span className="text-brand-600">PDF</span>
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-2 items-center">
              <Link
                to="/merge"
                className="text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Files size={18} />
                Merge
              </Link>
              <Link
                to="/split"
                className="text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Scissors size={18} />
                Split
              </Link>
              <Link
                to="/compress"
                className="text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Minimize2 size={18} />
                Compress
              </Link>
              <Link
                to="/paragraph-rewriter"
                className="text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Rewriter
              </Link>
               <Link
                to="/ai-chat"
                className="text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Sparkles size={18} />
                AI Assistant
              </Link>
            </div>

            {/* Search Bar */}
            <div ref={searchRef} className="relative hidden md:block flex-grow max-w-md ml-auto mr-4">
                <div 
                    className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-full' : 'w-full'}`}
                >
                    <div className="relative w-full">
                        <input 
                            ref={searchInputRef}
                            type="text" 
                            placeholder="Search tools..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchOpen(true)}
                            className={`pl-10 pr-4 py-2 rounded-full border text-sm w-full transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${isSearchOpen ? 'bg-white border-brand-300 shadow-md' : 'bg-gray-100/80 border-transparent hover:bg-white hover:border-gray-300 hover:shadow-sm'}`}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Dropdown */}
                {isSearchOpen && searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                        {filteredTools.length > 0 ? (
                            <div className="py-2">
                                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Tools</div>
                                {filteredTools.map(tool => (
                                    <Link 
                                        key={tool.id} 
                                        to={getToolLink(tool.id)}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className={`p-2 rounded-lg bg-gray-50 ${tool.color}`}>
                                            {React.cloneElement(tool.icon as React.ReactElement, { size: 18 })}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-800">{tool.title}</div>
                                            <div className="text-xs text-gray-500 line-clamp-1">{tool.description}</div>
                                        </div>
                                        <ChevronRight size={16} className="ml-auto text-gray-300" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="px-4 py-6 text-center text-sm text-gray-500">
                                No tools found matching "{searchQuery}"
                            </div>
                        )}
                    </div>
                )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden p-2 text-gray-500 hover:bg-gray-100/80 rounded-full"
            >
                <Search size={22} />
            </button>

            {/* Theme Switcher */}
            <div className="relative hidden sm:block">
              <button 
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
                title="Change Theme"
              >
                <Palette size={20} />
              </button>
              
              {showThemeMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowThemeMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { setTheme(t.id); setShowThemeMenu(false); }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-50 ${theme === t.id ? 'text-brand-600 font-bold' : 'text-gray-700'}`}
                      >
                        <div className={`w-4 h-4 rounded-full ${t.color}`}></div>
                        {t.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (Expanded) */}
        {isSearchOpen && (
            <div className="md:hidden pb-4 px-2">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search tools..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-brand-500 focus:ring-0 rounded-lg text-sm transition-colors shadow-inner"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>
                {/* Mobile Dropdown Results */}
                {searchQuery && (
                    <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-100 max-h-60 overflow-y-auto">
                         {filteredTools.length > 0 ? (
                            filteredTools.map(tool => (
                                <Link 
                                    key={tool.id} 
                                    to={getToolLink(tool.id)}
                                    className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50"
                                    onClick={() => setIsSearchOpen(false)}
                                >
                                    <div className={`text-brand-500`}>
                                        {React.cloneElement(tool.icon as React.ReactElement, { size: 18 })}
                                    </div>
                                    <div className="text-sm font-medium text-gray-800">{tool.title}</div>
                                </Link>
                            ))
                        ) : (
                            <div className="px-4 py-4 text-center text-sm text-gray-500">No tools found</div>
                        )}
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/merge"
              onClick={() => setIsOpen(false)}
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 hover:border-brand-500 flex items-center gap-3"
            >
              <Files size={20} />
              Merge PDF
            </Link>
            <Link
              to="/split"
              onClick={() => setIsOpen(false)}
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 hover:border-brand-500 flex items-center gap-3"
            >
              <Scissors size={20} />
              Split PDF
            </Link>
            <Link
              to="/compress"
              onClick={() => setIsOpen(false)}
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 hover:border-brand-500 flex items-center gap-3"
            >
              <Minimize2 size={20} />
              Compress PDF
            </Link>
            <Link
              to="/paragraph-rewriter"
              onClick={() => setIsOpen(false)}
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 hover:border-brand-500 flex items-center gap-3"
            >
              <RefreshCw size={20} />
              Rewriter
            </Link>
             <Link
              to="/ai-chat"
              onClick={() => setIsOpen(false)}
              className="block pl-3 pr-4 py-2 border-l-4 border-brand-500 text-base font-medium text-brand-600 bg-brand-50 flex items-center gap-3"
            >
              <Sparkles size={20} />
              AI Assistant
            </Link>
            
            <div className="border-t border-gray-100 mt-2 pt-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Theme</p>
              <div className="grid grid-cols-5 gap-2 px-3 pb-2">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`w-8 h-8 rounded-full ${t.color} flex items-center justify-center ${theme === t.id ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                    aria-label={t.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;