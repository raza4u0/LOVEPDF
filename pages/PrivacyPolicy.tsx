import React from 'react';
import { Shield, Eye, Lock, FileText, Server } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50 border-b border-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 bg-red-100 text-red-600 rounded-full mb-6">
             <Shield size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We are committed to protecting your privacy. This policy outlines how we handle your data with transparency and care.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-lg text-gray-600">
        
        <p className="lead">
            Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p>
                Welcome to LOVEPDF ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and use our tools.
            </p>
        </div>

        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="text-red-500" size={24} /> 
                2. Data Collection & Processing
            </h2>
            <p>
                The core philosophy of LOVEPDF is <strong>client-side processing</strong>. This means:
            </p>
            <ul className="list-disc pl-6 space-y-2">
                <li>
                    <strong>Files:</strong> For the majority of our tools (Merge, Split, Compress, etc.), your files are processed directly within your web browser. They are <strong>not</strong> uploaded to our servers.
                </li>
                <li>
                    <strong>AI Tools:</strong> For features that explicitly require server-side intelligence (like our AI Assistant), files are transmitted securely via encryption, processed immediately, and not permanently stored.
                </li>
            </ul>
        </div>

        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="text-red-500" size={24} /> 
                3. Information We Collect
            </h2>
            <p>We may collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Usage Data:</strong> Information on how the Service is accessed and used (e.g., page views, time spent, browser type). This is anonymized.</li>
                <li><strong>Contact Data:</strong> If you contact us via email or support forms, we collect your email address and message content to respond to your inquiry.</li>
            </ul>
        </div>

        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Server className="text-red-500" size={24} /> 
                4. Data Retention
            </h2>
            <p>
                Since most processing happens on your device, we do not retain your files. For any temporary data required for service operation (like AI analysis context), data is retained only for the duration of the session or strictly as necessary to fulfill the request, after which it is permanently deleted.
            </p>
        </div>

        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="text-red-500" size={24} /> 
                5. Security
            </h2>
            <p>
                The security of your data is important to us. We use HTTPS encryption for all website traffic. However, remember that no method of transmission over the Internet is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee its absolute security.
            </p>
        </div>

        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Third-Party Services</h2>
            <p>
                We may employ third-party companies (like Google Gemini API for AI features) to facilitate our Service. These third parties have access to your data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
        </div>

        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
            <p>
                If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:raza4u0@gmail.com" className="text-red-600 hover:underline">raza4u0@gmail.com</a>
            </p>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;