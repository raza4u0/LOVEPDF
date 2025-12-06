import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Twitter, Facebook, Linkedin, Instagram, Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white mt-auto border-t border-slate-800">
      {/* Top Section with Links */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 border-b border-slate-800">
        
        {/* Brand Column */}
        <div className="col-span-2 lg:col-span-2 pr-8">
            <Link to="/" className="flex items-center gap-2 mb-4 group w-fit">
                <div className="bg-brand-600 text-white p-1.5 rounded-md group-hover:bg-brand-700 transition-colors">
                    <Heart size={20} fill="currentColor" />
                </div>
                <span className="font-bold text-xl tracking-tight">
                LOVE<span className="text-brand-600">PDF</span>
                </span>
            </Link>
            <p className="text-slate-400 text-sm mb-6 max-w-sm leading-relaxed">
                Your one-stop shop for all PDF operations. Merge, split, compress, convert, and chat with your documents securely directly in your browser.
            </p>
            <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-all" aria-label="Twitter"><Twitter size={18} /></a>
                <a href="#" className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-all" aria-label="Facebook"><Facebook size={18} /></a>
                <a href="#" className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-all" aria-label="LinkedIn"><Linkedin size={18} /></a>
                <a href="#" className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-all" aria-label="Instagram"><Instagram size={18} /></a>
                <a href="#" className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-all" aria-label="GitHub"><Github size={18} /></a>
            </div>
        </div>

        {/* Product Column */}
        <div>
            <h3 className="font-bold text-base mb-4 text-slate-200">Product</h3>
            <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/merge" className="hover:text-brand-400 transition-colors">Merge PDF</Link></li>
                <li><Link to="/split" className="hover:text-brand-400 transition-colors">Split PDF</Link></li>
                <li><Link to="/compress" className="hover:text-brand-400 transition-colors">Compress PDF</Link></li>
                <li><Link to="/edit-pdf" className="hover:text-brand-400 transition-colors">Edit PDF</Link></li>
                <li><Link to="/sign-pdf" className="hover:text-brand-400 transition-colors">Sign PDF</Link></li>
                <li><Link to="/ocr-pdf" className="hover:text-brand-400 transition-colors">OCR PDF</Link></li>
            </ul>
        </div>

        {/* Solutions Column */}
        <div>
            <h3 className="font-bold text-base mb-4 text-slate-200">Solutions</h3>
            <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/ai-chat" className="hover:text-brand-400 transition-colors flex items-center gap-2">AI Assistant <span className="text-[10px] bg-brand-600 text-white px-1.5 py-0.5 rounded font-bold">NEW</span></Link></li>
                <li><Link to="/pdf-to-word" className="hover:text-brand-400 transition-colors">PDF to Word</Link></li>
                <li><Link to="/pdf-to-excel" className="hover:text-brand-400 transition-colors">PDF to Excel</Link></li>
                <li><Link to="/pdf-to-powerpoint" className="hover:text-brand-400 transition-colors">PDF to Powerpoint</Link></li>
            </ul>
        </div>

        {/* Company Column */}
        <div>
            <h3 className="font-bold text-base mb-4 text-slate-200">Company</h3>
            <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/about" className="hover:text-brand-400 transition-colors">About Us</Link></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Careers</a></li>
                <li><Link to="/press" className="hover:text-brand-400 transition-colors">Press</Link></li>
                <li><Link to="/contact" className="hover:text-brand-400 transition-colors">Contact</Link></li>
                <li><Link to="/security" className="hover:text-brand-400 transition-colors">Security</Link></li>
                <li><Link to="/feedback" className="hover:text-brand-400 transition-colors">Feedback</Link></li>
            </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} LOVEPDF. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
              <Link to="/cookies" className="hover:text-white transition-colors">Cookies Policy</Link>
          </div>
      </div>
    </footer>
  );
};

export default Footer;
