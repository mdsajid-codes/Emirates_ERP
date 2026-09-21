/**
 * Login.jsx
 * =========
 * Emirates ERP Redesigned Login Page
 * Built completely using Tailwind CSS for clean responsiveness and perfect sizing.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Clock,
  Check,
  Loader,
  ShoppingCart,
  Users,
  Truck,
  Box,
  Lightbulb,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTenant } from '../context/TenantContext';
import { saveThemeToStorage, applyTheme } from '../utils/themeUtils';
import { getTenantFromSubdomain } from '../utils/tenantUtils';

const Login = () => {
  const resolvedTenantId = getTenantFromSubdomain();
  const { refreshModules } = useTenant();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // Form State
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');

  // Clock State
  const [systemTime, setSystemTime] = useState('');
  const [systemDate, setSystemDate] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setSystemTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setSystemDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!API_URL) {
      setError('API URL is not configured. Please check your .env file.');
      setIsLoading(false);
      return;
    }

    try {
      let response;
      if (resolvedTenantId.toLowerCase() === 'master') {
        response = await axios.post(`${API_URL}/master/auth/login`, {
          username: loginData.email,
          password: loginData.password,
        });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('roles', JSON.stringify(response.data.roles));
        localStorage.setItem('username', loginData.email);
        localStorage.setItem('tenantId', 'master');
      } else {
        response = await axios.post(`${API_URL}/auth/login`, {
          tenantId: resolvedTenantId,
          email: loginData.email,
          password: loginData.password,
        });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('roles', JSON.stringify(response.data.roles));
        localStorage.setItem('username', loginData.email);
        localStorage.setItem('tenantId', resolvedTenantId);
        localStorage.setItem('modules', response.data.modules);

        if (response.data.theme) {
          saveThemeToStorage(response.data.theme);
          applyTheme(response.data.theme);
        } else {
          applyTheme(null);
        }
      }

      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#01AAB1', '#0191A1', '#00A9A8', '#02888D', '#FFA713'],
      });

      refreshModules();
      const name = loginData.email.trim() || 'Executive';
      setWelcomeMessage(`Welcome back, ${name}!`);

      const rolesString = localStorage.getItem('roles');
      if (rolesString) {
        const roles = JSON.parse(rolesString);
        setTimeout(async () => {
          if (roles.includes('SUPER_ADMIN') || (roles.includes('POS_ADMIN') && roles.includes('HRMS_ADMIN'))) {
            navigate('/company-dashboard');
          } else if (roles.includes('MASTER_ADMIN')) {
            navigate('/master-admin');
          } else if (roles.includes('HRMS_ADMIN') || roles.includes('HR')) {
            navigate('/hrdashboard');
          } else if (roles.includes('POS_ADMIN') || roles.includes('POS_MANAGER') || roles.includes('POS_CASHIER')) {
            navigate('/pos-dashboard');
          } else if (roles.includes('MANAGER') || roles.includes('EMPLOYEE')) {
            try {
              const token = localStorage.getItem('token');
              const permRes = await axios.get(`${API_URL}/crm/roles/my-permissions`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const perms = permRes.data?.permissions;
              if (perms && Object.keys(perms).length > 0) {
                navigate('/crm-dashboard/home');
                return;
              }
            } catch (permErr) {
              console.error('Failed to check CRM roles on login:', permErr);
            }
            navigate('/employee-dashboard');
          } else {
            navigate('/');
          }
        }, 800);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Error during login:', err);
      if (err.response) {
        setError(err.response.data.message || 'Invalid credentials or company ID.');
      } else if (err.request) {
        setError('No response from server. Please check your network connection.');
      } else {
        setError('Failed to login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-[#F5F8FC] to-[#EEF2F9] font-sans flex flex-col items-center justify-start sm:justify-center p-4 sm:p-6 md:p-8 overflow-y-auto py-6 sm:py-10">
      <motion.div
        className="w-full max-w-5xl bg-[#FAFBFD] rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200/60 my-auto shrink-0"
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* ── LEFT PANEL: Form Section ──────────────────────────────── */}
        <section className="lg:col-span-6 xl:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-[#FAFBFD] z-10 space-y-5">
          {/* Logo Header */}
          <div className="flex items-center">
            <img
              src="/Logo_Name.svg"
              alt="Emirates ERP Solutions LLC"
              className="w-48 sm:w-56 h-auto object-contain"
            />
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-1 bg-[#01AAB1] rounded-full" />
              <span className="text-[11px] font-bold text-[#01AAB1] tracking-[0.2em] uppercase">
                WELCOME BACK
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111111] leading-[1.15] tracking-tight">
              Access.<br />
              Insight.<br />
              <span className="text-[#01AAB1]">Impact.</span>
            </h1>

            <div className="pt-1 space-y-2">
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm">
                Unify operations, unlock insights, and scale your business with{' '}
                <span className="text-[#01AAB1] font-semibold">confidence.</span>
              </p>
              <div className="w-12 h-1 bg-[#01AAB1] rounded-full" />
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#111111]">
                <User size={15} className="text-[#01AAB1]" />
                <span>USERNAME</span>
              </label>
              <div className="relative w-full">
                <input
                  id="email"
                  name="email"
                  type="text"
                  className="w-full h-11 sm:h-12 px-4 pr-11 bg-[#F4F8FB] border border-[#D3DDE9] rounded-xl text-slate-800 placeholder-[#5B6A81] text-xs sm:text-sm focus:outline-none focus:border-[#01AAB1] focus:ring-4 focus:ring-[#01AAB1]/15 transition-all"
                  value={loginData.email}
                  onChange={handleChange}
                  placeholder={
                    resolvedTenantId !== 'master'
                      ? `Signing into: ${resolvedTenantId}`
                      : 'Enter your username'
                  }
                  autoComplete="username"
                  required
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#01AAB1] pointer-events-none">
                  <User size={18} />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#111111]">
                <Lock size={15} className="text-[#01AAB1]" />
                <span>PASSWORD</span>
              </label>
              <div className="relative w-full">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full h-11 sm:h-12 px-4 pr-11 bg-[#F4F8FB] border border-[#D3DDE9] rounded-xl text-slate-800 placeholder-[#5B6A81] text-xs sm:text-sm focus:outline-none focus:border-[#01AAB1] focus:ring-4 focus:ring-[#01AAB1]/15 transition-all"
                  value={loginData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#01AAB1] hover:opacity-80 transition-opacity"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
              <label
                className="flex items-center gap-2.5 cursor-pointer select-none"
                onClick={() => setRememberMe(!rememberMe)}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                    rememberMe ? 'bg-[#01AAB1] text-white' : 'bg-[#F4F8FB] border border-[#D3DDE9]'
                  }`}
                >
                  {rememberMe && <Check size={14} strokeWidth={3} />}
                </div>
                <span className="text-slate-700 font-medium">Remember me</span>
              </label>

              <button
                type="button"
                className="text-[#01AAB1] font-semibold hover:underline"
                onClick={() => alert('Please contact your System Administrator to reset your password.')}
              >
                Forgot Password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-12 sm:h-14 bg-gradient-to-r from-[#0191A1] to-[#01AAB1] text-white rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#01AAB1]/25 hover:shadow-xl hover:shadow-[#01AAB1]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Login Now</span>
                  <ArrowRight size={22} />
                </>
              )}
            </button>

            {/* Welcome Message */}
            <AnimatePresence>
              {welcomeMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[#01AAB1] font-semibold text-sm text-center pt-1"
                >
                  {welcomeMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs sm:text-sm text-slate-500">
              © {new Date().getFullYear()} Emirates ERP · All rights reserved
            </p>
          </div>
        </section>

        {/* ── RIGHT PANEL: Showcase Section (Tailwind) ─────────────── */}
        <section className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative bg-gradient-to-br from-[#EBF5FA] via-[#D8ECF5] to-[#C4E3EE] p-8 xl:p-10 flex-col justify-between overflow-hidden">
          {/* Radial Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.7),transparent_70%)] pointer-events-none" />

          {/* Live Clock Badge */}
          <div className="absolute top-6 right-6 bg-white/85 backdrop-blur-md border border-white/90 rounded-2xl px-4 py-2 flex flex-col items-end shadow-sm z-20">
            <div className="flex items-center gap-2 font-bold text-sm text-[#0F2A38]">
              <Clock size={16} className="text-[#01AAB1]" />
              <span>{systemTime || '10:43:52 AM'}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {systemDate || 'Thursday, 22 May 2026'}
            </div>
          </div>

          {/* Hero Illustration Wrapper */}
          <div className="relative w-full flex-1 flex items-center justify-center my-6">
            <img
              src="/login-hero.png"
              alt="Emirates ERP Business Intelligence Showcase"
              className="max-h-[360px] xl:max-h-[400px] w-auto object-contain drop-shadow-2xl hover:scale-[1.01] transition-transform duration-300"
            />

            {/* Floating Metric Overlay Cards */}
            <div className="absolute right-2 xl:right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
              <div className="bg-white/90 backdrop-blur-md border border-white/90 rounded-xl p-3 shadow-md flex items-center gap-3 min-w-[190px] hover:-translate-x-1 transition-all">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Total Orders</div>
                  <div className="text-base font-bold text-slate-900 leading-tight">12,584</div>
                  <div className="text-[10px] text-[#01AAB1] font-semibold mt-0.5">↑ 14.2% vs last month</div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-md border border-white/90 rounded-xl p-3 shadow-md flex items-center gap-3 min-w-[190px] hover:-translate-x-1 transition-all">
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                  <Users size={18} />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Active Users</div>
                  <div className="text-base font-bold text-slate-900 leading-tight">3,842</div>
                  <div className="text-[10px] text-[#01AAB1] font-semibold mt-0.5">↑ 12.8% vs last month</div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-md border border-white/90 rounded-xl p-3 shadow-md flex items-center gap-3 min-w-[190px] hover:-translate-x-1 transition-all">
                <div className="w-9 h-9 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
                  <Truck size={18} />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">On-Time Delivery</div>
                  <div className="text-base font-bold text-slate-900 leading-tight">97.6%</div>
                  <div className="text-[10px] text-[#01AAB1] font-semibold mt-0.5">↑ 8.3% vs last month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 4 Feature Grid Cards */}
          <div className="grid grid-cols-4 gap-3 relative z-10 w-full">
            <div className="bg-white/85 backdrop-blur-md border border-white/90 rounded-2xl p-3 text-center flex flex-col items-center hover:bg-white transition-all shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#EBF7F8] text-[#01AAB1] flex items-center justify-center mb-1.5">
                <Box size={18} />
              </div>
              <span className="text-xs font-bold text-slate-900">Integrated</span>
              <span className="text-[10px] text-slate-500 mt-0.5">All modules connected</span>
            </div>

            <div className="bg-white/85 backdrop-blur-md border border-white/90 rounded-2xl p-3 text-center flex flex-col items-center hover:bg-white transition-all shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#EBF7F8] text-[#01AAB1] flex items-center justify-center mb-1.5">
                <Lightbulb size={18} />
              </div>
              <span className="text-xs font-bold text-slate-900">Intelligent</span>
              <span className="text-[10px] text-slate-500 mt-0.5">AI-driven insights</span>
            </div>

            <div className="bg-white/85 backdrop-blur-md border border-white/90 rounded-2xl p-3 text-center flex flex-col items-center hover:bg-white transition-all shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#EBF7F8] text-[#01AAB1] flex items-center justify-center mb-1.5">
                <TrendingUp size={18} />
              </div>
              <span className="text-xs font-bold text-slate-900">Scalable</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Grow without limits</span>
            </div>

            <div className="bg-white/85 backdrop-blur-md border border-white/90 rounded-2xl p-3 text-center flex flex-col items-center hover:bg-white transition-all shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#EBF7F8] text-[#01AAB1] flex items-center justify-center mb-1.5">
                <ShieldCheck size={18} />
              </div>
              <span className="text-xs font-bold text-slate-900">Secure</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Enterprise grade security</span>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default Login;
