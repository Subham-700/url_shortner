import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { urlApi, AnalyticsData } from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#6c47ff', '#a78bfa', '#34d399', '#f472b6', '#facc15'];

const S = {
  page: { minHeight:'100vh', background:'#080810', color:'#fff', fontFamily:"'Inter',system-ui,sans-serif" } as React.CSSProperties,
  nav: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.25rem 2.5rem', borderBottom:'1px solid rgba(255,255,255,0.06)' } as React.CSSProperties,
  logo: { display:'flex', alignItems:'center', gap:10 } as React.CSSProperties,
  logoBox: { width:28, height:28, background:'#6c47ff', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' } as React.CSSProperties,
  main: { maxWidth:960, margin:'0 auto', padding:'2.5rem 2rem' } as React.CSSProperties,
  back: { display:'inline-flex', alignItems:'center', gap:6, color:'rgba(255,255,255,0.35)', textDecoration:'none', fontSize:13, marginBottom:'2rem', fontWeight:500 } as React.CSSProperties,
  heading: { fontSize:26, fontWeight:900, letterSpacing:'-1px', margin:'0 0 2rem' } as React.CSSProperties,
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:'1.5rem' } as React.CSSProperties,
  statCard: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'1.25rem 1.5rem' } as React.CSSProperties,
  statLabel: { fontSize:11, color:'rgba(255,255,255,0.35)', textTransform:'uppercase' as const, letterSpacing:1.2, margin:'0 0 8px', fontWeight:600 } as React.CSSProperties,
  statValue: { fontSize:32, fontWeight:900, letterSpacing:'-1px', margin:0 } as React.CSSProperties,
  chartCard: { background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'1.5rem', marginBottom:'1.5rem' } as React.CSSProperties,
  chartTitle: { fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.45)', textTransform:'uppercase' as const, letterSpacing:1, margin:'0 0 1.25rem' } as React.CSSProperties,
  grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 } as React.CSSProperties,
  refItem: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' } as React.CSSProperties,
  refUrl: { fontSize:13, color:'rgba(255,255,255,0.55)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const, maxWidth:200 } as React.CSSProperties,
  refCount: { fontSize:14, fontWeight:700, color:'#a78bfa', flexShrink:0 } as React.CSSProperties,
  empty: { textAlign:'center' as const, padding:'3rem', color:'rgba(255,255,255,0.2)', fontSize:13 } as React.CSSProperties,
};

const tooltipStyle = { background:'#12121e', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, fontSize:12 };

export function AnalyticsPage() {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    urlApi.analytics(code)
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return (
    <div style={{ ...S.page, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)' }}>Loading analytics…</div>
    </div>
  );

  if (!data) return null;

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.logo}>
          <div style={S.logoBox}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 8h12M9 3l5 5-5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight:800, fontSize:17, letterSpacing:'-0.5px' }}>snip<span style={{color:'#6c47ff'}}>.ly</span></span>
        </div>
      </nav>

      <main style={S.main}>
        <Link to="/dashboard" style={S.back}>
          ← Back to dashboard
        </Link>
        <h1 style={S.heading}>
          Analytics <span style={{color:'rgba(255,255,255,0.25)'}}>/</span>{' '}
          <span style={{color:'#6c47ff'}}>{code}</span>
        </h1>

        <div style={S.statsGrid}>
          {[
            { label:'Total clicks', value:data.totalClicks.toLocaleString(), color:'#6c47ff' },
            { label:'Unique clicks', value:data.uniqueClicks.toLocaleString(), color:'#a78bfa' },
            { label:'Devices', value:data.clicksByDevice.length, color:'#34d399' },
            { label:'Referrers', value:data.topReferers.length, color:'#f472b6' },
          ].map(s => (
            <div key={s.label} style={S.statCard}>
              <p style={S.statLabel}>{s.label}</p>
              <p style={{ ...S.statValue, color:s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={S.chartCard}>
          <p style={S.chartTitle}>Clicks — last 30 days</p>
          {data.clicksByDay.length === 0 ? (
            <div style={S.empty}>No click data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.clicksByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fontSize:11, fill:'rgba(255,255,255,0.3)' }} tickFormatter={v => v.slice(5)}/>
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize:11, fill:'rgba(255,255,255,0.3)' }}/>
                <Tooltip contentStyle={tooltipStyle} labelStyle={{color:'rgba(255,255,255,0.5)'}} itemStyle={{color:'#a78bfa'}}/>
                <Line type="monotone" dataKey="count" stroke="#6c47ff" strokeWidth={2.5} dot={false} activeDot={{ r:4, fill:'#6c47ff' }}/>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={S.grid2}>
          <div style={S.chartCard}>
            <p style={S.chartTitle}>Device breakdown</p>
            {data.clicksByDevice.length === 0 ? (
              <div style={S.empty}>No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data.clicksByDevice} dataKey="count" nameKey="device" cx="50%" cy="50%" outerRadius={72} paddingAngle={3}>
                    {data.clicksByDevice.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}/>
                  <Tooltip contentStyle={tooltipStyle}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={S.chartCard}>
            <p style={S.chartTitle}>Top referrers</p>
            {data.topReferers.length === 0 ? (
              <div style={S.empty}>No referrer data yet</div>
            ) : (
              <div>
                {data.topReferers.map((r,i) => (
                  <div key={i} style={S.refItem}>
                    <span style={S.refUrl}>{r.referer || 'Direct'}</span>
                    <span style={S.refCount}>{r.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
