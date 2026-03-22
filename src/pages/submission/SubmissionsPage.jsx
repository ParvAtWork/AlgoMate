// src/pages/submission/SubmissionsPage.jsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSubmission } from '../../hooks/useSubmission.js'
import Navbar from '../../components/common/Navbar.jsx'
import { SUBMISSION_STATUS, PROGRAMMING_LANGUAGES } from '../../config/constants.js'
import { CheckCircle2, XCircle, Clock, Search, Filter } from 'lucide-react'

const statusColor = s => ({
    [SUBMISSION_STATUS.ACCEPTED]:            { color:'#22c55e', bg:'rgba(34,197,94,.1)',   border:'rgba(34,197,94,.2)'   },
    [SUBMISSION_STATUS.WRONG_ANSWER]:        { color:'#ef4444', bg:'rgba(239,68,68,.1)',   border:'rgba(239,68,68,.2)'   },
    [SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED]: { color:'#f59e0b', bg:'rgba(245,158,11,.1)', border:'rgba(245,158,11,.2)' },
    [SUBMISSION_STATUS.COMPILATION_ERROR]:   { color:'#f87171', bg:'rgba(248,113,113,.1)', border:'rgba(248,113,113,.2)' },
    [SUBMISSION_STATUS.RUNTIME_ERROR]:       { color:'#f87171', bg:'rgba(248,113,113,.1)', border:'rgba(248,113,113,.2)' },
    [SUBMISSION_STATUS.PENDING]:             { color:'#60a5fa', bg:'rgba(96,165,250,.1)',  border:'rgba(96,165,250,.2)'  },
})[s] || { color:'#60a5fa', bg:'rgba(96,165,250,.1)', border:'rgba(96,165,250,.2)' }

const SubmissionsPage = () => {
    const navigate  = useNavigate()
    const { submissions, loading, error, fetchMySubmissions } = useSubmission()
    const [search,    setSearch]    = useState('')
    const [statusFilter, setStatus] = useState('All')

    useEffect(() => { fetchMySubmissions() }, [])

    const filtered = submissions.filter(s => {
        const ms = !search || String(s.problemId).includes(search)
        const mf = statusFilter === 'All' || s.status === statusFilter
        return ms && mf
    })

    const stats = {
        total:    submissions.length,
        accepted: submissions.filter(s => s.status === SUBMISSION_STATUS.ACCEPTED).length,
        rate:     submissions.length
            ? Math.round((submissions.filter(s => s.status === SUBMISSION_STATUS.ACCEPTED).length / submissions.length) * 100)
            : 0,
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
                @keyframes sb-grid { 0%,100%{opacity:.022} 50%{opacity:.05} }
                @keyframes sb-glow { 0%,100%{opacity:.07}  50%{opacity:.14} }
                @keyframes sb-fade { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                @keyframes sb-row  { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
                @keyframes sb-skel { 0%,100%{opacity:.05} 50%{opacity:.12} }
                .sb-page  { min-height:100vh; background:#06080e; font-family:'Space Grotesk',sans-serif; }
                .sb-grid  { position:fixed; inset:0; background:repeating-linear-gradient(90deg,rgba(226,232,240,.022) 0,transparent 1px,transparent 80px),repeating-linear-gradient(180deg,rgba(226,232,240,.022) 0,transparent 1px,transparent 80px); animation:sb-grid 5s ease-in-out infinite; pointer-events:none; z-index:0; }
                .sb-glow  { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; animation:sb-glow 5s ease-in-out infinite; }
                .sb-inner { max-width:960px; margin:0 auto; padding:28px 24px 60px; position:relative; z-index:1; }
                .sb-status-btn { padding:5px 14px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer; transition:all .18s; font-family:'Space Grotesk',sans-serif; border:1px solid rgba(226,232,240,.09); background:rgba(226,232,240,.04); color:rgba(148,163,184,.6); }
                .sb-status-btn.active { background:rgba(96,165,250,.1); border-color:rgba(96,165,250,.25); color:#60a5fa; }
                .sb-status-btn:hover:not(.active) { background:rgba(226,232,240,.07); color:rgba(226,232,240,.8); }
                .sb-row { display:grid; grid-template-columns:70px 1fr 160px 120px 100px 90px; align-items:center; padding:14px 18px; border-bottom:1px solid rgba(226,232,240,.05); transition:background .15s; cursor:pointer; }
                .sb-row:last-child { border-bottom:none; }
                .sb-row:hover { background:rgba(226,232,240,.03); }
                .sb-skel { height:54px; background:rgba(226,232,240,.05); animation:sb-skel 1.4s ease-in-out infinite; border-bottom:1px solid rgba(226,232,240,.05); }
            `}</style>

            <div className="sb-page">
                <div className="sb-grid" />
                <div className="sb-glow" style={{ width:500, height:400, background:'rgba(96,165,250,.04)', top:-80, left:'20%' }} />
                <div className="sb-glow" style={{ width:300, height:300, background:'rgba(34,197,94,.04)', bottom:'10%', right:'5%', animationDelay:'2s' }} />
                <Navbar />
                <div style={{ height:72 }} />

                <div className="sb-inner">
                    {/* Header */}
                    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4 }} style={{ marginBottom:24 }}>
                        <div style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:'rgba(96,165,250,.5)', letterSpacing:'.18em', textTransform:'uppercase', marginBottom:6 }}>
                            // My Submissions
                        </div>
                        <div style={{ fontSize:24, fontWeight:800, color:'#e2e8f0', letterSpacing:'-.03em', marginBottom:4 }}>
                            Submission{' '}
                            <span style={{ background:'linear-gradient(90deg,#60a5fa,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                                History
                            </span>
                        </div>
                        <div style={{ fontSize:13, color:'rgba(148,163,184,.5)' }}>
                            Track all your code submissions and results
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
                                style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
                        {[
                            { label:'Total',    value:stats.total,    color:'#e2e8f0', icon:<Clock       size={15}/> },
                            { label:'Accepted', value:stats.accepted, color:'#22c55e', icon:<CheckCircle2 size={15}/> },
                            { label:'Rejected', value:stats.total - stats.accepted, color:'#ef4444', icon:<XCircle size={15}/> },
                            { label:'AC Rate',  value:`${stats.rate}%`, color:'#60a5fa', icon:<Filter size={15}/> },
                        ].map((s,i) => (
                            <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*.07 }}
                                        style={{ padding:'16px 20px', borderRadius:11, background:'rgba(226,232,240,.03)', border:'1px solid rgba(226,232,240,.08)', flex:1, minWidth:120, display:'flex', alignItems:'center', gap:12, transition:'all .2s' }}>
                                <div style={{ color:s.color }}>{s.icon}</div>
                                <div>
                                    <div style={{ fontSize:20, fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'-.02em' }}>{s.value}</div>
                                    <div style={{ fontSize:10, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.06em', textTransform:'uppercase' }}>{s.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Filters */}
                    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.18 }}
                                style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:9, background:'rgba(226,232,240,.04)', border:'1px solid rgba(226,232,240,.1)', flex:1, minWidth:200 }}>
                            <Search size={13} style={{ color:'rgba(148,163,184,.4)', flexShrink:0 }} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by problem ID..."
                                style={{ background:'none', border:'none', outline:'none', color:'#e2e8f0', fontSize:13, fontFamily:"'JetBrains Mono',monospace", width:'100%' }}
                            />
                        </div>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                            {['All', ...Object.values(SUBMISSION_STATUS)].map(s => (
                                <button
                                    key={s}
                                    className={`sb-status-btn ${statusFilter===s ? 'active' : ''}`}
                                    onClick={() => setStatus(s)}
                                >
                                    {s === 'All' ? 'All' : s}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Table */}
                    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.24 }}
                                style={{ border:'1px solid rgba(226,232,240,.07)', borderRadius:12, overflow:'hidden' }}>

                        <div style={{ display:'grid', gridTemplateColumns:'70px 1fr 160px 120px 100px 90px', padding:'9px 18px', background:'rgba(226,232,240,.025)', borderBottom:'1px solid rgba(226,232,240,.07)', fontSize:10, fontWeight:700, color:'rgba(148,163,184,.4)', letterSpacing:'.08em', textTransform:'uppercase', fontFamily:"'JetBrains Mono',monospace" }}>
                            <div>#</div>
                            <div>Problem</div>
                            <div>Status</div>
                            <div>Language</div>
                            <div>Runtime</div>
                            <div style={{ textAlign:'right' }}>Date</div>
                        </div>

                        {loading ? (
                            Array(6).fill(0).map((_,i) => (
                                <div key={i} className="sb-skel" style={{ animationDelay:`${i*.08}s` }} />
                            ))
                        ) : filtered.length === 0 ? (
                            <div style={{ padding:'60px 20px', textAlign:'center' }}>
                                <div style={{ fontSize:32, marginBottom:12 }}>📋</div>
                                <div style={{ fontSize:14, fontWeight:600, color:'rgba(226,232,240,.6)', marginBottom:6 }}>
                                    No submissions found
                                </div>
                                <div style={{ fontSize:12, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", marginBottom:16 }}>
                                    Start solving problems to see your history here
                                </div>
                                <button
                                    onClick={() => navigate('/problems')}
                                    style={{ padding:'8px 20px', borderRadius:9, background:'rgba(96,165,250,.1)', border:'1px solid rgba(96,165,250,.22)', color:'#60a5fa', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}
                                >
                                    Browse Problems →
                                </button>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {filtered.map((s, i) => {
                                    const sc  = statusColor(s.status)
                                    const lang = PROGRAMMING_LANGUAGES.find(l => l.id === s.languageId)
                                    return (
                                        <motion.div
                                            key={s.id || i}
                                            className="sb-row"
                                            initial={{ opacity:0, x:-6 }}
                                            animate={{ opacity:1, x:0 }}
                                            transition={{ delay: i * .04 }}
                                            onClick={() => navigate(`/problems/${s.problemId}`)}
                                        >
                                            <div style={{ fontSize:11, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace" }}>
                                                #{s.id}
                                            </div>
                                            <div style={{ fontSize:13.5, fontWeight:600, color:'#e2e8f0' }}>
                                                Problem #{s.problemId}
                                            </div>
                                            <div>
                                                <span style={{ padding:'3px 10px', borderRadius:8, fontSize:11, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", background:sc.bg, color:sc.color, border:`1px solid ${sc.border}` }}>
                                                    {s.status}
                                                </span>
                                            </div>
                                            <div style={{ fontSize:12, color:'rgba(148,163,184,.5)', fontFamily:"'JetBrains Mono',monospace" }}>
                                                {lang?.name?.split(' ')[0] || 'Unknown'}
                                            </div>
                                            <div style={{ fontSize:12, color:'rgba(148,163,184,.45)', fontFamily:"'JetBrains Mono',monospace" }}>
                                                {s.runtime ? `${s.runtime}ms` : '—'}
                                            </div>
                                            <div style={{ fontSize:11, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", textAlign:'right' }}>
                                                {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        )}
                    </motion.div>

                    {error && (
                        <div style={{ marginTop:16, padding:'10px 14px', borderRadius:8, background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', fontSize:12, color:'#f87171', fontFamily:"'JetBrains Mono',monospace" }}>
                            ⚠ {error}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default SubmissionsPage