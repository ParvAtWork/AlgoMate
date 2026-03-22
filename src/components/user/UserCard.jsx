// src/components/user/UserCard.jsx
import { motion } from 'framer-motion'
import { Github, Mail, Calendar, MapPin, Trophy, Code2, Flame, CheckCircle2 } from 'lucide-react'
import { CircleProgress } from '../ui/progress.jsx'

const StatPill = ({ icon: Icon, label, value, color = '#60a5fa', delay = 0 }) => (
    <motion.div
        initial={{ opacity:0, y:8 }}
        animate={{ opacity:1, y:0 }}
        transition={{ delay, duration:.35 }}
        style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'12px 16px', borderRadius:10, background:'rgba(226,232,240,.03)', border:'1px solid rgba(226,232,240,.07)', flex:1, minWidth:70 }}
    >
        <Icon size={15} style={{ color }}/>
        <div style={{ fontSize:18, fontWeight:800, color, fontFamily:"'JetBrains Mono',monospace" }}>{value}</div>
        <div style={{ fontSize:10, color:'rgba(148,163,184,.45)', fontFamily:"'JetBrains Mono',monospace", textAlign:'center', letterSpacing:'.04em' }}>{label}</div>
    </motion.div>
)

const UserCard = ({ user, totalProblems = 0, delay = 0 }) => {
    const hue      = user?.username ? [...user.username].reduce((a,c) => a + c.charCodeAt(0), 0) % 360 : 200
    const solveRate = totalProblems > 0 ? Math.round(((user?.problemsSolved || 0) / totalProblems) * 100) : 0

    return (
        <motion.div
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0  }}
            transition={{ delay, duration:.4, ease:[.22,1,.36,1] }}
            style={{ padding:'24px', borderRadius:16, background:'rgba(226,232,240,.03)', border:'1px solid rgba(226,232,240,.08)', position:'relative', overflow:'hidden' }}
        >
            {/* Top glow */}
            <div style={{ position:'absolute', top:-40, left:'50%', transform:'translateX(-50%)', width:200, height:100, background:`hsl(${hue},70%,50%)`, opacity:.04, filter:'blur(40px)', borderRadius:'50%', pointerEvents:'none' }}/>

            {/* Top accent line */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,hsl(${hue},60%,55%)60,transparent)` }}/>

            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
                {/* Avatar */}
                <motion.div whileHover={{ scale:1.06 }} style={{ position:'relative', flexShrink:0 }}>
                    <div style={{ width:68, height:68, borderRadius:'50%', background:`hsl(${hue},40%,16%)`, color:`hsl(${hue},70%,65%)`, border:`3px solid hsl(${hue},40%,28%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:800, fontFamily:"'JetBrains Mono',monospace" }}>
                        {user?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    {user?.isPremium && (
                        <motion.div
                            animate={{ rotate:[0,10,-10,0] }}
                            transition={{ duration:2, repeat:Infinity, repeatDelay:3 }}
                            style={{ position:'absolute', top:-4, right:-4, fontSize:16 }}
                        >⭐</motion.div>
                    )}
                </motion.div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                        <span style={{ fontSize:18, fontWeight:800, color:'#e2e8f0', letterSpacing:'-.02em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {user?.username || 'Unknown'}
                        </span>
                        {user?.role === 'Admin' && (
                            <span style={{ fontSize:10, padding:'1px 7px', borderRadius:5, background:'rgba(251,191,36,.1)', border:'1px solid rgba(251,191,36,.2)', color:'#fbbf24', fontFamily:"'JetBrains Mono',monospace", fontWeight:700, flexShrink:0 }}>
                                👑 Admin
                            </span>
                        )}
                    </div>
                    {user?.email && (
                        <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'rgba(148,163,184,.5)', fontFamily:"'JetBrains Mono',monospace" }}>
                            <Mail size={11}/> {user.email}
                        </div>
                    )}
                    {user?.createdAt && (
                        <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", marginTop:3 }}>
                            <Calendar size={10}/>
                            Joined {new Date(user.createdAt).toLocaleDateString('en-IN',{year:'numeric',month:'short'})}
                        </div>
                    )}
                </div>

                {/* Solve rate circle */}
                {totalProblems > 0 && (
                    <CircleProgress value={solveRate} max={100} size={56} color={`hsl(${hue},70%,60%)`} strokeWidth={4}>
                        <span style={{ fontSize:10, fontWeight:800, color:`hsl(${hue},70%,60%)`, fontFamily:"'JetBrains Mono',monospace" }}>
                            {solveRate}%
                        </span>
                    </CircleProgress>
                )}
            </div>

            {/* Stats row */}
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                <StatPill icon={CheckCircle2} label="Solved"  value={user?.problemsSolved || 0} color='#22c55e' delay={delay+.1}/>
                <StatPill icon={Trophy}       label="Score"   value={user?.totalScore     || 0} color='#fbbf24' delay={delay+.15}/>
                <StatPill icon={Flame}        label="Streak"  value={`${user?.streak||0}d`}     color='#f97316' delay={delay+.2}/>
                <StatPill icon={Code2}        label="Submits" value={user?.totalSubmissions||0}  color='#60a5fa' delay={delay+.25}/>
            </div>

            {/* Difficulty breakdown */}
            {(user?.easySolved || user?.mediumSolved || user?.hardSolved) && (
                <div style={{ display:'flex', gap:8 }}>
                    {[
                        { label:'Easy',   value:user.easySolved,   color:'#22c55e' },
                        { label:'Medium', value:user.mediumSolved, color:'#f59e0b' },
                        { label:'Hard',   value:user.hardSolved,   color:'#ef4444' },
                    ].map(d => (
                        <div key={d.label} style={{ flex:1, padding:'8px 10px', borderRadius:8, background:`${d.color}08`, border:`1px solid ${d.color}18`, textAlign:'center' }}>
                            <div style={{ fontSize:14, fontWeight:800, color:d.color, fontFamily:"'JetBrains Mono',monospace" }}>{d.value || 0}</div>
                            <div style={{ fontSize:9, color:`${d.color}80`, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.06em', textTransform:'uppercase' }}>{d.label}</div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    )
}

export default UserCard