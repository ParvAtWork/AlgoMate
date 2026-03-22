// src/components/ui/card.jsx
import { motion } from 'framer-motion'

const Card = ({
                children,
                hover    = false,
                glow     = false,
                glowColor = '#60a5fa',
                padding  = '20px 22px',
                onClick,
                delay    = 0,
                animate  = true,
                style: extraStyle = {},
              }) => {
  const base = {
    background: 'rgba(226,232,240,.03)',
    border:     '1px solid rgba(226,232,240,.08)',
    borderRadius: 14,
    padding,
    position: 'relative',
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    ...extraStyle,
  }

  const content = (
      <>
        {glow && (
            <div style={{
              position:'absolute', top:-40, right:-20, width:120, height:120,
              borderRadius:'50%', background:`${glowColor}08`,
              filter:'blur(24px)', pointerEvents:'none',
            }}/>
        )}
        {children}
      </>
  )

  if (!animate) return <div style={base} onClick={onClick}>{content}</div>

  return (
      <motion.div
          initial={{ opacity:0, y:16 }}
          animate={{ opacity:1, y:0  }}
          transition={{ delay, duration:.4, ease:[.22,1,.36,1] }}
          whileHover={hover || onClick ? { y:-3, borderColor:`${glowColor}25`, boxShadow:`0 8px 28px ${glowColor}0d`, transition:{duration:.2} } : {}}
          whileTap={onClick ? { scale:.99 } : {}}
          onClick={onClick}
          style={base}
      >
        {content}
      </motion.div>
  )
}

export const CardHeader = ({ title, subtitle, action, icon: Icon, color = '#60a5fa' }) => (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {Icon && (
            <div style={{ width:36, height:36, borderRadius:9, background:`${color}15`, border:`1px solid ${color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon size={16} style={{ color }}/>
            </div>
        )}
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0' }}>{title}</div>
          {subtitle && <div style={{ fontSize:11, color:'rgba(148,163,184,.5)', fontFamily:"'JetBrains Mono',monospace", marginTop:2 }}>{subtitle}</div>}
        </div>
      </div>
      {action}
    </div>
)

export default Card