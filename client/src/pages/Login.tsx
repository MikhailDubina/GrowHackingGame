import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '../lib/trpc';

export default function Login() {
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const [loginMethod, setLoginMethod] = useState<'password' | 'sms'>('password');
  const [step, setStep] = useState(1); // 1: phone/password, 2: SMS code
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [smsCode, setSmsCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation();
  const loginWithSMSMutation = trpc.auth.loginWithSMS.useMutation();
  const sendCodeMutation = trpc.auth.sendVerificationCode.useMutation();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginMutation.mutateAsync(formData);

      if (!result.success) {
        setError(result.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Сохранение токена
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));

      // Перенаправление
      window.location.href = '/home';
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleSMSLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (step === 1) {
      // Отправка SMS-кода
      try {
        const result = await sendCodeMutation.mutateAsync({ phone: formData.phone });

        if (!result.success) {
          setError(result.error || 'Failed to send SMS');
          setLoading(false);
          return;
        }

        setStep(2);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to send SMS');
        setLoading(false);
      }
    } else {
      // Вход по SMS-коду
      try {
        const result = await loginWithSMSMutation.mutateAsync({
          phone: formData.phone,
          code: smsCode
        });

        if (!result.success) {
          setError(result.error || 'Invalid code');
          setLoading(false);
          return;
        }

        // Сохранение токена
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));

        // Перенаправление
        window.location.href = '/home';
      } catch (err: any) {
        setError(err.message || 'Login failed');
        setLoading(false);
      }
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

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 animate-fadeInScale">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-purple-200">Login to continue playing!</p>
          </div>

          {/* Login Method Tabs */}
          {step === 1 && (
            <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-lg">
              <button
                onClick={() => setLoginMethod('password')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                  loginMethod === 'password'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                Password
              </button>
              <button
                onClick={() => setLoginMethod('sms')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                  loginMethod === 'sms'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                SMS Code
              </button>
            </div>
          )}

          {loginMethod === 'password' && step === 1 ? (
            /* Password Login Form */
            <form onSubmit={handlePasswordLogin} className="space-y-6">
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
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : loginMethod === 'sms' && step === 1 ? (
            /* SMS Login - Phone Input */
            <form onSubmit={handleSMSLogin} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Login with SMS</h2>
                <p className="text-purple-200 text-sm">
                  Enter your phone number to receive a verification code
                </p>
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
                {loading ? 'Sending Code...' : 'Send SMS Code'}
              </button>
            </form>
          ) : (
            /* SMS Login - Code Verification */
            <form onSubmit={handleSMSLogin} className="space-y-6 animate-fadeInScale">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Enter Code</h2>
                <p className="text-purple-200">
                  Code sent to<br />
                  <span className="font-semibold text-white">{formData.phone}</span>
                </p>
              </div>

              {/* SMS Code Input */}
              <div className="group">
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
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              {/* Back & Resend */}
              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setSmsCode('');
                    setError('');
                  }}
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  ← Change number
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setError('');
                    const result = await sendCodeMutation.mutateAsync({ phone: formData.phone });
                    if (result.success) {
                      alert('New code sent!');
                    } else {
                      setError(result.error || 'Failed to resend');
                    }
                  }}
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  Resend code →
                </button>
              </div>
            </form>
          )}

          {/* Register Link */}
          {step === 1 && (
            <div className="mt-6 text-center text-purple-200 text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-white font-semibold hover:text-purple-300 transition-colors"
              >
                Register here
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
