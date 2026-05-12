import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const pageStyle: React.CSSProperties = {
  minHeight: '100vh', background: '#080810', color: '#fff',
  fontFamily: "'Inter',system-ui,sans-serif",
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
};

const cardStyle: React.CSSProperties = {
  width: '100%', maxWidth: 420,
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20, padding: '2.5rem',
};

const logoStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem',
};

const logoBoxStyle: React.CSSProperties = {
  width: 30, height: 30, background: '#6c47ff', borderRadius: 7,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
  padding: '13px 16px', color: '#fff', fontSize: 15, outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
};

const btnStyle: React.CSSProperties = {
  width: '100%', padding: '14px', background: '#6c47ff',
  border: 'none', borderRadius: 10, color: '#fff',
  fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 6, display: 'block',
};

function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={logoStyle}>
          <div style={logoBoxStyle}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8h12M9 3l5 5-5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>
            snip<span style={{ color: '#6c47ff' }}>.ly</span>
          </span>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', margin: '0 0 6px' }}>{title}</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
}

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to manage your links">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" placeholder="you@example.com" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} required/>
        </div>
        <div>
          <label style={labelStyle}>Password</label>
          <input type="password" placeholder="••••••••" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle} required/>
        </div>
        <button type="submit" disabled={isLoading} style={{ ...btnStyle, opacity: isLoading ? 0.7 : 1, marginTop: 4 }}>
          {isLoading ? 'Signing in…' : 'Sign in →'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>
            Sign up free
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <AuthCard title="Create your account" subtitle="Start shortening links for free">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Full name</label>
          <input type="text" placeholder="Your name" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} required/>
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" placeholder="you@example.com" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} required/>
        </div>
        <div>
          <label style={labelStyle}>Password</label>
          <input type="password" placeholder="Min 8 characters" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle} minLength={8} required/>
        </div>
        <button type="submit" disabled={isLoading} style={{ ...btnStyle, opacity: isLoading ? 0.7 : 1, marginTop: 4 }}>
          {isLoading ? 'Creating account…' : 'Create account →'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
