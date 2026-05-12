import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { urlApi, UrlData, PaginationMeta } from '../services/api';
import { useAuthStore } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const S = {
  page: { minHeight:'100vh', background:'#080810', color:'#fff', fontFamily:"'Inter',system-ui,sans-serif" } as React.CSSProperties,
  nav: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.25rem 2.5rem', borderBottom:'1px solid rgba(255,255,255,0.06)' } as React.CSSProperties,
  logo: { display:'flex', alignItems:'center', gap:10 } as React.CSSProperties,
  logoBox: { width:28, height:28, background:'#6c47ff', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' } as React.CSSProperties,
  main: { maxWidth:900, margin:'0 auto', padding:'2.5rem 2rem' } as React.CSSProperties,
  topBar: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem' } as React.CSSProperties,
  heading: { fontSize:28, fontWeight:900, letterSpacing:'-1px', margin:'0 0 4px' } as React.CSSProperties,
  subHeading: { fontSize:13, color:'rgba(255,255,255,0.35)', margin:0 } as React.CSSProperties,
  createBtn: { padding:'10px 20px', background:'#6c47ff', border:'none', borderRadius:9, color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 } as React.CSSProperties,
  formCard: { background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'1.5rem', marginBottom:'1.5rem' } as React.CSSProperties,
  formRow: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 } as React.CSSProperties,
  input: { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:9, padding:'11px 14px', color:'#fff', fontSize:14, outline:'none', fontFamily:'inherit', width:'100%', boxSizing:'border-box' as const } as React.CSSProperties,
  formActions: { display:'flex', gap:10, marginTop:4 } as React.CSSProperties,
  saveBtn: { padding:'10px 22px', background:'#6c47ff', border:'none', borderRadius:8, color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit' } as React.CSSProperties,
  cancelBtn: { padding:'10px 22px', background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'rgba(255,255,255,0.5)', fontSize:14, cursor:'pointer', fontFamily:'inherit' } as React.CSSProperties,
  urlList: { display:'flex', flexDirection:'column' as const, gap:8 } as React.CSSProperties,
  urlCard: { background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:'1rem', transition:'border-color .15s' } as React.CSSProperties,
  urlCardInactive: { opacity:0.45 } as React.CSSProperties,
  urlMain: { flex:1, minWidth:0 } as React.CSSProperties,
  urlShort: { fontSize:15, fontWeight:700, color:'#a78bfa', textDecoration:'none', display:'flex', alignItems:'center', gap:6 } as React.CSSProperties,
  urlOrig: { fontSize:12, color:'rgba(255,255,255,0.3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const, marginTop:2 } as React.CSSProperties,
  urlTitle: { fontSize:11, color:'rgba(255,255,255,0.2)', marginTop:2 } as React.CSSProperties,
  urlMeta: { display:'flex', alignItems:'center', gap:4, color:'rgba(255,255,255,0.3)', fontSize:13, flexShrink:0 } as React.CSSProperties,
  urlActions: { display:'flex', alignItems:'center', gap:4, flexShrink:0 } as React.CSSProperties,
  iconBtn: { padding:'7px', background:'transparent', border:'none', borderRadius:7, color:'rgba(255,255,255,0.35)', cursor:'pointer', fontSize:14, lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center', transition:'color .15s, background .15s' } as React.CSSProperties,
  pill: { padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 } as React.CSSProperties,
  skeleton: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, height:72, animation:'pulse 1.5s ease infinite' } as React.CSSProperties,
  empty: { textAlign:'center' as const, padding:'5rem 2rem' } as React.CSSProperties,
  pager: { display:'flex', justifyContent:'center', alignItems:'center', gap:12, marginTop:'2rem' } as React.CSSProperties,
  pageBtn: { padding:'8px 16px', background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:13, fontFamily:'inherit' } as React.CSSProperties,
  logoutBtn: { padding:'7px 16px', background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:13, fontFamily:'inherit' } as React.CSSProperties,
};

export function DashboardPage() {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ originalUrl:'', customAlias:'', title:'' });
  const { user, logout } = useAuthStore();

  const fetchUrls = async (p = 1) => {
    setLoading(true);
    try {
      const res = await urlApi.list(p);
      setUrls(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load links'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUrls(page); }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await urlApi.create({ originalUrl:form.originalUrl, customAlias:form.customAlias||undefined, title:form.title||undefined });
      toast.success('Link created!');
      setShowCreate(false);
      setForm({ originalUrl:'', customAlias:'', title:'' });
      fetchUrls(1);
    } catch (err:any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const toggleActive = async (url: UrlData) => {
    try {
      await urlApi.update(url.shortCode, { isActive: !url.isActive });
      setUrls(prev => prev.map(u => u._id === url._id ? { ...u, isActive: !u.isActive } : u));
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async (code: string) => {
    if (!confirm('Delete this link permanently?')) return;
    try {
      await urlApi.delete(code);
      toast.success('Deleted');
      fetchUrls(page);
    } catch { toast.error('Delete failed'); }
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  return (
    <div style={S.page}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      <nav style={S.nav}>
        <div style={S.logo}>
          <div style={S.logoBox}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 8h12M9 3l5 5-5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight:800, fontSize:17, letterSpacing:'-0.5px' }}>snip<span style={{color:'#6c47ff'}}>.ly</span></span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:13, color:'rgba(255,255,255,0.3)' }}>
            <span style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background:'#6c47ff', marginRight:6, verticalAlign:'middle' }}/>
            {user?.name}
          </span>
          <button onClick={logout} style={S.logoutBtn}>Log out</button>
        </div>
      </nav>

      <main style={S.main}>
        <div style={S.topBar}>
          <div>
            <h1 style={S.heading}>Your links</h1>
            <p style={S.subHeading}>{pagination ? `${pagination.total} links` : 'Loading…'}</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} style={S.createBtn}>
            <span style={{ fontSize:18, lineHeight:1 }}>+</span> New link
          </button>
        </div>

        {showCreate && (
          <div style={S.formCard}>
            <p style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.5)', margin:'0 0 14px', textTransform:'uppercase', letterSpacing:1 }}>New link</p>
            <form onSubmit={handleCreate}>
              <input type="url" placeholder="https://your-original-url.com/…" value={form.originalUrl}
                onChange={e => setForm({...form, originalUrl:e.target.value})} style={{...S.input, marginBottom:12}} required/>
              <div style={S.formRow}>
                <input type="text" placeholder="Custom alias (optional)" value={form.customAlias}
                  onChange={e => setForm({...form, customAlias:e.target.value})} style={S.input}/>
                <input type="text" placeholder="Title (optional)" value={form.title}
                  onChange={e => setForm({...form, title:e.target.value})} style={S.input}/>
              </div>
              <div style={S.formActions}>
                <button type="submit" style={S.saveBtn}>Create link</button>
                <button type="button" onClick={() => setShowCreate(false)} style={S.cancelBtn}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div style={S.urlList}>
          {loading ? (
            [...Array(4)].map((_,i) => <div key={i} style={S.skeleton}/>)
          ) : urls.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize:40, marginBottom:16, opacity:.2 }}>🔗</div>
              <p style={{ color:'rgba(255,255,255,0.25)', fontSize:14 }}>No links yet. Create your first one above.</p>
            </div>
          ) : urls.map(url => (
            <div key={url._id} style={{ ...S.urlCard, ...(url.isActive ? {} : S.urlCardInactive) }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:url.isActive?'#6c47ff':'rgba(255,255,255,0.15)', flexShrink:0 }}/>
              <div style={S.urlMain}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <a href={url.shortUrl} target="_blank" rel="noreferrer" style={S.urlShort}>
                    {url.shortUrl}
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{opacity:.5}}>
                      <path d="M2 10L10 2M10 2H5M10 2v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </a>
                  {url.title && <span style={{ fontSize:11, color:'rgba(255,255,255,0.25)' }}>{url.title}</span>}
                </div>
                <p style={S.urlOrig}>{url.originalUrl}</p>
              </div>

              <div style={S.urlMeta}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <span>{url.clicks.toLocaleString()}</span>
              </div>

              <div style={S.urlActions}>
                <button onClick={() => copy(url.shortUrl)} style={S.iconBtn} title="Copy">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M3 11V3h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                </button>
                <Link to={`/analytics/${url.shortCode}`} style={{ ...S.iconBtn, textDecoration:'none' }} title="Analytics">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="10" width="3" height="4" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="6.5" y="6" width="3" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="11" y="2" width="3" height="12" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>
                </Link>
                <button onClick={() => toggleActive(url)} style={S.iconBtn} title={url.isActive ? 'Disable' : 'Enable'}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="5" width="14" height="6" rx="3" stroke={url.isActive?'#6c47ff':'currentColor'} strokeWidth="1.4" fill={url.isActive?'rgba(108,71,255,0.2)':'none'}/>
                    <circle cx={url.isActive?11:5} cy="8" r="2" fill={url.isActive?'#6c47ff':'currentColor'}/>
                  </svg>
                </button>
                <button onClick={() => handleDelete(url.shortCode)} style={{ ...S.iconBtn, color:'rgba(239,68,68,0.5)' }} title="Delete">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M6 4V2h4v2M5 4l1 9h4l1-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div style={S.pager}>
            <button onClick={() => setPage(p => p-1)} disabled={!pagination.hasPrev} style={{ ...S.pageBtn, opacity: pagination.hasPrev?1:0.3 }}>← Prev</button>
            <span style={{ fontSize:13, color:'rgba(255,255,255,0.3)' }}>{pagination.page} / {pagination.totalPages}</span>
            <button onClick={() => setPage(p => p+1)} disabled={!pagination.hasNext} style={{ ...S.pageBtn, opacity: pagination.hasNext?1:0.3 }}>Next →</button>
          </div>
        )}
      </main>
    </div>
  );
}
