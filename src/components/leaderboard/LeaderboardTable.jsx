// src/components/leaderboard/RankBadge.jsx
import { motion } from 'framer-motion'
import { Crown, Medal } from 'lucide-react'

const RankBadge = ({ rank, size = 'md', animate = true }) => {
    const configs = {
        1: { icon: Crown,  color:'#fbbf24', bg:'rgba(251,191,36,.12)', border:'rgba(251,191,36,.25)', glow:'rgba(251,191,36,.2)' },
        2: { icon: Medal,  color:'#94a3b8', bg:'rgba(148,163,184,.1)', border:'rgba(148,163,184,.2)', glow:'rgba(148,163,184,.1)' },
        3: { icon: Medal,  color:'#b45309', bg:'rgba(180,87,9,.1)',    border:'rgba(180,87,9,.2)',    glow:'rgba(180,87,9,.1)'   },
    }

    const sizes = {
        sm: { outer:28, icon:12, font:10 },
        md: { outer:36, icon:15, font:12 },
        lg: { outer:48, icon:20, font:15 },
    }

    const cfg = configs[rank]
    const s   = sizes[size] || sizes.md

    if (!cfg) return (
        <span style={{ fontSize:s.font+1, fontWeight:700, color:'rgba(148,163,184,.5)', fontFamily:"'JetBrains Mono',monospace" }}>
            #{rank}
        </span>
    )

    const Icon = cfg.icon

    return (
        <motion.div
            initial={animate ? { scale:0, rotate:-20 } : false}
            animate={animate ? { scale:1, rotate:0 } : false}
            transition={{ type:'spring', stiffness:400, damping:20 }}
            whileHover={{ scale:1.15, rotate:[-3,3,-2,0] }}
            style={{
                width:s.outer, height:s.outer, borderRadius:'50%',
                background:cfg.bg, border:`2px solid ${cfg.border}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:`0 0 12px ${cfg.glow}`,
                flexShrink:0,
            }}
        >
            <Icon size={s.icon} style={{ color:cfg.color }}/>
        </motion.div>
    )
}

export default RankBadge