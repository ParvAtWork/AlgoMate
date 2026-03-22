// src/components/common/ErrorMessage.jsx
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, WifiOff, ServerCrash } from 'lucide-react'

const errorTypes = {
    network: {
        icon: WifiOff,
        color: '#f59e0b',
        bg: 'rgba(245,158,11,.07)',
        border: 'rgba(245,158,11,.18)',
        title: 'Network Error',
    },
    server: {
        icon: ServerCrash,
        color: '#f87171',
        bg: 'rgba(239,68,68,.07)',
        border: 'rgba(239,68,68,.18)',
        title: 'Server Error',
    },
    default: {
        icon: AlertTriangle,
        color: '#f87171',
        bg: 'rgba(239,68,68,.07)',
        border: 'rgba(239,68,68,.18)',
        title: 'Something went wrong',
    },
}

const ErrorMessage = ({
                          message    = 'An unexpected error occurred.',
                          type       = 'default',
                          onRetry,
                          retryLabel = 'Try Again',
                          compact    = false,
                      }) => {
    const cfg  = errorTypes[type] || errorTypes.default
    const Icon = cfg.icon

    if (compact) return (
        <motion.div
            initial={{ opacity:0, y:4 }}
            animate={{ opacity:1, y:0 }}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:8,
                background:cfg.bg, border:`1px solid ${cfg.border}`,
                fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:cfg.color }}
        >
            <Icon size={13} style={{ flexShrink:0 }}/>
            <span>{message}</span>
            {onRetry && (
                <button onClick={onRetry}
                        style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:4, background:'none', border:'none', color:cfg.color, cursor:'pointer', fontSize:11, fontFamily:"'JetBrains Mono',monospace', opacity:.8" }}>
                    <RefreshCw size={11}/> Retry
                </button>
            )}
        </motion.div>
    )

    return (
        <motion.div
            initial={{ opacity:0, scale:.97, y:10 }}
            animate={{ opacity:1, scale:1,   y:0  }}
            transition={{ duration:.35, ease:[.22,1,.36,1] }}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16,
                padding:'32px 24px', borderRadius:14, textAlign:'center',
                background:cfg.bg, border:`1px solid ${cfg.border}` }}
        >
            <motion.div
                animate={{ rotate:[0,-8,8,-4,4,0] }}
                transition={{ delay:.3, duration:.6, ease:'easeInOut' }}
                style={{ width:52, height:52, borderRadius:14, background:`${cfg.color}15`,
                    border:`1px solid ${cfg.color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}
            >
                <Icon size={24} style={{ color:cfg.color }}/>
            </motion.div>

            <div>
                <div style={{ fontSize:15, fontWeight:700, color:'#e2e8f0', marginBottom:6 }}>
                    {cfg.title}
                </div>
                <div style={{ fontSize:12, color:'rgba(148,163,184,.6)', fontFamily:"'JetBrains Mono',monospace", lineHeight:1.6 }}>
                    {message}
                </div>
            </div>

            {onRetry && (
                <motion.button
                    whileHover={{ scale:1.04, y:-1 }}
                    whileTap={{ scale:.97 }}
                    onClick={onRetry}
                    style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 20px', borderRadius:9,
                        background:`${cfg.color}15`, border:`1px solid ${cfg.color}30`,
                        color:cfg.color, fontSize:13, fontWeight:600, cursor:'pointer',
                        fontFamily:"'Space Grotesk',sans-serif" }}
                >
                    <RefreshCw size={13}/> {retryLabel}
                </motion.button>
            )}
        </motion.div>
    )
}

export default ErrorMessage