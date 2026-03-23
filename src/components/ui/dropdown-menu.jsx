// src/components/ui/dropdown-menu.jsx
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight } from 'lucide-react'

const DropdownMenu = ({
                        trigger,
                        items = [],
                        align = 'left',
                        width = 200,
                      }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
      <div ref={ref} style={{ position:'relative', display:'inline-block' }}>
        <div onClick={() => setOpen(o => !o)}>{trigger}</div>

        <AnimatePresence>
          {open && (
              <motion.div
                  initial={{ opacity:0, scale:.95, y:-6 }}
                  animate={{ opacity:1, scale:1,   y:0  }}
                  exit={{ opacity:0,   scale:.95, y:-4  }}
                  transition={{ duration:.18, ease:[.22,1,.36,1] }}
                  style={{
                    position:'absolute', zIndex:300,
                    top:'calc(100% + 6px)',
                    [align === 'right' ? 'right' : 'left']: 0,
                    width, background:'#0d1117',
                    border:'1px solid rgba(226,232,240,.12)',
                    borderRadius:11, overflow:'hidden',
                    boxShadow:'0 8px 32px rgba(0,0,0,.4)',
                  }}
              >
                {items.map((item, i) => {
                  if (item.type === 'separator') return (
                      <div key={i} style={{ height:1, background:'rgba(226,232,240,.07)', margin:'4px 0' }}/>
                  )
                  if (item.type === 'label') return (
                      <div key={i} style={{ padding:'6px 12px 3px', fontSize:10, fontWeight:700, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase' }}>
                        {item.label}
                      </div>
                  )
                  return (
                      <motion.div
                          key={i}
                          whileHover={{ background:'rgba(226,232,240,.06)' }}
                          onClick={() => { item.onClick?.(); setOpen(false) }}
                          style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 12px', cursor: item.disabled ? 'not-allowed' : 'pointer', opacity: item.disabled ? .45 : 1, color: item.danger ? '#f87171' : '#e2e8f0', fontSize:13, fontFamily:"'Space Grotesk',sans-serif" }}
                      >
                        {item.icon && <span style={{ color: item.danger ? '#f87171' : 'rgba(148,163,184,.6)', display:'flex' }}>{item.icon}</span>}
                        <span style={{ flex:1 }}>{item.label}</span>
                        {item.checked && <Check size={12} style={{ color:'#22c55e' }}/>}
                        {item.shortcut && <span style={{ fontSize:10, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace" }}>{item.shortcut}</span>}
                        {item.children && <ChevronRight size={12} style={{ color:'rgba(148,163,184,.4)' }}/>}
                      </motion.div>
                  )
                })}
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  )
}

export default DropdownMenu
// Named exports for Navbar compatibility
export const DropdownMenuTrigger = ({ children, asChild }) => <>{children}</>

export const DropdownMenuContent = ({ children, align = 'end', style }) => (
    <div style={{
        position:'absolute', zIndex:300,
        top:'calc(100% + 6px)',
        [align === 'end' ? 'right' : 'left']: 0,
        background:'#0d1117',
        border:'1px solid rgba(226,232,240,.09)',
        borderRadius:10, overflow:'hidden',
        boxShadow:'0 8px 32px rgba(0,0,0,.4)',
        ...style
    }}>
        {children}
    </div>
)

export const DropdownMenuItem = ({ children, onClick, style }) => (
    <div
        onClick={onClick}
        style={{
            display:'flex', alignItems:'center', gap:8,
            padding:'9px 13px', cursor:'pointer',
            fontSize:13, color:'rgba(203,213,225,.8)',
            fontFamily:"'Space Grotesk',sans-serif",
            transition:'background .15s',
            ...style
        }}
        onMouseEnter={e => e.currentTarget.style.background='rgba(226,232,240,.06)'}
        onMouseLeave={e => e.currentTarget.style.background='transparent'}
    >
        {children}
    </div>
)

export const DropdownMenuSeparator = ({ style }) => (
    <div style={{ height:1, background:'rgba(226,232,240,.07)', margin:'4px 0', ...style }}/>
)

export { DropdownMenu }