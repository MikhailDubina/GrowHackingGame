import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '../lib/trpc';

export default function Register() {
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const [step, setStep] = useState(1); // 1: registration, 2: SMS verification
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [smsCode, setSmsCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const registerMutation = trpc.auth.register.useMutation();
  const sendCodeMutation = trpc.auth.sendVerificationCode.useMutation();
  const verifyCodeMutation = trpc.auth.verifyCode.useMutation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!formData.phone.startsWith('+')) {
      setError('Phone must start with + and country code (e.g., +79991234567)');
      return;
    }

    setLoading(true);

    try {
      // Регистрация
      const registerResult = await registerMutation.mutateAsync(formData);
      
      if (!registerResult.success) {
        setError(registerResult.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Отправка SMS-кода
      const smsResult = await sendCodeMutation.mutateAsync({ phone: formData.phone });
      
      if (!smsResult.success) {
        setError(smsResult.error || 'Failed to send SMS');
        setLoading(false);
        return;
      }

      // Переход к верификации
      setStep(2);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  const handleVerifySMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await verifyCodeMutation.mutateAsync({
        phone: formData.phone,
        code: smsCode
      });

      if (!result.success) {
        setError(result.error || 'Invalid code');
        setLoading(false);
        return;
      }

      // Успешная регистрация
      alert('Registration successful! You are now logged in.');
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 flex items-center justify-center p-4">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-10 animate-float"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 10 + 10 + 's'
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="absolute -top-16 left-0 text-white hover:text-purple-300 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>

        {/* Registration Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 animate-fadeInScale">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-purple-200">Join GrowHackingGame today!</p>
          </div>

          {step === 1 ? (
            /* Step 1: Registration Form */
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Username */}
              <div className="group">
                <label className="block text-white text-sm font-medium mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="group">
                <label className="block text-white text-sm font-medium mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="+79991234567"
                    required
                  />
                </div>
                <p className="text-purple-200 text-xs mt-1">Format: +[country code][number]</p>
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-white text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="group">
                <label className="block text-white text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm animate-shake">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              {/* Login Link */}
              <div className="text-center text-purple-200 text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-white font-semibold hover:text-purple-300 transition-colors"
                >
                  Login here
                </button>
              </div>
            </form>
          ) : (
            /* Step 2: SMS Verification */
            <form onSubmit={handleVerifySMS} className="space-y-6 animate-fadeInScale">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verify Your Phone</h2>
                <p className="text-purple-200">
                  We sent a 6-digit code to<br />
                  <span className="font-semibold text-white">{formData.phone}</span>
                </p>
              </div>

              {/* SMS Code Input */}
              <div className="group">
                <label className="block text-white text-sm font-medium mb-2 text-center">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-lg text-white text-center text-2xl font-bold tracking-widest placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm animate-shake">
                  {error}
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || smsCode.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Complete Registration'}
              </button>

              {/* Resend Code */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={async () => {
                    setError('');
                    const result = await sendCodeMutation.mutateAsync({ phone: formData.phone });
                    if (result.success) {
                      alert('New code sent!');
                    } else {
                      setError(result.error || 'Failed to resend code');
                    }
                  }}
                  className="text-purple-200 hover:text-white text-sm transition-colors"
                >
                  Didn't receive code? <span className="font-semibold">Resend</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
