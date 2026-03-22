// src/components/ui/badge.jsx
import { motion } from 'framer-motion'

const variants = {
  default:  { color:'#60a5fa', bg:'rgba(96,165,250,.1)',   border:'rgba(96,165,250,.2)'   },
  success:  { color:'#22c55e', bg:'rgba(34,197,94,.1)',    border:'rgba(34,197,94,.2)'    },
  warning:  { color:'#f59e0b', bg:'rgba(245,158,11,.1)',   border:'rgba(245,158,11,.2)'   },
  danger:   { color:'#f87171', bg:'rgba(239,68,68,.1)',    border:'rgba(239,68,68,.2)'    },
  purple:   { color:'#a78bfa', bg:'rgba(167,139,250,.1)',  border:'rgba(167,139,250,.2)'  },
  gold:     { color:'#fbbf24', bg:'rgba(251,191,36,.1)',   border:'rgba(251,191,36,.2)'   },
  ghost:    { color:'rgba(148,163,184,.6)', bg:'rgba(226,232,240,.05)', border:'rgba(226,232,240,.1)' },
}

const diffVariant = { Easy:'success', Medium:'warning', Hard:'danger' }

const Badge = ({
                 children,
                 variant  = 'default',
                 size     = 'sm',
                 pulse    = false,
                 dot      = false,
                 onClick,
               }) => {
  const v = variants[variant] || variants.default
  const padding = size === 'lg' ? '4px 14px' : size === 'md' ? '3px 11px' : '2px 9px'
  const fontSize = size === 'lg' ? 13 : size === 'md' ? 12 : 11

  return (
      <motion.span
          whileHover={onClick ? { scale:1.06 } : {}}
          whileTap={onClick ? { scale:.95 } : {}}
          onClick={onClick}
          style={{
            display:'inline-flex', alignItems:'center', gap:5,
            padding, fontSize, fontWeight:700, borderRadius:20,
            background:v.bg, color:v.color, border:`1px solid ${v.border}`,
            fontFamily:"'JetBrains Mono',monospace",
            cursor: onClick ? 'pointer' : 'default',
            userSelect:'none', whiteSpace:'nowrap',
          }}
      >
        {dot && (
            <span style={{ width:6, height:6, borderRadius:'50%', background:v.color, flexShrink:0,
              ...(pulse ? { animation:'badgePulse 1.5s ease-in-out infinite' } : {})
            }}/>
        )}
        {children}
        <style>{`@keyframes badgePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }`}</style>
      </motion.span>
  )
}

export const DifficultyBadge = ({ difficulty }) => (
    <Badge variant={diffVariant[difficulty] || 'default'}>
      {difficulty}
    </Badge>
)

export const StatusBadge = ({ status }) => {
  const map = {
    'Accepted':            'success',
    'Wrong Answer':        'danger',
    'Time Limit Exceeded': 'warning',
    'Compilation Error':   'danger',
    'Runtime Error':       'danger',
    'Pending':             'default',
    'Processing':          'purple',
  }
  return <Badge variant={map[status] || 'ghost'} dot pulse={['Pending','Processing'].includes(status)}>{status}</Badge>
}

export default Badge