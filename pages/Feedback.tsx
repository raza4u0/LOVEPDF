import React, { useState } from 'react';
import { Star, Send, Loader2, CheckCircle, MessageSquare, ThumbsUp, Users, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Feedback: React.FC = () => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [nps, setNps] = useState<number | null>(null);
  const [userType, setUserType] = useState<string>('');
  const [category, setCategory] = useState<string>('General');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || nps === null) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log({ rating, nps, userType, category, message, email });
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNpsColor = (score: number) => {
      if (score <= 6) return 'hover:bg-red-100 hover:text-red-700 border-red-200';
      if (score <= 8) return 'hover:bg-yellow-100 hover:text-yellow-700 border-yellow-200';
      return 'hover:bg-green-100 hover:text-green-700 border-green-200';
  };

  const getNpsActiveColor = (score: number) => {
      if (score <= 6) return 'bg-red-600 text-white border-red-600';
      if (score <= 8) return 'bg-yellow-500 text-white border-yellow-500';
      return 'bg-green-600 text-white border-green-600';
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {isSuccess ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
              <Heart size={40} fill="currentColor" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Thank You!</h2>
            <p className="text-gray-600 mb-8 max-w-md text-lg">
              Your feedback is incredibly valuable to us. We read every suggestion to make LOVEPDF better for you.
            </p>
            <div className="flex gap-4">
              <Link to="/" className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Return Home
              </Link>
              <button 
                onClick={() => {
                  setIsSuccess(false);
                  setRating(0);
                  setNps(null);
                  setMessage('');
                  setCategory('General');
                  setUserType('');
                }}
                className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
              >
                Send More
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 md:p-12">
            <div className="text-center mb-10">
              <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-bold mb-4 tracking-wide uppercase">
                Customer Feedback
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Help us improve</h1>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                We'd love to hear your thoughts, suggestions, or problems with our tools.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Section 1: Satisfaction */}
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                    <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">Overall Experience</label>
                    <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                        >
                        <Star 
                            size={44} 
                            className={`${
                            star <= (hoverRating || rating) 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-200'
                            } transition-colors duration-200`} 
                        />
                        </button>
                    ))}
                    </div>
                    <div className="h-6 text-sm font-bold text-brand-600 min-h-[24px]">
                        {rating === 1 && "Terrible"}
                        {rating === 2 && "Bad"}
                        {rating === 3 && "Okay"}
                        {rating === 4 && "Good"}
                        {rating === 5 && "Excellent!"}
                    </div>
                </div>

                {/* NPS */}
                <div className="flex flex-col items-center gap-4 pt-4 border-t border-gray-100">
                    <label className="text-sm font-bold text-gray-800 uppercase tracking-wide text-center">
                        How likely are you to recommend us to a friend?
                    </label>
                    <div className="flex flex-wrap justify-center gap-2">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                            <button
                                key={score}
                                type="button"
                                onClick={() => setNps(score)}
                                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg border-2 font-bold text-sm sm:text-base transition-all duration-200
                                    ${nps === score 
                                        ? getNpsActiveColor(score) 
                                        : `bg-white text-gray-600 border-gray-200 ${getNpsColor(score)}`
                                    }
                                `}
                            >
                                {score}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between w-full max-w-lg text-xs font-semibold text-gray-400 uppercase px-2">
                        <span>Not Likely</span>
                        <span>Very Likely</span>
                    </div>
                </div>
              </div>

              {/* Section 2: Details */}
              <div className="bg-gray-50 p-6 rounded-2xl space-y-5 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">What best describes you?</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 text-gray-400" size={18} />
                            <select
                                value={userType}
                                onChange={(e) => setUserType(e.target.value)}
                                className="w-full pl-10 border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white transition-shadow"
                            >
                                <option value="" disabled>Select...</option>
                                <option value="Student">Student</option>
                                <option value="Teacher">Teacher / Educator</option>
                                <option value="Professional">Professional</option>
                                <option value="Business">Business Owner</option>
                                <option value="Personal">Personal Use</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Feedback Category</label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 text-gray-400" size={18} />
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full pl-10 border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white transition-shadow"
                            >
                                <option value="General">General Feedback</option>
                                <option value="Feature">Feature Request</option>
                                <option value="Bug">Bug Report</option>
                                <option value="Praise">Praise</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Your Message</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us what you like, what we can improve, or what features you'd like to see..."
                        rows={4}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none bg-white transition-shadow placeholder:text-gray-400"
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Email (Optional)</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com (if you'd like a reply)"
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white transition-shadow"
                    />
                </div>
              </div>

              <button
                type="submit"
                disabled={rating === 0 || nps === null || isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl shadow-brand-100 flex items-center justify-center gap-2 transition-all transform
                    ${rating === 0 || nps === null || isSubmitting 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                        : 'bg-brand-600 text-white hover:bg-brand-700 hover:-translate-y-1'
                    }
                `}
              >
                {isSubmitting ? (
                    <>
                        <Loader2 size={24} className="animate-spin" />
                        <span>Sending...</span>
                    </>
                ) : (
                    <>
                        <Send size={24} />
                        <span>Submit Feedback</span>
                    </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;