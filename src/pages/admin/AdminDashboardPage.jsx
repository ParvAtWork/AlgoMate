// src/pages/admin/AdminDashboardPage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getDashboardStats, getRecentSubmissions, recalculateLeaderboard } from '../../api/adminApi.js'
import Navbar from '../../components/common/Navbar.jsx'
import { Users, Code2, CheckCircle2, BarChart2, RefreshCw } from 'lucide-react'
import { SUBMISSION_STATUS } from '../../config/constants.js'

const StatCard = ({ label, value, icon: Icon, color, sub, delay }) => (
    <motion.div
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay, duration:.4 }}
        style={{ padding:'20px 22px', borderRadius:12, background:'rgba(226,232,240,.03)', border:'1px solid rgba(226,232,240,.08)', flex:1, minWidth:140, position:'relative', overflow:'hidden' }}
    >
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${color}60,transparent)` }} />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.5)', letterSpacing:'.08em', textTransform:'uppercase' }}>{label}</span>
            <div style={{ width:32, height:32, borderRadius:8, background:`${color}15`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon size={15} style={{ color }} />
            </div>
        </div>
        <div style={{ fontSize:28, fontWeight:800, color, letterSpacing:'-.02em', marginBottom:4 }}>{value ?? '--'}</div>
        {sub && <div style={{ fontSize:11, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace" }}>{sub}</div>}
    </motion.div>
)

const statusColor = s => ({
    [SUBMISSION_STATUS.ACCEPTED]:'#22c55e',
    [SUBMISSION_STATUS.WRONG_ANSWER]:'#ef4444',
    [SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED]:'#f59e0b',
    [SUBMISSION_STATUS.COMPILATION_ERROR]:'#f87171',
    [SUBMISSION_STATUS.RUNTIME_ERROR]:'#f87171',
})[s] || '#60a5fa'

const AdminDashboardPage = () => {
    const navigate = useNavigate()
    const [stats, setStats]         = useState(null)
    const [recent, setRecent]       = useState([])
    const [loading, setLoading]     = useState(true)
    const [recalcLoading, setRecalc]= useState(false)
    const [recalcMsg, setRecalcMsg] = useState(null)

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true)
                const [sRes, rRes] = await Promise.allSettled([
                    getDashboardStats(),
                    getRecentSubmissions(8),
                ])
                if (sRes.status === 'fulfilled') setStats(sRes.value.data)
                if (rRes.status === 'fulfilled') setRecent(rRes.value.data || [])
            } finally { setLoading(false) }
        }
        load()
    }, [])

    const handleRecalculate = async () => {
        try {
            setRecalc(true)
            await recalculateLeaderboard('AllTime')
            setRecalcMsg({ type:'success', text:'Leaderboard recalculated!' })
        } catch {
            setRecalcMsg({ type:'error', text:'Failed to recalculate.' })
        } finally {
            setRecalc(false)
            setTimeout(() => setRecalcMsg(null), 3000)
        }
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
                @keyframes ad-spin { to{transform:rotate(360deg)} }
                @keyframes ad-grid { 0%,100%{opacity:.02} 50%{opacity:.05} }
                @keyframes ad-glow { 0%,100%{opacity:.07} 50%{opacity:.14} }
                @keyframes ad-skel { 0%{background-position:200% center} 100%{background-position:-200% center} }
                .ad-page { min-height:100vh; background:#06080e; font-family:'Space Grotesk',sans-serif; }
                .ad-grid { position:fixed; inset:0; background:repeating-linear-gradient(90deg,rgba(226,232,240,.018) 0,transparent 1px,transparent 80px),repeating-linear-gradient(180deg,rgba(226,232,240,.018) 0,transparent 1px,transparent 80px); animation:ad-grid 5s ease-in-out infinite; pointer-events:none; z-index:0; }
                .ad-glow { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; animation:ad-glow 5s ease-in-out infinite; }
                .ad-inner { max-width:1100px; margin:0 auto; padding:28px 24px 60px; position:relative; z-index:1; }
                .ad-quick-btn { display:flex; align-items:center; gap:8px; padding:10px 18px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; transition:all .2s; border:1px solid; font-family:'Space Grotesk',sans-serif; }
                .ad-thead { display:grid; grid-template-columns:60px 1fr 140px 110px 90px; padding:9px 16px; background:rgba(226,232,240,.025); border-bottom:1px solid rgba(226,232,240,.07); font-size:10px; font-weight:700; color:rgba(148,163,184,.4); letter-spacing:.07em; text-transform:uppercase; font-family:'JetBrains Mono',monospace; border-radius:10px 10px 0 0; }
                .ad-row { display:grid; grid-template-columns:60px 1fr 140px 110px 90px; padding:12px 16px; border-bottom:1px solid rgba(226,232,240,.05); align-items:center; transition:background .2s; cursor:pointer; }
                .ad-row:hover { background:rgba(226,232,240,.03); }
                .ad-skel { height:48px; background:linear-gradient(90deg,rgba(226,232,240,.04) 25%,rgba(226,232,240,.08) 50%,rgba(226,232,240,.04) 75%); background-size:200% auto; animation:ad-skel 1.5s linear infinite; border-bottom:1px solid rgba(226,232,240,.05); }
            `}</style>

            <div className="ad-page">
                <div className="ad-grid" />
                <div className="ad-glow" style={{ width:500, height:400, background:'rgba(96,165,250,.05)', top:-100, left:'20%' }} />
                <div className="ad-glow" style={{ width:300, height:300, background:'rgba(139,92,246,.04)', bottom:'10%', right:'5%', animationDelay:'2s' }} />
                <Navbar />
                <div style={{ height:72 }} />

                <div className="ad-inner">
                    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4 }} style={{ marginBottom:24 }}>
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                            <div>
                                <div style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:'rgba(239,68,68,.5)', letterSpacing:'.18em', textTransform:'uppercase', marginBottom:6 }}>// Admin Panel</div>
                                <div style={{ fontSize:24, fontWeight:800, color:'#e2e8f0', letterSpacing:'-.03em' }}>Dashboard <span style={{ background:'linear-gradient(90deg,#f87171,#fb923c)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Overview</span></div>
                                <div style={{ fontSize:13, color:'rgba(148,163,184,.5)', marginTop:4 }}>Monitor platform activity and manage resources</div>
                            </div>
                            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                                <button className="ad-quick-btn" style={{ background:'rgba(96,165,250,.08)', borderColor:'rgba(96,165,250,.2)', color:'#60a5fa' }} onClick={() => navigate('/admin/problems')}>
                                    <Code2 size={14} /> Manage Problems
                                </button>
                                <button className="ad-quick-btn" style={{ background:'rgba(139,92,246,.08)', borderColor:'rgba(139,92,246,.2)', color:'#a78bfa' }} onClick={() => navigate('/admin/users')}>
                                    <Users size={14} /> Manage Users
                                </button>
                                <button className="ad-quick-btn" style={{ background:'rgba(34,197,94,.08)', borderColor:'rgba(34,197,94,.2)', color:'#22c55e' }} onClick={handleRecalculate} disabled={recalcLoading}>
                                    <RefreshCw size={14} style={{ animation: recalcLoading ? 'ad-spin 1s linear infinite' : 'none' }} />
                                    {recalcLoading ? 'Recalculating...' : 'Recalculate LB'}
                                </button>
                            </div>
                        </div>
                        {recalcMsg && (
                            <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                                        style={{ marginTop:12, padding:'8px 14px', borderRadius:8, fontSize:12, fontFamily:"'JetBrains Mono',monospace",
                                            background: recalcMsg.type==='success' ? 'rgba(34,197,94,.08)' : 'rgba(239,68,68,.08)',
                                            border:`1px solid ${recalcMsg.type==='success' ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}`,
                                            color: recalcMsg.type==='success' ? '#22c55e' : '#f87171' }}>
                                {recalcMsg.text}
                            </motion.div>
                        )}
                    </motion.div>

                    <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
                        <StatCard label="Total Users"  value={stats?.totalUsers}       icon={Users}       color="#60a5fa" sub="Registered users"    delay={.05} />
                        <StatCard label="Problems"     value={stats?.totalProblems}    icon={Code2}       color="#a78bfa" sub="Active problems"     delay={.1}  />
                        <StatCard label="Submissions"  value={stats?.totalSubmissions} icon={BarChart2}   color="#f59e0b" sub="All time"            delay={.15} />
                        <StatCard label="Accept Rate"  value={stats?.acceptanceRate ? `${Math.round(stats.acceptanceRate)}%` : '--'} icon={CheckCircle2} color="#22c55e" sub="Overall" delay={.2} />
                    </div>

                    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.3, duration:.4 }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                            <div style={{ fontSize:14, fontWeight:700, color:'rgba(226,232,240,.8)' }}>Recent Submissions</div>
                        </div>
                        <div style={{ border:'1px solid rgba(226,232,240,.07)', borderRadius:12, overflow:'hidden' }}>
                            <div className="ad-thead"><div>#</div><div>User</div><div>Status</div><div>Problem</div><div>Date</div></div>
                            {loading ? Array(5).fill(0).map((_,i) => <div key={i} className="ad-skel" />) :
                                recent.length === 0 ? (
                                    <div style={{ padding:'40px 20px', textAlign:'center', color:'rgba(148,163,184,.4)', fontSize:13, fontFamily:"'JetBrains Mono',monospace" }}>No recent submissions</div>
                                ) : recent.map((s, i) => (
                                    <motion.div key={s.id||i} className="ad-row" initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*.04 }}>
                                        <div style={{ fontSize:11, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace" }}>#{s.id}</div>
                                        <div style={{ fontSize:13, fontWeight:600, color:'#e2e8f0' }}>User #{s.userId}</div>
                                        <div><span style={{ padding:'3px 9px', borderRadius:7, fontSize:11, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", background:`${statusColor(s.status)}15`, color:statusColor(s.status), border:`1px solid ${statusColor(s.status)}30` }}>{s.status}</span></div>
                                        <div style={{ fontSize:12, color:'rgba(148,163,184,.5)', fontFamily:"'JetBrains Mono',monospace" }}>#{s.problemId}</div>
                                        <div style={{ fontSize:11, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace" }}>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '--'}</div>
                                    </motion.div>
                                ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    )
}

export default AdminDashboardPage