import React from 'react';
import { Heart, Shield, Zap, Globe, Users, Coffee, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50 border-b border-gray-100 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 bg-red-100 text-red-600 rounded-full mb-6">
             <Heart size={32} fill="currentColor" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            We make PDF easy.
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            LOVEPDF was born from a simple idea: document tools should be accessible, powerful, and free for everyone. No subscriptions, no software to install.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-4xl font-bold text-red-600 mb-2">100%</div>
                <div className="text-gray-600 font-medium">Free to Use</div>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-4xl font-bold text-red-600 mb-2">Secure</div>
                <div className="text-gray-600 font-medium">Client-side Processing</div>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-4xl font-bold text-red-600 mb-2">20+</div>
                <div className="text-gray-600 font-medium">PDF Tools</div>
            </div>
        </div>
      </div>

      {/* Mission & Values */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
                <p className="text-gray-600">Built with passion for efficiency and simplicity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="flex flex-col items-start p-6 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600 mb-4">
                        <Shield size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Privacy First</h3>
                    <p className="text-gray-600 leading-relaxed">
                        We believe your documents belong to you. That's why our tools process files directly in your browser whenever possible, ensuring your data never leaves your device unnecessarily.
                    </p>
                </div>

                <div className="flex flex-col items-start p-6 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="bg-orange-100 p-3 rounded-lg text-orange-600 mb-4">
                        <Zap size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Time is money. We optimize every tool for speed, using the latest web technologies to deliver results in seconds, not minutes.
                    </p>
                </div>

                <div className="flex flex-col items-start p-6 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="bg-green-100 p-3 rounded-lg text-green-600 mb-4">
                        <Globe size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Accessible to All</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Technology should bridge gaps, not create them. We strive to keep our core features free and easy to use on any device, anywhere in the world.
                    </p>
                </div>

                 <div className="flex flex-col items-start p-6 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="bg-pink-100 p-3 rounded-lg text-pink-600 mb-4">
                        <Users size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">User Focused</h3>
                    <p className="text-gray-600 leading-relaxed">
                        We listen. Every feature we build comes from user feedback. Whether it's adding a dark mode or a new conversion type, we build for you.
                    </p>
                </div>

                <div className="flex flex-col items-start p-6 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600 mb-4">
                        <Coffee size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Simplicity</h3>
                    <p className="text-gray-600 leading-relaxed">
                        PDFs can be complicated; handling them shouldn't be. We strip away the clutter to provide a clean, intuitive interface that just works.
                    </p>
                </div>

                <div className="flex flex-col items-start p-6 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600 mb-4">
                        <Heart size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Made with Love</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Small details matter. From the smooth animations to the helpful tooltips, we craft our software with care and attention to detail.
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get started?</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                  Join millions of users who rely on LOVEPDF for their daily document needs. No registration required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/" className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-2">
                      Explore All Tools <ArrowRight size={20} />
                  </Link>
                  <Link to="/contact" className="bg-transparent border border-gray-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors">
                      Contact Support
                  </Link>
              </div>
          </div>
      </div>
    </div>
  );
};

export default About;
