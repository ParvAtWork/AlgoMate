// src/components/ui/input.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

const Input = ({
                 label,
                 placeholder,
                 value,
                 onChange,
                 type       = 'text',
                 icon,
                 error,
                 success,
                 hint,
                 disabled   = false,
                 required   = false,
                 mono       = false,
                 size       = 'md',
               }) => {
  const [focused,    setFocused]    = useState(false)
  const [showPass,   setShowPass]   = useState(false)
  const isPassword = type === 'password'
  const inputType  = isPassword ? (showPass ? 'text' : 'password') : type

  const padding = size === 'lg' ? '11px 14px' : size === 'sm' ? '6px 10px' : '9px 12px'
  const fontSize = size === 'lg' ? 14 : size === 'sm' ? 12 : 13

  const borderColor = error ? 'rgba(239,68,68,.4)' : success ? 'rgba(34,197,94,.4)' : focused ? 'rgba(96,165,250,.4)' : 'rgba(226,232,240,.1)'
  const bgColor     = error ? 'rgba(239,68,68,.04)' : success ? 'rgba(34,197,94,.04)' : focused ? 'rgba(96,165,250,.04)' : 'rgba(226,232,240,.05)'

  return (
      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        {label && (
            <label style={{ fontSize:10, fontWeight:700, color:'rgba(148,163,184,.5)', letterSpacing:'.08em', textTransform:'uppercase', fontFamily:"'JetBrains Mono',monospace", display:'flex', gap:4 }}>
              {label} {required && <span style={{color:'#f87171'}}>*</span>}
            </label>
        )}

        <div style={{ position:'relative' }}>
          {icon && (
              <div style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'rgba(148,163,184,.45)', display:'flex', pointerEvents:'none' }}>
                {icon}
              </div>
          )}

          <input
              type={inputType}
              value={value}
              onChange={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              style={{
                width:'100%', padding, fontSize, boxSizing:'border-box',
                paddingLeft:  icon ? 36 : undefined,
                paddingRight: (isPassword || error || success) ? 36 : undefined,
                borderRadius: 8, background: bgColor,
                border:`1px solid ${borderColor}`,
                color:'#e2e8f0', outline:'none',
                fontFamily: mono ? "'JetBrains Mono',monospace" : "'Space Grotesk',sans-serif",
                transition:'border-color .2s, background .2s, box-shadow .2s',
                boxShadow: focused ? `0 0 0 3px ${error ? 'rgba(239,68,68,.08)' : 'rgba(96,165,250,.08)'}` : 'none',
                cursor: disabled ? 'not-allowed' : 'text',
                opacity: disabled ? .5 : 1,
              }}
          />

          {/* Right icon */}
          <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', display:'flex', alignItems:'center', gap:4 }}>
            {error   && !isPassword && <AlertCircle  size={14} style={{color:'#f87171'}}/>}
            {success && !isPassword && <CheckCircle2 size={14} style={{color:'#22c55e'}}/>}
            {isPassword && (
                <motion.button
                    whileHover={{ scale:1.1 }}
                    whileTap={{ scale:.9 }}
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{ background:'none', border:'none', color:'rgba(148,163,184,.5)', cursor:'pointer', display:'flex' }}
                >
                  {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                </motion.button>
            )}
          </div>
        </div>

        {(error || hint) && (
            <motion.div
                initial={{ opacity:0, y:-4 }}
                animate={{ opacity:1, y:0 }}
                style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", color: error ? '#f87171' : 'rgba(148,163,184,.4)', display:'flex', alignItems:'center', gap:4 }}
            >
              {error && <AlertCircle size={10}/>}
              {error || hint}
            </motion.div>
        )}
      </div>
  )
}

export default Input