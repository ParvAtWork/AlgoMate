// src/components/leaderboard/PeriodSelector.jsx
import { motion } from 'framer-motion'

const periods = [
    { key:'AllTime', label:'All Time', emoji:'🏆' },
    { key:'Weekly',  label:'This Week', emoji:'📅' },
    { key:'Monthly', label:'This Month', emoji:'🗓' },
]

const PeriodSelector = ({ value, onChange }) => (
    <div style={{ display:'flex', gap:6, padding:5, background:'rgba(226,232,240,.04)', borderRadius:12, border:'1px solid rgba(226,232,240,.08)', width:'fit-content' }}>
        {periods.map(p => {
            const isActive = value === p.key
            return (
                <motion.button
                    key={p.key}
                    onClick={() => onChange(p.key)}
                    whileHover={!isActive ? { background:'rgba(226,232,240,.06)' } : {}}
                    whileTap={{ scale:.97 }}
                    style={{
                        padding:'7px 16px', borderRadius:8, fontSize:13, fontWeight:600,
                        fontFamily:"'Space Grotesk',sans-serif", cursor:'pointer', border:'none',
                        display:'flex', alignItems:'center', gap:6, position:'relative',
                        background:'transparent', color: isActive ? '#fff' : 'rgba(148,163,184,.6)',
                        transition:'color .2s',
                    }}
                >
                    {isActive && (
                        <motion.div
                            layoutId="period-bg"
                            style={{ position:'absolute', inset:0, borderRadius:8, background:'linear-gradient(135deg,#60a5fa,#818cf8)' }}
                            transition={{ type:'spring', stiffness:400, damping:30 }}
                        />
                    )}
                    <span style={{ position:'relative', zIndex:1 }}>{p.emoji}</span>
                    <span style={{ position:'relative', zIndex:1 }}>{p.label}</span>
                </motion.button>
            )
        })}
    </div>
)

export default PeriodSelector