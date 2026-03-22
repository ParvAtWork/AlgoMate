// src/components/problem/ProblemList.jsx
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DifficultyBadge from './DifficultyBadge.jsx'
import { SkeletonTable } from '../ui/skeleton.jsx'
import { CheckCircle2, ChevronRight } from 'lucide-react'

const AccBar = ({ rate, color }) => (
    <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:80 }}>
        <div style={{ flex:1, height:4, borderRadius:2, background:'rgba(226,232,240,.06)', overflow:'hidden' }}>
            <motion.div
                initial={{ width:0 }}
                animate={{ width:`${rate}%` }}
                transition={{ duration:.6, ease:'easeOut' }}
                style={{ height:'100%', background:color, borderRadius:2 }}
            />
        </div>
        <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.45)', width:28, textAlign:'right' }}>
            {rate}%
        </span>
    </div>
)

const ProblemList = ({ problems = [], loading = false, solvedIds = [] }) => {
    const navigate = useNavigate()

    if (loading) return <SkeletonTable rows={8} cols={5}/>

    if (!problems.length) return (
        <div style={{ padding:'60px 20px', textAlign:'center', border:'1px solid rgba(226,232,240,.07)', borderRadius:12 }}>
            <div style={{ fontSize:36, marginBottom:12 }}>📋</div>
            <div style={{ fontSize:14, fontWeight:600, color:'rgba(226,232,240,.6)', marginBottom:6 }}>No problems found</div>
            <div style={{ fontSize:12, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace" }}>Try adjusting your filters</div>
        </div>
    )

    return (
        <div style={{ border:'1px solid rgba(226,232,240,.07)', borderRadius:12, overflow:'hidden' }}>
            {/* Header */}
            <div style={{ display:'grid', gridTemplateColumns:'52px 1fr 110px 120px 90px 36px', padding:'9px 16px', background:'rgba(226,232,240,.025)', borderBottom:'1px solid rgba(226,232,240,.07)', fontSize:10, fontWeight:700, color:'rgba(148,163,184,.4)', letterSpacing:'.07em', textTransform:'uppercase', fontFamily:"'JetBrains Mono',monospace" }}>
                <div>#</div>
                <div>Title</div>
                <div>Topic</div>
                <div>Difficulty</div>
                <div>Acceptance</div>
                <div/>
            </div>

            <AnimatePresence>
                {problems.map((p, i) => {
                    const solved  = solvedIds.includes(p.id)
                    const acRate  = p.totalSubmissions > 0 ? Math.round((p.acceptedSubmissions/p.totalSubmissions)*100) : 0
                    const acColor = acRate >= 60 ? '#22c55e' : acRate >= 40 ? '#f59e0b' : '#ef4444'

                    return (
                        <motion.div
                            key={p.id || i}
                            initial={{ opacity:0, x:-6 }}
                            animate={{ opacity:1, x:0  }}
                            exit={{ opacity:0 }}
                            transition={{ delay:i*.03 }}
                            whileHover={{ background:'rgba(226,232,240,.03)' }}
                            onClick={() => navigate(`/problems/${p.id}`)}
                            style={{ display:'grid', gridTemplateColumns:'52px 1fr 110px 120px 90px 36px', padding:'13px 16px', borderBottom:'1px solid rgba(226,232,240,.05)', alignItems:'center', cursor:'pointer', transition:'background .15s' }}
                        >
                            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                                {solved
                                    ? <CheckCircle2 size={14} style={{color:'#22c55e'}}/>
                                    : <span style={{ fontSize:11, color:'rgba(148,163,184,.3)', fontFamily:"'JetBrains Mono',monospace" }}>#{String(p.id).padStart(3,'0')}</span>
                                }
                            </div>
                            <div style={{ fontSize:13.5, fontWeight:600, color: solved ? 'rgba(34,197,94,.8)' : '#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {p.title}
                            </div>
                            <div style={{ fontSize:11.5, color:'rgba(148,163,184,.5)', fontFamily:"'JetBrains Mono',monospace", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {p.topic}
                            </div>
                            <div><DifficultyBadge difficulty={p.difficulty}/></div>
                            <div><AccBar rate={acRate} color={acColor}/></div>
                            <div style={{ display:'flex', justifyContent:'center' }}>
                                <ChevronRight size={14} style={{ color:'rgba(148,163,184,.25)' }}/>
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}

export default ProblemList