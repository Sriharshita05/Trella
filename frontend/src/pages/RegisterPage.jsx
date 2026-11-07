import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

function IconUser()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function IconEmail() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>; }
function IconLock()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function IconEyeOpen() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function IconEyeClose() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/></svg>; }
function IconArrow() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>; }
function IconSpinner() { return <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" strokeOpacity="0.3"/><path fill="white" fillOpacity="0.8" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>; }

const inputBase = {
  width: '100%', boxSizing: 'border-box', padding: '11px 14px 11px 44px',
  fontSize: '14.5px', color: '#172B4D', background: '#F8FBFF',
  border: '1.5px solid #E5EAF2', borderRadius: '12px', outline: 'none',
  fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s',
};
const handleFocus = (e) => { e.target.style.borderColor = '#3978E8'; e.target.style.boxShadow = '0 0 0 4px rgba(57,120,232,0.10)'; e.target.style.background = '#FFFFFF'; };
const handleBlur  = (e) => { e.target.style.borderColor = '#E5EAF2'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F8FBFF'; };

function Field({ id, label, type, placeholder, value, onChange, onBlur, icon, right, error, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '8px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#93AECF', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>{icon}</span>
        <input
          id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} required autoComplete={autoComplete}
          aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}
          style={{ ...inputBase, paddingRight: right ? '44px' : '14px', ...(error ? { borderColor: '#EF4444' } : null) }}
          onFocus={handleFocus}
          onBlur={(e) => { handleBlur(e); if (error) e.target.style.borderColor = '#EF4444'; onBlur?.(e); }}
        />
        {right && <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>{right}</span>}
      </div>
      {error && <p id={`${id}-error`} role="alert" style={{ margin: '6px 0 0', fontSize: '12.5px', fontWeight: 500, color: '#DC2626' }}>{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const errors = {
    password: form.password && form.password.length < 6 ? 'Password must be at least 6 characters' : '',
    confirm: form.confirm && form.password !== form.confirm ? 'Passwords do not match' : '',
  };
  const touch = (k) => () => setTouched((t) => ({ ...t, [k]: true }));
  const err = (k) => (touched[k] ? errors[k] : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ password: true, confirm: true });
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to Trella!');
      navigate('/');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter',system-ui,sans-serif", background: '#F0F6FF', overflow: 'hidden' }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex" style={{ width: '45%', background: 'linear-gradient(140deg,#1E3A8A 0%,#1D4ED8 40%,#2563EB 70%,#3B82F6 100%)', position: 'relative', overflow: 'hidden', flexDirection: 'column', padding: '48px 52px', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="animate-pulse-slow" style={{ position: 'absolute', top: '-80px', right: '-60px', width: '340px', height: '340px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/>
                <rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>
              </svg>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>Trella</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '36px', fontWeight: 800, lineHeight: 1.15, color: '#FFFFFF', letterSpacing: '-0.7px' }}>Start your<br />journey today.</h1>
          <p style={{ margin: '16px 0 0', fontSize: '15.5px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, maxWidth: '340px' }}>
            Join thousands of teams using Trella to manage work and collaborate in real time.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '36px' }}>
            {[['⚡', 'Real-time collaboration with your team'], ['🎯', 'Organize tasks with drag-and-drop Kanban boards'], ['🔒', 'Secure authentication and role-based access']].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px' }}>{icon}</span>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', position: 'relative', overflowY: 'auto' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, #DBEAFE 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="animate-fade-slide-left" style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
          {/* Mobile logo */}
          <div className="flex lg:hidden" style={{ alignItems: 'center', gap: '10px', marginBottom: '28px', justifyContent: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#1E40AF 0%,#2563EB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/>
                <rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>
              </svg>
            </div>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#172554' }}>Trella</span>
          </div>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '36px', boxShadow: '0 4px 6px rgba(37,99,235,0.04), 0 20px 48px rgba(37,99,235,0.10)', border: '1px solid #E8F0FE' }}>
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#172554', letterSpacing: '-0.4px' }}>Create your account ✨</h2>
              <p style={{ margin: '7px 0 0', fontSize: '14px', color: '#64748B' }}>Start managing your projects with Trella.</p>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <Field id="register-name" autoComplete="name" label="Full Name" type="text" placeholder="Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} icon={<IconUser />} />
              <Field id="register-email" autoComplete="email" label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} icon={<IconEmail />} />
              <Field id="register-password" autoComplete="new-password" error={err('password')} onBlur={touch('password')} label="Password" type={showPw ? 'text' : 'password'} placeholder="At least 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} icon={<IconLock />}
                right={<button type="button" aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#93AECF', display: 'flex', padding: '2px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='#3978E8'} onMouseLeave={e => e.currentTarget.style.color='#93AECF'}>{showPw ? <IconEyeOpen /> : <IconEyeClose />}</button>} />
              <Field id="register-confirm" autoComplete="new-password" error={err('confirm')} onBlur={touch('confirm')} label="Confirm Password" type={showCf ? 'text' : 'password'} placeholder="Repeat your password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} icon={<IconLock />}
                right={<button type="button" aria-label={showCf ? 'Hide password' : 'Show password'} onClick={() => setShowCf(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#93AECF', display: 'flex', padding: '2px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='#3978E8'} onMouseLeave={e => e.currentTarget.style.color='#93AECF'}>{showCf ? <IconEyeOpen /> : <IconEyeClose />}</button>} />

              <button id="register-submit" type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: loading ? '#93AECF' : 'linear-gradient(135deg,#1D4ED8 0%,#3978E8 100%)', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', transition: 'transform 0.18s, box-shadow 0.18s', boxShadow: loading ? 'none' : '0 4px 16px rgba(57,120,232,0.35)', fontFamily: 'inherit' }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(57,120,232,0.45)'; }}}
                onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(57,120,232,0.35)'; }}}>
                {loading ? <><IconSpinner /> Creating account…</> : <>Create Account <IconArrow /></>}
              </button>
            </form>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#E8F0FE' }} />
              <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>Have an account?</span>
              <div style={{ flex: 1, height: '1px', background: '#E8F0FE' }} />
            </div>
            <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '12px', background: '#F0F6FF', border: '1.5px solid #DBEAFE', borderRadius: '12px', textDecoration: 'none', fontSize: '14px', fontWeight: 600, color: '#2563EB', transition: 'all 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#DBEAFE'; e.currentTarget.style.borderColor='#93C5FD'; }}
              onMouseLeave={e => { e.currentTarget.style.background='#F0F6FF'; e.currentTarget.style.borderColor='#DBEAFE'; }}>
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
