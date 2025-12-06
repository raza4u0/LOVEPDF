import React from 'react';
import { Newspaper, Download, Mail, Image, Palette, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Press: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 bg-red-500/20 text-red-500 rounded-full mb-6 border border-red-500/30">
             <Newspaper size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Press & Media
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Welcome to the LOVEPDF newsroom. Here you'll find our latest news, brand assets, and resources for journalists and content creators.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column: Contact & About */}
            <div className="lg:col-span-1 space-y-8">
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Mail size={20} className="text-red-600" /> Media Contact
                    </h3>
                    <p className="text-gray-600 mb-6 text-sm">
                        For press inquiries, interviews, or additional information, please contact our PR team.
                    </p>
                    <a href="mailto:raza4u0@gmail.com" className="text-red-600 font-bold hover:underline text-lg">
                        raza4u0@gmail.com
                    </a>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">Boilerplate</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        LOVEPDF is a leading online PDF tool suite providing simple, secure, and free document management solutions. Founded with the mission to make PDF editing accessible to everyone, LOVEPDF offers robust features like merging, splitting, compressing, and AI-powered analysis directly in the browser.
                    </p>
                </div>
            </div>

            {/* Right Column: Assets & News */}
            <div className="lg:col-span-2 space-y-12">
                
                {/* Brand Assets */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Palette className="text-gray-400" /> Brand Assets
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <div className="bg-gray-100 p-8 rounded-lg mb-4 w-full flex items-center justify-center">
                                <span className="font-bold text-2xl tracking-tight text-gray-900">
                                    LOVE<span className="text-red-500">PDF</span>
                                </span>
                            </div>
                            <h4 className="font-bold text-gray-900">Official Logo</h4>
                            <p className="text-sm text-gray-500 mb-4">PNG, SVG, and EPS formats.</p>
                            <button className="text-red-600 font-medium text-sm flex items-center gap-1 hover:underline">
                                <Download size={16} /> Download Pack
                            </button>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                             <div className="bg-gray-100 p-8 rounded-lg mb-4 w-full flex items-center justify-center gap-4">
                                <div className="w-12 h-12 bg-red-600 rounded-full shadow-sm" title="#DC2626"></div>
                                <div className="w-12 h-12 bg-gray-900 rounded-full shadow-sm" title="#111827"></div>
                                <div className="w-12 h-12 bg-white border border-gray-200 rounded-full shadow-sm" title="#FFFFFF"></div>
                            </div>
                            <h4 className="font-bold text-gray-900">Brand Colors</h4>
                            <p className="text-sm text-gray-500 mb-4">Primary Red, Slate, and White.</p>
                            <button className="text-red-600 font-medium text-sm flex items-center gap-1 hover:underline">
                                <Download size={16} /> Download Palette
                            </button>
                        </div>
                    </div>
                </section>

                <div className="border-t border-gray-200 my-8"></div>

                {/* Latest News */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Newspaper className="text-gray-400" /> Latest News
                    </h2>
                    <div className="space-y-6">
                        
                        {/* News Item 1 */}
                        <div className="group flex flex-col md:flex-row gap-6 items-start hover:bg-gray-50 p-4 rounded-xl transition-colors -mx-4">
                            <div className="w-full md:w-48 h-32 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-indigo-600 font-bold">AI Launch</span>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">October 24, 2023</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                                    LOVEPDF Launches Gemini-Powered AI Assistant
                                </h3>
                                <p className="text-gray-600 mb-3 text-sm line-clamp-2">
                                    We are thrilled to announce the integration of Google's Gemini 2.5 Flash model, bringing conversational document analysis to our users for free.
                                </p>
                                <a href="#" className="inline-flex items-center text-red-600 font-medium text-sm hover:underline">
                                    Read Press Release <ArrowRight size={14} className="ml-1" />
                                </a>
                            </div>
                        </div>

                         {/* News Item 2 */}
                        <div className="group flex flex-col md:flex-row gap-6 items-start hover:bg-gray-50 p-4 rounded-xl transition-colors -mx-4">
                            <div className="w-full md:w-48 h-32 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-green-600 font-bold">Milestone</span>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">August 15, 2023</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                                    Celebrating 1 Million Documents Processed
                                </h3>
                                <p className="text-gray-600 mb-3 text-sm line-clamp-2">
                                    A huge milestone for our community. We've helped users process over one million PDFs securely in their browsers without any cost.
                                </p>
                                <a href="#" className="inline-flex items-center text-red-600 font-medium text-sm hover:underline">
                                    Read Blog Post <ArrowRight size={14} className="ml-1" />
                                </a>
                            </div>
                        </div>

                         {/* News Item 3 */}
                        <div className="group flex flex-col md:flex-row gap-6 items-start hover:bg-gray-50 p-4 rounded-xl transition-colors -mx-4">
                            <div className="w-full md:w-48 h-32 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-blue-600 font-bold">Security</span>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">June 01, 2023</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                                    Enhanced Encryption Standards Implemented
                                </h3>
                                <p className="text-gray-600 mb-3 text-sm line-clamp-2">
                                    We've upgraded our core processing engine to support AES-256 encryption by default for all protection tools.
                                </p>
                                <a href="#" className="inline-flex items-center text-red-600 font-medium text-sm hover:underline">
                                    Learn More <ArrowRight size={14} className="ml-1" />
                                </a>
                            </div>
                        </div>

                    </div>
                </section>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Press;