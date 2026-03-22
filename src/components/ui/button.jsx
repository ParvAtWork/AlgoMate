// src/components/ui/button.jsx
import { motion } from 'framer-motion'
import { Spinner } from '../common/Loader.jsx'

const variants = {
  primary:  { bg:'linear-gradient(135deg,#60a5fa,#818cf8)', color:'#fff', border:'none',                           shadow:'rgba(96,165,250,.35)'   },
  success:  { bg:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', border:'none',                           shadow:'rgba(34,197,94,.35)'    },
  danger:   { bg:'rgba(239,68,68,.1)',                      color:'#f87171', border:'1px solid rgba(239,68,68,.2)', shadow:'rgba(239,68,68,.2)'     },
  ghost:    { bg:'rgba(226,232,240,.05)',                    color:'rgba(226,232,240,.7)', border:'1px solid rgba(226,232,240,.1)', shadow:'transparent' },
  outline:  { bg:'transparent',                             color:'#60a5fa', border:'1px solid rgba(96,165,250,.3)', shadow:'rgba(96,165,250,.2)'   },
}

const sizes = {
  sm: { padding:'5px 14px',  fontSize:12, borderRadius:8  },
  md: { padding:'8px 20px',  fontSize:13, borderRadius:10 },
  lg: { padding:'11px 26px', fontSize:14, borderRadius:11 },
}

const Button = ({
                  children,
                  variant  = 'primary',
                  size     = 'md',
                  loading  = false,
                  disabled = false,
                  icon,
                  iconRight,
                  fullWidth = false,
                  onClick,
                  type = 'button',
                }) => {
  const v = variants[variant] || variants.primary
  const s = sizes[size]       || sizes.md
  const isDisabled = disabled || loading

  return (
      <motion.button
          type={type}
          onClick={onClick}
          disabled={isDisabled}
          whileHover={!isDisabled ? { scale:1.03, boxShadow:`0 6px 20px ${v.shadow}` } : {}}
          whileTap={!isDisabled ? { scale:.97 } : {}}
          style={{
            display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7,
            ...s,
            background: v.bg,
            color:      v.color,
            border:     v.border,
            fontWeight: 700,
            fontFamily: "'Space Grotesk',sans-serif",
            cursor:     isDisabled ? 'not-allowed' : 'pointer',
            opacity:    isDisabled ? .55 : 1,
            width:      fullWidth ? '100%' : 'auto',
            transition: 'opacity .2s',
            outline:    'none',
          }}
      >
        {loading ? <Spinner size={13} color={variant==='ghost'?'#60a5fa':'#fff'}/> : icon}
        {children}
        {!loading && iconRight}
      </motion.button>
  )
}

export default Button