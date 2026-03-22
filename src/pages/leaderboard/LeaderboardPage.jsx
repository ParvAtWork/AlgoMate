// src/pages/leaderboard/LeaderboardPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser } from '../../store/slices/authSlice.js'
import Navbar from '../../components/common/Navbar.jsx'
import axiosInstance from '../../api/axiosInstance.js'

const LeaderboardPage = () => {
    const navigate    = useNavigate()
    const currentUser = useSelector(selectUser)

    const [users,      setUsers]      = useState([])
    const [loading,    setLoading]    = useState(true)
    const [error,      setError]      = useState(null)
    const [filter,     setFilter]     = useState('all')
    const [myRank,     setMyRank]     = useState(null)
    const [lastUpdate, setLastUpdate] = useState(null)
    const intervalRef = useRef(null)

    const fetchLeaderboard = async () => {
        try {
            const res  = await fetch('http://localhost:5270/api/submission/leaderboard')
            const data = await res.json()

            setUsers(data)
            setLastUpdate(new Date())

            if (currentUser) {
                const me = data.find(u =>
                    u.userId === currentUser.id ||
                    u.username?.toLowerCase() === currentUser.username?.toLowerCase()
                )
                if (me) setMyRank(me.rank)
            }

            setError(null)
        } catch (err) {
            setError('Failed to load leaderboard — ' + (err.message || ''))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLeaderboard()
        intervalRef.current = setInterval(fetchLeaderboard, 30000)
        return () => clearInterval(intervalRef.current)
    }, [])

    const filtered = [...users].sort((a, b) => {
        if (filter === 'easy')   return b.easyS   - a.easyS
        if (filter === 'medium') return b.mediumS  - a.mediumS
        if (filter === 'hard')   return b.hardS    - a.hardS
        return a.rank - b.rank
    }).map((u, i) => ({ ...u, displayRank: i + 1 }))

    const getBadge = (rank) => {
        if (rank === 1) return { icon:'🏆', color:'#fbbf24' }
        if (rank === 2) return { icon:'🥈', color:'#94a3b8' }
        if (rank === 3) return { icon:'🥉', color:'#fb923c' }
        return { icon:`#${rank}`, color:'rgba(148,163,184,.5)' }
    }

    const isMe = (u) =>
        currentUser && (
            u.userId === currentUser.id ||
            u.username?.toLowerCase() === currentUser.username?.toLowerCase()
        )

    const myStats = users.find(u => isMe(u))

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
                @keyframes lb-fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
                @keyframes lb-pulse  { 0%,100%{opacity:.06} 50%{opacity:.12} }
                @keyframes lb-glow   { 0%,100%{opacity:.08} 50%{opacity:.16} }
                @keyframes lb-skel   { 0%{background-position:200% center} 100%{background-position:-200% center} }
                @keyframes lb-ping   { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(2);opacity:0} }

                .lb-page  { min-height:100vh; background:#06080e; font-family:'Space Grotesk',sans-serif; }
                .lb-grid  { position:fixed; inset:0; background:repeating-linear-gradient(90deg,rgba(226,232,240,.018) 0,transparent 1px,transparent 80px),repeating-linear-gradient(180deg,rgba(226,232,240,.018) 0,transparent 1px,transparent 80px); animation:lb-pulse 5s ease-in-out infinite; pointer-events:none; z-index:0; }
                .lb-glow  { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; animation:lb-glow 5s ease-in-out infinite; }
                .lb-inner { max-width:960px; margin:0 auto; padding:28px 24px 80px; position:relative; z-index:1; }

                .lb-top   { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:28px; animation:lb-fadeUp .5s ease-out both; flex-wrap:wrap; gap:12px; }
                .lb-tag   { font-size:9.5px; font-family:'JetBrains Mono',monospace; color:rgba(251,191,36,.6); letter-spacing:.18em; text-transform:uppercase; margin-bottom:6px; }
                .lb-h1    { font-size:26px; font-weight:800; letter-spacing:-.03em; color:#e2e8f0; }
                .lb-h1-acc{ background:linear-gradient(90deg,#fbbf24,#f59e0b); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
                .lb-sub   { font-size:13px; color:rgba(148,163,184,.5); margin-top:4px; }

                .lb-live     { display:flex; align-items:center; gap:7px; padding:6px 14px; border-radius:20px; background:rgba(34,197,94,.08); border:1px solid rgba(34,197,94,.18); font-size:11px; font-family:'JetBrains Mono',monospace; color:#22c55e; }
                .lb-live-dot { position:relative; width:7px; height:7px; flex-shrink:0; }
                .lb-live-dot::before { content:''; position:absolute; inset:0; border-radius:50%; background:#22c55e; animation:lb-ping 1.5s ease-in-out infinite; }
                .lb-live-dot::after  { content:''; position:absolute; inset:0; border-radius:50%; background:#22c55e; }

                .lb-my-rank  { display:flex; align-items:center; gap:16px; padding:16px 20px; border-radius:12px; background:rgba(96,165,250,.06); border:1px solid rgba(96,165,250,.18); margin-bottom:18px; animation:lb-fadeUp .5s ease-out .08s both; flex-wrap:wrap; }
                .lb-divider  { width:1px; height:40px; background:rgba(96,165,250,.15); }
                .lb-stat-box { text-align:center; }
                .lb-stat-val { font-size:20px; font-weight:800; font-family:'JetBrains Mono',monospace; }
                .lb-stat-lbl { font-size:9.5px; color:rgba(148,163,184,.4); font-family:'JetBrains Mono',monospace; text-transform:uppercase; letter-spacing:.05em; margin-top:2px; }

                .lb-filters { display:flex; gap:8px; margin-bottom:18px; flex-wrap:wrap; animation:lb-fadeUp .5s ease-out .12s both; }
                .lb-filter  { padding:7px 18px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer; border:1px solid rgba(226,232,240,.08); background:rgba(226,232,240,.03); color:rgba(148,163,184,.55); transition:all .2s; font-family:'Space Grotesk',sans-serif; }
                .lb-filter:hover { border-color:rgba(226,232,240,.18); color:#e2e8f0; }
                .lb-filter.on    { background:rgba(251,191,36,.1); border-color:rgba(251,191,36,.3); color:#fbbf24; }

                .lb-table  { border:1px solid rgba(226,232,240,.07); border-radius:14px; overflow:hidden; animation:lb-fadeUp .5s ease-out .18s both; }
                .lb-thead  { display:grid; grid-template-columns:64px 1fr 90px 100px 80px 100px; padding:11px 18px; background:rgba(226,232,240,.03); border-bottom:1px solid rgba(226,232,240,.07); font-size:10px; font-weight:700; color:rgba(148,163,184,.4); letter-spacing:.08em; text-transform:uppercase; font-family:'JetBrains Mono',monospace; }
                .lb-row    { display:grid; grid-template-columns:64px 1fr 90px 100px 80px 100px; padding:14px 18px; border-bottom:1px solid rgba(226,232,240,.05); transition:all .2s; align-items:center; }
                .lb-row:last-child { border-bottom:none; }
                .lb-row:hover { background:rgba(226,232,240,.025); }
                .lb-row.me   { background:rgba(96,165,250,.05); border-left:2px solid rgba(96,165,250,.4); }
                .lb-row.top1 { background:rgba(251,191,36,.04); border-left:2px solid rgba(251,191,36,.4); }
                .lb-row.top2 { background:rgba(148,163,184,.03); border-left:2px solid rgba(148,163,184,.3); }
                .lb-row.top3 { background:rgba(249,115,22,.04); border-left:2px solid rgba(249,115,22,.3); }

                .lb-rank-cell { display:flex; align-items:center; justify-content:center; }
                .lb-user-cell { display:flex; align-items:center; gap:11px; min-width:0; }
                .lb-avatar    { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0; font-family:'JetBrains Mono',monospace; }
                .lb-username  { font-size:13.5px; font-weight:700; color:#e2e8f0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
                .lb-you       { font-size:9px; padding:1px 7px; border-radius:8px; background:rgba(96,165,250,.15); border:1px solid rgba(96,165,250,.3); color:#60a5fa; font-family:'JetBrains Mono',monospace; flex-shrink:0; }
                .lb-val       { font-size:13px; font-weight:700; font-family:'JetBrains Mono',monospace; }
                .lb-dc        { font-size:9.5px; padding:2px 6px; border-radius:6px; font-family:'JetBrains Mono',monospace; font-weight:600; }
                .lb-skel      { height:58px; background:linear-gradient(90deg,rgba(226,232,240,.04) 25%,rgba(226,232,240,.07) 50%,rgba(226,232,240,.04) 75%); background-size:200% auto; animation:lb-skel 1.5s linear infinite; border-bottom:1px solid rgba(226,232,240,.05); }
                .lb-empty     { padding:60px 20px; text-align:center; }
                .lb-err       { padding:14px 18px; background:rgba(248,113,113,.06); border-radius:8px; border:1px solid rgba(248,113,113,.15); color:#f87171; font-size:12px; font-family:'JetBrains Mono',monospace; margin-bottom:16px; }
                .lb-update    { font-size:10.5px; font-family:'JetBrains Mono',monospace; color:rgba(148,163,184,.3); text-align:right; margin-top:12px; }
                .lb-refresh   { padding:6px 14px; border-radius:8px; background:rgba(226,232,240,.04); border:1px solid rgba(226,232,240,.1); color:rgba(148,163,184,.6); font-size:11px; font-family:'JetBrains Mono',monospace; cursor:pointer; transition:all .2s; }
                .lb-refresh:hover { background:rgba(226,232,240,.08); color:#e2e8f0; }

                @media(max-width:700px){
                    .lb-thead,.lb-row { grid-template-columns:50px 1fr 80px 80px; }
                    .lb-row>*:nth-child(5),.lb-row>*:nth-child(6),
                    .lb-thead>*:nth-child(5),.lb-thead>*:nth-child(6){ display:none; }
                }
            `}</style>

            <div className="lb-page">
                <div className="lb-grid"/>
                <div className="lb-glow" style={{width:500,height:400,background:'rgba(251,191,36,.05)',top:-100,left:'30%'}}/>
                <div className="lb-glow" style={{width:350,height:350,background:'rgba(96,165,250,.04)',bottom:'5%',right:'5%',animationDelay:'2.5s'}}/>
                <Navbar/>
                <div style={{height:72}}/>

                <div className="lb-inner">

                    {/* TOP */}
                    <div className="lb-top">
                        <div>
                            <div className="lb-tag">// Rankings</div>
                            <div className="lb-h1">Leaderboard <span className="lb-h1-acc">🏆</span></div>
                            <div className="lb-sub">Real-time rankings — problems solved & points earned.</div>
                        </div>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}}>
                            <div className="lb-live">
                                <div className="lb-live-dot"/>
                                Live · Updates every 30s
                            </div>
                            <button className="lb-refresh" onClick={fetchLeaderboard}>↻ Refresh</button>
                        </div>
                    </div>

                    {/* MY RANK CARD */}
                    {myRank && myStats && (
                        <div className="lb-my-rank">
                            <div className="lb-stat-box">
                                <div style={{fontSize:10,color:'rgba(96,165,250,.7)',fontFamily:"'JetBrains Mono',monospace",textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>Your Rank</div>
                                <div style={{fontSize:28,fontWeight:800,color:'#60a5fa',fontFamily:"'JetBrains Mono',monospace"}}>#{myRank}</div>
                            </div>
                            <div className="lb-divider"/>
                            <div className="lb-stat-box">
                                <div className="lb-stat-val" style={{color:'#60a5fa'}}>{myStats.solved}</div>
                                <div className="lb-stat-lbl">Solved</div>
                            </div>
                            <div className="lb-divider"/>
                            <div className="lb-stat-box">
                                <div className="lb-stat-val" style={{color:'#fbbf24'}}>{myStats.points}</div>
                                <div className="lb-stat-lbl">Points</div>
                            </div>
                            <div className="lb-divider"/>
                            <div className="lb-stat-box">
                                <div className="lb-stat-val" style={{color:'#22c55e'}}>{myStats.accuracy}%</div>
                                <div className="lb-stat-lbl">Accuracy</div>
                            </div>
                            <div className="lb-divider"/>
                            <div style={{display:'flex',gap:6}}>
                                <div className="lb-stat-box">
                                    <div className="lb-stat-val" style={{color:'#22c55e',fontSize:16}}>{myStats.easyS}</div>
                                    <div className="lb-stat-lbl">Easy</div>
                                </div>
                                <div className="lb-stat-box">
                                    <div className="lb-stat-val" style={{color:'#f59e0b',fontSize:16}}>{myStats.mediumS}</div>
                                    <div className="lb-stat-lbl">Medium</div>
                                </div>
                                <div className="lb-stat-box">
                                    <div className="lb-stat-val" style={{color:'#ef4444',fontSize:16}}>{myStats.hardS}</div>
                                    <div className="lb-stat-lbl">Hard</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && <div className="lb-err">⚠ {error}</div>}

                    {/* FILTERS */}
                    <div className="lb-filters">
                        {[
                            {key:'all',    label:'All Problems'},
                            {key:'easy',   label:'🟢 Easy'},
                            {key:'medium', label:'🟡 Medium'},
                            {key:'hard',   label:'🔴 Hard'},
                        ].map(f => (
                            <div key={f.key} className={`lb-filter ${filter===f.key?'on':''}`} onClick={()=>setFilter(f.key)}>
                                {f.label}
                            </div>
                        ))}
                    </div>

                    {/* TABLE */}
                    <div className="lb-table">
                        <div className="lb-thead">
                            <div>Rank</div>
                            <div>User</div>
                            <div>Solved</div>
                            <div>Points</div>
                            <div>Accuracy</div>
                            <div>Breakdown</div>
                        </div>

                        {loading ? (
                            Array(8).fill(0).map((_,i) => (
                                <div key={i} className="lb-skel" style={{animationDelay:`${i*.08}s`}}/>
                            ))
                        ) : filtered.length === 0 ? (
                            <div className="lb-empty">
                                <div style={{fontSize:32,marginBottom:12}}>📊</div>
                                <div style={{fontSize:14,color:'rgba(226,232,240,.5)',fontWeight:600}}>No data yet</div>
                                <div style={{fontSize:12,color:'rgba(148,163,184,.4)',marginTop:6}}>Solve problems to appear on leaderboard!</div>
                            </div>
                        ) : (
                            filtered.map((u, i) => {
                                const badge      = getBadge(u.displayRank)
                                const avatarBg   = u.displayRank===1 ? 'rgba(251,191,36,.15)'
                                    : u.displayRank===2 ? 'rgba(148,163,184,.12)'
                                        : u.displayRank===3 ? 'rgba(249,115,22,.12)'
                                            : 'rgba(226,232,240,.06)'
                                const avatarClr  = u.displayRank===1 ? '#fbbf24'
                                    : u.displayRank===2 ? '#94a3b8'
                                        : u.displayRank===3 ? '#fb923c'
                                            : '#60a5fa'
                                const rowCls     = isMe(u)          ? 'lb-row me'
                                    : u.displayRank===1 ? 'lb-row top1'
                                        : u.displayRank===2 ? 'lb-row top2'
                                            : u.displayRank===3 ? 'lb-row top3'
                                                : 'lb-row'

                                return (
                                    <div key={u.userId || i} className={rowCls}>

                                        {/* Rank */}
                                        <div className="lb-rank-cell">
                                            {u.displayRank <= 3
                                                ? <span style={{fontSize:22}}>{badge.icon}</span>
                                                : <span style={{fontSize:13,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:badge.color}}>{badge.icon}</span>
                                            }
                                        </div>

                                        {/* User */}
                                        <div className="lb-user-cell">
                                            <div className="lb-avatar" style={{background:avatarBg,color:avatarClr,border:`1px solid ${avatarClr}30`}}>
                                                {u.avatar}
                                            </div>
                                            <div style={{minWidth:0}}>
                                                <div style={{display:'flex',alignItems:'center',gap:7}}>
                                                    <span className="lb-username">{u.username}</span>
                                                    {isMe(u) && <span className="lb-you">You</span>}
                                                </div>
                                                {u.displayRank===1 && (
                                                    <div style={{fontSize:10,color:'rgba(251,191,36,.6)',fontFamily:"'JetBrains Mono',monospace",marginTop:1}}>👑 Top Coder</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Solved */}
                                        <div className="lb-val" style={{color:'#e2e8f0'}}>
                                            {filter==='easy'   ? u.easyS
                                                : filter==='medium' ? u.mediumS
                                                    : filter==='hard'   ? u.hardS
                                                        : u.solved}
                                        </div>

                                        {/* Points */}
                                        <div className="lb-val" style={{color:'#fbbf24'}}>
                                            {u.points.toLocaleString()}
                                        </div>

                                        {/* Accuracy */}
                                        <div className="lb-val" style={{
                                            fontSize:12,
                                            color: u.accuracy>=70 ? '#22c55e'
                                                : u.accuracy>=50 ? '#f59e0b'
                                                    : '#ef4444'
                                        }}>
                                            {u.accuracy}%
                                        </div>

                                        {/* Breakdown */}
                                        <div style={{display:'flex',gap:4}}>
                                            <span className="lb-dc" style={{background:'rgba(34,197,94,.08)',color:'#22c55e',border:'1px solid rgba(34,197,94,.15)'}}>E:{u.easyS}</span>
                                            <span className="lb-dc" style={{background:'rgba(245,158,11,.08)',color:'#f59e0b',border:'1px solid rgba(245,158,11,.15)'}}>M:{u.mediumS}</span>
                                            <span className="lb-dc" style={{background:'rgba(239,68,68,.08)',color:'#ef4444',border:'1px solid rgba(239,68,68,.15)'}}>H:{u.hardS}</span>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {lastUpdate && (
                        <div className="lb-update">
                            Last updated: {lastUpdate.toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default LeaderboardPage