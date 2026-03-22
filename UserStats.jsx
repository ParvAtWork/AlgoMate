// src/components/user/UserStats.jsx
import { motion } from 'framer-motion'
import Progress, { CircleProgress } from '../ui/progress.jsx'
import { TrendingUp, Award, Target, Zap, BarChart2 } from 'lucide-react'

// ── Heatmap ──────────────────────────────────────────────────────
const ActivityHeatmap = ({ data = [], delay = 0 }) => {
    const days  = 70
    const cells = Array(days).fill(0).map((_, i) => {
        const d = data[data.length - days + i]
        return d ?? 0
    })

    const maxVal = Math.max(...cells, 1)

    const getColor = (val) => {
        if (!val) return 'rgba(226,232,240,.05)'
        const intensity = val / maxVal
        if (intensity > .75) return '#22c55e'
        if (intensity > .5)  return 'rgba(34,197,94,.6)'
        if (intensity > .25) return 'rgba(34,197,94,.35)'
        return 'rgba(34,197,94,.15)'
    }

    return (
        <div>
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase', marginBottom:8 }}>
                Activity (Last 70 days)
            </div>
            <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
                {cells.map((val, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity:0, scale:0 }}
                        animate={{ opacity:1, scale:1 }}
                        transition={{ delay: delay + i*.008, duration:.2 }}
                        title={`${val} submission${val !== 1 ? 's' : ''}`}
                        style={{ width:10, height:10, borderRadius:2, background:getColor(val), cursor:'default', transition:'transform .1s' }}
                        whileHover={{ scale:1.4 }}
                    />
                ))}
            </div>
        </div>
    )
}

// ── Topic breakdown ───────────────────────────────────────────────
const TopicBreakdown = ({ topics = [], delay = 0 }) => {
    const max = Math.max(...topics.map(t => t.count), 1)

    return (
        <div>
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase', marginBottom:10 }}>
                Topics Solved
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {topics.slice(0, 6).map((t, i) => (
                    <motion.div
                        key={t.topic}
                        initial={{ opacity:0, x:-10 }}
                        animate={{ opacity:1, x:0   }}
                        transition={{ delay: delay + i*.06 }}
                    >
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                            <span style={{ fontSize:12, color:'rgba(226,232,240,.65)' }}>{t.topic}</span>
                            <span style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.5)' }}>{t.count}</span>
                        </div>
                        <Progress value={t.count} max={max} height={4} color='#60a5fa' delay={delay + i*.06 + .1} animated={false}/>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

// ── Rank card ─────────────────────────────────────────────────────
const RankCard = ({ rank, totalUsers, delay = 0 }) => {
    const percentile = totalUsers > 0 ? Math.round(((totalUsers - rank) / totalUsers) * 100) : 0
    const color = percentile >= 90 ? '#fbbf24' : percentile >= 70 ? '#a78bfa' : percentile >= 50 ? '#60a5fa' : '#22c55e'
    const label = percentile >= 90 ? '🏆 Top 10%' : percentile >= 70 ? '🥇 Top 30%' : percentile >= 50 ? '⭐ Top 50%' : '💪 Rising'

    return (
        <motion.div
            initial={{ opacity:0, scale:.95 }}
            animate={{ opacity:1, scale:1  }}
            transition={{ delay, duration:.4 }}
            style={{ padding:'16px 20px', borderRadius:12, background:`${color}08`, border:`1px solid ${color}20`, display:'flex', alignItems:'center', gap:16 }}
        >
            <CircleProgress value={percentile} max={100} size={56} color={color} strokeWidth={4}>
                <span style={{ fontSize:10, fontWeight:800, color, fontFamily:"'JetBrains Mono',monospace" }}>{percentile}%</span>
            </CircleProgress>
            <div>
                <div style={{ fontSize:18, fontWeight:800, color, fontFamily:"'JetBrains Mono',monospace" }}>#{rank}</div>
                <div style={{ fontSize:12, fontWeight:600, color:`${color}cc` }}>{label}</div>
                <div style={{ fontSize:10, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", marginTop:2 }}>
                    Top {100-percentile}% of {totalUsers?.toLocaleString()} users
                </div>
            </div>
        </motion.div>
    )
}

// ── Main UserStats component ──────────────────────────────────────
const UserStats = ({ user, rank, totalUsers = 0, activityData = [], topicStats = [], delay = 0 }) => {
    const diffStats = [
        { label:'Easy',   solved: user?.easySolved   || 0, total: user?.easyTotal   || 0, color:'#22c55e' },
        { label:'Medium', solved: user?.mediumSolved || 0, total: user?.mediumTotal || 0, color:'#f59e0b' },
        { label:'Hard',   solved: user?.hardSolved   || 0, total: user?.hardTotal   || 0, color:'#ef4444' },
    ]

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Rank */}
            {rank && <RankCard rank={rank} totalUsers={totalUsers} delay={delay}/>}

            {/* Difficulty breakdown */}
            <motion.div
                initial={{ opacity:0, y:12 }}
                animate={{ opacity:1, y:0  }}
                transition={{ delay:delay+.1, duration:.35 }}
                style={{ padding:'18px 20px', borderRadius:12, background:'rgba(226,232,240,.03)', border:'1px solid rgba(226,232,240,.08)' }}
            >
                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14 }}>
                    <Target size={14} style={{ color:'#60a5fa' }}/>
                    <span style={{ fontSize:11, fontWeight:700, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase' }}>
                        Problems Solved
                    </span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {diffStats.map((d, i) => (
                        <div key={d.label}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                                <span style={{ fontSize:12, fontWeight:600, color:d.color }}>{d.label}</span>
                                <span style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.5)' }}>
                                    {d.solved}{d.total > 0 ? `/${d.total}` : ''}
                                </span>
                            </div>
                            <Progress
                                value={d.solved}
                                max={d.total || Math.max(d.solved, 1)}
                                height={5}
                                color={d.color}
                                delay={delay + .15 + i*.08}
                            />
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Activity heatmap */}
            {activityData.length > 0 && (
                <motion.div
                    initial={{ opacity:0, y:12 }}
                    animate={{ opacity:1, y:0  }}
                    transition={{ delay:delay+.2, duration:.35 }}
                    style={{ padding:'18px 20px', borderRadius:12, background:'rgba(226,232,240,.03)', border:'1px solid rgba(226,232,240,.08)' }}
                >
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:12 }}>
                        <Zap size={14} style={{ color:'#f59e0b' }}/>
                        <span style={{ fontSize:11, fontWeight:700, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase' }}>
                            Activity
                        </span>
                    </div>
                    <ActivityHeatmap data={activityData} delay={delay+.25}/>
                </motion.div>
            )}

            {/* Topic breakdown */}
            {topicStats.length > 0 && (
                <motion.div
                    initial={{ opacity:0, y:12 }}
                    animate={{ opacity:1, y:0  }}
                    transition={{ delay:delay+.3, duration:.35 }}
                    style={{ padding:'18px 20px', borderRadius:12, background:'rgba(226,232,240,.03)', border:'1px solid rgba(226,232,240,.08)' }}
                >
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:12 }}>
                        <BarChart2 size={14} style={{ color:'#818cf8' }}/>
                        <span style={{ fontSize:11, fontWeight:700, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase' }}>
                            Topics
                        </span>
                    </div>
                    <TopicBreakdown topics={topicStats} delay={delay+.35}/>
                </motion.div>
            )}

            {/* Achievements */}
            <motion.div
                initial={{ opacity:0, y:12 }}
                animate={{ opacity:1, y:0  }}
                transition={{ delay:delay+.4, duration:.35 }}
                style={{ padding:'18px 20px', borderRadius:12, background:'rgba(226,232,240,.03)', border:'1px solid rgba(226,232,240,.08)' }}
            >
                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:12 }}>
                    <Award size={14} style={{ color:'#fbbf24' }}/>
                    <span style={{ fontSize:11, fontWeight:700, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase' }}>
                        Achievements
                    </span>
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {[
                        { emoji:'🔥', label:'Streak',    earned: (user?.streak||0) >= 3  },
                        { emoji:'💯', label:'Centurion', earned: (user?.problemsSolved||0) >= 100 },
                        { emoji:'⚡', label:'Speedster',  earned: (user?.totalSubmissions||0) >= 50 },
                        { emoji:'🧠', label:'Thinker',   earned: (user?.hardSolved||0) >= 5 },
                        { emoji:'🌟', label:'Star',      earned: (user?.totalScore||0) >= 500 },
                        { emoji:'🏆', label:'Champion',  earned: (user?.problemsSolved||0) >= 50 },
                    ].map((a, i) => (
                        <motion.div
                            key={a.label}
                            initial={{ opacity:0, scale:0 }}
                            animate={{ opacity:1, scale:1 }}
                            transition={{ delay:delay+.45+i*.05, type:'spring', stiffness:300 }}
                            title={a.label}
                            style={{
                                width:44, height:44, borderRadius:10,
                                background: a.earned ? 'rgba(251,191,36,.08)' : 'rgba(226,232,240,.04)',
                                border:`1px solid ${a.earned ? 'rgba(251,191,36,.2)' : 'rgba(226,232,240,.07)'}`,
                                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                                gap:2, opacity: a.earned ? 1 : .3, cursor:'default',
                            }}
                        >
                            <span style={{ fontSize:18, lineHeight:1 }}>{a.emoji}</span>
                            <span style={{ fontSize:7, color:'rgba(148,163,184,.5)', fontFamily:"'JetBrains Mono',monospace", textAlign:'center' }}>{a.label}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}

export default UserStats