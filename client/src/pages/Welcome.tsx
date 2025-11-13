import React from 'react';
import { useLocation } from 'wouter';

export default function Welcome() {
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-10 animate-float"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 10 + 10 + 's'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <div className="text-center mb-16 animate-fadeInScale">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
            GrowHacking
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Game</span>
          </h1>

          <p className="text-xl md:text-2xl text-purple-200 mb-4">
            Play, Win, and Earn Real Rewards
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="group relative">
            <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105">
              <h3 className="text-2xl font-bold text-white mb-3">Try Demo</h3>
              <p className="text-purple-200 mb-6">Start playing instantly with a demo account!</p>
              <button
                onClick={() => navigate('/demo-login')}
                className="w-full py-3 bg-gradient-to-r from-purple-600/50 to-blue-600/50 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Play Demo
              </button>
            </div>
          </div>

          <div className="group relative">
            <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-yellow-400/40 hover:border-yellow-400/60 transition-all duration-300 transform hover:scale-105">
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                RECOMMENDED
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Create Account</h3>
              <p className="text-purple-200 mb-6">Register and win real money prizes!</p>
              <button
                onClick={() => navigate('/register')}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-purple-200">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-white font-semibold hover:text-yellow-300 transition-colors underline"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
