// src/components/submission/SubmissionCard.jsx
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge.jsx'
import { PROGRAMMING_LANGUAGES, SUBMISSION_STATUS } from '../../config/constants.js'
import { Clock, Cpu, Trophy } from 'lucide-react'

const SubmissionCard = ({ submission: s, index = 0 }) => {
    const navigate = useNavigate()
    const lang     = PROGRAMMING_LANGUAGES.find(l => l.id === s.languageId)
    const isAC     = s.status === SUBMISSION_STATUS.ACCEPTED

    return (
        <motion.div
            initial={{ opacity:0, y:12 }}
            animate={{ opacity:1, y:0  }}
            transition={{ delay:index*.04, duration:.3, ease:[.22,1,.36,1] }}
            whileHover={{ y:-2, borderColor: isAC ? 'rgba(34,197,94,.2)' : 'rgba(226,232,240,.12)', transition:{duration:.15} }}
            onClick={() => navigate(`/problems/${s.problemId}`)}
            style={{
                padding:'14px 16px', borderRadius:11, cursor:'pointer',
                background: isAC ? 'rgba(34,197,94,.04)' : 'rgba(226,232,240,.03)',
                border:`1px solid ${isAC ? 'rgba(34,197,94,.12)' : 'rgba(226,232,240,.07)'}`,
                position:'relative', overflow:'hidden',
            }}
        >
            {isAC && <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,rgba(34,197,94,.4),transparent)' }}/>}

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
                    <span style={{ fontSize:11, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>#{s.id}</span>
                    <span style={{ fontSize:13.5, fontWeight:600, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        Problem #{s.problemId}
                    </span>
                </div>
                <StatusBadge status={s.status}/>
            </div>

            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                <span style={{ fontSize:11, color:'rgba(148,163,184,.5)', fontFamily:"'JetBrains Mono',monospace" }}>
                    {lang?.name?.split(' ')[0] || 'Unknown'}
                </span>
                {s.executionTimeMs > 0 && (
                    <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'rgba(148,163,184,.45)', fontFamily:"'JetBrains Mono',monospace" }}>
                        <Clock size={10}/> {Math.round(s.executionTimeMs)}ms
                    </span>
                )}
                {s.memoryUsedMb > 0 && (
                    <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'rgba(148,163,184,.45)', fontFamily:"'JetBrains Mono',monospace" }}>
                        <Cpu size={10}/> {s.memoryUsedMb?.toFixed(1)}MB
                    </span>
                )}
                {s.score > 0 && (
                    <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#fbbf24', fontFamily:"'JetBrains Mono',monospace" }}>
                        <Trophy size={10}/> +{s.score}pts
                    </span>
                )}
                <span style={{ marginLeft:'auto', fontSize:10, color:'rgba(148,163,184,.3)', fontFamily:"'JetBrains Mono',monospace" }}>
                    {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : ''}
                </span>
            </div>
        </motion.div>
    )
}

export default SubmissionCard