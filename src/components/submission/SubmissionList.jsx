// src/components/submission/SubmissionList.jsx
import { motion, AnimatePresence } from 'framer-motion'
import SubmissionCard from './SubmissionCard.jsx'
import { SkeletonCard } from '../ui/skeleton.jsx'
import { useNavigate } from 'react-router-dom'

const SubmissionList = ({ submissions = [], loading = false, emptyMessage = 'No submissions yet' }) => {
    const navigate = useNavigate()

    if (loading) return (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {Array(5).fill(0).map((_,i) => <SkeletonCard key={i} rows={2}/>)}
        </div>
    )

    if (!submissions.length) return (
        <motion.div
            initial={{ opacity:0, y:10 }}
            animate={{ opacity:1, y:0 }}
            style={{ padding:'48px 20px', textAlign:'center', border:'1px solid rgba(226,232,240,.07)', borderRadius:12, background:'rgba(226,232,240,.02)' }}
        >
            <div style={{ fontSize:36, marginBottom:12 }}>📋</div>
            <div style={{ fontSize:14, fontWeight:600, color:'rgba(226,232,240,.6)', marginBottom:8 }}>
                {emptyMessage}
            </div>
            <div style={{ fontSize:12, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", marginBottom:20 }}>
                Start solving problems to see your history here
            </div>
            <motion.button
                whileHover={{ scale:1.04 }}
                whileTap={{ scale:.97 }}
                onClick={() => navigate('/problems')}
                style={{ padding:'8px 20px', borderRadius:9, background:'rgba(96,165,250,.1)', border:'1px solid rgba(96,165,250,.22)', color:'#60a5fa', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}
            >
                Browse Problems →
            </motion.button>
        </motion.div>
    )

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <AnimatePresence>
                {submissions.map((s, i) => (
                    <SubmissionCard key={s.id || i} submission={s} index={i}/>
                ))}
            </AnimatePresence>
        </div>
    )
}

export default SubmissionList