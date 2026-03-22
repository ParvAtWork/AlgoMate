// src/components/problem/DifficultyBadge.jsx
import { motion } from 'framer-motion'

const configs = {
    Easy:   { color:'#22c55e', bg:'rgba(34,197,94,.1)',   border:'rgba(34,197,94,.22)'   },
    Medium: { color:'#f59e0b', bg:'rgba(245,158,11,.1)', border:'rgba(245,158,11,.22)' },
    Hard:   { color:'#ef4444', bg:'rgba(239,68,68,.1)',   border:'rgba(239,68,68,.22)'   },
}

const DifficultyBadge = ({ difficulty, size = 'sm', pulse = false }) => {
    const cfg  = configs[difficulty] || configs.Easy
    const pad  = size === 'lg' ? '4px 14px' : size === 'md' ? '3px 10px' : '2px 9px'
    const font = size === 'lg' ? 13 : size === 'md' ? 12 : 11

    return (
        <motion.span
            whileHover={{ scale:1.06 }}
            style={{
                display:'inline-flex', alignItems:'center', gap:5,
                padding:pad, fontSize:font, fontWeight:700, borderRadius:20,
                background:cfg.bg, color:cfg.color,
                border:`1px solid ${cfg.border}`,
                fontFamily:"'JetBrains Mono',monospace",
                userSelect:'none', whiteSpace:'nowrap',
            }}
        >
            {pulse && (
                <motion.span
                    animate={{ scale:[1,.7,1], opacity:[1,.5,1] }}
                    transition={{ duration:1.5, repeat:Infinity }}
                    style={{ width:5, height:5, borderRadius:'50%', background:cfg.color, flexShrink:0 }}
                />
            )}
            {difficulty}
        </motion.span>
    )
}

export default DifficultyBadge