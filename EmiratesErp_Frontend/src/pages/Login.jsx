/**
 * Login.jsx
 * =========
 * Emirates ERP login page — Vibrant Enterprise design system.
 *
 * UI Architecture (adapted from Nasim reference project):
 *  ┌─────────────────────────────────────────────────────┐
 *  │  HUD header bar (brand label + live clock)          │
 *  ├─────────────────────┬───────────────────────────────┤
 *  │  LEFT PANEL         │  RIGHT PANEL                  │
 *  │  - Eyebrow          │  - Three.js 3D canvas (abs)   │
 *  │  - Animated heading │  - Chip badge + nav arrows    │
 *  │  - Subtext          │  - Glass slide info card      │
 *  │  - Login form       │  - Progress dot indicators    │
 *  │  - Footer           │                               │
 *  └─────────────────────┴───────────────────────────────┘
 *
 * Business logic (axios calls, role routing, tenant detection) is
 * preserved exactly from the previous implementation.
 *
 * No multilingual (i18n) features — English only.
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Users,
  Building2,
  Boxes,
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Loader,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTenant } from '../context/TenantContext';
import { saveThemeToStorage, applyTheme } from '../utils/themeUtils';
import { getTenantFromSubdomain } from '../utils/tenantUtils';

import PatternBackground from '../components/login/PatternBackground';
import ThreeCanvas from '../components/login/ThreeCanvas';
import { useLoginTheme } from '../components/login/useLoginTheme';
import '../components/login/login.css';

// ── Static content (English) ────────────────────────────────────────────────
const COMPANY = 'EMIRATES ERP';
const HUD_VERSION = 'EMIRATES-ERP';
const HEADING = 'Next-Gen Enterprise Platform';
const SUBTEXT = 'Unify operations, unlock insights, and scale your business with confidence.';

const ERM_SLIDES = [
  {
    id: 0,
    badge: 'HR & WORKFORCE',
    badgeIcon: Users,
    title: 'Human Resource Management',
    description:
      'Streamline recruitment, payroll, and performance reviews. Build a high-performing workforce at scale.',
    stats: [
      { label: 'Workforce', value: '12,450', color: '#00A9A8' },
      { label: 'Payroll', value: '100.0%', color: '#00A9A8' },
      { label: 'Retention', value: '98.4%', color: '#00A9A8' },
    ],
  },
  {
    id: 1,
    badge: 'FINANCE & ACCOUNTING',
    badgeIcon: Building2,
    title: 'Financial Management & Accuracy',
    description:
      'Full-ledger accounting, VAT compliance, and real-time financial dashboards for data-driven decisions.',
    stats: [
      { label: 'Revenue', value: 'AED 42.8M', color: '#00A9A8' },
      { label: 'VAT Status', value: 'COMPLIANT', color: '#00A9A8' },
      { label: 'Audit', value: '100%', color: '#00A9A8' },
    ],
  },
  {
    id: 2,
    badge: 'SUPPLY CHAIN',
    badgeIcon: Boxes,
    title: 'Supply Chain & Logistics',
    description:
      'End-to-end visibility across procurement, warehousing, and delivery — optimised for speed and accuracy.',
    stats: [
      { label: 'Fulfillment', value: '99.8%', color: '#00A9A8' },
      { label: 'Warehouses', value: '48', color: '#00A9A8' },
      { label: 'Lead Time', value: '-42.0%', color: '#00A9A8' },
    ],
  },
  {
    id: 3,
    badge: 'CRM & SALES',
    badgeIcon: ShieldCheck,
    title: 'CRM & Client Intelligence',
    description:
      'Manage leads, track deals, and deliver exceptional customer experiences with AI-powered insights.',
    stats: [
      { label: 'Conversion', value: '+45.2%', color: '#00A9A8' },
      { label: 'Deals', value: '1,820', color: '#00A9A8' },
      { label: 'CSAT', value: '4.9 / 5', color: '#00A9A8' },
    ],
  },
];

// ── Helper: Word-aware animated heading ──────────────────────────────────────
function AnimatedHeading({ text }) {
  const words = text.split(' ');
  let letterIndex = 0;
  return (
    <h1 className="login-heading">
      {words.map((word, wi) => {
        const wordNode = (
          <span key={wi} className="login-heading-word">
            {word.split('').map((char) => {
              const idx = letterIndex++;
              return (
                <motion.span
                  key={idx}
                  className="login-heading-letter"
                  initial={{ opacity: 0, filter: 'blur(6px)', y: 14 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                  transition={{ delay: 0.12 * idx, duration: 0.28, ease: 'easeOut' }}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        );

        return wi < words.length - 1 ? (
          <React.Fragment key={wi}>
            {wordNode}
            <span className="login-heading-space">&nbsp;</span>
          </React.Fragment>
        ) : (
          wordNode
        );
      })}
    </h1>
  );
}

// ── Helper: Shimmer animated company eyebrow ────────────────────────────────
function CompanyEyebrow({ text }) {
  return (
    <motion.p
      className="login-company-eyebrow"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.span
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {text}
      </motion.span>
    </motion.p>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
const Login = () => {
  // ── Theme Hook ────────────────────────────────────────────────────────────
  const { loginTheme } = useLoginTheme();

  // ── Tenant & API ──────────────────────────────────────────────────────────
  const resolvedTenantId = getTenantFromSubdomain();
  const { refreshModules } = useTenant();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // ── Form state ────────────────────────────────────────────────────────────
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');

  // ── Carousel / animation state ────────────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState(0);
  const [headingKey, setHeadingKey] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ x: 400, y: 300 });
  const [systemTime, setSystemTime] = useState('');

  // ── Carousel auto-advance every 7.5 s ────────────────────────────────────
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ERM_SLIDES.length);
    }, 7500);
    return () => window.clearInterval(timer);
  }, []);

  // ── Replay heading animation every 4.5 s ─────────────────────────────────
  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeadingKey((k) => k + 1);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  // ── Live clock (GST) ──────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setSystemTime(now.toTimeString().split(' ')[0] + ' ');
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // ── Cursor tracking for glow + canvas repel ───────────────────────────────
  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setCursorPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  // ── Form handlers ─────────────────────────────────────────────────────────
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
        console.log(response.data);
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

        // Theme handling
        if (response.data.theme) {
          saveThemeToStorage(response.data.theme);
          applyTheme(response.data.theme);
        } else {
          applyTheme(null);
        }
      }

      // Confetti on successful login
      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.6 },
        colors: [loginTheme.primary, loginTheme.accent, '#00A9A8', '#02888D', '#FFA713'],
      });

      // Re-sync sidebar modules
      refreshModules();

      const name = loginData.email.trim() || 'Executive';
      setWelcomeMessage(`Welcome back, ${name}!`);

      // Role-based navigation
      const rolesString = localStorage.getItem('roles');
      if (rolesString) {
        const roles = JSON.parse(rolesString);

        window.setTimeout(async () => {
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

  // ── Derived ───────────────────────────────────────────────────────────────
  const currentSlide = ERM_SLIDES[activeIndex];
  const BadgeIcon = currentSlide.badgeIcon;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="login-root"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCursorPosition({ x: 400, y: 300 })}
      style={{
        '--lp-primary': loginTheme.primary,
        '--lp-secondary': loginTheme.secondary,
        '--lp-accent': loginTheme.accent,
        '--lp-surface': loginTheme.surface,
        '--lp-card-bg': loginTheme.cardBg,
        '--lp-text': loginTheme.text,
      }}
    >
      {/* Node-graph canvas + ticker bar */}
      <PatternBackground cursorPosition={cursorPosition} loginTheme={loginTheme} />

      {/* Cursor glow orb */}
      <motion.div
        className="login-cursor-glow"
        animate={{ x: cursorPosition.x - 140, y: cursorPosition.y - 140 }}
        transition={{ type: 'spring', stiffness: 200, damping: 28 }}
      />

      {/* Subtle grid overlay */}
      <div className="login-grid-overlay" />

      {/* ── Main Card ──────────────────────────────────────────────── */}
      <motion.div
        className="login-card"
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
      >
        {/* HUD Status Header */}
        <div className="login-hud-header">
          <span className="login-hud-brand">{HUD_VERSION}</span>
          <span className="login-hud-time">{systemTime}</span>
        </div>

        {/* ── LEFT PANEL: Login Form ──────────────────────────────── */}
        <section className="login-panel login-form-panel">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65 }}
          >
            <CompanyEyebrow text={COMPANY} />
            <AnimatedHeading key={headingKey} text={HEADING} />

            <motion.p
              className="login-subtext"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              {SUBTEXT}
              <span className="login-typing-cursor" />
            </motion.p>
          </motion.div>

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            {/* Username */}
            <label className="login-input-group">
              <span className="login-input-label">
                <User size={13} /> Username
              </span>
              <div className="login-input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="text"
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
              </div>
            </label>

            {/* Password */}
            <label className="login-input-group">
              <span className="login-input-label">
                <Lock size={13} /> Password
              </span>
              <div className="login-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-pass-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </label>

            {/* Error */}
            {error && <div className="login-error-box">{error}</div>}

            {/* Submit */}
            <motion.button
              type="submit"
              className="login-submit-btn"
              style={{ backgroundColor: loginTheme.primary, color: '#ffffff' }}
              whileHover={{ scale: 1.02, boxShadow: `0 0 28px ${loginTheme.primary}aa` }}
              whileTap={{ scale: 0.97 }}
              disabled={isLoading}
            >
              <span className="login-btn-content">
                {isLoading ? (
                  <>
                    <Loader className="login-spin-icon" size={16} />
                    Signing in…
                  </>
                ) : (
                  <>
                    Login Now
                    <ChevronRight size={17} />
                  </>
                )}
              </span>
              <div className="login-btn-shimmer" />
            </motion.button>

            {/* Welcome / success message */}
            <AnimatePresence mode="wait">
              {welcomeMessage && (
                <motion.div
                  key={welcomeMessage}
                  className="login-success-box"
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                >
                  <ShieldCheck size={18} className="login-success-icon" />
                  <span className="login-success-text">
                    {welcomeMessage.split('').map((char, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, filter: 'blur(4px)', y: 8 }}
                        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                        transition={{
                          delay: 0.05 * i,
                          duration: 0.22,
                          ease: 'easeOut',
                        }}
                        style={{ display: 'inline-block' }}
                      >
                        {char === ' ' ? '\u00A0' : char}
                      </motion.span>
                    ))}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Footer */}
          <div className="login-form-footer">
            <span>© {new Date().getFullYear()} Emirates ERP · All rights reserved</span>
          </div>
        </section>

        {/* ── RIGHT PANEL: 3D Carousel ─────────────────────────────── */}
        <section
          className="login-panel login-showcase-panel"
          style={{ backgroundColor: loginTheme.secondary }}
        >
          {/* Three.js canvas — fills the panel absolutely */}
          <ThreeCanvas activeSlideIndex={activeIndex} loginTheme={loginTheme} />

          {/* Badge chip + navigation arrows */}
          <div className="login-showcase-top">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.badge}
                className="login-cyber-chip"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <BadgeIcon size={14} className="login-chip-icon" />
                <span>{currentSlide.badge}</span>
              </motion.div>
            </AnimatePresence>

            <div className="login-carousel-nav">
              <button
                type="button"
                className="login-nav-btn"
                onClick={() =>
                  setActiveIndex((p) =>
                    p === 0 ? ERM_SLIDES.length - 1 : p - 1
                  )
                }
              >
                <ChevronLeft size={17} />
              </button>
              <button
                type="button"
                className="login-nav-btn"
                onClick={() =>
                  setActiveIndex((p) => (p + 1) % ERM_SLIDES.length)
                }
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          {/* Animated glass info card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              className="login-3d-card"
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.94 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <div className="login-card-glass-body">
                <motion.h2
                  className="login-slide-title"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12, duration: 0.38 }}
                >
                  {currentSlide.title}
                </motion.h2>
                <motion.p
                  className="login-slide-desc"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.22, duration: 0.38 }}
                >
                  {currentSlide.description}
                </motion.p>
                <div className="login-stats-grid">
                  {currentSlide.stats.map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      className="login-stat-box"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.28 + idx * 0.07,
                        duration: 0.35,
                      }}
                    >
                      <span className="login-stat-label">{stat.label}</span>
                      <span
                        className="login-stat-value"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress dot indicators */}
          <div className="login-carousel-controls">
            <div className="login-dots-container">
              {ERM_SLIDES.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  className={`login-dot-pill${index === activeIndex ? ' active' : ''}`}
                  onClick={() => setActiveIndex(index)}
                >
                  {index === activeIndex && (
                    <motion.div
                      className="login-dot-progress-fill"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 7.5, ease: 'linear' }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default Login;
