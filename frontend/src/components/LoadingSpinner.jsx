export default function LoadingSpinner({ size = 'md', text = '' }) {
  const s = { sm: '18px', md: '36px', lg: '48px' }[size] || '36px';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
      <svg
        className="animate-spin"
        width={s} height={s} viewBox="0 0 24 24" fill="none"
      >
        <circle cx="12" cy="12" r="10" stroke="#DCEAFF" strokeWidth="4" />
        <path fill="#3978E8" fillOpacity="0.85" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {text && <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', background: '#F4F7FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '16px',
          background: 'linear-gradient(135deg,#2563EB 0%,#3978E8 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(57,120,232,0.35)',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
          </svg>
        </div>
        <LoadingSpinner size="md" text="Loading Trella..." />
      </div>
    </div>
  );
}
