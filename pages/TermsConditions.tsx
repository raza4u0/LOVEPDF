import React, { useState } from 'react';
import { FileText, AlertTriangle, Scale, Copyright } from 'lucide-react';

const TermsConditions: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50 border-b border-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 bg-red-100 text-red-600 rounded-full mb-6">
             <FileText size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Terms & Conditions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Please read these terms and conditions carefully before using our service.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-lg text-gray-600">
        
        <p className="lead">
            Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p>
                These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and LOVEPDF ("we," "us" or "our"), concerning your access to and use of the LOVEPDF website. By accessing the site, you acknowledge that you have read, understood, and agree to be bound by all of these Terms and Conditions.
            </p>
        </div>

        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Intellectual Property Rights</h2>
            <p>
                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
            </p>
        </div>

        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Copyright className="text-red-500" size={24} /> 
                3. User Representations
            </h2>
            <p>By using the Site, you represent and warrant that:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>You have the legal capacity and you agree to comply with these Terms and Conditions.</li>
                <li>You will not access the Site through automated or non-human means, whether through a bot, script or otherwise.</li>
                <li>You will not use the Site for any illegal or unauthorized purpose.</li>
                <li>Your use of the Site will not violate any applicable law or regulation.</li>
            </ul>
        </div>

        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Prohibited Activities</h2>
            <p>
                You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
            </p>
        </div>

        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={24} /> 
                5. Limitations of Liability
            </h2>
            <p>
                In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.
            </p>
            <p>
                We do not guarantee that the result of processed files will be accurate or error-free. You are solely responsible for verifying the output of any tools used on this site.
            </p>
        </div>

        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Scale className="text-red-500" size={24} /> 
                6. Governing Law
            </h2>
            <p>
                These terms shall be governed by and defined following the laws of the jurisdiction in which LOVEPDF is established. LOVEPDF and yourself irrevocably consent that the courts of that jurisdiction shall have exclusive authority to resolve any dispute which may arise in connection with these terms.
            </p>
        </div>

        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
            <p>
                In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: <a href="mailto:raza4u0@gmail.com" className="text-red-600 hover:underline">raza4u0@gmail.com</a>
            </p>
        </div>

      </div>
    </div>
  );
};

export default TermsConditions;