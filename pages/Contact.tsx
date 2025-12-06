import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, Loader2, CheckCircle, AlertCircle, X, MessageSquare } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Support',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Basic validation simulation
      if (!formData.email.includes('@')) {
          throw new Error("Please enter a valid email address.");
      }

      // Construct mailto link
      const mailtoLink = `mailto:raza4u0@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`;
      
      // Open email client
      window.location.href = mailtoLink;

      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: 'Support', message: '' });
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Have a question, feedback, or need support? We're here to help you with your PDF needs.
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Side */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Get in touch</h3>
                    
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-red-50 p-3 rounded-lg text-red-600">
                                <Mail size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Email</h4>
                                <p className="text-gray-500 text-sm mt-1">Our friendly team is here to help.</p>
                                <a href="mailto:raza4u0@gmail.com" className="text-red-600 font-medium text-sm mt-1 block hover:underline">raza4u0@gmail.com</a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-red-50 p-3 rounded-lg text-red-600">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Office</h4>
                                <p className="text-gray-500 text-sm mt-1">Come say hello at our office HQ.</p>
                                <p className="text-gray-600 text-sm mt-1">100 PDF Street, San Francisco, CA 94103</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-red-50 p-3 rounded-lg text-red-600">
                                <Phone size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Phone</h4>
                                <p className="text-gray-500 text-sm mt-1">Mon-Fri from 8am to 5pm.</p>
                                <a href="tel:+15550000000" className="text-red-600 font-medium text-sm mt-1 block hover:underline">+1 (555) 000-0000</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-900 p-8 rounded-xl shadow-lg text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-2">Did you know?</h3>
                        <p className="text-indigo-100 text-sm mb-4">
                            You can chat directly with your PDF documents using our new AI Assistant.
                        </p>
                        <a href="#/ai-chat" className="inline-block bg-white text-indigo-900 text-sm font-bold px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors">
                            Try AI Assistant
                        </a>
                    </div>
                    <MessageSquare className="absolute -bottom-4 -right-4 text-indigo-800 opacity-50" size={120} />
                </div>
            </div>

            {/* Form Side */}
            <div className="lg:col-span-2">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    {isSuccess ? (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center p-4 bg-green-100 text-green-600 rounded-full mb-6">
                                <CheckCircle size={48} />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Email Created!</h2>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                We've opened your email client with your message. Please verify the details and hit send.
                            </p>
                            <button 
                                onClick={() => setIsSuccess(false)}
                                className="text-red-600 font-medium hover:underline"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {errorMessage && (
                                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 border border-red-200">
                                    <AlertCircle className="shrink-0 mt-0.5" size={20} />
                                    <div className="flex-grow text-sm font-medium">{errorMessage}</div>
                                    <button type="button" onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <select
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white"
                                >
                                    <option value="Support">Technical Support</option>
                                    <option value="Billing">Billing Inquiry</option>
                                    <option value="Feature">Feature Request</option>
                                    <option value="Feedback">General Feedback</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={6}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
                                    placeholder="How can we help you today?"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-red-700 transition-all flex items-center justify-center gap-2
                                    ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}
                                `}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        <span>Drafting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        <span>Send Message</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;