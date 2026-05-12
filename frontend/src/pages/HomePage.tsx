import { useState } from 'react';
import { Link } from 'react-router-dom';
import { urlApi, UrlData } from '../services/api';
import toast from 'react-hot-toast';

export function HomePage() {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [result, setResult] = useState<UrlData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) return;

    setLoading(true);

    try {
      const res = await urlApi.create({
        originalUrl: url,
        customAlias: alias || undefined,
      });

      setResult(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);

    setCopied(true);

    toast.success('Copied!');

    setTimeout(() => setCopied(false), 2000);
  };

  const S = {
    page: {
      minHeight: '100vh',
      background: '#080810',
      color: '#fff',
      fontFamily: "'Inter',system-ui,sans-serif",
    } as React.CSSProperties,

    nav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem 2.5rem',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    } as React.CSSProperties,

    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    } as React.CSSProperties,

    logoBox: {
      width: 30,
      height: 30,
      background: '#6c47ff',
      borderRadius: 7,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    } as React.CSSProperties,

    logoText: {
      fontWeight: 800,
      fontSize: 18,
      letterSpacing: '-0.5px',
    } as React.CSSProperties,

    navLinks: {
      display: 'flex',
      gap: 8,
    } as React.CSSProperties,

    btnGhost: {
      padding: '8px 18px',
      borderRadius: 8,
      border: '1px solid rgba(255,255,255,0.12)',
      color: 'rgba(255,255,255,0.65)',
      textDecoration: 'none',
      fontSize: 14,
      fontWeight: 500,
    } as React.CSSProperties,

    btnPrimary: {
      padding: '8px 20px',
      borderRadius: 8,
      background: '#6c47ff',
      color: '#fff',
      textDecoration: 'none',
      fontSize: 14,
      fontWeight: 700,
    } as React.CSSProperties,

    hero: {
      maxWidth: 800,
      margin: '0 auto',
      padding: '6rem 2rem 3rem',
      textAlign: 'center',
    } as React.CSSProperties,

    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '5px 14px',
      borderRadius: 20,
      border: '1px solid rgba(108,71,255,0.35)',
      background: 'rgba(108,71,255,0.08)',
      marginBottom: '2rem',
    } as React.CSSProperties,

    badgeDot: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: '#6c47ff',
      display: 'inline-block',
    } as React.CSSProperties,

    badgeText: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.55)',
      fontWeight: 500,
    } as React.CSSProperties,

    h1: {
      fontSize: 'clamp(2.5rem,6vw,4.5rem)',
      fontWeight: 900,
      letterSpacing: '-2px',
      lineHeight: 1.05,
      margin: '0 0 1.5rem',
    } as React.CSSProperties,

    sub: {
      fontSize: 17,
      color: 'rgba(255,255,255,0.4)',
      lineHeight: 1.7,
      margin: '0 auto 3rem',
      maxWidth: 500,
    } as React.CSSProperties,

    card: {
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20,
      padding: '1.75rem',
    } as React.CSSProperties,

    inputRow: {
      display: 'flex',
      gap: 10,
      marginBottom: 10,
    } as React.CSSProperties,

    input: {
      flex: 1,
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10,
      padding: '13px 16px',
      color: '#fff',
      fontSize: 15,
      outline: 'none',
      fontFamily: 'inherit',
    } as React.CSSProperties,

    submit: {
      padding: '13px 26px',
      background: '#6c47ff',
      border: 'none',
      borderRadius: 10,
      color: '#fff',
      fontWeight: 700,
      fontSize: 15,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      fontFamily: 'inherit',
    } as React.CSSProperties,

    aliasRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    } as React.CSSProperties,

    aliasPrefix: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.25)',
      whiteSpace: 'nowrap',
    } as React.CSSProperties,

    aliasInput: {
      flex: 1,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 8,
      padding: '9px 14px',
      color: 'rgba(255,255,255,0.7)',
      fontSize: 13,
      outline: 'none',
      fontFamily: 'inherit',
    } as React.CSSProperties,

    result: {
      marginTop: 16,
      padding: '14px 18px',
      background: 'rgba(108,71,255,0.1)',
      border: '1px solid rgba(108,71,255,0.25)',
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    } as React.CSSProperties,

    resultUrl: {
      fontSize: 16,
      fontWeight: 700,
      color: '#a78bfa',
      margin: 0,
    } as React.CSSProperties,

    resultOrig: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.3)',
      margin: '3px 0 0',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    } as React.CSSProperties,

    copyBtn: {
      padding: '8px 16px',
      border: '1px solid rgba(108,71,255,0.4)',
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      fontFamily: 'inherit',
    } as React.CSSProperties,

    statsBar: {
      borderTop: '1px solid rgba(255,255,255,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      padding: '2rem 3rem',
      display: 'flex',
      justifyContent: 'center',
      gap: '5rem',
    } as React.CSSProperties,

    statVal: {
      fontSize: 28,
      fontWeight: 900,
      margin: 0,
      letterSpacing: '-1px',
    } as React.CSSProperties,

    statLabel: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.3)',
      margin: '4px 0 0',
      textTransform: 'uppercase' as const,
      letterSpacing: 1.5,
    } as React.CSSProperties,

    features: {
      maxWidth: 1000,
      margin: '0 auto',
      padding: '5rem 2rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
      gap: 14,
    } as React.CSSProperties,

    featureCard: {
      padding: '1.5rem',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
      background: 'rgba(255,255,255,0.015)',
    } as React.CSSProperties,

    featureTitle: {
      fontSize: 14,
      fontWeight: 700,
      margin: '10px 0 7px',
      color: '#fff',
    } as React.CSSProperties,

    featureDesc: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.38)',
      margin: 0,
      lineHeight: 1.65,
    } as React.CSSProperties,

    footer: {
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '2rem 3rem',
      textAlign: 'center' as const,
    } as React.CSSProperties,

    footerText: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.18)',
      margin: 0,
    } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.logo}>
          <div style={S.logoBox}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 8h12M9 3l5 5-5 5"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <span style={S.logoText}>
            snip<span style={{ color: '#6c47ff' }}>.ly</span>
          </span>
        </div>

        <div style={S.navLinks}>
          <Link to="/login" style={S.btnGhost}>
            Log in
          </Link>

          <Link to="/register" style={S.btnPrimary}>
            Get started
          </Link>
        </div>
      </nav>

      <div style={S.hero}>
        <div style={S.badge}>
          <span style={S.badgeDot} />
          <span style={S.badgeText}>
            Redis-cached · sub-10ms redirects
          </span>
        </div>

        <h1 style={S.h1}>
          Short links.
          <br />
          <span style={{ color: '#6c47ff' }}>Real analytics.</span>
        </h1>

        <p style={S.sub}>
          Shorten any URL, set a custom alias, track every click.
          Built for speed at scale.
        </p>

        <div style={S.card}>
          <form onSubmit={handleShorten}>
            <div style={S.inputRow}>
              <input
                type="url"
                placeholder="Paste your long URL here…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                style={S.input}
              />

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...S.submit,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? '…' : 'Shorten →'}
              </button>
            </div>

            <div style={S.aliasRow}>
              <span style={S.aliasPrefix}>snip.ly /</span>

              <input
                type="text"
                placeholder="custom-alias (optional)"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                style={S.aliasInput}
              />
            </div>
          </form>

          {result && (
            <div style={S.result}>
              <div style={{ minWidth: 0 }}>
                <p style={S.resultUrl}>{result.shortUrl}</p>
                <p style={S.resultOrig}>{result.originalUrl}</p>
              </div>

              <button
                onClick={() => copy(result.shortUrl)}
                style={{
                  ...S.copyBtn,
                  background: copied
                    ? 'rgba(16,185,129,0.15)'
                    : 'rgba(108,71,255,0.15)',
                  color: copied ? '#34d399' : '#a78bfa',
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={S.statsBar}>
        {[
          ['< 10ms', 'Redirect speed'],
          ['99.9%', 'Uptime SLA'],
          ['24h', 'Cache TTL'],
        ].map(([v, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <p style={S.statVal}>{v}</p>
            <p style={S.statLabel}>{l}</p>
          </div>
        ))}
      </div>

      <div style={S.features}>
        {[
          [
            '⚡',
            'Redis hot path',
            'Redirects hit an in-memory cache first. Cold starts populate it automatically.',
          ],
          [
            '📊',
            'Click analytics',
            'Track clicks over time, devices, browsers, OS and referrers via MongoDB aggregations.',
          ],
          [
            '🔒',
            'Secure by default',
            'Helmet headers, bcrypt hashing, JWT auth, Zod validation on every request.',
          ],
          [
            '🎯',
            'Custom aliases',
            'Make links memorable: snip.ly/launch instead of snip.ly/xK3p9qR.',
          ],
          [
            '⏱',
            'Link expiry',
            "TTL-based expiry using MongoDB's native index. No cron jobs needed.",
          ],
          [
            '🐳',
            'Docker-ready',
            'One docker-compose command runs MongoDB, Redis, and the full app stack.',
          ],
        ].map(([icon, title, desc]) => (
          <div key={String(title)} style={S.featureCard}>
            <div style={{ fontSize: 22 }}>{icon}</div>

            <p style={S.featureTitle}>{title}</p>

            <p style={S.featureDesc}>{desc}</p>
          </div>
        ))}
      </div>

      <div style={S.footer}>
        <p style={S.footerText}>
          MERN · TypeScript · Redis · Docker
        </p>
      </div>
    </div>
  );
}