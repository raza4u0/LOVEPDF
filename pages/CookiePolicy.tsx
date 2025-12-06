import React from 'react';
import { Cookie, Info, Shield, CheckCircle } from 'lucide-react';

const CookiePolicy: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50 border-b border-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 bg-red-100 text-red-600 rounded-full mb-6">
             <Cookie size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Cookie Policy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We believe in being transparent about how we use your data. This policy explains what cookies are and how we use them.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-lg text-gray-600">
        
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Info className="text-red-500" size={24} /> 
                What are cookies?
            </h2>
            <p>
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.
            </p>
            <p>
                In addition to traditional cookies, we also use local storage in your browser. This allows us to store data locally on your device to enable features like saving your preferences or temporarily holding files during processing without uploading them to a server.
            </p>
        </div>

        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Shield className="text-red-500" size={24} /> 
                How we use cookies
            </h2>
            <p className="mb-4">
                LOVEPDF uses cookies and local storage for the following purposes:
            </p>
            <ul className="space-y-4 list-none pl-0">
                <li className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                    <CheckCircle className="text-green-500 shrink-0 mt-1" size={20} />
                    <div>
                        <strong className="text-gray-900 block">Strictly Necessary</strong>
                        <span className="text-sm">These are essential for the website to function properly. They include, for example, the ability to process your files securely within the browser session.</span>
                    </div>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                    <CheckCircle className="text-green-500 shrink-0 mt-1" size={20} />
                    <div>
                        <strong className="text-gray-900 block">Performance & Analytics</strong>
                        <span className="text-sm">We may use anonymized analytics to understand how users interact with our tools, helping us improve speed and usability.</span>
                    </div>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                    <CheckCircle className="text-green-500 shrink-0 mt-1" size={20} />
                    <div>
                        <strong className="text-gray-900 block">Functional</strong>
                        <span className="text-sm">These allow the website to remember choices you make (such as your preferred language or recent tool settings) to provide a more personalized experience.</span>
                    </div>
                </li>
            </ul>
        </div>

        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
            <p>
                Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience, since it will no longer be personalized to you. It may also stop you from saving customized settings like login information.
            </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-blue-900 mb-2">Questions?</h3>
            <p className="text-blue-800 text-sm mb-4">
                If you have any questions about our use of cookies or other technologies, please email us.
            </p>
             <a href="mailto:privacy@lovepdf.com" className="text-blue-600 font-semibold hover:underline">
                privacy@lovepdf.com
            </a>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
