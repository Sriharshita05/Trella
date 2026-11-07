import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

/* ─── Inline SVG icons (no extra dependencies) ─── */
function IconEmail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconEyeOpen() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconEyeClosed() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
function IconSpinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
      <path fill="currentColor" fillOpacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ─── Floating Kanban card component ─── */
function TaskCard({ column, tasks, colorKey, animClass, posStyle }) {
  const palette = {
    todo:       { dot: '#2563EB', tagBg: '#DBEAFE', tagText: '#1D4ED8', rowBg: '#EFF6FF', rowBorder: '#BFDBFE', colLabel: '#1E40AF' },
    inprogress: { dot: '#EA580C', tagBg: '#FFEDD5', tagText: '#C2410C', rowBg: '#FFF7ED', rowBorder: '#FED7AA', colLabel: '#9A3412' },
    done:       { dot: '#16A34A', tagBg: '#DCFCE7', tagText: '#15803D', rowBg: '#F0FDF4', rowBorder: '#BBF7D0', colLabel: '#166534' },
  };
  const c = palette[colorKey];
  return (
    <div
      className={animClass}
      style={{
        position: 'absolute',
        ...posStyle,
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(37,99,235,0.13), 0 2px 8px rgba(0,0,0,0.06)',
        padding: '14px',
        width: '190px',
        border: '1px solid #E8F0FE',
      }}
    >
      {/* Column header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.dot, display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontSize: '10.5px', fontWeight: 700, color: c.colLabel, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {column}
        </span>
        <span style={{ marginLeft: 'auto', background: c.tagBg, color: c.tagText, fontSize: '10px', fontWeight: 700, borderRadius: '99px', padding: '1px 7px' }}>
          {tasks.length}
        </span>
      </div>
      {/* Task rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {tasks.map((task, i) => (
          <div key={i} style={{
            background: c.rowBg, borderRadius: '9px', padding: '8px 10px',
            display: 'flex', alignItems: 'center', gap: '8px', border: `1px solid ${c.rowBorder}`,
          }}>
            <div style={{
              width: '15px', height: '15px', borderRadius: '4px', flexShrink: 0,
              border: `2px solid ${c.dot}`,
              background: colorKey === 'done' ? c.dot : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {colorKey === 'done' && (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#334155', lineHeight: 1.3 }}>{task}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Main LoginPage component
   ══════════════════════════════════════════════ */
export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const inputBase = {
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '14.5px',
    color: '#172554',
    background: '#F8FBFF',
    border: '1.5px solid #D8E3F0',
    borderRadius: '12px',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = '#2563EB';
    e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.10)';
    e.target.style.background = '#FFFFFF';
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = '#D8E3F0';
    e.target.style.boxShadow = 'none';
    e.target.style.background = '#F8FBFF';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', system-ui, sans-serif", background: '#F0F6FF', overflow: 'hidden' }}>

      {/* ════════════════════════════════
          LEFT PANEL – Branding
         ════════════════════════════════ */}
      <div className="hidden lg:flex" style={{
        width: '55%',
        background: 'linear-gradient(140deg, #1E3A8A 0%, #1D4ED8 40%, #2563EB 70%, #3B82F6 100%)',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'column',
        padding: '48px 52px',
      }}>
        {/* Background decoration circles */}
        <div className="animate-pulse-slow" style={{ position: 'absolute', top: '-100px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-120px', left: '-80px', width: '360px', height: '360px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '42%', right: '6%', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        {/* Dot grid overlay */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        {/* Trella Logo */}
        <div className="animate-fade-slide-up" style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9" rx="1.5" />
              <rect x="14" y="3" width="7" height="5" rx="1.5" />
              <rect x="14" y="12" width="7" height="9" rx="1.5" />
              <rect x="3" y="16" width="7" height="5" rx="1.5" />
            </svg>
          </div>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>Trella</span>
        </div>

        {/* Headline */}
        <div className="animate-fade-slide-up" style={{ marginTop: '54px', maxWidth: '440px', position: 'relative' }}>
          <h1 style={{ margin: 0, fontSize: '38px', fontWeight: 800, lineHeight: 1.15, color: '#FFFFFF', letterSpacing: '-0.8px' }}>
            Bring your team's<br />work together.
          </h1>
          <p style={{ margin: '16px 0 0', fontSize: '16px', fontWeight: 400, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, maxWidth: '370px' }}>
            Plan projects, collaborate effortlessly, and turn ideas into accomplishments — all in real time.
          </p>
        </div>

        {/* Floating Kanban illustration */}
        <div style={{ flex: 1, position: 'relative', marginTop: '44px', minHeight: '320px' }}>
          <TaskCard
            column="To Do"
            colorKey="todo"
            tasks={['Design login page', 'Create dashboard UI']}
            animClass="animate-float-1"
            posStyle={{ top: '16px', left: '0px' }}
          />
          <TaskCard
            column="In Progress"
            colorKey="inprogress"
            tasks={['Develop authentication', 'Connect database']}
            animClass="animate-float-2"
            posStyle={{ top: '4px', left: '210px' }}
          />
          <TaskCard
            column="Completed"
            colorKey="done"
            tasks={['Setup project structure', 'Create workspace']}
            animClass="animate-float-3"
            posStyle={{ top: '118px', left: '104px' }}
          />

          {/* Status pills */}
          <div className="animate-float-1" style={{ position: 'absolute', bottom: '52px', right: '16px', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '99px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
            <span style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 600 }}>3 members online</span>
          </div>
          <div className="animate-float-2" style={{ position: 'absolute', bottom: '106px', left: '0px', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '99px', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>⚡</span>
            <span style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 600 }}>Real-time sync</span>
          </div>
        </div>

        {/* Footer tagline */}
        <div style={{ position: 'relative', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          {[['🚀', 'Fast'], ['🔒', 'Secure'], ['🌍', 'Real-time']].map(([icon, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>{icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════
          RIGHT PANEL – Login Form
         ════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', background: '#F0F6FF', position: 'relative', overflowY: 'auto' }}>
        {/* Subtle bg blobs */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, #DBEAFE 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, #EFF6FF 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="animate-fade-slide-left" style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

          {/* Mobile-only logo */}
          <div className="flex lg:hidden" style={{ alignItems: 'center', gap: '10px', marginBottom: '32px', justifyContent: 'center' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg,#1E40AF 0%,#2563EB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" rx="1.5" />
                <rect x="14" y="3" width="7" height="5" rx="1.5" />
                <rect x="14" y="12" width="7" height="9" rx="1.5" />
                <rect x="3" y="16" width="7" height="5" rx="1.5" />
              </svg>
            </div>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#172554', letterSpacing: '-0.4px' }}>Trella</span>
          </div>

          {/* White form card */}
          <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '40px 36px', boxShadow: '0 4px 6px rgba(37,99,235,0.04), 0 20px 48px rgba(37,99,235,0.10)', border: '1px solid #E8F0FE' }}>
            {/* Heading */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#172554', letterSpacing: '-0.4px' }}>
                Welcome back! 👋
              </h2>
              <p style={{ margin: '8px 0 0', fontSize: '14.5px', color: '#64748B' }}>
                Sign in to continue to your workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Email */}
              <div>
                <label htmlFor="login-email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '8px' }}>
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#93AECF', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                    <IconEmail />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    autoFocus
                    style={{ ...inputBase, padding: '12px 14px 12px 44px' }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '8px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#93AECF', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                    <IconLock />
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    style={{ ...inputBase, padding: '12px 44px 12px 44px' }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    id="toggle-password"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#93AECF', display: 'flex', alignItems: 'center', padding: '2px', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#2563EB'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#93AECF'; }}
                  >
                    {showPassword ? <IconEyeOpen /> : <IconEyeClosed />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="remember-me" style={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer', userSelect: 'none' }}>
                  <div
                    onClick={() => setRememberMe((v) => !v)}
                    style={{ width: '18px', height: '18px', borderRadius: '5px', border: `2px solid ${rememberMe ? '#2563EB' : '#D8E3F0'}`, background: rememberMe ? '#2563EB' : '#F8FBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s', cursor: 'pointer', flexShrink: 0 }}
                  >
                    {rememberMe && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <input type="checkbox" id="remember-me" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ display: 'none' }} />
                  <span style={{ fontSize: '13.5px', color: '#64748B', fontWeight: 500 }}>Remember me</span>
                </label>
              </div>

              {/* Sign In button */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px',
                  background: loading ? '#93AECF' : 'linear-gradient(135deg,#1D4ED8 0%,#2563EB 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '9px',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.35)',
                  fontFamily: 'inherit',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.45)'; } }}
                onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.35)'; } }}
              >
                {loading ? <><IconSpinner /> Signing in…</> : <> Sign In <IconArrow /></>}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#E8F0FE' }} />
              <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500, whiteSpace: 'nowrap' }}>New to Trella?</span>
              <div style={{ flex: 1, height: '1px', background: '#E8F0FE' }} />
            </div>

            {/* Register CTA */}
            <Link
              to="/register"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '12px', background: '#F0F6FF', border: '1.5px solid #DBEAFE', borderRadius: '12px', textDecoration: 'none', fontSize: '14px', fontWeight: 600, color: '#2563EB', transition: 'all 0.18s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#DBEAFE'; e.currentTarget.style.borderColor = '#93C5FD'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F0F6FF'; e.currentTarget.style.borderColor = '#DBEAFE'; }}
            >
              Don't have an account?&nbsp;<span style={{ color: '#1D4ED8', fontWeight: 700 }}>Create one</span>
            </Link>
          </div>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#94A3B8' }}>
            Powered by Socket.IO · MongoDB · Express
          </p>
        </div>
      </div>
    </div>
  );
}
