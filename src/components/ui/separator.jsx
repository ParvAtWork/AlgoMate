// src/components/ui/separator.jsx
import { motion } from 'framer-motion'

const Separator = ({
                     orientation = 'horizontal',
                     label,
                     color       = 'rgba(226,232,240,.08)',
                     animate     = false,
                     style: extra = {},
                   }) => {
  if (orientation === 'vertical') return (
      <div style={{ width:1, alignSelf:'stretch', background:color, ...extra }}/>
  )

  if (label) return (
      <div style={{ display:'flex', alignItems:'center', gap:12, ...extra }}>
        <div style={{ flex:1, height:1, background:color }}/>
        <span style={{ fontSize:11, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", whiteSpace:'nowrap' }}>
                {label}
            </span>
        <div style={{ flex:1, height:1, background:color }}/>
      </div>
  )

  if (animate) return (
      <motion.div
          initial={{ scaleX:0 }} animate={{ scaleX:1 }}
          transition={{ duration:.5, ease:'easeOut' }}
          style={{ height:1, background:`linear-gradient(90deg,transparent,${color},transparent)`, ...extra }}
      />
  )

  return <div style={{ height:1, background:color, ...extra }}/>
}

export default Separator