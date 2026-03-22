// src/components/submission/StatusBadge.jsx
import { motion } from 'framer-motion'
import { SUBMISSION_STATUS } from '../../config/constants.js'

const configs = {
    [SUBMISSION_STATUS.ACCEPTED]:            { color:'#22c55e', bg:'rgba(34,197,94,.1)',    border:'rgba(34,197,94,.22)',    label:'✓ Accepted'            },
    [SUBMISSION_STATUS.WRONG_ANSWER]:        { color:'#ef4444', bg:'rgba(239,68,68,.1)',    border:'rgba(239,68,68,.22)',    label:'✗ Wrong Answer'        },
    [SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED]: { color:'#f59e0b', bg:'rgba(245,158,11,.1)',  border:'rgba(245,158,11,.22)',  label:'⏱ Time Limit Exceeded' },
    [SUBMISSION_STATUS.COMPILATION_ERROR]:   { color:'#f87171', bg:'rgba(248,113,113,.1)', border:'rgba(248,113,113,.22)', label:'⚠ Compilation Error'   },
    [SUBMISSION_STATUS.RUNTIME_ERROR]:       { color:'#f87171', bg:'rgba(248,113,113,.1)', border:'rgba(248,113,113,.22)', label:'⚠ Runtime Error'       },
    [SUBMISSION_STATUS.PENDING]:             { color:'#60a5fa', bg:'rgba(96,165,250,.1)',  border:'rgba(96,165,250,.22)',  label:'… Pending'             },
    [SUBMISSION_STATUS.PROCESSING]:          { color:'#a78bfa', bg:'rgba(167,139,250,.1)', border:'rgba(167,139,250,.22)', label:'⚙ Processing'          },
    [SUBMISSION_STATUS.IN_QUEUE]:            { color:'#60a5fa', bg:'rgba(96,165,250,.1)',  border:'rgba(96,165,250,.22)',  label:'⏳ In Queue'            },
}

const isAnimated = (status) => [
    SUBMISSION_STATUS.PENDING,
    SUBMISSION_STATUS.PROCESSING,
    SUBMISSION_STATUS.IN_QUEUE,
].includes(status)

const StatusBadge = ({ status, size = 'sm' }) => {
    const cfg  = configs[status] || { color:'#94a3b8', bg:'rgba(148,163,184,.1)', border:'rgba(148,163,184,.2)', label: status }
    const pad  = size === 'lg' ? '5px 14px' : size === 'md' ? '4px 11px' : '3px 9px'
    const font = size === 'lg' ? 13 : size === 'md' ? 12 : 11
    const animate = isAnimated(status)

    return (
        <motion.span
            initial={{ opacity:0, scale:.9 }}
            animate={{ opacity:1, scale:1  }}
            style={{ display:'inline-flex', alignItems:'center', gap:5, padding:pad, fontSize:font, fontWeight:700, borderRadius:20, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, fontFamily:"'JetBrains Mono',monospace", whiteSpace:'nowrap', userSelect:'none' }}
        >
            {animate && (
                <motion.span
                    animate={{ scale:[1,.6,1], opacity:[1,.4,1] }}
                    transition={{ duration:1.2, repeat:Infinity }}
                    style={{ width:5, height:5, borderRadius:'50%', background:cfg.color, flexShrink:0 }}
                />
            )}
            {cfg.label}
        </motion.span>
    )
}

export default StatusBadge