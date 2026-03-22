// src/components/ui/progress.jsx
import { motion } from 'framer-motion'

const Progress = ({
                      value      = 0,
                      max        = 100,
                      color      = '#60a5fa',
                      height     = 6,
                      label,
                      showValue  = false,
                      animated   = true,
                      delay      = 0,
                      rounded    = true,
                      striped    = false,
                  }) => {
    const percent = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {(label || showValue) && (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    {label    && <span style={{ fontSize:12, fontWeight:600, color:'rgba(226,232,240,.7)' }}>{label}</span>}
                    {showValue && <span style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.5)' }}>{Math.round(percent)}%</span>}
                </div>
            )}

            <div style={{ height, borderRadius: rounded ? height/2 : 2, background:'rgba(226,232,240,.07)', overflow:'hidden', position:'relative' }}>
                <motion.div
                    initial={{ width:0 }}
                    animate={{ width:`${percent}%` }}
                    transition={{ delay, duration:.7, ease:'easeOut' }}
                    style={{
                        height:'100%',
                        borderRadius: rounded ? height/2 : 2,
                        background: striped
                            ? `repeating-linear-gradient(45deg,${color},${color} 6px,${color}99 6px,${color}99 12px)`
                            : color,
                        position:'relative', overflow:'hidden',
                    }}
                >
                    {animated && (
                        <motion.div
                            animate={{ x:['-100%','200%'] }}
                            transition={{ duration:1.8, repeat:Infinity, ease:'linear', delay:delay+.5 }}
                            style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent)', width:'50%' }}
                        />
                    )}
                </motion.div>
            </div>
        </div>
    )
}

export const CircleProgress = ({ value = 0, max = 100, size = 60, color = '#60a5fa', strokeWidth = 5, children }) => {
    const r          = (size - strokeWidth * 2) / 2
    const circ       = 2 * Math.PI * r
    const percent    = Math.min(Math.max(value / max, 0), 1)
    const strokeDash = circ * percent

    return (
        <div style={{ position:'relative', width:size, height:size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:'rotate(-90deg)' }}>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(226,232,240,.07)" strokeWidth={strokeWidth}/>
                <motion.circle
                    cx={size/2} cy={size/2} r={r}
                    fill="none" stroke={color} strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    initial={{ strokeDasharray:`0 ${circ}` }}
                    animate={{ strokeDasharray:`${strokeDash} ${circ}` }}
                    transition={{ duration:.8, ease:'easeOut' }}
                />
            </svg>
            {children && (
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {children}
                </div>
            )}
        </div>
    )
}

export default Progress