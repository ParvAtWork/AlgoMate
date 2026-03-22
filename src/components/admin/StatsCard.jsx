// src/components/admin/StatsCard.jsx
import { motion } from 'framer-motion'
import CountUp from 'react-countup'

const StatsCard = ({
                       label,
                       value,
                       icon: Icon,
                       color = '#60a5fa',
                       sub,
                       delay = 0,
                       prefix = '',
                       suffix = '',
                       trend,        // { value: 12, positive: true }
                       onClick,
                   }) => {
    const isNumber = typeof value === 'number'

    return (
        <motion.div
            initial={{ opacity:0, y:24, scale:.96 }}
            animate={{ opacity:1, y:0,  scale:1   }}
            transition={{ delay, duration:.45, ease:[.22,1,.36,1] }}
            whileHover={{ y:-4, scale:1.02, transition:{ duration:.2 } }}
            onClick={onClick}
            style={{
                position:'relative', overflow:'hidden', flex:1, minWidth:140,
                padding:'20px 22px', borderRadius:14,
                background:'rgba(226,232,240,.03)',
                border:`1px solid rgba(226,232,240,.08)`,
                cursor: onClick ? 'pointer' : 'default',
                transition:'border-color .2s, box-shadow .2s',
            }}
            onHoverStart={e => {
                e.target.style.borderColor = `${color}30`
                e.target.style.boxShadow   = `0 8px 32px ${color}10`
            }}
            onHoverEnd={e => {
                e.target.style.borderColor = 'rgba(226,232,240,.08)'
                e.target.style.boxShadow   = 'none'
            }}
        >
            {/* Top gradient line */}
            <div style={{
                position:'absolute', top:0, left:0, right:0, height:2,
                background:`linear-gradient(90deg,transparent,${color}80,transparent)`,
            }} />

            {/* Glow blob */}
            <div style={{
                position:'absolute', top:-30, right:-20, width:100, height:100,
                borderRadius:'50%', background:`${color}08`,
                filter:'blur(20px)', pointerEvents:'none',
            }} />

            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <span style={{
                    fontSize:10, fontFamily:"'JetBrains Mono',monospace",
                    color:'rgba(148,163,184,.5)', letterSpacing:'.1em',
                    textTransform:'uppercase', fontWeight:700,
                }}>
                    {label}
                </span>
                {Icon && (
                    <motion.div
                        whileHover={{ rotate:10, scale:1.15 }}
                        style={{
                            width:34, height:34, borderRadius:9,
                            background:`${color}15`,
                            border:`1px solid ${color}30`,
                            display:'flex', alignItems:'center', justifyContent:'center',
                        }}
                    >
                        <Icon size={16} style={{ color }} />
                    </motion.div>
                )}
            </div>

            {/* Value */}
            <div style={{
                fontSize:30, fontWeight:800, color,
                letterSpacing:'-.03em', marginBottom:4,
                fontFamily:"'Space Grotesk',sans-serif",
            }}>
                {prefix}
                {isNumber
                    ? <CountUp end={value} duration={1.5} delay={delay} separator="," />
                    : value ?? '--'
                }
                {suffix}
            </div>

            {/* Sub + Trend */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                {sub && (
                    <span style={{
                        fontSize:11, color:'rgba(148,163,184,.4)',
                        fontFamily:"'JetBrains Mono',monospace",
                    }}>
                        {sub}
                    </span>
                )}
                {trend && (
                    <motion.span
                        initial={{ opacity:0, x:6 }}
                        animate={{ opacity:1, x:0 }}
                        transition={{ delay: delay + .4 }}
                        style={{
                            fontSize:10, fontWeight:700,
                            fontFamily:"'JetBrains Mono',monospace",
                            color: trend.positive ? '#22c55e' : '#ef4444',
                            background: trend.positive ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)',
                            padding:'2px 7px', borderRadius:6,
                        }}
                    >
                        {trend.positive ? '↑' : '↓'} {trend.value}%
                    </motion.span>
                )}
            </div>
        </motion.div>
    )
}

export default StatsCard