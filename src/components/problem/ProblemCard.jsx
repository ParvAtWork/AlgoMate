// src/components/problem/ProblemCard.jsx
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DifficultyBadge from './DifficultyBadge.jsx'
import { CheckCircle2, Users, Trophy } from 'lucide-react'

const ProblemCard = ({ problem, index = 0, solved = false }) => {
    const navigate = useNavigate()
    const acRate   = problem.totalSubmissions > 0
        ? Math.round((problem.acceptedSubmissions / problem.totalSubmissions) * 100)
        : 0

    const acColor = acRate >= 60 ? '#22c55e' : acRate >= 40 ? '#f59e0b' : '#ef4444'

    return (
        <motion.div
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0  }}
            transition={{ delay:index*.05, duration:.35, ease:[.22,1,.36,1] }}
            whileHover={{ y:-4, borderColor:'rgba(96,165,250,.2)', boxShadow:'0 8px 28px rgba(96,165,250,.08)', transition:{duration:.2} }}
            onClick={() => navigate(`/problems/${problem.id}`)}
            style={{
                padding:'18px 20px', borderRadius:13,
                background:'rgba(226,232,240,.03)',
                border:'1px solid rgba(226,232,240,.08)',
                cursor:'pointer', position:'relative', overflow:'hidden',
            }}
        >
            {/* Top accent */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2,
                background: solved ? 'linear-gradient(90deg,transparent,rgba(34,197,94,.5),transparent)' : 'linear-gradient(90deg,transparent,rgba(96,165,250,.3),transparent)' }}/>

            {/* Header */}
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
                    {solved && <CheckCircle2 size={14} style={{ color:'#22c55e', flexShrink:0 }}/>}
                    <span style={{ fontSize:11, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>
                        #{String(problem.id).padStart(3,'0')}
                    </span>
                    <span style={{ fontSize:14, fontWeight:700, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {problem.title}
                    </span>
                </div>
                <DifficultyBadge difficulty={problem.difficulty}/>
            </div>

            {/* Topic */}
            <div style={{ marginBottom:12 }}>
                <span style={{ fontSize:11, padding:'2px 8px', borderRadius:6, background:'rgba(226,232,240,.05)', border:'1px solid rgba(226,232,240,.08)', color:'rgba(148,163,184,.55)', fontFamily:"'JetBrains Mono',monospace" }}>
                    {problem.topic}
                </span>
            </div>

            {/* Stats */}
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <Users size={11} style={{ color:'rgba(148,163,184,.4)' }}/>
                    <span style={{ fontSize:11, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace" }}>
                        {problem.totalSubmissions?.toLocaleString() || 0}
                    </span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <Trophy size={11} style={{ color:acColor }}/>
                    <span style={{ fontSize:11, color:acColor, fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>
                        {acRate}%
                    </span>
                </div>
                <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:5 }}>
                    <span style={{ fontSize:11, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace" }}>
                        +{problem.maxScore} pts
                    </span>
                </div>
            </div>

            {/* AC bar */}
            <div style={{ marginTop:10, height:3, borderRadius:2, background:'rgba(226,232,240,.06)', overflow:'hidden' }}>
                <motion.div
                    initial={{ width:0 }}
                    animate={{ width:`${acRate}%` }}
                    transition={{ delay:index*.05+.3, duration:.6, ease:'easeOut' }}
                    style={{ height:'100%', background:acColor, borderRadius:2 }}
                />
            </div>
        </motion.div>
    )
}

export default ProblemCard