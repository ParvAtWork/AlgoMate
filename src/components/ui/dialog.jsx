// src/components/ui/dialog.jsx
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const Dialog = ({
                  open,
                  onClose,
                  title,
                  subtitle,
                  children,
                  maxWidth = 520,
                  showClose = true,
                }) => (
    <AnimatePresence>
      {open && (
          <motion.div
              initial={{ opacity:0 }}
              animate={{ opacity:1 }}
              exit={{ opacity:0 }}
              transition={{ duration:.2 }}
              onClick={e => e.target === e.currentTarget && onClose?.()}
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.72)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(5px)' }}
          >
            <motion.div
                initial={{ opacity:0, scale:.94, y:16 }}
                animate={{ opacity:1, scale:1,   y:0  }}
                exit={{ opacity:0,   scale:.94, y:10  }}
                transition={{ duration:.28, ease:[.22,1,.36,1] }}
                style={{ background:'#0d1117', border:'1px solid rgba(226,232,240,.12)', borderRadius:16, width:'100%', maxWidth, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column' }}
            >
              {/* Header */}
              {(title || showClose) && (
                  <div style={{ padding:'18px 22px', borderBottom:'1px solid rgba(226,232,240,.08)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                    <div>
                      {title    && <div style={{ fontSize:16, fontWeight:800, color:'#e2e8f0' }}>{title}</div>}
                      {subtitle && <div style={{ fontSize:11, color:'rgba(148,163,184,.45)', fontFamily:"'JetBrains Mono',monospace", marginTop:2 }}>{subtitle}</div>}
                    </div>
                    {showClose && (
                        <motion.button
                            whileHover={{ rotate:90, scale:1.1 }}
                            whileTap={{ scale:.9 }}
                            onClick={onClose}
                            style={{ background:'rgba(226,232,240,.06)', border:'1px solid rgba(226,232,240,.1)', borderRadius:8, color:'rgba(148,163,184,.6)', cursor:'pointer', display:'flex', padding:6 }}
                        >
                          <X size={15}/>
                        </motion.button>
                    )}
                  </div>
              )}

              {/* Body */}
              <div style={{ overflowY:'auto', flex:1 }}>
                {children}
              </div>
            </motion.div>
          </motion.div>
      )}
    </AnimatePresence>
)

export const DialogBody    = ({ children, style = {} }) => <div style={{ padding:'20px 22px', ...style }}>{children}</div>
export const DialogFooter  = ({ children }) => (
    <div style={{ padding:'14px 22px', borderTop:'1px solid rgba(226,232,240,.07)', display:'flex', gap:8, justifyContent:'flex-end', flexShrink:0 }}>
      {children}
    </div>
)

export default Dialog