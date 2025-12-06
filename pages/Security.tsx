import React from 'react';
import { Shield, Lock, FileCheck, Server, Globe, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Security: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 bg-red-500/20 text-red-500 rounded-full mb-6 border border-red-500/30">
             <Shield size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Your Security is our Priority
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We handle your documents with the utmost care. Learn how we protect your data, privacy, and information at every step.
          </p>
        </div>
      </div>

      {/* Main Assurance Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Client-Side Processing</h2>
                    <div className="prose text-gray-600 leading-relaxed">
                        <p className="mb-4">
                            Unlike other online PDF tools, LOVEPDF is architected to perform the majority of file operations <strong>directly in your browser</strong>.
                        </p>
                        <p className="mb-4">
                            This means that for tools like Merge, Split, Compress, and Organize, your files <strong>never leave your device</strong>. The processing happens locally using your computer's power, ensuring that your sensitive documents are never uploaded to a remote server.
                        </p>
                        <div className="flex items-center gap-2 text-green-600 font-semibold bg-green-50 p-4 rounded-lg border border-green-100 mt-6">
                            <CheckCircle size={20} />
                            <span>Zero Server Uploads for Standard Tools</span>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Server size={20} className="text-indigo-600" />
                        How it works
                    </h3>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 font-bold text-gray-500">1</div>
                            <div>
                                <h4 className="font-semibold text-gray-800">Select File</h4>
                                <p className="text-sm text-gray-500">You select a file from your local storage.</p>
                            </div>
                        </div>
                        <div className="w-0.5 h-6 bg-gray-200 ml-4"></div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 font-bold text-gray-500">2</div>
                            <div>
                                <h4 className="font-semibold text-gray-800">Browser Processing</h4>
                                <p className="text-sm text-gray-500">Our code runs in your browser to modify the file.</p>
                            </div>
                        </div>
                        <div className="w-0.5 h-6 bg-gray-200 ml-4"></div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 border border-green-200 flex items-center justify-center shrink-0 font-bold">3</div>
                            <div>
                                <h4 className="font-semibold text-gray-800">Save & Download</h4>
                                <p className="text-sm text-gray-500">The result is saved directly to your Downloads folder.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Security Features Grid */}
      <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 border-y border-gray-100">
          <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Comprehensive Protection</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                          <Lock size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">HTTPS Encryption</h3>
                      <p className="text-gray-600 text-sm">
                          All connections to our website are secured using 256-bit SSL encryption (HTTPS). Even when just loading the page, your connection is secure.
                      </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center text-orange-600 mb-4">
                          <Globe size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">GDPR Compliant</h3>
                      <p className="text-gray-600 text-sm">
                          We adhere to strict European General Data Protection Regulation (GDPR) standards for data handling and user privacy.
                      </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center text-red-600 mb-4">
                          <Trash2 size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Auto-Deletion</h3>
                      <p className="text-gray-600 text-sm">
                          For tools that require server processing (like AI Chat), files are stored temporarily and automatically deleted after processing.
                      </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                          <FileCheck size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">ISO 27001 Certified</h3>
                      <p className="text-gray-600 text-sm">
                          Our infrastructure follows international standards for information security management systems (ISMS).
                      </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center text-teal-600 mb-4">
                          <AlertTriangle size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Incident Response</h3>
                      <p className="text-gray-600 text-sm">
                          We have a dedicated security team and automated systems monitoring for any suspicious activity or potential breaches 24/7.
                      </p>
                  </div>

                   <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center text-gray-600 mb-4">
                          <Shield size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Ownership</h3>
                      <p className="text-gray-600 text-sm">
                          You retain full ownership of any files you process. We do not analyze, scan, or copy your content for any purpose other than the requested task.
                      </p>
                  </div>
              </div>
          </div>
      </div>

      {/* FAQ / Info */}
      <div className="max-w-3xl mx-auto py-16 px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
              <div className="border-b border-gray-100 pb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Do you keep a copy of my processed files?</h3>
                  <p className="text-gray-600 text-sm">
                      No. For client-side tools (Merge, Split, etc.), files never leave your computer. For server-side tools (like AI), files are deleted immediately after the session ends or after a short timeout period.
                  </p>
              </div>

              <div className="border-b border-gray-100 pb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Is it safe to upload documents with personal information?</h3>
                  <p className="text-gray-600 text-sm">
                      Yes. We use end-to-end encryption for transfers, and our automated systems process files without human intervention. However, we recommend using our local processing tools for extremely sensitive data for absolute peace of mind.
                  </p>
              </div>

               <div className="border-b border-gray-100 pb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Can I password protect my files?</h3>
                  <p className="text-gray-600 text-sm">
                      Absolutely. Use our <Link to="/protect-pdf" className="text-red-600 hover:underline">Protect PDF</Link> tool to encrypt your documents with AES-128 or AES-256 encryption before sharing them.
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Security;
