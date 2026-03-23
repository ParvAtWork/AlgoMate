// src/pages/submission/SubmissionsPage.jsx
import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSubmission } from '../../hooks/useSubmission.js'
import { useProblems } from '../../hooks/useProblems.js'
import Navbar from '../../components/common/Navbar.jsx'
import { SUBMISSION_STATUS, PROGRAMMING_LANGUAGES } from '../../config/constants.js'
import { CheckCircle2, XCircle, Clock, Search, Filter, Hash, Tag, X } from 'lucide-react'

const statusColor = s => ({
    [SUBMISSION_STATUS.ACCEPTED]:            { color:'#22c55e', bg:'rgba(34,197,94,.1)',    border:'rgba(34,197,94,.2)'    },
    [SUBMISSION_STATUS.WRONG_ANSWER]:        { color:'#ef4444', bg:'rgba(239,68,68,.1)',    border:'rgba(239,68,68,.2)'    },
    [SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED]: { color:'#f59e0b', bg:'rgba(245,158,11,.1)',   border:'rgba(245,158,11,.2)'   },
    [SUBMISSION_STATUS.COMPILATION_ERROR]:   { color:'#f87171', bg:'rgba(248,113,113,.1)',  border:'rgba(248,113,113,.2)'  },
    [SUBMISSION_STATUS.RUNTIME_ERROR]:       { color:'#fb923c', bg:'rgba(251,146,60,.1)',   border:'rgba(251,146,60,.2)'   },
    [SUBMISSION_STATUS.PENDING]:             { color:'#60a5fa', bg:'rgba(96,165,250,.1)',   border:'rgba(96,165,250,.2)'   },
    'Accepted':                              { color:'#22c55e', bg:'rgba(34,197,94,.1)',    border:'rgba(34,197,94,.2)'    },
    'Wrong Answer':                          { color:'#ef4444', bg:'rgba(239,68,68,.1)',    border:'rgba(239,68,68,.2)'    },
    'Time Limit Exceeded':                   { color:'#f59e0b', bg:'rgba(245,158,11,.1)',   border:'rgba(245,158,11,.2)'   },
    'Compilation Error':                     { color:'#f87171', bg:'rgba(248,113,113,.1)',  border:'rgba(248,113,113,.2)'  },
    'Runtime Error':                         { color:'#fb923c', bg:'rgba(251,146,60,.1)',   border:'rgba(251,146,60,.2)'   },
})[s] || { color:'#60a5fa', bg:'rgba(96,165,250,.1)', border:'rgba(96,165,250,.2)' }

const getLangName = (s) => {
    if (s.language && typeof s.language === 'string') {
        return s.language.split(' ')[0]
    }
    const found = PROGRAMMING_LANGUAGES.find(l => l.id === s.languageId)
    return found?.name?.split(' ')[0] || 'Unknown'
}

const ALL_STATUSES = [
    'All', 'Pending', 'In Queue', 'Processing', 'Accepted',
    'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error',
    'Runtime Error', 'Internal Error', 'Execution Format Error',
]

const SubmissionsPage = () => {
    const navigate = useNavigate()
    const { submissions, loading, error, fetchMySubmissions } = useSubmission()
    const { problems, fetchAllProblems } = useProblems()

    const [search,       setSearch]       = useState('')
    const [searchMode,   setSearchMode]   = useState('all')
    const [statusFilter, setStatusFilter] = useState('All')
    const [sortBy,       setSortBy]       = useState('date')
    const [sortDir,      setSortDir]      = useState('desc')

    useEffect(() => {
        fetchMySubmissions()
        fetchAllProblems()
    }, [])

    const problemMap = useMemo(() => {
        const map = {}
        problems.forEach(p => { map[p.id] = p })
        return map
    }, [problems])

    const stats = useMemo(() => {
        const total    = submissions.length
        const accepted = submissions.filter(s =>
            s.status === SUBMISSION_STATUS.ACCEPTED || s.status === 'Accepted'
        ).length
        return {
            total,
            accepted,
            rejected: total - accepted,
            rate: total ? Math.round((accepted / total) * 100) : 0,
        }
    }, [submissions])

    const filtered = useMemo(() => {
        let result = [...submissions]

        if (search.trim()) {
            const q = search.trim().toLowerCase()
            result = result.filter(s => {
                const prob = problemMap[s.problemId]
                if (searchMode === 'id')    return String(s.problemId).includes(q)
                if (searchMode === 'name')  return prob?.title?.toLowerCase().includes(q)
                if (searchMode === 'topic') return prob?.topic?.toLowerCase().includes(q)
                return (
                    String(s.problemId).includes(q) ||
                    prob?.title?.toLowerCase().includes(q) ||
                    prob?.topic?.toLowerCase().includes(q) ||
                    (s.language || '').toLowerCase().includes(q)
                )
            })
        }

        if (statusFilter !== 'All') {
            result = result.filter(s => s.status === statusFilter)
        }

        result.sort((a, b) => {
            let valA, valB
            if (sortBy === 'date')    { valA = new Date(a.submittedAt); valB = new Date(b.submittedAt) }
            if (sortBy === 'status')  { valA = a.status;                valB = b.status                }
            if (sortBy === 'runtime') { valA = a.executionTimeMs || 0;  valB = b.executionTimeMs || 0  }
            if (valA < valB) return sortDir === 'asc' ? -1 : 1
            if (valA > valB) return sortDir === 'asc' ?  1 : -1
            return 0
        })

        return result
    }, [submissions, search, searchMode, statusFilter, sortBy, sortDir, problemMap])

    const toggleSort = (col) => {
        if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortBy(col); setSortDir('desc') }
    }

    const SortIcon = ({ col }) => sortBy === col
        ? <span style={{ color:'#60a5fa', fontSize:10 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
        : <span style={{ color:'rgba(148,163,184,.2)', fontSize:10 }}>↕</span>

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
                @keyframes sb-grid  { 0%,100%{opacity:.022} 50%{opacity:.05} }
                @keyframes sb-glow  { 0%,100%{opacity:.07}  50%{opacity:.14} }
                @keyframes sb-shine { 0%{background-position:200% center} 100%{background-position:-200% center} }
                .sb-page  { min-height:100vh; background:#06080e; font-family:'Space Grotesk',sans-serif; }
                .sb-grid  { position:fixed; inset:0; background:repeating-linear-gradient(90deg,rgba(226,232,240,.022) 0,transparent 1px,transparent 80px),repeating-linear-gradient(180deg,rgba(226,232,240,.022) 0,transparent 1px,transparent 80px); animation:sb-grid 5s ease-in-out infinite; pointer-events:none; z-index:0; }
                .sb-glow  { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; animation:sb-glow 5s ease-in-out infinite; }
                .sb-inner { max-width:1100px; margin:0 auto; padding:28px 24px 60px; position:relative; z-index:1; }
                .sb-mode-btn { padding:4px 12px; border-radius:7px; font-size:11px; font-weight:600; cursor:pointer; transition:all .15s; font-family:'JetBrains Mono',monospace; border:1px solid rgba(226,232,240,.08); background:rgba(226,232,240,.03); color:rgba(148,163,184,.5); }
                .sb-mode-btn.on { background:rgba(96,165,250,.12); border-color:rgba(96,165,250,.25); color:#60a5fa; }
                .sb-mode-btn:hover:not(.on) { background:rgba(226,232,240,.06); color:rgba(226,232,240,.7); }
                .sb-filter { padding:5px 13px; border-radius:20px; font-size:11px; font-weight:600; cursor:pointer; transition:all .15s; font-family:'Space Grotesk',sans-serif; border:1px solid rgba(226,232,240,.08); background:rgba(226,232,240,.03); color:rgba(148,163,184,.5); white-space:nowrap; }
                .sb-filter.on { background:rgba(96,165,250,.1); border-color:rgba(96,165,250,.25); color:#60a5fa; }
                .sb-filter:hover:not(.on) { background:rgba(226,232,240,.06); color:rgba(226,232,240,.7); }
                .sb-th { font-size:10px; font-weight:700; color:rgba(148,163,184,.4); letter-spacing:.08em; text-transform:uppercase; font-family:'JetBrains Mono',monospace; display:flex; align-items:center; gap:4px; user-select:none; }
                .sb-th.sort { cursor:pointer; }
                .sb-th.sort:hover { color:rgba(148,163,184,.7); }
                .sb-head { display:grid; grid-template-columns:55px minmax(0,1fr) 110px 140px 100px 90px 80px; align-items:center; padding:10px 18px; gap:10px; background:rgba(226,232,240,.025); border-bottom:1px solid rgba(226,232,240,.08); }
                .sb-row  { display:grid; grid-template-columns:55px minmax(0,1fr) 110px 140px 100px 90px 80px; align-items:center; padding:13px 18px; border-bottom:1px solid rgba(226,232,240,.05); transition:all .15s; cursor:pointer; gap:10px; }
                .sb-row:last-child { border-bottom:none; }
                .sb-row:hover { background:rgba(226,232,240,.025); transform:translateX(2px); }
                .sb-row.ac { background:rgba(34,197,94,.025); }
                .sb-row.ac:hover { background:rgba(34,197,94,.04); }
                .sb-skel { height:58px; background:linear-gradient(90deg,rgba(226,232,240,.04) 25%,rgba(226,232,240,.08) 50%,rgba(226,232,240,.04) 75%); background-size:200% auto; animation:sb-shine 1.4s linear infinite; border-bottom:1px solid rgba(226,232,240,.05); }
                .sb-stat { padding:16px 20px; border-radius:12px; background:rgba(226,232,240,.03); border:1px solid rgba(226,232,240,.07); flex:1; min-width:110px; display:flex; align-items:center; gap:12px; transition:all .2s; }
                .sb-stat:hover { background:rgba(226,232,240,.05); border-color:rgba(226,232,240,.12); transform:translateY(-2px); }
                .sb-topic { font-size:10.5px; padding:2px 8px; border-radius:8px; background:rgba(96,165,250,.08); color:#60a5fa; border:1px solid rgba(96,165,250,.15); font-family:'JetBrains Mono',monospace; font-weight:600; display:inline-block; max-width:105px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
                .sb-badge { padding:3px 9px; border-radius:8px; font-size:11px; font-weight:700; font-family:'JetBrains Mono',monospace; display:inline-block; max-width:135px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            `}</style>

            <div className="sb-page">
                <div className="sb-grid"/>
                <div className="sb-glow" style={{ width:500, height:400, background:'rgba(96,165,250,.04)', top:-80, left:'20%' }}/>
                <div className="sb-glow" style={{ width:300, height:300, background:'rgba(34,197,94,.04)', bottom:'10%', right:'5%', animationDelay:'2s' }}/>
                <Navbar/>
                <div style={{ height:72 }}/>

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
                            { label:'Total',    value:stats.total,      color:'#e2e8f0', icon:<Clock        size={15}/> },
                            { label:'Accepted', value:stats.accepted,   color:'#22c55e', icon:<CheckCircle2 size={15}/> },
                            { label:'Rejected', value:stats.rejected,   color:'#ef4444', icon:<XCircle      size={15}/> },
                            { label:'AC Rate',  value:`${stats.rate}%`, color:'#60a5fa', icon:<Filter       size={15}/> },
                        ].map((s,i) => (
                            <motion.div key={s.label} className="sb-stat"
                                        initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.07 }}>
                                <div style={{ color:s.color }}>{s.icon}</div>
                                <div>
                                    <div style={{ fontSize:20, fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>{s.value}</div>
                                    <div style={{ fontSize:10, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.06em', textTransform:'uppercase' }}>{s.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Search Engine */}
                    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.16 }}
                                style={{ padding:'16px 18px', borderRadius:12, background:'rgba(226,232,240,.025)', border:'1px solid rgba(226,232,240,.08)', marginBottom:14 }}>

                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
                            <Search size={13} style={{ color:'rgba(96,165,250,.6)', flexShrink:0 }}/>
                            <span style={{ fontSize:11, fontWeight:700, color:'rgba(148,163,184,.5)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase' }}>
                                Search Submissions
                            </span>
                        </div>

                        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 14px', borderRadius:9, background:'rgba(226,232,240,.04)', border:'1px solid rgba(226,232,240,.1)', marginBottom:10 }}>
                            <Search size={13} style={{ color:'rgba(148,163,184,.4)', flexShrink:0 }}/>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder={
                                    searchMode === 'id'    ? 'Search by problem ID (e.g. 5)...' :
                                        searchMode === 'name'  ? 'Search by problem name (e.g. Two Sum)...' :
                                            searchMode === 'topic' ? 'Search by topic (e.g. Arrays, DP)...' :
                                                'Search by ID, name, topic or language...'
                                }
                                style={{ background:'none', border:'none', outline:'none', color:'#e2e8f0', fontSize:13, fontFamily:"'JetBrains Mono',monospace", width:'100%' }}
                            />
                            {search && (
                                <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(148,163,184,.4)', padding:0, display:'flex', flexShrink:0 }}>
                                    <X size={13}/>
                                </button>
                            )}
                            {search && (
                                <span style={{ fontSize:10, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", flexShrink:0, paddingLeft:8, borderLeft:'1px solid rgba(226,232,240,.08)' }}>
                                    {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                            <span style={{ fontSize:10, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", marginRight:4 }}>Search by:</span>
                            {[
                                { key:'all',   label:'All'   },
                                { key:'id',    label:'#ID'   },
                                { key:'name',  label:'Name'  },
                                { key:'topic', label:'Topic' },
                            ].map(m => (
                                <button key={m.key} className={`sb-mode-btn ${searchMode===m.key?'on':''}`} onClick={() => setSearchMode(m.key)}>
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Status Filters */}
                    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2 }}
                                style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
                        <span style={{ fontSize:10, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace', marginRight:2" }}>Filter:</span>
                        {ALL_STATUSES.map(s => {
                            const sc = s !== 'All' ? statusColor(s) : null
                            return (
                                <button key={s} className={`sb-filter ${statusFilter===s?'on':''}`}
                                        onClick={() => setStatusFilter(s)}
                                        style={statusFilter===s && sc ? { background:sc.bg, borderColor:sc.border, color:sc.color } : {}}>
                                    {s}
                                </button>
                            )
                        })}
                    </motion.div>

                    {/* Table */}
                    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.26 }}
                                style={{ border:'1px solid rgba(226,232,240,.07)', borderRadius:12, overflow:'hidden' }}>

                        {/* Header */}
                        <div className="sb-head">
                            <div className="sb-th">#</div>
                            <div className="sb-th">Problem</div>
                            <div className="sb-th">Topic</div>
                            <div className="sb-th sort" onClick={() => toggleSort('status')}>
                                Status <SortIcon col="status"/>
                            </div>
                            <div className="sb-th">Language</div>
                            <div className="sb-th sort" onClick={() => toggleSort('runtime')}>
                                Runtime <SortIcon col="runtime"/>
                            </div>
                            <div className="sb-th sort" onClick={() => toggleSort('date')} style={{ justifyContent:'flex-end' }}>
                                Date <SortIcon col="date"/>
                            </div>
                        </div>

                        {/* Rows */}
                        {loading ? (
                            Array(6).fill(0).map((_,i) => (
                                <div key={i} className="sb-skel" style={{ animationDelay:`${i*.06}s` }}/>
                            ))
                        ) : filtered.length === 0 ? (
                            <div style={{ padding:'60px 20px', textAlign:'center' }}>
                                <div style={{ fontSize:32, marginBottom:12 }}>📋</div>
                                <div style={{ fontSize:14, fontWeight:600, color:'rgba(226,232,240,.6)', marginBottom:6 }}>
                                    {search ? `No results for "${search}"` : 'No submissions found'}
                                </div>
                                <div style={{ fontSize:12, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", marginBottom:16 }}>
                                    {search ? 'Try a different search term' : 'Start solving problems to see your history here'}
                                </div>
                                {!search && (
                                    <button onClick={() => navigate('/problems')}
                                            style={{ padding:'8px 20px', borderRadius:9, background:'rgba(96,165,250,.1)', border:'1px solid rgba(96,165,250,.22)', color:'#60a5fa', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}>
                                        Browse Problems →
                                    </button>
                                )}
                            </div>
                        ) : (
                            <AnimatePresence>
                                {filtered.map((s, i) => {
                                    const sc    = statusColor(s.status)
                                    const prob  = problemMap[s.problemId]
                                    const lang  = getLangName(s)
                                    const isAC  = s.status === SUBMISSION_STATUS.ACCEPTED || s.status === 'Accepted'
                                    return (
                                        <motion.div
                                            key={s.id || i}
                                            className={`sb-row ${isAC ? 'ac' : ''}`}
                                            initial={{ opacity:0, x:-6 }}
                                            animate={{ opacity:1, x:0 }}
                                            transition={{ delay:Math.min(i*.025, .25) }}
                                            onClick={() => navigate(`/problems/${s.problemId}`)}
                                            style={{ borderLeft:`2px solid ${isAC ? 'rgba(34,197,94,.25)' : 'transparent'}` }}
                                        >
                                            {/* # */}
                                            <div style={{ fontSize:11, color:'rgba(148,163,184,.3)', fontFamily:"'JetBrains Mono',monospace" }}>
                                                #{s.id}
                                            </div>

                                            {/* Problem */}
                                            <div style={{ minWidth:0 }}>
                                                <div style={{ fontSize:13.5, fontWeight:600, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                                    {prob?.title || `Problem #${s.problemId}`}
                                                </div>
                                                <div style={{ fontSize:10.5, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", marginTop:1 }}>
                                                    ID: {s.problemId}
                                                </div>
                                            </div>

                                            {/* Topic */}
                                            <div style={{ overflow:'hidden' }}>
                                                {prob?.topic ? (
                                                    <span className="sb-topic" title={prob.topic}>
                                                        {prob.topic}
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize:11, color:'rgba(148,163,184,.25)', fontFamily:"'JetBrains Mono',monospace" }}>—</span>
                                                )}
                                            </div>

                                            {/* Status */}
                                            <div style={{ overflow:'hidden' }}>
                                                <span className="sb-badge" title={s.status}
                                                      style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.border}` }}>
                                                    {s.status}
                                                </span>
                                            </div>

                                            {/* Language */}
                                            <div style={{ fontSize:12, color:'rgba(148,163,184,.6)', fontFamily:"'JetBrains Mono',monospace", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                                {lang}
                                            </div>

                                            {/* Runtime */}
                                            <div style={{ fontSize:12, color:'rgba(148,163,184,.45)', fontFamily:"'JetBrains Mono',monospace" }}>
                                                {s.executionTimeMs > 0 ? `⚡${Math.round(s.executionTimeMs)}ms` : '—'}
                                            </div>

                                            {/* Date */}
                                            <div style={{ fontSize:11, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", textAlign:'right' }}>
                                                {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        )}
                    </motion.div>

                    {/* Count */}
                    {!loading && filtered.length > 0 && (
                        <div style={{ marginTop:12, fontSize:11, color:'rgba(148,163,184,.3)', fontFamily:"'JetBrains Mono',monospace", textAlign:'right' }}>
                            Showing {filtered.length} of {submissions.length} submissions
                            {statusFilter !== 'All' && ` · filtered by "${statusFilter}"`}
                            {search && ` · matching "${search}"`}
                        </div>
                    )}

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


// src/pages/submission/SubmissionsPage.jsx
// import { useEffect, useState, useMemo } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { useNavigate } from 'react-router-dom'
// import { useSubmission } from '../../hooks/useSubmission.js'
// import { useProblems } from '../../hooks/useProblems.js'
// import Navbar from '../../components/common/Navbar.jsx'
// import { SUBMISSION_STATUS, PROGRAMMING_LANGUAGES } from '../../config/constants.js'
// import { CheckCircle2, XCircle, Clock, Search, Filter, Hash, Tag, ChevronDown, X } from 'lucide-react'
//
// const statusColor = s => ({
//     [SUBMISSION_STATUS.ACCEPTED]:            { color:'#22c55e', bg:'rgba(34,197,94,.1)',    border:'rgba(34,197,94,.2)'    },
//     [SUBMISSION_STATUS.WRONG_ANSWER]:        { color:'#ef4444', bg:'rgba(239,68,68,.1)',    border:'rgba(239,68,68,.2)'    },
//     [SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED]: { color:'#f59e0b', bg:'rgba(245,158,11,.1)',   border:'rgba(245,158,11,.2)'   },
//     [SUBMISSION_STATUS.COMPILATION_ERROR]:   { color:'#f87171', bg:'rgba(248,113,113,.1)',  border:'rgba(248,113,113,.2)'  },
//     [SUBMISSION_STATUS.RUNTIME_ERROR]:       { color:'#fb923c', bg:'rgba(251,146,60,.1)',   border:'rgba(251,146,60,.2)'   },
//     [SUBMISSION_STATUS.PENDING]:             { color:'#60a5fa', bg:'rgba(96,165,250,.1)',   border:'rgba(96,165,250,.2)'   },
// })[s] || { color:'#60a5fa', bg:'rgba(96,165,250,.1)', border:'rgba(96,165,250,.2)' }
//
// const ALL_STATUSES = [
//     'All',
//     'Pending',
//     'In Queue',
//     'Processing',
//     'Accepted',
//     'Wrong Answer',
//     'Time Limit Exceeded',
//     'Compilation Error',
//     'Runtime Error',
//     'Internal Error',
//     'Execution Format Error',
// ]
//
// const SubmissionsPage = () => {
//     const navigate = useNavigate()
//     const { submissions, loading, error, fetchMySubmissions } = useSubmission()
//     const { problems, fetchAllProblems } = useProblems()
//
//     const [search,       setSearch]       = useState('')
//     const [searchMode,   setSearchMode]   = useState('all')   // all | id | name | topic
//     const [statusFilter, setStatusFilter] = useState('All')
//     const [sortBy,       setSortBy]       = useState('date')  // date | status | runtime
//     const [sortDir,      setSortDir]      = useState('desc')
//
//     useEffect(() => {
//         fetchMySubmissions()
//         fetchAllProblems()
//     }, [])
//
//     // Problem map
//     const problemMap = useMemo(() => {
//         const map = {}
//         problems.forEach(p => { map[p.id] = p })
//         return map
//     }, [problems])
//
//     // Stats
//     const stats = useMemo(() => {
//         const total    = submissions.length
//         const accepted = submissions.filter(s => s.status === SUBMISSION_STATUS.ACCEPTED || s.status === 'Accepted').length
//         const rejected = total - accepted
//         const rate     = total ? Math.round((accepted / total) * 100) : 0
//         return { total, accepted, rejected, rate }
//     }, [submissions])
//
//     // Search + filter + sort
//     const filtered = useMemo(() => {
//         let result = [...submissions]
//
//         // Search
//         if (search.trim()) {
//             const q = search.trim().toLowerCase()
//             result = result.filter(s => {
//                 const prob = problemMap[s.problemId]
//                 if (searchMode === 'id')    return String(s.problemId).includes(q)
//                 if (searchMode === 'name')  return prob?.title?.toLowerCase().includes(q)
//                 if (searchMode === 'topic') return prob?.topic?.toLowerCase().includes(q)
//                 // all — search by id, name, topic
//                 return (
//                     String(s.problemId).includes(q) ||
//                     prob?.title?.toLowerCase().includes(q) ||
//                     prob?.topic?.toLowerCase().includes(q)
//                 )
//             })
//         }
//
//         // Status filter
//         if (statusFilter !== 'All') {
//             result = result.filter(s => s.status === statusFilter)
//         }
//
//         // Sort
//         result.sort((a, b) => {
//             let valA, valB
//             if (sortBy === 'date')    { valA = new Date(a.submittedAt); valB = new Date(b.submittedAt) }
//             if (sortBy === 'status')  { valA = a.status;                valB = b.status                }
//             if (sortBy === 'runtime') { valA = a.executionTimeMs||0;    valB = b.executionTimeMs||0    }
//             if (valA < valB) return sortDir === 'asc' ? -1 : 1
//             if (valA > valB) return sortDir === 'asc' ?  1 : -1
//             return 0
//         })
//
//         return result
//     }, [submissions, search, searchMode, statusFilter, sortBy, sortDir, problemMap])
//
//     const toggleSort = (col) => {
//         if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
//         else { setSortBy(col); setSortDir('desc') }
//     }
//
//     const SortIcon = ({ col }) => sortBy === col
//         ? <span style={{ color:'#60a5fa', fontSize:10 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
//         : <span style={{ color:'rgba(148,163,184,.2)', fontSize:10 }}>↕</span>
//
//     return (
//         <>
//             <style>{`
//                 @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
//                 @keyframes sb-grid  { 0%,100%{opacity:.022} 50%{opacity:.05} }
//                 @keyframes sb-glow  { 0%,100%{opacity:.07}  50%{opacity:.14} }
//                 @keyframes sb-skel  { 0%,100%{opacity:.05}  50%{opacity:.12} }
//                 @keyframes sb-shine { 0%{background-position:200% center} 100%{background-position:-200% center} }
//                 .sb-page  { min-height:100vh; background:#06080e; font-family:'Space Grotesk',sans-serif; }
//                 .sb-grid  { position:fixed; inset:0; background:repeating-linear-gradient(90deg,rgba(226,232,240,.022) 0,transparent 1px,transparent 80px),repeating-linear-gradient(180deg,rgba(226,232,240,.022) 0,transparent 1px,transparent 80px); animation:sb-grid 5s ease-in-out infinite; pointer-events:none; z-index:0; }
//                 .sb-glow  { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; animation:sb-glow 5s ease-in-out infinite; }
//                 .sb-inner { max-width:1060px; margin:0 auto; padding:28px 24px 60px; position:relative; z-index:1; }
//                 .sb-mode-btn { padding:4px 12px; border-radius:7px; font-size:11px; font-weight:600; cursor:pointer; transition:all .15s; font-family:'JetBrains Mono',monospace; border:1px solid rgba(226,232,240,.08); background:rgba(226,232,240,.03); color:rgba(148,163,184,.5); }
//                 .sb-mode-btn.active { background:rgba(96,165,250,.12); border-color:rgba(96,165,250,.25); color:#60a5fa; }
//                 .sb-mode-btn:hover:not(.active) { background:rgba(226,232,240,.06); color:rgba(226,232,240,.7); }
//                 .sb-filter-btn { padding:5px 14px; border-radius:20px; font-size:11.5px; font-weight:600; cursor:pointer; transition:all .15s; font-family:'Space Grotesk',sans-serif; border:1px solid rgba(226,232,240,.08); background:rgba(226,232,240,.03); color:rgba(148,163,184,.5); white-space:nowrap; }
//                 .sb-filter-btn.active { background:rgba(96,165,250,.1); border-color:rgba(96,165,250,.25); color:#60a5fa; }
//                 .sb-filter-btn:hover:not(.active) { background:rgba(226,232,240,.06); color:rgba(226,232,240,.7); }
//                 .sb-th    { font-size:10px; font-weight:700; color:rgba(148,163,184,.4); letter-spacing:.08em; text-transform:uppercase; font-family:'JetBrains Mono',monospace; cursor:pointer; display:flex; align-items:center; gap:4px; user-select:none; }
//                 .sb-th:hover { color:rgba(148,163,184,.7); }
//                 .sb-row   { display:grid; grid-template-columns:55px 1fr 80px 170px 110px 100px 80px; align-items:center; padding:13px 18px; border-bottom:1px solid rgba(226,232,240,.05); transition:all .15s; cursor:pointer; gap:8px; }
//                 .sb-row:last-child { border-bottom:none; }
//                 .sb-row:hover { background:rgba(226,232,240,.025); transform:translateX(2px); }
//                 .sb-row.ac { background:rgba(34,197,94,.025); }
//                 .sb-row.ac:hover { background:rgba(34,197,94,.04); }
//                 .sb-skel  { height:58px; background:linear-gradient(90deg,rgba(226,232,240,.04) 25%,rgba(226,232,240,.08) 50%,rgba(226,232,240,.04) 75%); background-size:200% auto; animation:sb-shine 1.4s linear infinite; border-bottom:1px solid rgba(226,232,240,.05); }
//                 .sb-stat-card { padding:16px 20px; border-radius:12px; background:rgba(226,232,240,.03); border:1px solid rgba(226,232,240,.07); flex:1; min-width:110px; display:flex; align-items:center; gap:12px; transition:all .2s; }
//                 .sb-stat-card:hover { background:rgba(226,232,240,.05); border-color:rgba(226,232,240,.12); transform:translateY(-2px); }
//                 @media(max-width:768px){
//                     .sb-row { grid-template-columns:45px 1fr 140px 90px; }
//                     .sb-row>*:nth-child(3),.sb-row>*:nth-child(4),.sb-row>*:nth-child(6),.sb-row>*:nth-child(7),
//                     .sb-head>*:nth-child(3),.sb-head>*:nth-child(4),.sb-head>*:nth-child(6),.sb-head>*:nth-child(7) { display:none; }
//                 }
//             `}</style>
//
//             <div className="sb-page">
//                 <div className="sb-grid"/>
//                 <div className="sb-glow" style={{ width:500, height:400, background:'rgba(96,165,250,.04)', top:-80, left:'20%' }}/>
//                 <div className="sb-glow" style={{ width:300, height:300, background:'rgba(34,197,94,.04)', bottom:'10%', right:'5%', animationDelay:'2s' }}/>
//                 <Navbar/>
//                 <div style={{ height:72 }}/>
//
//                 <div className="sb-inner">
//
//                     {/* Header */}
//                     <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4 }} style={{ marginBottom:24 }}>
//                         <div style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:'rgba(96,165,250,.5)', letterSpacing:'.18em', textTransform:'uppercase', marginBottom:6 }}>
//                             // My Submissions
//                         </div>
//                         <div style={{ fontSize:24, fontWeight:800, color:'#e2e8f0', letterSpacing:'-.03em', marginBottom:4 }}>
//                             Submission{' '}
//                             <span style={{ background:'linear-gradient(90deg,#60a5fa,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
//                                 History
//                             </span>
//                         </div>
//                         <div style={{ fontSize:13, color:'rgba(148,163,184,.5)' }}>
//                             Track all your code submissions and results
//                         </div>
//                     </motion.div>
//
//                     {/* Stats */}
//                     <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
//                                 style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
//                         {[
//                             { label:'Total',    value:stats.total,    color:'#e2e8f0', icon:<Clock        size={15}/> },
//                             { label:'Accepted', value:stats.accepted, color:'#22c55e', icon:<CheckCircle2 size={15}/> },
//                             { label:'Rejected', value:stats.rejected, color:'#ef4444', icon:<XCircle      size={15}/> },
//                             { label:'AC Rate',  value:`${stats.rate}%`, color:'#60a5fa', icon:<Filter     size={15}/> },
//                         ].map((s,i) => (
//                             <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.07 }}
//                                         className="sb-stat-card">
//                                 <div style={{ color:s.color }}>{s.icon}</div>
//                                 <div>
//                                     <div style={{ fontSize:20, fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>{s.value}</div>
//                                     <div style={{ fontSize:10, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.06em', textTransform:'uppercase' }}>{s.label}</div>
//                                 </div>
//                             </motion.div>
//                         ))}
//                     </motion.div>
//
//                     {/* Search Engine */}
//                     <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.16 }}
//                                 style={{ padding:'16px 18px', borderRadius:12, background:'rgba(226,232,240,.025)', border:'1px solid rgba(226,232,240,.08)', marginBottom:14 }}>
//
//                         <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
//                             <Search size={13} style={{ color:'rgba(96,165,250,.6)', flexShrink:0 }}/>
//                             <span style={{ fontSize:11, fontWeight:700, color:'rgba(148,163,184,.5)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase' }}>
//                                 Search Submissions
//                             </span>
//                         </div>
//
//                         {/* Search input */}
//                         <div style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 14px', borderRadius:9, background:'rgba(226,232,240,.04)', border:'1px solid rgba(226,232,240,.1)', marginBottom:10 }}>
//                             <Search size={13} style={{ color:'rgba(148,163,184,.4)', flexShrink:0 }}/>
//                             <input
//                                 value={search}
//                                 onChange={e => setSearch(e.target.value)}
//                                 placeholder={
//                                     searchMode === 'id'    ? 'Search by problem ID (e.g. 5)...' :
//                                         searchMode === 'name'  ? 'Search by problem name...' :
//                                             searchMode === 'topic' ? 'Search by topic (e.g. Arrays)...' :
//                                                 'Search by ID, name or topic...'
//                                 }
//                                 style={{ background:'none', border:'none', outline:'none', color:'#e2e8f0', fontSize:13, fontFamily:"'JetBrains Mono',monospace", width:'100%' }}
//                             />
//                             {search && (
//                                 <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(148,163,184,.4)', padding:0, display:'flex', flexShrink:0 }}>
//                                     <X size={13}/>
//                                 </button>
//                             )}
//                             {search && (
//                                 <span style={{ fontSize:10, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", flexShrink:0, paddingLeft:8, borderLeft:'1px solid rgba(226,232,240,.08)' }}>
//                                     {filtered.length} result{filtered.length !== 1 ? 's' : ''}
//                                 </span>
//                             )}
//                         </div>
//
//                         {/* Search mode buttons */}
//                         <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
//                             <span style={{ fontSize:10, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", marginRight:4 }}>Search by:</span>
//                             {[
//                                 { key:'all',   label:'All',         icon:<Search size={9}/> },
//                                 { key:'id',    label:'#ID',         icon:<Hash   size={9}/> },
//                                 { key:'name',  label:'Name',        icon:<Search size={9}/> },
//                                 { key:'topic', label:'Topic',       icon:<Tag    size={9}/> },
//                             ].map(m => (
//                                 <button key={m.key} className={`sb-mode-btn ${searchMode===m.key?'active':''}`} onClick={() => setSearchMode(m.key)}>
//                                     {m.label}
//                                 </button>
//                             ))}
//                         </div>
//                     </motion.div>
//
//                     {/* Status Filters */}
//                     <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2 }}
//                                 style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
//                         <span style={{ fontSize:10, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", marginRight:2 }}>Filter:</span>
//                         {ALL_STATUSES.map(s => {
//                             const sc = s !== 'All' ? statusColor(s) : null
//                             return (
//                                 <button
//                                     key={s}
//                                     className={`sb-filter-btn ${statusFilter===s?'active':''}`}
//                                     onClick={() => setStatusFilter(s)}
//                                     style={statusFilter===s && sc ? { background:sc.bg, borderColor:sc.border, color:sc.color } : {}}
//                                 >
//                                     {s}
//                                 </button>
//                             )
//                         })}
//                     </motion.div>
//
//                     {/* Table */}
//                     <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.26 }}
//                                 style={{ border:'1px solid rgba(226,232,240,.07)', borderRadius:12, overflow:'hidden' }}>
//
//                         {/* Table Header */}
//                         <div className="sb-row sb-head" style={{ background:'rgba(226,232,240,.025)', borderBottom:'1px solid rgba(226,232,240,.08)', cursor:'default' }}
//                              onMouseEnter={e => e.currentTarget.style.background='rgba(226,232,240,.025)'}
//                         >
//                             <div className="sb-th">#</div>
//                             <div className="sb-th">Problem</div>
//                             <div className="sb-th">Topic</div>
//                             <div className="sb-th" onClick={() => toggleSort('status')} style={{ cursor:'pointer' }}>
//                                 Status <SortIcon col="status"/>
//                             </div>
//                             <div className="sb-th">Language</div>
//                             <div className="sb-th" onClick={() => toggleSort('runtime')} style={{ cursor:'pointer' }}>
//                                 Runtime <SortIcon col="runtime"/>
//                             </div>
//                             <div className="sb-th" onClick={() => toggleSort('date')} style={{ cursor:'pointer', justifyContent:'flex-end' }}>
//                                 Date <SortIcon col="date"/>
//                             </div>
//                         </div>
//
//                         {/* Rows */}
//                         {loading ? (
//                             Array(6).fill(0).map((_,i) => (
//                                 <div key={i} className="sb-skel" style={{ animationDelay:`${i*.06}s` }}/>
//                             ))
//                         ) : filtered.length === 0 ? (
//                             <div style={{ padding:'60px 20px', textAlign:'center' }}>
//                                 <div style={{ fontSize:32, marginBottom:12 }}>📋</div>
//                                 <div style={{ fontSize:14, fontWeight:600, color:'rgba(226,232,240,.6)', marginBottom:6 }}>
//                                     {search ? `No results for "${search}"` : 'No submissions found'}
//                                 </div>
//                                 <div style={{ fontSize:12, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", marginBottom:16 }}>
//                                     {search ? 'Try searching by ID, name or topic' : 'Start solving problems to see your history here'}
//                                 </div>
//                                 {!search && (
//                                     <button onClick={() => navigate('/problems')}
//                                             style={{ padding:'8px 20px', borderRadius:9, background:'rgba(96,165,250,.1)', border:'1px solid rgba(96,165,250,.22)', color:'#60a5fa', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}>
//                                         Browse Problems →
//                                     </button>
//                                 )}
//                             </div>
//                         ) : (
//                             <AnimatePresence>
//                                 {filtered.map((s, i) => {
//                                     const sc   = statusColor(s.status)
//                                     const lang = s.language || PROGRAMMING_LANGUAGES.find(l => l.id === s.languageId)?.name || 'Unknown'
//                                     const prob = problemMap[s.problemId]
//                                     const isAC = s.status === SUBMISSION_STATUS.ACCEPTED || s.status === 'Accepted'
//                                     return (
//                                         <motion.div
//                                             key={s.id || i}
//                                             className={`sb-row ${isAC ? 'ac' : ''}`}
//                                             initial={{ opacity:0, x:-6 }}
//                                             animate={{ opacity:1, x:0 }}
//                                             transition={{ delay:Math.min(i*.03, .3) }}
//                                             onClick={() => navigate(`/problems/${s.problemId}`)}
//                                             style={{ borderLeft:`2px solid ${isAC ? 'rgba(34,197,94,.25)' : 'transparent'}` }}
//                                         >
//                                             {/* # */}
//                                             <div style={{ fontSize:11, color:'rgba(148,163,184,.3)', fontFamily:"'JetBrains Mono',monospace" }}>
//                                                 #{s.id}
//                                             </div>
//
//                                             {/* Problem */}
//                                             <div style={{ minWidth:0 }}>
//                                                 <div style={{ fontSize:13.5, fontWeight:600, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
//                                                     {prob?.title || `Problem #${s.problemId}`}
//                                                 </div>
//                                                 <div style={{ fontSize:10.5, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", marginTop:1 }}>
//                                                     ID: {s.problemId}
//                                                 </div>
//                                             </div>
//
//                                             {/* Topic */}
//                                             <div>
//                                                 {prob?.topic ? (
//                                                     <span style={{
//                                                         fontSize:10.5, padding:'2px 8px', borderRadius:8,
//                                                         background:'rgba(96,165,250,.08)', color:'#60a5fa',
//                                                         border:'1px solid rgba(96,165,250,.15)',
//                                                         fontFamily:"'JetBrains Mono',monospace", fontWeight:600,
//                                                         whiteSpace:'nowrap'
//                                                     }}>
//                                                         {prob.topic}
//                                                     </span>
//                                                 ) : (
//                                                     <span style={{ fontSize:11, color:'rgba(148,163,184,.25)', fontFamily:"'JetBrains Mono',monospace" }}>—</span>
//                                                 )}
//                                             </div>
//
//                                             {/* Status */}
//                                             <div>
//                                                 <span style={{
//                                                     padding:'3px 10px', borderRadius:8, fontSize:11, fontWeight:700,
//                                                     fontFamily:"'JetBrains Mono',monospace",
//                                                     background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`,
//                                                     whiteSpace:'nowrap'
//                                                 }}>
//                                                     {s.status}
//                                                 </span>
//                                             </div>
//
//                                             {/* Language */}
//                                             <div style={{ fontSize:12, color:'rgba(148,163,184,.5)', fontFamily:"'JetBrains Mono',monospace" }}>
//                                                 {lang?.name?.split(' ')[0] || 'Unknown'}
//                                             </div>
//
//                                             {/* Runtime */}
//                                             <div style={{ fontSize:12, color:'rgba(148,163,184,.45)', fontFamily:"'JetBrains Mono',monospace" }}>
//                                                 {s.executionTimeMs > 0 ? `⚡${Math.round(s.executionTimeMs)}ms` : '—'}
//                                             </div>
//
//                                             {/* Date */}
//                                             <div style={{ fontSize:11, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", textAlign:'right' }}>
//                                                 {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}
//                                             </div>
//                                         </motion.div>
//                                     )
//                                 })}
//                             </AnimatePresence>
//                         )}
//                     </motion.div>
//
//                     {/* Result count */}
//                     {!loading && filtered.length > 0 && (
//                         <div style={{ marginTop:12, fontSize:11, color:'rgba(148,163,184,.3)', fontFamily:"'JetBrains Mono',monospace", textAlign:'right' }}>
//                             Showing {filtered.length} of {submissions.length} submissions
//                             {statusFilter !== 'All' && ` · filtered by "${statusFilter}"`}
//                             {search && ` · matching "${search}"`}
//                         </div>
//                     )}
//
//                     {error && (
//                         <div style={{ marginTop:16, padding:'10px 14px', borderRadius:8, background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', fontSize:12, color:'#f87171', fontFamily:"'JetBrains Mono',monospace" }}>
//                             ⚠ {error}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </>
//     )
// }
//
// export default SubmissionsPage


// src/pages/submission/SubmissionsPage.jsx
// import { useEffect, useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { useNavigate } from 'react-router-dom'
// import { useSubmission } from '../../hooks/useSubmission.js'
// import Navbar from '../../components/common/Navbar.jsx'
// import { SUBMISSION_STATUS, PROGRAMMING_LANGUAGES } from '../../config/constants.js'
// import { CheckCircle2, XCircle, Clock, Search, Filter } from 'lucide-react'
//
// const statusColor = s => ({
//     [SUBMISSION_STATUS.ACCEPTED]:            { color:'#22c55e', bg:'rgba(34,197,94,.1)',   border:'rgba(34,197,94,.2)'   },
//     [SUBMISSION_STATUS.WRONG_ANSWER]:        { color:'#ef4444', bg:'rgba(239,68,68,.1)',   border:'rgba(239,68,68,.2)'   },
//     [SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED]: { color:'#f59e0b', bg:'rgba(245,158,11,.1)', border:'rgba(245,158,11,.2)' },
//     [SUBMISSION_STATUS.COMPILATION_ERROR]:   { color:'#f87171', bg:'rgba(248,113,113,.1)', border:'rgba(248,113,113,.2)' },
//     [SUBMISSION_STATUS.RUNTIME_ERROR]:       { color:'#f87171', bg:'rgba(248,113,113,.1)', border:'rgba(248,113,113,.2)' },
//     [SUBMISSION_STATUS.PENDING]:             { color:'#60a5fa', bg:'rgba(96,165,250,.1)',  border:'rgba(96,165,250,.2)'  },
// })[s] || { color:'#60a5fa', bg:'rgba(96,165,250,.1)', border:'rgba(96,165,250,.2)' }
//
// const SubmissionsPage = () => {
//     const navigate  = useNavigate()
//     const { submissions, loading, error, fetchMySubmissions } = useSubmission()
//     const [search,    setSearch]    = useState('')
//     const [statusFilter, setStatus] = useState('All')
//
//     useEffect(() => { fetchMySubmissions() }, [])
//
//     const filtered = submissions.filter(s => {
//         const ms = !search || String(s.problemId).includes(search)
//         const mf = statusFilter === 'All' || s.status === statusFilter
//         return ms && mf
//     })
//
//     const stats = {
//         total:    submissions.length,
//         accepted: submissions.filter(s => s.status === SUBMISSION_STATUS.ACCEPTED).length,
//         rate:     submissions.length
//             ? Math.round((submissions.filter(s => s.status === SUBMISSION_STATUS.ACCEPTED).length / submissions.length) * 100)
//             : 0,
//     }
//
//     return (
//         <>
//             <style>{`
//                 @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
//                 @keyframes sb-grid { 0%,100%{opacity:.022} 50%{opacity:.05} }
//                 @keyframes sb-glow { 0%,100%{opacity:.07}  50%{opacity:.14} }
//                 @keyframes sb-fade { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
//                 @keyframes sb-row  { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
//                 @keyframes sb-skel { 0%,100%{opacity:.05} 50%{opacity:.12} }
//                 .sb-page  { min-height:100vh; background:#06080e; font-family:'Space Grotesk',sans-serif; }
//                 .sb-grid  { position:fixed; inset:0; background:repeating-linear-gradient(90deg,rgba(226,232,240,.022) 0,transparent 1px,transparent 80px),repeating-linear-gradient(180deg,rgba(226,232,240,.022) 0,transparent 1px,transparent 80px); animation:sb-grid 5s ease-in-out infinite; pointer-events:none; z-index:0; }
//                 .sb-glow  { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; animation:sb-glow 5s ease-in-out infinite; }
//                 .sb-inner { max-width:960px; margin:0 auto; padding:28px 24px 60px; position:relative; z-index:1; }
//                 .sb-status-btn { padding:5px 14px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer; transition:all .18s; font-family:'Space Grotesk',sans-serif; border:1px solid rgba(226,232,240,.09); background:rgba(226,232,240,.04); color:rgba(148,163,184,.6); }
//                 .sb-status-btn.active { background:rgba(96,165,250,.1); border-color:rgba(96,165,250,.25); color:#60a5fa; }
//                 .sb-status-btn:hover:not(.active) { background:rgba(226,232,240,.07); color:rgba(226,232,240,.8); }
//                 .sb-row { display:grid; grid-template-columns:70px 1fr 160px 120px 100px 90px; align-items:center; padding:14px 18px; border-bottom:1px solid rgba(226,232,240,.05); transition:background .15s; cursor:pointer; }
//                 .sb-row:last-child { border-bottom:none; }
//                 .sb-row:hover { background:rgba(226,232,240,.03); }
//                 .sb-skel { height:54px; background:rgba(226,232,240,.05); animation:sb-skel 1.4s ease-in-out infinite; border-bottom:1px solid rgba(226,232,240,.05); }
//             `}</style>
//
//             <div className="sb-page">
//                 <div className="sb-grid" />
//                 <div className="sb-glow" style={{ width:500, height:400, background:'rgba(96,165,250,.04)', top:-80, left:'20%' }} />
//                 <div className="sb-glow" style={{ width:300, height:300, background:'rgba(34,197,94,.04)', bottom:'10%', right:'5%', animationDelay:'2s' }} />
//                 <Navbar />
//                 <div style={{ height:72 }} />
//
//                 <div className="sb-inner">
//                     {/* Header */}
//                     <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4 }} style={{ marginBottom:24 }}>
//                         <div style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:'rgba(96,165,250,.5)', letterSpacing:'.18em', textTransform:'uppercase', marginBottom:6 }}>
//                             // My Submissions
//                         </div>
//                         <div style={{ fontSize:24, fontWeight:800, color:'#e2e8f0', letterSpacing:'-.03em', marginBottom:4 }}>
//                             Submission{' '}
//                             <span style={{ background:'linear-gradient(90deg,#60a5fa,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
//                                 History
//                             </span>
//                         </div>
//                         <div style={{ fontSize:13, color:'rgba(148,163,184,.5)' }}>
//                             Track all your code submissions and results
//                         </div>
//                     </motion.div>
//
//                     {/* Stats */}
//                     <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
//                                 style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
//                         {[
//                             { label:'Total',    value:stats.total,    color:'#e2e8f0', icon:<Clock       size={15}/> },
//                             { label:'Accepted', value:stats.accepted, color:'#22c55e', icon:<CheckCircle2 size={15}/> },
//                             { label:'Rejected', value:stats.total - stats.accepted, color:'#ef4444', icon:<XCircle size={15}/> },
//                             { label:'AC Rate',  value:`${stats.rate}%`, color:'#60a5fa', icon:<Filter size={15}/> },
//                         ].map((s,i) => (
//                             <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*.07 }}
//                                         style={{ padding:'16px 20px', borderRadius:11, background:'rgba(226,232,240,.03)', border:'1px solid rgba(226,232,240,.08)', flex:1, minWidth:120, display:'flex', alignItems:'center', gap:12, transition:'all .2s' }}>
//                                 <div style={{ color:s.color }}>{s.icon}</div>
//                                 <div>
//                                     <div style={{ fontSize:20, fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'-.02em' }}>{s.value}</div>
//                                     <div style={{ fontSize:10, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.06em', textTransform:'uppercase' }}>{s.label}</div>
//                                 </div>
//                             </motion.div>
//                         ))}
//                     </motion.div>
//
//                     {/* Filters */}
//                     <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.18 }}
//                                 style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
//                         <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:9, background:'rgba(226,232,240,.04)', border:'1px solid rgba(226,232,240,.1)', flex:1, minWidth:200 }}>
//                             <Search size={13} style={{ color:'rgba(148,163,184,.4)', flexShrink:0 }} />
//                             <input
//                                 value={search}
//                                 onChange={e => setSearch(e.target.value)}
//                                 placeholder="Search by problem ID..."
//                                 style={{ background:'none', border:'none', outline:'none', color:'#e2e8f0', fontSize:13, fontFamily:"'JetBrains Mono',monospace", width:'100%' }}
//                             />
//                         </div>
//                         <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
//                             {['All', ...Object.values(SUBMISSION_STATUS)].map(s => (
//                                 <button
//                                     key={s}
//                                     className={`sb-status-btn ${statusFilter===s ? 'active' : ''}`}
//                                     onClick={() => setStatus(s)}
//                                 >
//                                     {s === 'All' ? 'All' : s}
//                                 </button>
//                             ))}
//                         </div>
//                     </motion.div>
//
//                     {/* Table */}
//                     <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.24 }}
//                                 style={{ border:'1px solid rgba(226,232,240,.07)', borderRadius:12, overflow:'hidden' }}>
//
//                         <div style={{ display:'grid', gridTemplateColumns:'70px 1fr 160px 120px 100px 90px', padding:'9px 18px', background:'rgba(226,232,240,.025)', borderBottom:'1px solid rgba(226,232,240,.07)', fontSize:10, fontWeight:700, color:'rgba(148,163,184,.4)', letterSpacing:'.08em', textTransform:'uppercase', fontFamily:"'JetBrains Mono',monospace" }}>
//                             <div>#</div>
//                             <div>Problem</div>
//                             <div>Status</div>
//                             <div>Language</div>
//                             <div>Runtime</div>
//                             <div style={{ textAlign:'right' }}>Date</div>
//                         </div>
//
//                         {loading ? (
//                             Array(6).fill(0).map((_,i) => (
//                                 <div key={i} className="sb-skel" style={{ animationDelay:`${i*.08}s` }} />
//                             ))
//                         ) : filtered.length === 0 ? (
//                             <div style={{ padding:'60px 20px', textAlign:'center' }}>
//                                 <div style={{ fontSize:32, marginBottom:12 }}>📋</div>
//                                 <div style={{ fontSize:14, fontWeight:600, color:'rgba(226,232,240,.6)', marginBottom:6 }}>
//                                     No submissions found
//                                 </div>
//                                 <div style={{ fontSize:12, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", marginBottom:16 }}>
//                                     Start solving problems to see your history here
//                                 </div>
//                                 <button
//                                     onClick={() => navigate('/problems')}
//                                     style={{ padding:'8px 20px', borderRadius:9, background:'rgba(96,165,250,.1)', border:'1px solid rgba(96,165,250,.22)', color:'#60a5fa', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}
//                                 >
//                                     Browse Problems →
//                                 </button>
//                             </div>
//                         ) : (
//                             <AnimatePresence>
//                                 {filtered.map((s, i) => {
//                                     const sc  = statusColor(s.status)
//                                     const lang = PROGRAMMING_LANGUAGES.find(l => l.id === s.languageId)
//                                     return (
//                                         <motion.div
//                                             key={s.id || i}
//                                             className="sb-row"
//                                             initial={{ opacity:0, x:-6 }}
//                                             animate={{ opacity:1, x:0 }}
//                                             transition={{ delay: i * .04 }}
//                                             onClick={() => navigate(`/problems/${s.problemId}`)}
//                                         >
//                                             <div style={{ fontSize:11, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace" }}>
//                                                 #{s.id}
//                                             </div>
//                                             <div style={{ fontSize:13.5, fontWeight:600, color:'#e2e8f0' }}>
//                                                 Problem #{s.problemId}
//                                             </div>
//                                             <div>
//                                                 <span style={{ padding:'3px 10px', borderRadius:8, fontSize:11, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", background:sc.bg, color:sc.color, border:`1px solid ${sc.border}` }}>
//                                                     {s.status}
//                                                 </span>
//                                             </div>
//                                             <div style={{ fontSize:12, color:'rgba(148,163,184,.5)', fontFamily:"'JetBrains Mono',monospace" }}>
//                                                 {lang?.name?.split(' ')[0] || 'Unknown'}
//                                             </div>
//                                             <div style={{ fontSize:12, color:'rgba(148,163,184,.45)', fontFamily:"'JetBrains Mono',monospace" }}>
//                                                 {s.runtime ? `${s.runtime}ms` : '—'}
//                                             </div>
//                                             <div style={{ fontSize:11, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", textAlign:'right' }}>
//                                                 {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}
//                                             </div>
//                                         </motion.div>
//                                     )
//                                 })}
//                             </AnimatePresence>
//                         )}
//                     </motion.div>
//
//                     {error && (
//                         <div style={{ marginTop:16, padding:'10px 14px', borderRadius:8, background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', fontSize:12, color:'#f87171', fontFamily:"'JetBrains Mono',monospace" }}>
//                             ⚠ {error}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </>
//     )
// }
//
// export default SubmissionsPage