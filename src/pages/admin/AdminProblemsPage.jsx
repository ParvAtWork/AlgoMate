// src/components/ui/tabs.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Tabs = ({
                  tabs      = [],
                  defaultTab,
                  onChange,
                  variant   = 'underline',  // underline | pill | card
                  size      = 'md',
              }) => {
    const [active, setActive] = useState(defaultTab || tabs[0]?.key)

    const handleChange = (key) => {
        setActive(key)
        onChange?.(key)
    }

    const padding = size === 'lg' ? '11px 22px' : size === 'sm' ? '6px 14px' : '9px 18px'
    const fontSize = size === 'lg' ? 14 : size === 'sm' ? 12 : 13

    return (
        <div>
            {/* Tab bar */}
            <div style={{
                display:'flex', gap: variant === 'pill' ? 6 : 0, position:'relative',
                borderBottom: variant === 'underline' ? '1px solid rgba(226,232,240,.07)' : 'none',
                background: variant === 'card' ? 'rgba(226,232,240,.03)' : 'transparent',
                padding: variant === 'pill' ? '5px' : 0,
                borderRadius: variant === 'pill' || variant === 'card' ? 10 : 0,
                flexWrap:'wrap',
            }}>
                {tabs.map(tab => {
                    const isActive = active === tab.key
                    return (
                        <motion.div
                            key={tab.key}
                            onClick={() => !tab.disabled && handleChange(tab.key)}
                            whileHover={!tab.disabled ? { opacity:.85 } : {}}
                            whileTap={!tab.disabled ? { scale:.98 } : {}}
                            style={{
                                padding, fontSize, fontWeight:600,
                                fontFamily:"'Space Grotesk',sans-serif",
                                cursor: tab.disabled ? 'not-allowed' : 'pointer',
                                opacity: tab.disabled ? .4 : 1,
                                position:'relative', userSelect:'none',
                                display:'flex', alignItems:'center', gap:6,
                                borderRadius: variant === 'pill' ? 7 : variant === 'card' ? 8 : 0,
                                color: isActive
                                    ? variant === 'pill' ? '#fff' : '#60a5fa'
                                    : 'rgba(148,163,184,.5)',
                                background: variant === 'pill' && isActive ? 'linear-gradient(135deg,#60a5fa,#818cf8)' : 'transparent',
                                borderBottom: variant === 'underline' ? '2px solid transparent' : 'none',
                                transition: 'color .2s',
                                whiteSpace:'nowrap',
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.count !== undefined && (
                                <span style={{ padding:'1px 7px', borderRadius:10, fontSize:10, background: isActive ? 'rgba(96,165,250,.2)' : 'rgba(226,232,240,.08)', color: isActive ? '#60a5fa' : 'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace" }}>
                                    {tab.count}
                                </span>
                            )}

                            {/* Underline indicator */}
                            {variant === 'underline' && isActive && (
                                <motion.div
                                    layoutId="tab-underline"
                                    style={{ position:'absolute', bottom:-1, left:0, right:0, height:2, background:'#60a5fa', borderRadius:'1px 1px 0 0' }}
                                    transition={{ type:'spring', stiffness:400, damping:30 }}
                                />
                            )}

                            {/* Card indicator */}
                            {variant === 'card' && isActive && (
                                <motion.div
                                    layoutId="tab-card"
                                    style={{ position:'absolute', inset:0, background:'rgba(96,165,250,.1)', border:'1px solid rgba(96,165,250,.2)', borderRadius:8, zIndex:-1 }}
                                    transition={{ type:'spring', stiffness:400, damping:30 }}
                                />
                            )}
                        </motion.div>
                    )
                })}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
                {tabs.map(tab => active === tab.key && (
                    <motion.div
                        key={tab.key}
                        initial={{ opacity:0, y:6 }}
                        animate={{ opacity:1, y:0 }}
                        exit={{ opacity:0, y:-4 }}
                        transition={{ duration:.2, ease:'easeOut' }}
                    >
                        {tab.content}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

export default Tabs