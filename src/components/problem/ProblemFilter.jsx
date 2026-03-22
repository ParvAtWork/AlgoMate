// src/components/problem/ProblemFilter.jsx
import { motion } from 'framer-motion'
import { TOPICS, DIFFICULTY } from '../../config/constants.js'
import { X } from 'lucide-react'

const FilterPill = ({ label, active, color = '#60a5fa', onClick }) => (
    <motion.button
        whileHover={{ scale:1.04 }}
        whileTap={{ scale:.96 }}
        onClick={onClick}
        style={{
            padding:'5px 13px', borderRadius:20, fontSize:12, fontWeight:600,
            fontFamily:"'Space Grotesk',sans-serif", cursor:'pointer', border:'1px solid',
            transition:'all .15s',
            background: active ? `${color}15` : 'rgba(226,232,240,.04)',
            borderColor: active ? `${color}35` : 'rgba(226,232,240,.1)',
            color: active ? color : 'rgba(148,163,184,.6)',
            whiteSpace:'nowrap',
        }}
    >
        {label}
    </motion.button>
)

const diffColors = { Easy:'#22c55e', Medium:'#f59e0b', Hard:'#ef4444' }

const ProblemFilter = ({
                           topicFilter,    setTopicFilter,
                           diffFilter,     setDiffFilter,
                           statusFilter,   setStatusFilter,
                           search,         setSearch,
                           onClear,
                       }) => {
    const hasFilters = topicFilter || diffFilter !== 'All' || statusFilter !== 'All' || search

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>

            {/* Search */}
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 14px', borderRadius:10, background:'rgba(226,232,240,.04)', border:'1px solid rgba(226,232,240,.1)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,.4)" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search problems..."
                    style={{ background:'none', border:'none', outline:'none', color:'#e2e8f0', fontSize:13, fontFamily:"'JetBrains Mono',monospace", width:'100%' }}
                />
                {search && (
                    <motion.button whileTap={{scale:.9}} onClick={() => setSearch('')}
                                   style={{ background:'none', border:'none', color:'rgba(148,163,184,.4)', cursor:'pointer', display:'flex' }}>
                        <X size={13}/>
                    </motion.button>
                )}
            </div>

            {/* Difficulty */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                <span style={{ fontSize:10, fontWeight:700, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase', flexShrink:0 }}>Diff:</span>
                <FilterPill label="All" active={diffFilter==='All'} onClick={() => setDiffFilter('All')}/>
                {Object.values(DIFFICULTY).map(d => (
                    <FilterPill key={d} label={d} active={diffFilter===d} color={diffColors[d]} onClick={() => setDiffFilter(d)}/>
                ))}
            </div>

            {/* Status */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                <span style={{ fontSize:10, fontWeight:700, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase', flexShrink:0 }}>Status:</span>
                {['All','Solved','Unsolved'].map(s => (
                    <FilterPill key={s} label={s} active={statusFilter===s}
                                color={s==='Solved'?'#22c55e':s==='Unsolved'?'#ef4444':'#60a5fa'}
                                onClick={() => setStatusFilter(s)}/>
                ))}
            </div>

            {/* Topics */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                <span style={{ fontSize:10, fontWeight:700, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase', flexShrink:0 }}>Topic:</span>
                <FilterPill label="All" active={!topicFilter} onClick={() => setTopicFilter('')}/>
                {TOPICS.map(t => (
                    <FilterPill key={t} label={t} active={topicFilter===t} color='#818cf8' onClick={() => setTopicFilter(t===topicFilter?'':t)}/>
                ))}
            </div>

            {/* Clear all */}
            {hasFilters && (
                <motion.button
                    initial={{ opacity:0, scale:.9 }}
                    animate={{ opacity:1, scale:1 }}
                    whileHover={{ scale:1.03 }}
                    whileTap={{ scale:.97 }}
                    onClick={onClear}
                    style={{ alignSelf:'flex-start', display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:8, background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', color:'#f87171', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}
                >
                    <X size={11}/> Clear filters
                </motion.button>
            )}
        </div>
    )
}

export default ProblemFilter