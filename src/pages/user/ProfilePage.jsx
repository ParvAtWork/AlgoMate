// src/pages/user/ProfilePage.jsx
import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectUser } from '../../store/slices/authSlice.js'
import { useSubmission } from '../../hooks/useSubmission.js'
import { useProblems } from '../../hooks/useProblems.js'
import Navbar from '../../components/common/Navbar.jsx'
import UserCard  from '../../components/user/UserCard.jsx'
import UserStats from '../../components/user/UserStats.jsx'
import AvatarUpload from '../../components/user/AvatarUpload.jsx'
import SubmissionList from '../../components/submission/SubmissionList.jsx'
import { CircleProgress } from '../../components/ui/progress.jsx'
import { SUBMISSION_STATUS, PROGRAMMING_LANGUAGES } from '../../config/constants.js'
import {
    Code2, CheckCircle2, Trophy, Flame,
    TrendingUp, Settings, ChevronRight,
    Edit3, X, Save, Bell, Shield, LogOut,
    Calendar, Hash
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const TABS = [
    { key:'overview',    label:'Overview',    icon:<Code2        size={13}/> },
    { key:'submissions', label:'Submissions', icon:<CheckCircle2 size={13}/> },
    { key:'stats',       label:'Stats',       icon:<TrendingUp   size={13}/> },
    { key:'settings',    label:'Settings',    icon:<Settings     size={13}/> },
]

// ── Activity Heatmap ─────────────────────────────────────────────
const ActivityHeatmap = ({ submissions }) => {
    const [tooltip, setTooltip] = useState(null)

    const heatmapData = useMemo(() => {
        const map = {}
        submissions.forEach(s => {
            if (!s.submittedAt) return
            const date = new Date(s.submittedAt).toISOString().split('T')[0]
            map[date] = (map[date] || 0) + 1
        })
        return map
    }, [submissions])

    const days = useMemo(() => {
        const result = []
        const today = new Date()
        for (let i = 364; i >= 0; i--) {
            const d = new Date(today)
            d.setDate(d.getDate() - i)
            const key = d.toISOString().split('T')[0]
            result.push({ date: key, count: heatmapData[key] || 0, day: d.getDay() })
        }
        return result
    }, [heatmapData])

    const weeks = useMemo(() => {
        const w = []
        for (let i = 0; i < days.length; i += 7) w.push(days.slice(i, i + 7))
        return w
    }, [days])

    const maxCount = Math.max(...days.map(d => d.count), 1)

    const getColor = (count) => {
        if (!count) return 'rgba(226,232,240,.05)'
        const intensity = count / maxCount
        if (intensity > .75) return '#22c55e'
        if (intensity > .5)  return 'rgba(34,197,94,.65)'
        if (intensity > .25) return 'rgba(34,197,94,.38)'
        return 'rgba(34,197,94,.18)'
    }

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const totalActiveDays = days.filter(d => d.count > 0).length
    const totalSubmissions = days.reduce((a,b) => a + b.count, 0)

    return (
        <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <Calendar size={14} style={{ color:'#22c55e' }}/>
                    <span style={{ fontSize:11, fontWeight:700, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase' }}>
                        Activity — Last 365 Days
                    </span>
                </div>
                <div style={{ display:'flex', gap:14 }}>
                    <span style={{ fontSize:10, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace" }}>
                        <span style={{ color:'#22c55e' }}>{totalSubmissions}</span> submissions
                    </span>
                    <span style={{ fontSize:10, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace" }}>
                        <span style={{ color:'#22c55e' }}>{totalActiveDays}</span> active days
                    </span>
                </div>
            </div>

            {/* Month labels */}
            <div style={{ display:'flex', gap:2, marginBottom:4, paddingLeft:18 }}>
                {weeks.map((week, wi) => {
                    const firstDay = new Date(week[0]?.date)
                    const showMonth = wi === 0 || new Date(weeks[wi-1]?.[0]?.date)?.getMonth() !== firstDay.getMonth()
                    return (
                        <div key={wi} style={{ width:10, flexShrink:0, fontSize:8, color:'rgba(148,163,184,.3)', fontFamily:"'JetBrains Mono',monospace" }}>
                            {showMonth ? months[firstDay.getMonth()] : ''}
                        </div>
                    )
                })}
            </div>

            <div style={{ display:'flex', gap:2, position:'relative' }}>
                {/* Day labels */}
                <div style={{ display:'flex', flexDirection:'column', gap:2, marginRight:4 }}>
                    {['S','M','T','W','T','F','S'].map((d,i) => (
                        <div key={i} style={{ height:10, fontSize:7, color:'rgba(148,163,184,.25)', fontFamily:"'JetBrains Mono',monospace", lineHeight:'10px' }}>
                            {i % 2 === 1 ? d : ''}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div style={{ display:'flex', gap:2, overflowX:'auto', paddingBottom:4 }}>
                    {weeks.map((week, wi) => (
                        <div key={wi} style={{ display:'flex', flexDirection:'column', gap:2 }}>
                            {Array(7).fill(null).map((_, di) => {
                                const cell = week[di]
                                if (!cell) return <div key={di} style={{ width:10, height:10 }}/>
                                return (
                                    <div
                                        key={di}
                                        onMouseEnter={(e) => setTooltip({ date:cell.date, count:cell.count, x:e.clientX, y:e.clientY })}
                                        onMouseLeave={() => setTooltip(null)}
                                        style={{
                                            width:10, height:10, borderRadius:2,
                                            background:getColor(cell.count),
                                            cursor:'default',
                                            transition:'transform .1s',
                                        }}
                                        onMouseOver={e => e.currentTarget.style.transform='scale(1.4)'}
                                        onMouseOut={e => e.currentTarget.style.transform='scale(1)'}
                                    />
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:8, justifyContent:'flex-end' }}>
                <span style={{ fontSize:9, color:'rgba(148,163,184,.3)', fontFamily:"'JetBrains Mono',monospace" }}>Less</span>
                {['rgba(226,232,240,.05)','rgba(34,197,94,.18)','rgba(34,197,94,.38)','rgba(34,197,94,.65)','#22c55e'].map((c,i) => (
                    <div key={i} style={{ width:10, height:10, borderRadius:2, background:c }}/>
                ))}
                <span style={{ fontSize:9, color:'rgba(148,163,184,.3)', fontFamily:"'JetBrains Mono',monospace" }}>More</span>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div style={{
                    position:'fixed', left:tooltip.x+12, top:tooltip.y-36,
                    background:'#0d1117', border:'1px solid rgba(226,232,240,.12)',
                    borderRadius:7, padding:'5px 10px', zIndex:9999, pointerEvents:'none',
                    fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'#e2e8f0',
                    boxShadow:'0 4px 16px rgba(0,0,0,.4)',
                }}>
                    <span style={{ color:'#22c55e' }}>{tooltip.count}</span> submission{tooltip.count !== 1 ? 's' : ''} · {tooltip.date}
                </div>
            )}
        </div>
    )
}

// ── Main ProfilePage ─────────────────────────────────────────────
const ProfilePage = () => {
    const navigate = useNavigate()
    const user     = useSelector(selectUser)
    const { submissions, loading: subLoading, fetchMySubmissions } = useSubmission()
    const { problems, fetchAllProblems } = useProblems()

    const [activeTab,  setActiveTab]  = useState('overview')
    const [editMode,   setEditMode]   = useState(false)
    const [editForm,   setEditForm]   = useState({ username:'', bio:'' })
    const [avatarSrc,  setAvatarSrc]  = useState(null)
    const [notifSettings, setNotifSettings] = useState({
        newProblem:  true,
        submission:  true,
        leaderboard: false,
    })

    const toggleNotif = (key) => setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }))

    useEffect(() => {
        fetchMySubmissions()
        fetchAllProblems()
    }, [])

    useEffect(() => {
        if (user) setEditForm({ username: user.username || '', bio: user.bio || '' })
    }, [user])

    // ── Problem map for names ────────────────────────────────────
    const problemMap = useMemo(() => {
        const map = {}
        problems.forEach(p => { map[p.id] = p })
        return map
    }, [problems])

    // ── Derived stats ────────────────────────────────────────────
    const accepted     = useMemo(() => submissions.filter(s => s.status === SUBMISSION_STATUS.ACCEPTED || s.status === 'Accepted'), [submissions])
    const acRate       = submissions.length ? Math.round((accepted.length / submissions.length) * 100) : 0
    const uniqueSolved = useMemo(() => [...new Set(accepted.map(s => s.problemId))].length, [accepted])

    const easyCount   = useMemo(() => {
        const solvedIds = new Set()
        accepted.forEach(s => {
            const p = problemMap[s.problemId]
            if (p?.difficulty === 'Easy' && !solvedIds.has(s.problemId)) solvedIds.add(s.problemId)
        })
        return solvedIds.size
    }, [accepted, problemMap])

    const mediumCount = useMemo(() => {
        const solvedIds = new Set()
        accepted.forEach(s => {
            const p = problemMap[s.problemId]
            if (p?.difficulty === 'Medium' && !solvedIds.has(s.problemId)) solvedIds.add(s.problemId)
        })
        return solvedIds.size
    }, [accepted, problemMap])

    const hardCount = useMemo(() => {
        const solvedIds = new Set()
        accepted.forEach(s => {
            const p = problemMap[s.problemId]
            if (p?.difficulty === 'Hard' && !solvedIds.has(s.problemId)) solvedIds.add(s.problemId)
        })
        return solvedIds.size
    }, [accepted, problemMap])

    const topicStats = useMemo(() => {
        const topicMap = {}
        accepted.forEach(s => {
            const p = problemMap[s.problemId]
            const t = p?.topic || 'Unknown'
            if (!topicMap[t]) topicMap[t] = new Set()
            topicMap[t].add(s.problemId)
        })
        return Object.entries(topicMap)
            .sort((a,b) => b[1].size - a[1].size)
            .slice(0,6)
            .map(([topic, ids]) => ({ topic, count: ids.size }))
    }, [accepted, problemMap])

    const recentSubs = useMemo(() =>
            [...submissions]
                .sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                .slice(0, 20),
        [submissions]
    )

    const joinDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month:'long', year:'numeric' })
        : 'GLA University'

    const hue = user?.username
        ? [...user.username].reduce((a,c) => a + c.charCodeAt(0), 0) % 360
        : 200

    const enrichedUser = {
        ...user,
        problemsSolved:   uniqueSolved,
        totalSubmissions: submissions.length,
        totalScore:       user?.rating || 0,
        easySolved:       easyCount,
        mediumSolved:     mediumCount,
        hardSolved:       hardCount,
    }

    const statusColor = (s) =>
        s === 'Accepted' || s === SUBMISSION_STATUS.ACCEPTED ? '#22c55e'
            : s === 'Wrong Answer' ? '#ef4444'
                : s === 'Time Limit Exceeded' ? '#f59e0b'
                    : s === 'Compilation Error' ? '#f87171'
                        : '#94a3b8'

    const notifList = [
        { key:'newProblem',  label:'New problem added',   sub:'Get notified when new problems are added' },
        { key:'submission',  label:'Submission result',   sub:'Get notified on your submission result'   },
        { key:'leaderboard', label:'Leaderboard changes', sub:'Get notified when your rank changes'      },
    ]

    return (
        <>
            <Toaster position="top-right"/>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
                @keyframes pf-grid  { 0%,100%{opacity:.022} 50%{opacity:.05}  }
                @keyframes pf-glow  { 0%,100%{opacity:.08}  50%{opacity:.16}  }
                @keyframes pf-shine { 0%{background-position:200% center} 100%{background-position:-200% center} }
                * { box-sizing:border-box; }
                .pf-page  { min-height:100vh; background:#06080e; font-family:'Space Grotesk',sans-serif; }
                .pf-grid  { position:fixed; inset:0; background:repeating-linear-gradient(90deg,rgba(226,232,240,.022) 0,transparent 1px,transparent 80px),repeating-linear-gradient(180deg,rgba(226,232,240,.022) 0,transparent 1px,transparent 80px); animation:pf-grid 5s ease-in-out infinite; pointer-events:none; z-index:0; }
                .pf-glow  { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; animation:pf-glow 5s ease-in-out infinite; }
                .pf-inner { max-width:1060px; margin:0 auto; padding:28px 24px 80px; position:relative; z-index:1; }
                .pf-card  { background:rgba(226,232,240,.03); border:1px solid rgba(226,232,240,.08); border-radius:14px; padding:22px 24px; }
                .pf-tab   { display:flex; align-items:center; gap:6px; padding:9px 18px; font-size:13px; font-weight:600; color:rgba(148,163,184,.5); cursor:pointer; transition:all .2s; border-bottom:2px solid transparent; font-family:'Space Grotesk',sans-serif; white-space:nowrap; user-select:none; }
                .pf-tab:hover { color:rgba(226,232,240,.7); }
                .pf-tab.active { color:#60a5fa; border-bottom-color:#60a5fa; }
                .pf-input { width:100%; padding:9px 12px; border-radius:8px; background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.1); color:#e2e8f0; font-size:13px; font-family:'JetBrains Mono',monospace; outline:none; transition:all .2s; }
                .pf-input:focus { border-color:rgba(96,165,250,.35); background:rgba(96,165,250,.04); }
                .pf-sub-row { display:flex; align-items:center; gap:10px; padding:11px 14px; border-radius:10px; background:rgba(226,232,240,.025); border:1px solid rgba(226,232,240,.06); margin-bottom:7px; cursor:pointer; transition:all .15s; }
                .pf-sub-row:hover { background:rgba(226,232,240,.05); transform:translateX(3px); }
                .pf-skel  { border-radius:8px; background:linear-gradient(90deg,rgba(226,232,240,.04) 25%,rgba(226,232,240,.08) 50%,rgba(226,232,240,.04) 75%); background-size:200% auto; animation:pf-shine 1.4s linear infinite; }
            `}</style>

            <div className="pf-page">
                <div className="pf-grid"/>
                <div className="pf-glow" style={{ width:500, height:400, background:`hsl(${hue},70%,50%)`, opacity:.04, top:-80, left:'30%' }}/>
                <div className="pf-glow" style={{ width:300, height:300, background:'rgba(167,139,250,.04)', bottom:'15%', right:'5%', animationDelay:'2s' }}/>
                <Navbar/>
                <div style={{ height:72 }}/>

                <div className="pf-inner">

                    {/* ── HERO BANNER ── */}
                    <motion.div
                        initial={{ opacity:0, y:20 }}
                        animate={{ opacity:1, y:0 }}
                        transition={{ duration:.4 }}
                        style={{
                            position:'relative', borderRadius:18, overflow:'hidden', marginBottom:20,
                            background:`linear-gradient(135deg,hsl(${hue},40%,10%),rgba(13,17,23,1))`,
                            border:`1px solid hsl(${hue},40%,22%)`
                        }}
                    >
                        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 20% 50%,hsl(${hue},60%,30%)15,transparent 60%)`, opacity:.12, pointerEvents:'none' }}/>

                        <div style={{ padding:'28px 28px 22px', position:'relative', zIndex:1 }}>
                            <div style={{ display:'flex', alignItems:'flex-start', gap:22, flexWrap:'wrap' }}>

                                {/* Avatar */}
                                <motion.div animate={{ y:[0,-4,0] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }} style={{ flexShrink:0 }}>
                                    <div style={{ position:'relative' }}>
                                        {avatarSrc ? (
                                            <img src={avatarSrc} alt="avatar" style={{ width:88, height:88, borderRadius:'50%', objectFit:'cover', border:`3px solid hsl(${hue},40%,30%)` }}/>
                                        ) : (
                                            <div style={{ width:88, height:88, borderRadius:'50%', background:`hsl(${hue},40%,16%)`, color:`hsl(${hue},70%,65%)`, border:`3px solid hsl(${hue},40%,30%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:800, fontFamily:"'JetBrains Mono',monospace" }}>
                                                {user?.username?.[0]?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                        <div style={{ position:'absolute', bottom:4, right:4, width:14, height:14, borderRadius:'50%', background:'#22c55e', border:'2px solid #06080e' }}/>
                                    </div>
                                </motion.div>

                                {/* Info */}
                                <div style={{ flex:1, minWidth:200 }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:5, flexWrap:'wrap' }}>
                                        <span style={{ fontSize:24, fontWeight:800, color:'#e2e8f0', letterSpacing:'-.025em' }}>
                                            {user?.username || 'User'}
                                        </span>
                                        {user?.role === 'Admin' && (
                                            <span style={{ padding:'2px 10px', borderRadius:8, fontSize:10, fontWeight:700, background:'rgba(251,191,36,.12)', color:'#fbbf24', border:'1px solid rgba(251,191,36,.25)', fontFamily:"'JetBrains Mono',monospace" }}>👑 Admin</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize:12, color:'rgba(148,163,184,.5)', marginBottom:12, fontFamily:"'JetBrains Mono',monospace" }}>
                                        Joined {joinDate} · GLA University CSE
                                    </div>
                                    <div style={{ display:'flex', alignItems:'center', gap:10, maxWidth:280 }}>
                                        <div style={{ flex:1, height:5, borderRadius:3, background:'rgba(226,232,240,.08)', overflow:'hidden' }}>
                                            <motion.div
                                                initial={{ width:0 }}
                                                animate={{ width:`${Math.min(((user?.rating||0)/1000)*100,100)}%` }}
                                                transition={{ delay:.5, duration:1, ease:'easeOut' }}
                                                style={{ height:'100%', background:`linear-gradient(90deg,hsl(${hue},70%,55%),hsl(${hue+40},70%,60%))`, borderRadius:3 }}
                                            />
                                        </div>
                                        <span style={{ fontSize:13, fontWeight:700, color:`hsl(${hue},70%,65%)`, fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>
                                            {user?.rating || 0} pts
                                        </span>
                                    </div>
                                </div>

                                {/* AC Rate */}
                                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, flexShrink:0 }}>
                                    <CircleProgress value={acRate} max={100} size={72} color='#22c55e' strokeWidth={5}>
                                        <div style={{ textAlign:'center' }}>
                                            <div style={{ fontSize:14, fontWeight:800, color:'#22c55e', fontFamily:"'JetBrains Mono',monospace", lineHeight:1 }}>{acRate}%</div>
                                        </div>
                                    </CircleProgress>
                                    <span style={{ fontSize:9, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase' }}>AC Rate</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats strip */}
                        <div style={{ display:'flex', borderTop:`1px solid hsl(${hue},40%,18%)`, background:'rgba(0,0,0,.2)' }}>
                            {[
                                { label:'Solved',      value:uniqueSolved,          color:`hsl(${hue},70%,65%)`, icon:<Code2        size={13}/> },
                                { label:'Submissions', value:submissions.length,    color:'rgba(226,232,240,.7)', icon:<TrendingUp   size={13}/> },
                                { label:'Accepted',    value:accepted.length,       color:'#22c55e',              icon:<CheckCircle2 size={13}/> },
                                { label:'Streak',      value:`${user?.streak||0}d`, color:'#f97316',              icon:<Flame        size={13}/> },
                                { label:'Score',       value:user?.rating||0,       color:'#fbbf24',              icon:<Trophy       size={13}/> },
                            ].map((s,i) => (
                                <motion.div key={s.label} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2+i*.06 }}
                                            style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'14px 8px', borderRight:'1px solid rgba(226,232,240,.06)', cursor:'default' }}>
                                    <div style={{ color:s.color }}>{s.icon}</div>
                                    <div style={{ fontSize:17, fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>{s.value}</div>
                                    <div style={{ fontSize:9, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.06em', textTransform:'uppercase' }}>{s.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── TAB BAR ── */}
                    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.15 }}
                                style={{ display:'flex', borderBottom:'1px solid rgba(226,232,240,.07)', marginBottom:20, overflowX:'auto', scrollbarWidth:'none' }}>
                        {TABS.map(t => (
                            <div key={t.key} className={`pf-tab ${activeTab===t.key?'active':''}`} onClick={() => setActiveTab(t.key)}>
                                {t.icon} {t.label}
                            </div>
                        ))}
                    </motion.div>

                    <AnimatePresence mode="wait">

                        {/* ── OVERVIEW ── */}
                        {activeTab === 'overview' && (
                            <motion.div key="overview" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }} transition={{ duration:.25 }}>

                                {/* Heatmap */}
                                <div className="pf-card" style={{ marginBottom:16 }}>
                                    <ActivityHeatmap submissions={submissions}/>
                                </div>

                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                                    {/* Difficulty Breakdown */}
                                    <div className="pf-card">
                                        <div style={{ fontSize:13, fontWeight:700, color:'rgba(226,232,240,.8)', marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
                                            <Trophy size={14} style={{ color:'#fbbf24' }}/> Difficulty Breakdown
                                        </div>
                                        {subLoading ? Array(3).fill(0).map((_,i) => (
                                            <div key={i} className="pf-skel" style={{ height:40, marginBottom:12 }}/>
                                        )) : [
                                            { label:'Easy',   count:easyCount,   total:problems.filter(p=>p.difficulty==='Easy').length,   color:'#22c55e' },
                                            { label:'Medium', count:mediumCount, total:problems.filter(p=>p.difficulty==='Medium').length, color:'#f59e0b' },
                                            { label:'Hard',   count:hardCount,   total:problems.filter(p=>p.difficulty==='Hard').length,   color:'#ef4444' },
                                        ].map((d,i) => (
                                            <div key={d.label} style={{ marginBottom:14 }}>
                                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                                                    <span style={{ fontSize:12.5, fontWeight:600, color:d.color }}>{d.label}</span>
                                                    <span style={{ fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.5)' }}>
                                                        {d.count}<span style={{ color:'rgba(148,163,184,.3)' }}>/{d.total || '?'}</span>
                                                    </span>
                                                </div>
                                                <div style={{ height:6, borderRadius:3, background:'rgba(226,232,240,.06)', overflow:'hidden' }}>
                                                    <motion.div
                                                        initial={{ width:0 }}
                                                        animate={{ width:`${d.total > 0 ? Math.round((d.count/d.total)*100) : 0}%` }}
                                                        transition={{ delay:.3+i*.1, duration:.7, ease:'easeOut' }}
                                                        style={{ height:'100%', background:d.color, borderRadius:3 }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Topic Breakdown */}
                                    <div className="pf-card">
                                        <div style={{ fontSize:13, fontWeight:700, color:'rgba(226,232,240,.8)', marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
                                            <Code2 size={14} style={{ color:'#60a5fa' }}/> Topic Breakdown
                                        </div>
                                        {subLoading ? Array(4).fill(0).map((_,i) => (
                                            <div key={i} className="pf-skel" style={{ height:32, marginBottom:10 }}/>
                                        )) : topicStats.length === 0 ? (
                                            <div style={{ fontSize:12, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", textAlign:'center', padding:'20px 0' }}>
                                                No data yet — start solving!
                                            </div>
                                        ) : topicStats.map((t,i) => (
                                            <div key={t.topic} style={{ marginBottom:12 }}>
                                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                                                    <span style={{ fontSize:12.5, fontWeight:600, color:'rgba(226,232,240,.7)' }}>{t.topic}</span>
                                                    <span style={{ fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.5)' }}>{t.count}</span>
                                                </div>
                                                <div style={{ height:5, borderRadius:2.5, background:'rgba(226,232,240,.06)', overflow:'hidden' }}>
                                                    <motion.div
                                                        initial={{ width:0 }}
                                                        animate={{ width:`${Math.round((t.count/(topicStats[0]?.count||1))*100)}%` }}
                                                        transition={{ delay:.3+i*.08, duration:.6, ease:'easeOut' }}
                                                        style={{ height:'100%', background:`hsl(${210+i*25},70%,60%)`, borderRadius:2.5 }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Submissions */}
                                <div className="pf-card">
                                    <div style={{ fontSize:13, fontWeight:700, color:'rgba(226,232,240,.8)', marginBottom:14, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                                            <CheckCircle2 size={14} style={{ color:'#22c55e' }}/> Recent Submissions
                                        </div>
                                        <motion.span whileHover={{ x:3 }} style={{ fontSize:11, color:'#60a5fa', cursor:'pointer', fontFamily:"'JetBrains Mono',monospace", display:'flex', alignItems:'center', gap:3 }}
                                                     onClick={() => setActiveTab('submissions')}>
                                            View all <ChevronRight size={11}/>
                                        </motion.span>
                                    </div>
                                    {subLoading ? Array(4).fill(0).map((_,i) => (
                                        <div key={i} className="pf-skel" style={{ height:52, marginBottom:8 }}/>
                                    )) : recentSubs.length === 0 ? (
                                        <div style={{ fontSize:12, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", textAlign:'center', padding:'20px 0' }}>
                                            No submissions yet — start solving!
                                        </div>
                                    ) : recentSubs.slice(0,5).map((s,i) => {
                                        const prob    = problemMap[s.problemId]
                                        const sColor  = statusColor(s.status)
                                        const lang    = PROGRAMMING_LANGUAGES?.find(l => l.id === s.languageId)
                                        return (
                                            <motion.div key={s.id||i} className="pf-sub-row"
                                                        initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} transition={{ delay:.1+i*.05 }}
                                                        onClick={() => navigate(`/problems/${s.problemId}`)}
                                                        style={{ borderLeft:`2px solid ${sColor}30` }}
                                            >
                                                <div style={{ width:8, height:8, borderRadius:'50%', background:sColor, flexShrink:0 }}/>
                                                <div style={{ flex:1, minWidth:0 }}>
                                                    <div style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                                        {prob?.title || `Problem #${s.problemId}`}
                                                    </div>
                                                    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:2 }}>
                                                        {prob?.topic && (
                                                            <span style={{ fontSize:10, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace" }}>
                                                                #{prob.topic}
                                                            </span>
                                                        )}
                                                        {lang && (
                                                            <span style={{ fontSize:10, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace" }}>
                                                                {lang.name?.split(' ')[0]}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {prob?.difficulty && (
                                                    <span style={{
                                                        fontSize:9.5, fontWeight:700, padding:'2px 7px', borderRadius:6,
                                                        color: prob.difficulty==='Easy' ? '#22c55e' : prob.difficulty==='Medium' ? '#f59e0b' : '#ef4444',
                                                        background: prob.difficulty==='Easy' ? 'rgba(34,197,94,.08)' : prob.difficulty==='Medium' ? 'rgba(245,158,11,.08)' : 'rgba(239,68,68,.08)',
                                                        border: `1px solid ${prob.difficulty==='Easy' ? 'rgba(34,197,94,.2)' : prob.difficulty==='Medium' ? 'rgba(245,158,11,.2)' : 'rgba(239,68,68,.2)'}`,
                                                        fontFamily:"'JetBrains Mono',monospace", flexShrink:0
                                                    }}>{prob.difficulty}</span>
                                                )}
                                                <span style={{ fontSize:11, fontWeight:700, color:sColor, fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>{s.status}</span>
                                                <span style={{ fontSize:10, color:'rgba(148,163,184,.3)', fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>
                                                    {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : ''}
                                                </span>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* ── SUBMISSIONS ── */}
                        {activeTab === 'submissions' && (
                            <motion.div key="submissions" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }} transition={{ duration:.25 }}>
                                <div className="pf-card">
                                    <div style={{ fontSize:13, fontWeight:700, color:'rgba(226,232,240,.8)', marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
                                        <CheckCircle2 size={14} style={{ color:'#22c55e' }}/> All Submissions
                                        <span style={{ fontSize:10, padding:'1px 8px', borderRadius:8, background:'rgba(96,165,250,.1)', color:'#60a5fa', border:'1px solid rgba(96,165,250,.2)', fontFamily:"'JetBrains Mono',monospace", marginLeft:4 }}>
                                            {submissions.length}
                                        </span>
                                    </div>

                                    {subLoading ? Array(6).fill(0).map((_,i) => (
                                        <div key={i} className="pf-skel" style={{ height:60, marginBottom:8 }}/>
                                    )) : recentSubs.length === 0 ? (
                                        <div style={{ textAlign:'center', padding:'40px 0' }}>
                                            <div style={{ fontSize:28, marginBottom:12 }}>📋</div>
                                            <div style={{ fontSize:14, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace" }}>No submissions yet</div>
                                        </div>
                                    ) : recentSubs.map((s,i) => {
                                        const prob   = problemMap[s.problemId]
                                        const sColor = statusColor(s.status)
                                        const lang   = PROGRAMMING_LANGUAGES?.find(l => l.id === s.languageId)
                                        return (
                                            <motion.div key={s.id||i} className="pf-sub-row"
                                                        initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} transition={{ delay:Math.min(i*.03,.3) }}
                                                        onClick={() => navigate(`/problems/${s.problemId}`)}
                                                        style={{ borderLeft:`2px solid ${sColor}30` }}
                                            >
                                                <div style={{ width:8, height:8, borderRadius:'50%', background:sColor, flexShrink:0 }}/>

                                                {/* Problem info */}
                                                <div style={{ flex:1, minWidth:0 }}>
                                                    <div style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                                        {prob?.title || `Problem #${s.problemId}`}
                                                    </div>
                                                    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:2 }}>
                                                        <span style={{ fontSize:10, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace" }}>
                                                            #{s.problemId}
                                                        </span>
                                                        {prob?.topic && (
                                                            <span style={{ fontSize:10, color:'rgba(96,165,250,.5)', fontFamily:"'JetBrains Mono',monospace" }}>
                                                                {prob.topic}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Difficulty */}
                                                {prob?.difficulty && (
                                                    <span style={{
                                                        fontSize:9.5, fontWeight:700, padding:'2px 7px', borderRadius:6,
                                                        color: prob.difficulty==='Easy' ? '#22c55e' : prob.difficulty==='Medium' ? '#f59e0b' : '#ef4444',
                                                        background: prob.difficulty==='Easy' ? 'rgba(34,197,94,.08)' : prob.difficulty==='Medium' ? 'rgba(245,158,11,.08)' : 'rgba(239,68,68,.08)',
                                                        border:`1px solid ${prob.difficulty==='Easy' ? 'rgba(34,197,94,.2)' : prob.difficulty==='Medium' ? 'rgba(245,158,11,.2)' : 'rgba(239,68,68,.2)'}`,
                                                        fontFamily:"'JetBrains Mono',monospace", flexShrink:0
                                                    }}>{prob.difficulty}</span>
                                                )}

                                                {/* Language */}
                                                {lang && (
                                                    <span style={{ fontSize:10.5, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>
                                                        {lang.name?.split(' ')[0]}
                                                    </span>
                                                )}

                                                {/* Execution time */}
                                                {s.executionTimeMs > 0 && (
                                                    <span style={{ fontSize:10, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>
                                                        ⚡{Math.round(s.executionTimeMs)}ms
                                                    </span>
                                                )}

                                                {/* Status */}
                                                <span style={{ fontSize:11, fontWeight:700, color:sColor, fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>
                                                    {s.status}
                                                </span>

                                                {/* Date */}
                                                <span style={{ fontSize:10, color:'rgba(148,163,184,.3)', fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>
                                                    {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : ''}
                                                </span>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* ── STATS ── */}
                        {activeTab === 'stats' && (
                            <motion.div key="stats" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }} transition={{ duration:.25 }}
                                        style={{ display:'flex', flexDirection:'column', gap:16 }}>

                                {/* Heatmap in stats too */}
                                <div className="pf-card">
                                    <ActivityHeatmap submissions={submissions}/>
                                </div>

                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                                    {/* Submission Stats */}
                                    <div className="pf-card">
                                        <div style={{ fontSize:13, fontWeight:700, color:'rgba(226,232,240,.8)', marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
                                            <TrendingUp size={14} style={{ color:'#60a5fa' }}/> Submission Stats
                                        </div>
                                        {[
                                            { label:'Total Submissions', val:submissions.length,                                                                color:'#60a5fa' },
                                            { label:'Accepted',          val:accepted.length,                                                                  color:'#22c55e' },
                                            { label:'Wrong Answer',      val:submissions.filter(s=>s.status==='Wrong Answer').length,                          color:'#ef4444' },
                                            { label:'Time Limit',        val:submissions.filter(s=>s.status==='Time Limit Exceeded'||s.status==='TLE').length, color:'#f59e0b' },
                                            { label:'Compile Error',     val:submissions.filter(s=>s.status==='Compilation Error').length,                     color:'#f87171' },
                                            { label:'Runtime Error',     val:submissions.filter(s=>s.status==='Runtime Error').length,                         color:'#fb923c' },
                                        ].map((item,i) => (
                                            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid rgba(226,232,240,.05)' }}>
                                                <span style={{ fontSize:12.5, color:'rgba(226,232,240,.6)' }}>{item.label}</span>
                                                <span style={{ fontSize:14, fontWeight:700, color:item.color, fontFamily:"'JetBrains Mono',monospace" }}>{item.val}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Performance */}
                                    <div className="pf-card">
                                        <div style={{ fontSize:13, fontWeight:700, color:'rgba(226,232,240,.8)', marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
                                            <Trophy size={14} style={{ color:'#fbbf24' }}/> Performance
                                        </div>
                                        {[
                                            { label:'Acceptance Rate', val:`${acRate}%`,        color:acRate>=60?'#22c55e':acRate>=40?'#f59e0b':'#ef4444', pct:acRate },
                                            { label:'Problems Solved', val:`${uniqueSolved}`,   color:'#60a5fa', pct:Math.min(uniqueSolved*5,100) },
                                            { label:'Easy Solved',     val:`${easyCount}`,      color:'#22c55e', pct:problems.filter(p=>p.difficulty==='Easy').length > 0 ? Math.round((easyCount/problems.filter(p=>p.difficulty==='Easy').length)*100) : 0 },
                                            { label:'Medium Solved',   val:`${mediumCount}`,    color:'#f59e0b', pct:problems.filter(p=>p.difficulty==='Medium').length > 0 ? Math.round((mediumCount/problems.filter(p=>p.difficulty==='Medium').length)*100) : 0 },
                                            { label:'Hard Solved',     val:`${hardCount}`,      color:'#ef4444', pct:problems.filter(p=>p.difficulty==='Hard').length > 0 ? Math.round((hardCount/problems.filter(p=>p.difficulty==='Hard').length)*100) : 0 },
                                        ].map((item,i) => (
                                            <div key={i} style={{ marginBottom:14 }}>
                                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                                                    <span style={{ fontSize:12, color:'rgba(148,163,184,.5)' }}>{item.label}</span>
                                                    <span style={{ fontSize:12, fontWeight:700, color:item.color, fontFamily:"'JetBrains Mono',monospace" }}>{item.val}</span>
                                                </div>
                                                <div style={{ height:4, borderRadius:2, background:'rgba(226,232,240,.06)', overflow:'hidden' }}>
                                                    <motion.div
                                                        initial={{ width:0 }}
                                                        animate={{ width:`${item.pct}%` }}
                                                        transition={{ delay:.2+i*.1, duration:.7, ease:'easeOut' }}
                                                        style={{ height:'100%', background:item.color, borderRadius:2 }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* UserCard + UserStats */}
                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                                    <UserCard user={enrichedUser} totalProblems={problems.length || 50}/>
                                    <UserStats user={enrichedUser} topicStats={topicStats} delay={.1}/>
                                </div>
                            </motion.div>
                        )}

                        {/* ── SETTINGS ── */}
                        {activeTab === 'settings' && (
                            <motion.div key="settings" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }} transition={{ duration:.25 }}
                                        style={{ display:'flex', flexDirection:'column', gap:16 }}>

                                {/* Avatar Upload */}
                                <div className="pf-card">
                                    <div style={{ fontSize:13, fontWeight:700, color:'rgba(226,232,240,.8)', marginBottom:18, display:'flex', alignItems:'center', gap:7 }}>
                                        <Edit3 size={14} style={{ color:'#60a5fa' }}/> Profile Picture
                                    </div>
                                    <div style={{ display:'flex', alignItems:'center', gap:24, flexWrap:'wrap' }}>
                                        <AvatarUpload
                                            name={user?.username}
                                            src={avatarSrc}
                                            onUpload={async (file) => {
                                                const reader = new FileReader()
                                                reader.onload = (e) => {
                                                    setAvatarSrc(e.target.result)
                                                    toast.success('Avatar updated!', { style:{ background:'#0d1117', border:'1px solid rgba(34,197,94,.3)', color:'#22c55e', fontFamily:"'JetBrains Mono',monospace" }})
                                                }
                                                reader.readAsDataURL(file)
                                            }}
                                        />
                                        <div style={{ flex:1 }}>
                                            <div style={{ fontSize:13, color:'rgba(226,232,240,.7)', marginBottom:6 }}>Upload a profile picture</div>
                                            <div style={{ fontSize:11, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", lineHeight:1.6 }}>
                                                JPG, PNG or GIF · Max 2MB<br/>Square images work best
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Edit Profile */}
                                <div className="pf-card">
                                    <div style={{ fontSize:13, fontWeight:700, color:'rgba(226,232,240,.8)', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                                            <Edit3 size={14} style={{ color:'#818cf8' }}/> Edit Profile
                                        </div>
                                        {!editMode ? (
                                            <motion.button whileHover={{scale:1.04}} whileTap={{scale:.97}} onClick={() => setEditMode(true)}
                                                           style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:7, background:'rgba(129,140,248,.1)', border:'1px solid rgba(129,140,248,.2)', color:'#818cf8', fontSize:12, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}>
                                                <Edit3 size={11}/> Edit
                                            </motion.button>
                                        ) : (
                                            <div style={{ display:'flex', gap:6 }}>
                                                <motion.button whileHover={{scale:1.04}} onClick={() => setEditMode(false)}
                                                               style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:7, background:'rgba(226,232,240,.05)', border:'1px solid rgba(226,232,240,.1)', color:'rgba(148,163,184,.6)', fontSize:12, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}>
                                                    <X size={11}/> Cancel
                                                </motion.button>
                                                <motion.button whileHover={{scale:1.04}}
                                                               onClick={() => { setEditMode(false); toast.success('Profile saved!', { style:{ background:'#0d1117', border:'1px solid rgba(34,197,94,.3)', color:'#22c55e', fontFamily:"'JetBrains Mono',monospace" }}) }}
                                                               style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:7, background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.2)', color:'#22c55e', fontSize:12, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}>
                                                    <Save size={11}/> Save
                                                </motion.button>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                                        <div>
                                            <div style={{ fontSize:10, fontWeight:700, color:'rgba(148,163,184,.45)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase', marginBottom:5 }}>Username</div>
                                            <input className="pf-input" value={editForm.username} onChange={e => setEditForm(p=>({...p,username:e.target.value}))} disabled={!editMode} placeholder="Your username"/>
                                        </div>
                                        <div>
                                            <div style={{ fontSize:10, fontWeight:700, color:'rgba(148,163,184,.45)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase', marginBottom:5 }}>Email</div>
                                            <input className="pf-input" value={user?.email || ''} disabled placeholder="Email (cannot be changed)" style={{ opacity:.5, cursor:'not-allowed' }}/>
                                        </div>
                                        <div>
                                            <div style={{ fontSize:10, fontWeight:700, color:'rgba(148,163,184,.45)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase', marginBottom:5 }}>Bio</div>
                                            <textarea className="pf-input" value={editForm.bio} onChange={e => setEditForm(p=>({...p,bio:e.target.value}))} disabled={!editMode} placeholder="Tell something about yourself..." style={{ minHeight:70, resize:'vertical' }}/>
                                        </div>
                                    </div>
                                </div>

                                {/* Notifications */}
                                <div className="pf-card">
                                    <div style={{ fontSize:13, fontWeight:700, color:'rgba(226,232,240,.8)', marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
                                        <Bell size={14} style={{ color:'#f59e0b' }}/> Notifications
                                    </div>
                                    {notifList.map((item,i) => (
                                        <div key={item.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom: i < notifList.length-1 ? '1px solid rgba(226,232,240,.06)' : 'none' }}>
                                            <div>
                                                <div style={{ fontSize:13, fontWeight:600, color:'rgba(226,232,240,.7)', marginBottom:2 }}>{item.label}</div>
                                                <div style={{ fontSize:11, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace" }}>{item.sub}</div>
                                            </div>
                                            <motion.div whileTap={{ scale:.9 }} onClick={() => toggleNotif(item.key)}
                                                        style={{ width:40, height:22, borderRadius:11, flexShrink:0, background: notifSettings[item.key] ? '#22c55e' : 'rgba(226,232,240,.1)', border: notifSettings[item.key] ? 'none' : '1px solid rgba(226,232,240,.15)', cursor:'pointer', position:'relative', transition:'background .25s' }}>
                                                <motion.div
                                                    animate={{ left: notifSettings[item.key] ? 20 : 2 }}
                                                    transition={{ type:'spring', stiffness:500, damping:30 }}
                                                    style={{ position:'absolute', top:3, width:16, height:16, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,.3)' }}
                                                />
                                            </motion.div>
                                        </div>
                                    ))}
                                </div>

                                {/* Account */}
                                <div className="pf-card" style={{ borderColor:'rgba(239,68,68,.15)' }}>
                                    <div style={{ fontSize:13, fontWeight:700, color:'rgba(226,232,240,.8)', marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
                                        <Shield size={14} style={{ color:'#f87171' }}/> Account
                                    </div>
                                    <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }} onClick={() => navigate('/login')}
                                                   style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:9, background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', color:'#f87171', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}>
                                        <LogOut size={13}/> Sign Out
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    )
}

export default ProfilePage



// src/pages/user/ProfilePage.jsx

// import { useEffect, useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { useSelector } from 'react-redux'
// import { useNavigate } from 'react-router-dom'
// import { selectUser } from '../../store/slices/authSlice.js'
// import { useSubmission } from '../../hooks/useSubmission.js'
// import Navbar from '../../components/common/Navbar.jsx'
// import UserCard  from '../../components/user/UserCard.jsx'
// import UserStats from '../../components/user/UserStats.jsx'
// import AvatarUpload from '../../components/user/AvatarUpload.jsx'
// import SubmissionList from '../../components/submission/SubmissionList.jsx'
// import { CircleProgress } from '../../components/ui/progress.jsx'
// import { SUBMISSION_STATUS, PROGRAMMING_LANGUAGES } from '../../config/constants.js'
// import {
//     Code2, CheckCircle2, Trophy, Flame,
//     TrendingUp, Settings, ChevronRight,
//     Edit3, X, Save, Bell, Shield, LogOut
// } from 'lucide-react'
// import toast, { Toaster } from 'react-hot-toast'
//
// const TABS = [
//     { key:'overview',    label:'Overview',    icon:<Code2        size={13}/> },
//     { key:'submissions', label:'Submissions', icon:<CheckCircle2 size={13}/> },
//     { key:'stats',       label:'Stats',       icon:<TrendingUp   size={13}/> },
//     { key:'settings',    label:'Settings',    icon:<Settings     size={13}/> },
// ]
//
// const ProfilePage = () => {
//     const navigate = useNavigate()
//     const user     = useSelector(selectUser)
//     const { submissions, loading: subLoading, fetchMySubmissions } = useSubmission()
//
//     const [activeTab,  setActiveTab]  = useState('overview')
//     const [editMode,   setEditMode]   = useState(false)
//     const [editForm,   setEditForm]   = useState({ username:'', bio:'' })
//     const [avatarSrc,  setAvatarSrc]  = useState(null)
//
//     // ── Notification toggles ─────────────────────────────────────
//     const [notifSettings, setNotifSettings] = useState({
//         newProblem:  true,
//         submission:  true,
//         leaderboard: false,
//     })
//     const toggleNotif = (key) =>
//         setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }))
//
//     useEffect(() => { fetchMySubmissions() }, [])
//     useEffect(() => {
//         if (user) setEditForm({ username: user.username || '', bio: user.bio || '' })
//     }, [user])
//
//     // ── Derived stats ────────────────────────────────────────────
//     const accepted     = submissions.filter(s => s.status === SUBMISSION_STATUS.ACCEPTED)
//     const acRate       = submissions.length ? Math.round((accepted.length / submissions.length) * 100) : 0
//     const uniqueSolved = [...new Set(accepted.map(s => s.problemId))].length
//     const easyCount    = accepted.filter(s => s.difficulty === 'Easy').length
//     const mediumCount  = accepted.filter(s => s.difficulty === 'Medium').length
//     const hardCount    = accepted.filter(s => s.difficulty === 'Hard').length
//
//     const topicMap = {}
//     accepted.forEach(s => { const t = s.topic || 'Unknown'; topicMap[t] = (topicMap[t]||0)+1 })
//     const topicStats = Object.entries(topicMap)
//         .sort((a,b) => b[1]-a[1]).slice(0,6)
//         .map(([topic, count]) => ({ topic, count }))
//
//     const enrichedUser = {
//         ...user,
//         problemsSolved:   uniqueSolved,
//         totalSubmissions: submissions.length,
//         totalScore:       user?.rating || 0,
//         easySolved:       easyCount,
//         mediumSolved:     mediumCount,
//         hardSolved:       hardCount,
//     }
//
//     const joinDate = user?.createdAt
//         ? new Date(user.createdAt).toLocaleDateString('en-US', { month:'long', year:'numeric' })
//         : 'GLA University'
//
//     const hue = user?.username
//         ? [...user.username].reduce((a,c) => a + c.charCodeAt(0), 0) % 360
//         : 200
//
//     const notifList = [
//         { key:'newProblem',  label:'New problem added',   sub:'Get notified when new problems are added' },
//         { key:'submission',  label:'Submission result',   sub:'Get notified on your submission result'   },
//         { key:'leaderboard', label:'Leaderboard changes', sub:'Get notified when your rank changes'      },
//     ]
//
//     return (
//         <>
//             <Toaster position="top-right"/>
//             <style>{`
//                 @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
//                 @keyframes pf-grid  { 0%,100%{opacity:.022} 50%{opacity:.05}  }
//                 @keyframes pf-glow  { 0%,100%{opacity:.08}  50%{opacity:.16}  }
//                 * { box-sizing:border-box; }
//                 .pf-page  { min-height:100vh; background:#06080e; font-family:'Space Grotesk',sans-serif; }
//                 .pf-grid  { position:fixed; inset:0; background:repeating-linear-gradient(90deg,rgba(226,232,240,.022) 0,transparent 1px,transparent 80px),repeating-linear-gradient(180deg,rgba(226,232,240,.022) 0,transparent 1px,transparent 80px); animation:pf-grid 5s ease-in-out infinite; pointer-events:none; z-index:0; }
//                 .pf-glow  { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; animation:pf-glow 5s ease-in-out infinite; }
//                 .pf-inner { max-width:1060px; margin:0 auto; padding:28px 24px 80px; position:relative; z-index:1; }
//                 .pf-card  { background:rgba(226,232,240,.03); border:1px solid rgba(226,232,240,.08); border-radius:14px; padding:22px 24px; }
//                 .pf-tab   { display:flex; align-items:center; gap:6px; padding:9px 18px; font-size:13px; font-weight:600; color:rgba(148,163,184,.5); cursor:pointer; transition:all .2s; border-bottom:2px solid transparent; font-family:'Space Grotesk',sans-serif; white-space:nowrap; user-select:none; }
//                 .pf-tab:hover { color:rgba(226,232,240,.7); }
//                 .pf-tab.active { color:#60a5fa; border-bottom-color:#60a5fa; }
//                 .pf-input { width:100%; padding:9px 12px; border-radius:8px; background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.1); color:#e2e8f0; font-size:13px; font-family:'JetBrains Mono',monospace; outline:none; transition:all .2s; }
//                 .pf-input:focus { border-color:rgba(96,165,250,.35); background:rgba(96,165,250,.04); }
//                 .pf-sub-row { display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:10px; background:rgba(226,232,240,.025); border:1px solid rgba(226,232,240,.06); margin-bottom:7px; cursor:pointer; transition:all .15s; }
//                 .pf-sub-row:hover { background:rgba(226,232,240,.05); transform:translateX(3px); }
//             `}</style>
//
//             <div className="pf-page">
//                 <div className="pf-grid"/>
//                 <div className="pf-glow" style={{ width:500, height:400, background:`hsl(${hue},70%,50%)`, opacity:.04, top:-80, left:'30%' }}/>
//                 <div className="pf-glow" style={{ width:300, height:300, background:'rgba(167,139,250,.04)', bottom:'15%', right:'5%', animationDelay:'2s' }}/>
//                 <Navbar/>
//                 <div style={{ height:72 }}/>
//
//                 <div className="pf-inner">
//
//                     {/* ── HERO BANNER ── */}
//                     <motion.div
//                         initial={{ opacity:0, y:20 }}
//                         animate={{ opacity:1, y:0 }}
//                         transition={{ duration:.4 }}
//                         style={{ position:'relative', borderRadius:18, overflow:'hidden', marginBottom:20, background:`linear-gradient(135deg,hsl(${hue},40%,10%),rgba(13,17,23,1))`, border:`1px solid hsl(${hue},40%,22%)` }}
//                     >
//                         <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 20% 50%,hsl(${hue},60%,30%)15,transparent 60%)`, opacity:.12, pointerEvents:'none' }}/>
//                         <div style={{ position:'absolute', top:-30, right:-20, width:200, height:200, borderRadius:'50%', background:`hsl(${hue},60%,50%)`, opacity:.06, filter:'blur(40px)', pointerEvents:'none' }}/>
//
//                         <div style={{ padding:'28px 28px 22px', position:'relative', zIndex:1 }}>
//                             <div style={{ display:'flex', alignItems:'flex-start', gap:22, flexWrap:'wrap' }}>
//
//                                 {/* Avatar */}
//                                 <motion.div
//                                     animate={{ y:[0,-4,0] }}
//                                     transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
//                                     style={{ flexShrink:0 }}
//                                 >
//                                     <div style={{ position:'relative' }}>
//                                         {avatarSrc ? (
//                                             <img src={avatarSrc} alt="avatar" style={{ width:88, height:88, borderRadius:'50%', objectFit:'cover', border:`3px solid hsl(${hue},40%,30%)`, boxShadow:`0 0 30px hsl(${hue},60%,30%)25` }}/>
//                                         ) : (
//                                             <div style={{ width:88, height:88, borderRadius:'50%', background:`hsl(${hue},40%,16%)`, color:`hsl(${hue},70%,65%)`, border:`3px solid hsl(${hue},40%,30%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:800, fontFamily:"'JetBrains Mono',monospace", boxShadow:`0 0 30px hsl(${hue},60%,30%)25` }}>
//                                                 {user?.username?.[0]?.toUpperCase() || '?'}
//                                             </div>
//                                         )}
//                                         {user?.isPremium && (
//                                             <motion.div animate={{ rotate:[0,15,-15,0] }} transition={{ duration:2, repeat:Infinity, repeatDelay:3 }} style={{ position:'absolute', top:-6, right:-6, fontSize:20 }}>⭐</motion.div>
//                                         )}
//                                         <div style={{ position:'absolute', bottom:4, right:4, width:14, height:14, borderRadius:'50%', background:'#22c55e', border:'2px solid #06080e' }}/>
//                                     </div>
//                                 </motion.div>
//
//                                 {/* Info */}
//                                 <div style={{ flex:1, minWidth:200 }}>
//                                     <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:5, flexWrap:'wrap' }}>
//                                         <span style={{ fontSize:24, fontWeight:800, color:'#e2e8f0', letterSpacing:'-.025em' }}>
//                                             {editMode ? editForm.username : (user?.username || 'User')}
//                                         </span>
//                                         {user?.role === 'Admin' && (
//                                             <span style={{ padding:'2px 10px', borderRadius:8, fontSize:10, fontWeight:700, background:'rgba(251,191,36,.12)', color:'#fbbf24', border:'1px solid rgba(251,191,36,.25)', fontFamily:"'JetBrains Mono',monospace" }}>👑 Admin</span>
//                                         )}
//                                         {user?.isPremium && (
//                                             <span style={{ padding:'2px 10px', borderRadius:8, fontSize:10, fontWeight:700, background:'rgba(96,165,250,.1)', color:'#60a5fa', border:'1px solid rgba(96,165,250,.2)', fontFamily:"'JetBrains Mono',monospace" }}>⭐ Premium</span>
//                                         )}
//                                     </div>
//                                     <div style={{ fontSize:12, color:'rgba(148,163,184,.5)', marginBottom:12, fontFamily:"'JetBrains Mono',monospace" }}>
//                                         Joined {joinDate} · GLA University CSE
//                                     </div>
//                                     <div style={{ display:'flex', alignItems:'center', gap:10, maxWidth:280 }}>
//                                         <div style={{ flex:1, height:5, borderRadius:3, background:'rgba(226,232,240,.08)', overflow:'hidden' }}>
//                                             <motion.div
//                                                 initial={{ width:0 }}
//                                                 animate={{ width:`${Math.min(((user?.rating||0)/1000)*100,100)}%` }}
//                                                 transition={{ delay:.5, duration:1, ease:'easeOut' }}
//                                                 style={{ height:'100%', background:`linear-gradient(90deg,hsl(${hue},70%,55%),hsl(${hue+40},70%,60%))`, borderRadius:3 }}
//                                             />
//                                         </div>
//                                         <span style={{ fontSize:13, fontWeight:700, color:`hsl(${hue},70%,65%)`, fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>
//                                             {user?.rating || 0} pts
//                                         </span>
//                                     </div>
//                                 </div>
//
//                                 {/* AC Rate */}
//                                 <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, flexShrink:0 }}>
//                                     <CircleProgress value={acRate} max={100} size={72} color='#22c55e' strokeWidth={5}>
//                                         <div style={{ textAlign:'center' }}>
//                                             <div style={{ fontSize:14, fontWeight:800, color:'#22c55e', fontFamily:"'JetBrains Mono',monospace", lineHeight:1 }}>{acRate}%</div>
//                                         </div>
//                                     </CircleProgress>
//                                     <span style={{ fontSize:9, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase' }}>AC Rate</span>
//                                 </div>
//                             </div>
//                         </div>
//
//                         {/* Stats strip */}
//                         <div style={{ display:'flex', borderTop:`1px solid hsl(${hue},40%,18%)`, background:'rgba(0,0,0,.2)' }}>
//                             {[
//                                 { label:'Solved',      value:uniqueSolved,          color:`hsl(${hue},70%,65%)`, icon:<Code2        size={13}/> },
//                                 { label:'Submissions', value:submissions.length,    color:'rgba(226,232,240,.7)', icon:<TrendingUp   size={13}/> },
//                                 { label:'Accepted',    value:accepted.length,       color:'#22c55e',              icon:<CheckCircle2 size={13}/> },
//                                 { label:'Streak',      value:`${user?.streak||0}d`, color:'#f97316',              icon:<Flame        size={13}/> },
//                                 { label:'Score',       value:user?.rating||0,       color:'#fbbf24',              icon:<Trophy       size={13}/> },
//                             ].map((s,i) => (
//                                 <motion.div key={s.label} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2+i*.06 }}
//                                             style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'14px 8px', borderRight:'1px solid rgba(226,232,240,.06)', cursor:'default' }}>
//                                     <div style={{ color:s.color }}>{s.icon}</div>
//                                     <div style={{ fontSize:17, fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>{s.value}</div>
//                                     <div style={{ fontSize:9, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.06em', textTransform:'uppercase' }}>{s.label}</div>
//                                 </motion.div>
//                             ))}
//                         </div>
//                     </motion.div>
//
//                     {/* ── TAB BAR ── */}
//                     <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.15 }}
//                                 style={{ display:'flex', borderBottom:'1px solid rgba(226,232,240,.07)', marginBottom:20, overflowX:'auto', scrollbarWidth:'none' }}>
//                         {TABS.map(t => (
//                             <div key={t.key} className={`pf-tab ${activeTab===t.key?'active':''}`} onClick={() => setActiveTab(t.key)}>
//                                 {t.icon} {t.label}
//                             </div>
//                         ))}
//                     </motion.div>
//
//                     {/* ── TAB CONTENT ── */}
//                     <AnimatePresence mode="wait">
//
//                         {/* OVERVIEW */}
//                         {activeTab === 'overview' && (
//                             <motion.div key="overview" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }} transition={{ duration:.25 }}>
//                                 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
//                                     <div className="pf-card">
//                                         <div style={{ fontSize:13, fontWeight:700, color:'rgba(226,232,240,.8)', marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
//                                             <Trophy size={14} style={{ color:'#fbbf24' }}/> Difficulty Breakdown
//                                         </div>
//                                         {[
//                                             { label:'Easy',   count:easyCount,   color:'#22c55e' },
//                                             { label:'Medium', count:mediumCount, color:'#f59e0b' },
//                                             { label:'Hard',   count:hardCount,   color:'#ef4444' },
//                                         ].map((d,i) => (
//                                             <div key={d.label} style={{ marginBottom:14 }}>
//                                                 <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
//                                                     <span style={{ fontSize:12.5, fontWeight:600, color:d.color }}>{d.label}</span>
//                                                     <span style={{ fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.5)' }}>{d.count} solved</span>
//                                                 </div>
//                                                 <div style={{ height:6, borderRadius:3, background:'rgba(226,232,240,.06)', overflow:'hidden' }}>
//                                                     <motion.div
//                                                         initial={{ width:0 }}
//                                                         animate={{ width:`${uniqueSolved ? Math.round((d.count/Math.max(uniqueSolved,1))*100) : 0}%` }}
//                                                         transition={{ delay:.3+i*.1, duration:.7, ease:'easeOut' }}
//                                                         style={{ height:'100%', background:d.color, borderRadius:3, position:'relative', overflow:'hidden' }}
//                                                     >
//                                                         <motion.div
//                                                             animate={{ x:['-100%','200%'] }}
//                                                             transition={{ duration:2, repeat:Infinity, ease:'linear', delay:i*.2 }}
//                                                             style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent)', width:'50%' }}
//                                                         />
//                                                     </motion.div>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//
//                                     <div className="pf-card">
//                                         <div style={{ fontSize:13, fontWeight:700, color:'rgba(226,232,240,.8)', marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
//                                             <Code2 size={14} style={{ color:'#60a5fa' }}/> Topic Breakdown
//                                         </div>
//                                         {subLoading ? Array(4).fill(0).map((_,i) => (
//                                             <div key={i} style={{ height:32, marginBottom:10, borderRadius:6, background:'rgba(226,232,240,.06)' }}/>
//                                         )) : topicStats.length === 0 ? (
//                                             <div style={{ fontSize:12, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", textAlign:'center', padding:'20px 0' }}>No data yet — start solving!</div>
//                                         ) : topicStats.map((t,i) => (
//                                             <div key={t.topic} style={{ marginBottom:12 }}>
//                                                 <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
//                                                     <span style={{ fontSize:12.5, fontWeight:600, color:'rgba(226,232,240,.7)' }}>{t.topic}</span>
//                                                     <span style={{ fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.5)' }}>{t.count}</span>
//                                                 </div>
//                                                 <div style={{ height:5, borderRadius:2.5, background:'rgba(226,232,240,.06)', overflow:'hidden' }}>
//                                                     <motion.div initial={{ width:0 }} animate={{ width:`${Math.round((t.count/(topicStats[0]?.count||1))*100)}%` }} transition={{ delay:.3+i*.08, duration:.6, ease:'easeOut' }}
//                                                                 style={{ height:'100%', background:`hsl(${210+i*25},70%,60%)`, borderRadius:2.5 }}/>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>
//
//                                 <div className="pf-card">
//                                     <div style={{ fontSize:13, fontWeight:700, color:'rgba(226,232,240,.8)', marginBottom:14, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
//                                         <div style={{ display:'flex', alignItems:'center', gap:7 }}>
//                                             <CheckCircle2 size={14} style={{ color:'#22c55e' }}/> Recent Submissions
//                                         </div>
//                                         <motion.span whileHover={{ x:3 }} style={{ fontSize:11, color:'#60a5fa', cursor:'pointer', fontFamily:"'JetBrains Mono',monospace", display:'flex', alignItems:'center', gap:3 }} onClick={() => setActiveTab('submissions')}>
//                                             View all <ChevronRight size={11}/>
//                                         </motion.span>
//                                     </div>
//                                     {subLoading ? Array(4).fill(0).map((_,i) => (
//                                         <div key={i} style={{ height:44, marginBottom:8, borderRadius:9, background:'rgba(226,232,240,.06)' }}/>
//                                     )) : submissions.length === 0 ? (
//                                         <div style={{ fontSize:12, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", textAlign:'center', padding:'20px 0' }}>No submissions yet — start solving!</div>
//                                     ) : submissions.slice(0,5).map((s,i) => {
//                                         const isAC   = s.status === SUBMISSION_STATUS.ACCEPTED
//                                         const lang   = PROGRAMMING_LANGUAGES.find(l => l.id === s.languageId)
//                                         const sColor = isAC ? '#22c55e' : s.status === SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED ? '#f59e0b' : '#ef4444'
//                                         return (
//                                             <motion.div key={s.id||i} className="pf-sub-row" initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} transition={{ delay:.1+i*.05 }}
//                                                         onClick={() => navigate(`/problems/${s.problemId}`)} style={{ borderLeft:`2px solid ${sColor}30` }}>
//                                                 <div style={{ width:8, height:8, borderRadius:'50%', background:sColor, flexShrink:0 }}/>
//                                                 <span style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', flex:1 }}>Problem #{s.problemId}</span>
//                                                 <span style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.45)' }}>{lang?.name?.split(' ')[0] || ''}</span>
//                                                 <span style={{ fontSize:11, fontWeight:700, color:sColor, fontFamily:"'JetBrains Mono',monospace" }}>{s.status}</span>
//                                                 <span style={{ fontSize:10, color:'rgba(148,163,184,.3)', fontFamily:"'JetBrains Mono',monospace" }}>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : ''}</span>
//                                             </motion.div>
//                                         )
//                                     })}
//                                 </div>
//                             </motion.div>
//                         )}
//
//                         {/* SUBMISSIONS */}
//                         {activeTab === 'submissions' && (
//                             <motion.div key="submissions" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }} transition={{ duration:.25 }}>
//                                 <SubmissionList submissions={submissions} loading={subLoading}/>
//                             </motion.div>
//                         )}
//
//                         {/* STATS */}
//                         {activeTab === 'stats' && (
//                             <motion.div key="stats" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }} transition={{ duration:.25 }}
//                                         style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
//                                 <UserCard user={enrichedUser} totalProblems={50}/>
//                                 <UserStats user={enrichedUser} topicStats={topicStats} delay={.1}/>
//                             </motion.div>
//                         )}
//
//                         {/* SETTINGS */}
//                         {activeTab === 'settings' && (
//                             <motion.div key="settings" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }} transition={{ duration:.25 }}
//                                         style={{ display:'flex', flexDirection:'column', gap:16 }}>
//
//                                 {/* Avatar Upload */}
//                                 <div className="pf-card">
//                                     <div style={{ fontSize:13, fontWeight:700, color:'rgba(226,232,240,.8)', marginBottom:18, display:'flex', alignItems:'center', gap:7 }}>
//                                         <Edit3 size={14} style={{ color:'#60a5fa' }}/> Profile Picture
//                                     </div>
//                                     <div style={{ display:'flex', alignItems:'center', gap:24, flexWrap:'wrap' }}>
//                                         <AvatarUpload
//                                             name={user?.username}
//                                             src={avatarSrc}
//                                             onUpload={async (file) => {
//                                                 const reader = new FileReader()
//                                                 reader.onload = (e) => {
//                                                     setAvatarSrc(e.target.result)
//                                                     toast.success('Avatar updated!', { style:{ background:'#0d1117', border:'1px solid rgba(34,197,94,.3)', color:'#22c55e', fontFamily:"'JetBrains Mono',monospace" }})
//                                                 }
//                                                 reader.readAsDataURL(file)
//                                             }}
//                                         />
//                                         <div style={{ flex:1 }}>
//                                             <div style={{ fontSize:13, color:'rgba(226,232,240,.7)', marginBottom:6 }}>Upload a profile picture</div>
//                                             <div style={{ fontSize:11, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", lineHeight:1.6 }}>
//                                                 JPG, PNG or GIF · Max 2MB<br/>
//                                                 Square images work best
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//
//                                 {/* Edit Profile */}
//                                 <div className="pf-card">
//                                     <div style={{ fontSize:13, fontWeight:700, color:'rgba(226,232,240,.8)', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
//                                         <div style={{ display:'flex', alignItems:'center', gap:7 }}>
//                                             <Edit3 size={14} style={{ color:'#818cf8' }}/> Edit Profile
//                                         </div>
//                                         {!editMode ? (
//                                             <motion.button whileHover={{scale:1.04}} whileTap={{scale:.97}} onClick={() => setEditMode(true)}
//                                                            style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:7, background:'rgba(129,140,248,.1)', border:'1px solid rgba(129,140,248,.2)', color:'#818cf8', fontSize:12, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}>
//                                                 <Edit3 size={11}/> Edit
//                                             </motion.button>
//                                         ) : (
//                                             <div style={{ display:'flex', gap:6 }}>
//                                                 <motion.button whileHover={{scale:1.04}} whileTap={{scale:.97}} onClick={() => setEditMode(false)}
//                                                                style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:7, background:'rgba(226,232,240,.05)', border:'1px solid rgba(226,232,240,.1)', color:'rgba(148,163,184,.6)', fontSize:12, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}>
//                                                     <X size={11}/> Cancel
//                                                 </motion.button>
//                                                 <motion.button whileHover={{scale:1.04}} whileTap={{scale:.97}}
//                                                                onClick={() => { setEditMode(false); toast.success('Profile saved!', { style:{ background:'#0d1117', border:'1px solid rgba(34,197,94,.3)', color:'#22c55e', fontFamily:"'JetBrains Mono',monospace" }}) }}
//                                                                style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:7, background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.2)', color:'#22c55e', fontSize:12, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}>
//                                                     <Save size={11}/> Save
//                                                 </motion.button>
//                                             </div>
//                                         )}
//                                     </div>
//                                     <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
//                                         <div>
//                                             <div style={{ fontSize:10, fontWeight:700, color:'rgba(148,163,184,.45)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase', marginBottom:5 }}>Username</div>
//                                             <input className="pf-input" value={editForm.username} onChange={e => setEditForm(p=>({...p,username:e.target.value}))} disabled={!editMode} placeholder="Your username"/>
//                                         </div>
//                                         <div>
//                                             <div style={{ fontSize:10, fontWeight:700, color:'rgba(148,163,184,.45)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase', marginBottom:5 }}>Email</div>
//                                             <input className="pf-input" value={user?.email || ''} disabled placeholder="Email (cannot be changed)" style={{ opacity:.5, cursor:'not-allowed' }}/>
//                                         </div>
//                                         <div>
//                                             <div style={{ fontSize:10, fontWeight:700, color:'rgba(148,163,184,.45)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase', marginBottom:5 }}>Bio</div>
//                                             <textarea className="pf-input" value={editForm.bio} onChange={e => setEditForm(p=>({...p,bio:e.target.value}))} disabled={!editMode} placeholder="Tell something about yourself..." style={{ minHeight:70, resize:'vertical' }}/>
//                                         </div>
//                                     </div>
//                                 </div>
//
//                                 {/* ── NOTIFICATIONS — WORKING TOGGLE ── */}
//                                 <div className="pf-card">
//                                     <div style={{ fontSize:13, fontWeight:700, color:'rgba(226,232,240,.8)', marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
//                                         <Bell size={14} style={{ color:'#f59e0b' }}/> Notifications
//                                     </div>
//                                     {notifList.map((item, i) => (
//                                         <div key={item.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom: i < notifList.length-1 ? '1px solid rgba(226,232,240,.06)' : 'none' }}>
//                                             <div>
//                                                 <div style={{ fontSize:13, fontWeight:600, color:'rgba(226,232,240,.7)', marginBottom:2 }}>{item.label}</div>
//                                                 <div style={{ fontSize:11, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace" }}>{item.sub}</div>
//                                             </div>
//                                             <motion.div
//                                                 whileTap={{ scale:.9 }}
//                                                 onClick={() => toggleNotif(item.key)}
//                                                 style={{
//                                                     width:40, height:22, borderRadius:11, flexShrink:0,
//                                                     background: notifSettings[item.key] ? '#22c55e' : 'rgba(226,232,240,.1)',
//                                                     border: notifSettings[item.key] ? 'none' : '1px solid rgba(226,232,240,.15)',
//                                                     cursor:'pointer', position:'relative',
//                                                     transition:'background .25s',
//                                                 }}
//                                             >
//                                                 <motion.div
//                                                     animate={{ left: notifSettings[item.key] ? 20 : 2 }}
//                                                     transition={{ type:'spring', stiffness:500, damping:30 }}
//                                                     style={{ position:'absolute', top:3, width:16, height:16, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,.3)' }}
//                                                 />
//                                             </motion.div>
//                                         </div>
//                                     ))}
//                                 </div>
//
//                                 {/* Account */}
//                                 <div className="pf-card" style={{ borderColor:'rgba(239,68,68,.15)' }}>
//                                     <div style={{ fontSize:13, fontWeight:700, color:'rgba(226,232,240,.8)', marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
//                                         <Shield size={14} style={{ color:'#f87171' }}/> Account
//                                     </div>
//                                     <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }} onClick={() => navigate('/login')}
//                                                    style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:9, background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', color:'#f87171', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}>
//                                         <LogOut size={13}/> Sign Out
//                                     </motion.button>
//                                 </div>
//                             </motion.div>
//                         )}
//                     </AnimatePresence>
//                 </div>
//             </div>
//         </>
//     )
// }
//
// export default ProfilePage

// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useSelector } from 'react-redux'
// import { selectUser } from '../../store/slices/authSlice.js'
// import Navbar from '../../components/common/Navbar.jsx'
// import axiosInstance from '../../api/axiosInstance.js'
//
// const ProfilePage = () => {
//     const navigate    = useNavigate()
//     const currentUser = useSelector(selectUser)
//
//     const [submissions, setSubmissions] = useState([])
//     const [loading,     setLoading]     = useState(true)
//     const [activeTab,   setActiveTab]   = useState('overview')
//
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const res = await axiosInstance.get('/api/submission/my')
//                 setSubmissions(res.data || [])
//             } catch (e) {
//                 console.error(e)
//             } finally {
//                 setLoading(false)
//             }
//         }
//         // fetchData()
//     }, [])
//
//     // Stats calculate karo
//     const accepted    = submissions.filter(s => s.status === 'Accepted')
//     const solvedSet   = new Set(accepted.map(s => s.problemId))
//     const solved      = solvedSet.size
//     const accuracy    = submissions.length > 0
//         ? Math.round((accepted.length / submissions.length) * 100)
//         : 0
//
//     const joinDate = currentUser?.createdAt
//         ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month:'long', year:'numeric' })
//         : 'March 2026'
//
//     const recentSubs = [...submissions]
//         .sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt))
//         .slice(0, 8)
//
//     const statusColor = (s) =>
//         s === 'Accepted'          ? '#22c55e'
//             : s === 'Wrong Answer'    ? '#ef4444'
//                 : s === 'Time Limit Exceeded' ? '#f59e0b'
//                     : '#f87171'
//
//     return (
//         <>
//             <style>{`
//                 @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
//                 @keyframes pf-fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
//                 @keyframes pf-pulse  { 0%,100%{opacity:.06} 50%{opacity:.12} }
//                 @keyframes pf-glow   { 0%,100%{opacity:.08} 50%{opacity:.16} }
//                 @keyframes pf-spin   { to{transform:rotate(360deg)} }
//                 @keyframes pf-skel   { 0%{background-position:200% center} 100%{background-position:-200% center} }
//
//                 .pf-page  { min-height:100vh; background:#06080e; font-family:'Space Grotesk',sans-serif; }
//                 .pf-grid  { position:fixed; inset:0; background:repeating-linear-gradient(90deg,rgba(226,232,240,.018) 0,transparent 1px,transparent 80px),repeating-linear-gradient(180deg,rgba(226,232,240,.018) 0,transparent 1px,transparent 80px); animation:pf-pulse 5s ease-in-out infinite; pointer-events:none; z-index:0; }
//                 .pf-glow  { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; animation:pf-glow 5s ease-in-out infinite; }
//                 .pf-inner { max-width:900px; margin:0 auto; padding:28px 24px 80px; position:relative; z-index:1; }
//
//                 /* Hero Card */
//                 .pf-hero  { padding:28px 28px 24px; border-radius:16px; background:rgba(226,232,240,.03); border:1px solid rgba(226,232,240,.08); margin-bottom:20px; animation:pf-fadeUp .5s ease-out both; display:flex; align-items:center; gap:24px; flex-wrap:wrap; }
//                 .pf-avatar{ width:72px; height:72px; border-radius:18px; background:linear-gradient(135deg,rgba(96,165,250,.2),rgba(129,140,248,.15)); border:2px solid rgba(96,165,250,.3); display:flex; align-items:center; justify-content:center; font-size:26px; font-weight:800; color:#60a5fa; font-family:'JetBrains Mono',monospace; flex-shrink:0; position:relative; }
//                 .pf-online{ position:absolute; bottom:2px; right:2px; width:12px; height:12px; border-radius:50%; background:#22c55e; border:2px solid #06080e; }
//                 .pf-info  { flex:1; min-width:0; }
//                 .pf-name  { font-size:22px; font-weight:800; color:#e2e8f0; letter-spacing:-.02em; margin-bottom:4px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
//                 .pf-badge { font-size:10px; padding:2px 10px; border-radius:10px; background:rgba(251,191,36,.12); border:1px solid rgba(251,191,36,.25); color:#fbbf24; font-family:'JetBrains Mono',monospace; font-weight:700; }
//                 .pf-meta  { font-size:12px; color:rgba(148,163,184,.5); font-family:'JetBrains Mono',monospace; margin-bottom:8px; }
//                 .pf-pts   { font-size:13px; font-weight:700; color:#60a5fa; font-family:'JetBrains Mono',monospace; }
//                 .pf-ac-ring{ display:flex; flex-direction:column; align-items:center; gap:4px; }
//
//                 /* Stats Row */
//                 .pf-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:20px; animation:pf-fadeUp .5s ease-out .1s both; }
//                 .pf-stat  { padding:18px 14px; border-radius:12px; background:rgba(226,232,240,.03); border:1px solid rgba(226,232,240,.07); text-align:center; transition:all .2s; }
//                 .pf-stat:hover { background:rgba(226,232,240,.06); border-color:rgba(226,232,240,.14); transform:translateY(-2px); }
//                 .pf-stat-icon { font-size:18px; margin-bottom:8px; }
//                 .pf-stat-val  { font-size:22px; font-weight:800; font-family:'JetBrains Mono',monospace; margin-bottom:4px; }
//                 .pf-stat-lbl  { font-size:9.5px; color:rgba(148,163,184,.45); font-family:'JetBrains Mono',monospace; text-transform:uppercase; letter-spacing:.06em; }
//
//                 /* Tabs */
//                 .pf-tabs  { display:flex; border-bottom:1px solid rgba(226,232,240,.07); margin-bottom:20px; gap:0; animation:pf-fadeUp .5s ease-out .15s both; }
//                 .pf-tab   { padding:10px 20px; font-size:13px; font-weight:600; color:rgba(148,163,184,.5); cursor:pointer; border-bottom:2px solid transparent; transition:all .2s; display:flex; align-items:center; gap:6px; }
//                 .pf-tab:hover { color:rgba(226,232,240,.7); }
//                 .pf-tab.on    { color:#60a5fa; border-bottom-color:#60a5fa; }
//
//                 /* Overview */
//                 .pf-2col  { display:grid; grid-template-columns:1fr 1fr; gap:16px; animation:pf-fadeUp .5s ease-out .2s both; }
//                 .pf-card  { padding:20px; border-radius:12px; background:rgba(226,232,240,.03); border:1px solid rgba(226,232,240,.07); }
//                 .pf-card-title { font-size:12px; font-weight:700; color:rgba(226,232,240,.7); margin-bottom:14px; display:flex; align-items:center; gap:7px; }
//                 .pf-diff-row   { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
//                 .pf-diff-bar   { height:4px; border-radius:2px; background:rgba(226,232,240,.06); overflow:hidden; margin-top:4px; }
//                 .pf-diff-fill  { height:100%; border-radius:2px; transition:width .8s ease; }
//
//                 /* Submissions Tab */
//                 .pf-sub-list { display:flex; flex-direction:column; gap:8px; animation:pf-fadeUp .5s ease-out .2s both; }
//                 .pf-sub-row  { display:grid; grid-template-columns:1fr auto auto auto; gap:12px; align-items:center; padding:12px 16px; border-radius:10px; background:rgba(226,232,240,.03); border:1px solid rgba(226,232,240,.06); transition:all .2s; cursor:pointer; }
//                 .pf-sub-row:hover { background:rgba(226,232,240,.06); border-color:rgba(226,232,240,.12); }
//                 .pf-sub-title { font-size:13px; font-weight:600; color:#e2e8f0; }
//                 .pf-sub-lang  { font-size:10.5px; color:rgba(148,163,184,.45); font-family:'JetBrains Mono',monospace; }
//                 .pf-sub-date  { font-size:10.5px; color:rgba(148,163,184,.35); font-family:'JetBrains Mono',monospace; }
//
//                 /* Skel */
//                 .pf-skel { height:44px; border-radius:10px; background:linear-gradient(90deg,rgba(226,232,240,.04) 25%,rgba(226,232,240,.07) 50%,rgba(226,232,240,.04) 75%); background-size:200% auto; animation:pf-skel 1.5s linear infinite; margin-bottom:8px; }
//
//                 @media(max-width:700px){
//                     .pf-stats { grid-template-columns:repeat(3,1fr); }
//                     .pf-2col  { grid-template-columns:1fr; }
//                 }
//             `}</style>
//
//             <div className="pf-page">
//                 <div className="pf-grid"/>
//                 <div className="pf-glow" style={{width:500,height:400,background:'rgba(96,165,250,.05)',top:-100,left:'20%'}}/>
//                 <div className="pf-glow" style={{width:350,height:350,background:'rgba(139,92,246,.04)',bottom:'5%',right:'5%',animationDelay:'2.5s'}}/>
//                 <Navbar/>
//                 <div style={{height:72}}/>
//
//                 <div className="pf-inner">
//
//                     {/* HERO */}
//                     <div className="pf-hero">
//                         <div className="pf-avatar">
//                             {(currentUser?.username || currentUser?.email || 'U').slice(0,2).toUpperCase()}
//                             <div className="pf-online"/>
//                         </div>
//                         <div className="pf-info">
//                             <div className="pf-name">
//                                 {currentUser?.username || currentUser?.email?.split('@')[0] || 'User'}
//                                 {currentUser?.role === 'Admin' && <span className="pf-badge">👑 Admin</span>}
//                             </div>
//                             <div className="pf-meta">
//                                 🗓 Joined {joinDate} · GLA University CSE
//                             </div>
//                             <div style={{display:'flex',alignItems:'center',gap:8}}>
//                                 <div style={{flex:1,height:4,borderRadius:2,background:'rgba(226,232,240,.06)',overflow:'hidden',maxWidth:200}}>
//                                     <div style={{height:'100%',width:`${Math.min((solved/10)*100,100)}%`,background:'linear-gradient(90deg,#60a5fa,#818cf8)',borderRadius:2,transition:'width .8s ease'}}/>
//                                 </div>
//                                 <span className="pf-pts">{solved * 100} pts</span>
//                             </div>
//                         </div>
//
//                         {/* AC Rate Ring */}
//                         <div className="pf-ac-ring">
//                             <div style={{position:'relative',width:70,height:70}}>
//                                 <svg width="70" height="70" viewBox="0 0 70 70">
//                                     <circle cx="35" cy="35" r="28" fill="none" stroke="rgba(226,232,240,.06)" strokeWidth="6"/>
//                                     <circle cx="35" cy="35" r="28" fill="none"
//                                             stroke="#22c55e" strokeWidth="6"
//                                             strokeDasharray={`${2 * Math.PI * 28 * accuracy / 100} ${2 * Math.PI * 28}`}
//                                             strokeLinecap="round"
//                                             transform="rotate(-90 35 35)"
//                                             style={{transition:'stroke-dasharray .8s ease'}}
//                                     />
//                                 </svg>
//                                 <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#22c55e',fontFamily:"'JetBrains Mono',monospace"}}>
//                                     {accuracy}%
//                                 </div>
//                             </div>
//                             <div style={{fontSize:9.5,color:'rgba(148,163,184,.4)',fontFamily:"'JetBrains Mono',monospace",textTransform:'uppercase',letterSpacing:'.05em'}}>AC Rate</div>
//                         </div>
//                     </div>
//
//                     {/* STATS */}
//                     <div className="pf-stats">
//                         {[
//                             { icon:'</>',  val:solved,               label:'Problems Solved', color:'#60a5fa' },
//                             { icon:'📈',   val:submissions.length,   label:'Total Submissions',color:'#818cf8' },
//                             { icon:'✅',   val:accepted.length,      label:'Accepted',        color:'#22c55e' },
//                             { icon:'🔥',   val:'0d',                 label:'Streak',          color:'#fb923c' },
//                             { icon:'🏆',   val:solved * 100,         label:'Score',           color:'#fbbf24' },
//                         ].map((s,i) => (
//                             <div key={i} className="pf-stat">
//                                 <div className="pf-stat-icon">{s.icon}</div>
//                                 <div className="pf-stat-val" style={{color:s.color}}>{s.val}</div>
//                                 <div className="pf-stat-lbl">{s.label}</div>
//                             </div>
//                         ))}
//                     </div>
//
//                     {/* TABS */}
//                     <div className="pf-tabs">
//                         {[
//                             {key:'overview',    label:'</> Overview'},
//                             {key:'submissions', label:'📋 Submissions'},
//                             {key:'stats',       label:'📊 Stats'},
//                         ].map(t => (
//                             <div key={t.key} className={`pf-tab ${activeTab===t.key?'on':''}`} onClick={()=>setActiveTab(t.key)}>
//                                 {t.label}
//                             </div>
//                         ))}
//                     </div>
//
//                     {/* OVERVIEW TAB */}
//                     {activeTab === 'overview' && (
//                         <div className="pf-2col">
//                             {/* Difficulty Breakdown */}
//                             <div className="pf-card">
//                                 <div className="pf-card-title">🏆 Difficulty Breakdown</div>
//                                 {[
//                                     { label:'Easy',   color:'#22c55e', count: accepted.filter(s => s.difficulty==='Easy'   || s.problem?.difficulty==='Easy').length   },
//                                     { label:'Medium', color:'#f59e0b', count: accepted.filter(s => s.difficulty==='Medium' || s.problem?.difficulty==='Medium').length },
//                                     { label:'Hard',   color:'#ef4444', count: accepted.filter(s => s.difficulty==='Hard'   || s.problem?.difficulty==='Hard').length   },
//                                 ].map((d,i) => (
//                                     <div key={i} style={{marginBottom:14}}>
//                                         <div className="pf-diff-row">
//                                             <span style={{fontSize:13,fontWeight:600,color:d.color}}>{d.label}</span>
//                                             <span style={{fontSize:12,color:'rgba(148,163,184,.5)',fontFamily:"'JetBrains Mono',monospace"}}>{d.count} solved</span>
//                                         </div>
//                                         <div className="pf-diff-bar">
//                                             <div className="pf-diff-fill" style={{width:`${solved>0?(d.count/solved)*100:0}%`,background:d.color}}/>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//
//                             {/* Recent Submissions */}
//                             <div className="pf-card">
//                                 <div className="pf-card-title" style={{justifyContent:'space-between'}}>
//                                     <span>📋 Recent Submissions</span>
//                                     <span style={{fontSize:11,color:'#60a5fa',cursor:'pointer'}} onClick={()=>setActiveTab('submissions')}>View all →</span>
//                                 </div>
//                                 {loading ? (
//                                     [1,2,3].map(i => <div key={i} className="pf-skel"/>)
//                                 ) : recentSubs.slice(0,4).map((s,i) => (
//                                     <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(226,232,240,.05)'}}>
//                                         <div>
//                                             <div style={{fontSize:12.5,fontWeight:600,color:'#e2e8f0'}}>Problem #{s.problemId}</div>
//                                             <div style={{fontSize:10.5,color:'rgba(148,163,184,.4)',fontFamily:"'JetBrains Mono',monospace"}}>{s.language}</div>
//                                         </div>
//                                         <div style={{textAlign:'right'}}>
//                                             <div style={{fontSize:11.5,fontWeight:700,color:statusColor(s.status)}}>{s.status}</div>
//                                             <div style={{fontSize:10,color:'rgba(148,163,184,.35)',fontFamily:"'JetBrains Mono',monospace"}}>
//                                                 {new Date(s.submittedAt).toLocaleDateString()}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                                 {!loading && recentSubs.length === 0 && (
//                                     <div style={{textAlign:'center',padding:'20px 0',fontSize:12,color:'rgba(148,163,184,.4)'}}>No submissions yet</div>
//                                 )}
//                             </div>
//                         </div>
//                     )}
//
//                     {/* SUBMISSIONS TAB */}
//                     {activeTab === 'submissions' && (
//                         <div className="pf-sub-list">
//                             {loading ? (
//                                 Array(6).fill(0).map((_,i) => <div key={i} className="pf-skel"/>)
//                             ) : recentSubs.length === 0 ? (
//                                 <div style={{textAlign:'center',padding:'40px 0'}}>
//                                     <div style={{fontSize:28,marginBottom:12}}>📋</div>
//                                     <div style={{fontSize:14,color:'rgba(148,163,184,.4)'}}>No submissions yet</div>
//                                 </div>
//                             ) : (
//                                 recentSubs.map((s,i) => (
//                                     <div key={i} className="pf-sub-row" onClick={()=>navigate(`/problems/${s.problemId}`)}>
//                                         <div>
//                                             <div className="pf-sub-title">Problem #{s.problemId}</div>
//                                             <div className="pf-sub-lang">{s.language}</div>
//                                         </div>
//                                         <div style={{fontSize:12,fontWeight:700,color:statusColor(s.status)}}>{s.status}</div>
//                                         {s.executionTimeMs > 0 && (
//                                             <div style={{fontSize:10.5,color:'rgba(148,163,184,.4)',fontFamily:"'JetBrains Mono',monospace"}}>⚡{Math.round(s.executionTimeMs)}ms</div>
//                                         )}
//                                         <div className="pf-sub-date">{new Date(s.submittedAt).toLocaleDateString()}</div>
//                                     </div>
//                                 ))
//                             )}
//                         </div>
//                     )}
//
//                     {/* STATS TAB */}
//                     {activeTab === 'stats' && (
//                         <div className="pf-2col" style={{animation:'pf-fadeUp .5s ease-out both'}}>
//                             <div className="pf-card">
//                                 <div className="pf-card-title">📊 Submission Stats</div>
//                                 {[
//                                     {label:'Total Submissions', val:submissions.length,  color:'#60a5fa'},
//                                     {label:'Accepted',          val:accepted.length,      color:'#22c55e'},
//                                     {label:'Wrong Answer',      val:submissions.filter(s=>s.status==='Wrong Answer').length,        color:'#ef4444'},
//                                     {label:'Time Limit',        val:submissions.filter(s=>s.status==='Time Limit Exceeded').length, color:'#f59e0b'},
//                                     {label:'Compile Error',     val:submissions.filter(s=>s.status==='Compilation Error').length,   color:'#f87171'},
//                                 ].map((item,i) => (
//                                     <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(226,232,240,.05)'}}>
//                                         <span style={{fontSize:13,color:'rgba(226,232,240,.6)'}}>{item.label}</span>
//                                         <span style={{fontSize:14,fontWeight:700,color:item.color,fontFamily:"'JetBrains Mono',monospace"}}>{item.val}</span>
//                                     </div>
//                                 ))}
//                             </div>
//                             <div className="pf-card">
//                                 <div className="pf-card-title">🎯 Performance</div>
//                                 <div style={{display:'flex',flexDirection:'column',gap:14}}>
//                                     {[
//                                         {label:'Acceptance Rate', val:`${accuracy}%`,     color: accuracy>=60?'#22c55e':accuracy>=40?'#f59e0b':'#ef4444', pct:accuracy},
//                                         {label:'Problems Solved', val:`${solved}`,         color:'#60a5fa', pct:Math.min(solved*10,100)},
//                                         {label:'Best Streak',     val:'0 days',           color:'#fb923c', pct:0},
//                                     ].map((item,i) => (
//                                         <div key={i}>
//                                             <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
//                                                 <span style={{fontSize:12,color:'rgba(148,163,184,.5)'}}>{item.label}</span>
//                                                 <span style={{fontSize:12,fontWeight:700,color:item.color,fontFamily:"'JetBrains Mono',monospace"}}>{item.val}</span>
//                                             </div>
//                                             <div style={{height:4,borderRadius:2,background:'rgba(226,232,240,.06)',overflow:'hidden'}}>
//                                                 <div style={{height:'100%',width:`${item.pct}%`,background:item.color,borderRadius:2,transition:'width .8s ease'}}/>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </>
//     )
// }
//
// export default ProfilePage