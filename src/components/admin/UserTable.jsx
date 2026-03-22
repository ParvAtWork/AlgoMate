// src/components/admin/UserTable.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Star, Trash2, Search, ChevronUp, ChevronDown } from 'lucide-react'

const UserTable = ({
                       users = [],
                       loading = false,
                       actionId,
                       onRoleChange,
                       onPremium,
                       onDelete,
                       msg,
                   }) => {
    const [search, setSearch] = useState('')
    const [roleFilter, setRole] = useState('All')
    const [sortBy, setSortBy] = useState('id')
    const [sortDir, setSortDir] = useState('asc')

    const toggleSort = (col) => {
        if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortBy(col); setSortDir('asc') }
    }

    const SortIcon = ({ col }) => sortBy === col
        ? (sortDir === 'asc' ? <ChevronUp size={10}/> : <ChevronDown size={10}/>)
        : null

    const filtered = users
        .filter(u => {
            const ms = !search || u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
            const mr = roleFilter === 'All' || u.role === roleFilter
            return ms && mr
        })
        .sort((a,b) => {
            let va = a[sortBy], vb = b[sortBy]
            if (typeof va === 'string') va = va.toLowerCase()
            if (typeof vb === 'string') vb = vb.toLowerCase()
            return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
        })

    return (
        <>
            <style>{`
                @keyframes ut-skel { 0%,100%{opacity:.05} 50%{opacity:.12} }
                .ut-skel { height:54px; background:rgba(226,232,240,.05); animation:ut-skel 1.4s ease-in-out infinite; border-bottom:1px solid rgba(226,232,240,.05); }
                .ut-row { display:grid; grid-template-columns:50px 1fr 160px 110px 80px 90px 110px; padding:13px 18px; border-bottom:1px solid rgba(226,232,240,.05); align-items:center; transition:background .15s; }
                .ut-row:hover { background:rgba(226,232,240,.03); }
                .ut-row:last-child { border-bottom:none; }
                .ut-th { display:grid; grid-template-columns:50px 1fr 160px 110px 80px 90px 110px; padding:9px 18px; background:rgba(226,232,240,.025); border-bottom:1px solid rgba(226,232,240,.07); font-size:10px; font-weight:700; color:rgba(148,163,184,.4); letter-spacing:.07em; text-transform:uppercase; font-family:'JetBrains Mono',monospace; }
                .ut-th-cell { display:flex; align-items:center; gap:4px; cursor:pointer; user-select:none; }
                .ut-th-cell:hover { color:rgba(148,163,184,.7); }
                .ut-avatar { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800; font-family:'JetBrains Mono',monospace; flex-shrink:0; }
                .ut-icon-btn { display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:7px; cursor:pointer; transition:all .2s; border:1px solid; background:none; }
                .ut-icon-btn:hover { transform:scale(1.1); }
                .ut-icon-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; }
            `}</style>

            {/* Toolbar */}
            <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:9, background:'rgba(226,232,240,.04)', border:'1px solid rgba(226,232,240,.1)', flex:1, minWidth:200 }}>
                    <Search size={13} style={{ color:'rgba(148,163,184,.4)', flexShrink:0 }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by username or email..."
                        style={{ background:'none', border:'none', outline:'none', color:'#e2e8f0', fontSize:13, fontFamily:"'JetBrains Mono',monospace", width:'100%' }}
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={e => setRole(e.target.value)}
                    style={{ padding:'8px 12px', borderRadius:9, background:'rgba(226,232,240,.05)', border:'1px solid rgba(226,232,240,.1)', color:'rgba(226,232,240,.8)', fontSize:12, fontFamily:"'JetBrains Mono',monospace", outline:'none', cursor:'pointer' }}
                >
                    <option value="All">All Roles</option>
                    <option value="Student">Student</option>
                    <option value="Admin">Admin</option>
                </select>
            </div>

            {/* Message */}
            <AnimatePresence>
                {msg && (
                    <motion.div
                        initial={{ opacity:0, y:-6 }}
                        animate={{ opacity:1, y:0 }}
                        exit={{ opacity:0, y:-6 }}
                        style={{ marginBottom:12, padding:'8px 14px', borderRadius:8, fontSize:12, fontFamily:"'JetBrains Mono',monospace",
                            background: msg.type==='success' ? 'rgba(34,197,94,.08)' : 'rgba(239,68,68,.08)',
                            border:`1px solid ${msg.type==='success' ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}`,
                            color: msg.type==='success' ? '#22c55e' : '#f87171' }}
                    >
                        {msg.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Table */}
            <div style={{ border:'1px solid rgba(226,232,240,.07)', borderRadius:12, overflow:'hidden' }}>
                <div className="ut-th">
                    {[
                        { label:'#',       col:'id'       },
                        { label:'User',    col:'username' },
                        { label:'Email',   col:'email'    },
                        { label:'Role',    col:'role'     },
                        { label:'Solved',  col:'problemsSolved' },
                        { label:'Premium', col:'isPremium' },
                        { label:'Actions', col:null        },
                    ].map(({ label, col }) => (
                        <div
                            key={label}
                            className={col ? 'ut-th-cell' : ''}
                            onClick={() => col && toggleSort(col)}
                        >
                            {label} {col && <SortIcon col={col}/>}
                        </div>
                    ))}
                </div>

                {loading ? (
                    Array(5).fill(0).map((_,i) => (
                        <div key={i} className="ut-skel" style={{ animationDelay:`${i*.08}s` }}/>
                    ))
                ) : filtered.length === 0 ? (
                    <div style={{ padding:'60px 20px', textAlign:'center' }}>
                        <div style={{ fontSize:32, marginBottom:12 }}>👥</div>
                        <div style={{ fontSize:14, fontWeight:600, color:'rgba(226,232,240,.6)' }}>No users found</div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filtered.map((u, i) => {
                            const isAdmin = u.role === 'Admin'
                            const hue     = (u.id * 47) % 360
                            return (
                                <motion.div
                                    key={u.id || i}
                                    className="ut-row"
                                    initial={{ opacity:0, x:-8 }}
                                    animate={{ opacity:1, x:0 }}
                                    exit={{ opacity:0, x:8 }}
                                    transition={{ delay: i * .03 }}
                                >
                                    {/* ID */}
                                    <div style={{ fontSize:11, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace" }}>
                                        #{u.id}
                                    </div>

                                    {/* User */}
                                    <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                                        <div
                                            className="ut-avatar"
                                            style={{ background:`hsl(${hue},40%,16%)`, color:`hsl(${hue},70%,65%)`, border:`1px solid hsl(${hue},40%,26%)` }}
                                        >
                                            {u.username?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div style={{ minWidth:0 }}>
                                            <div style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                                {u.username}
                                            </div>
                                            {u.isPremium && (
                                                <div style={{ fontSize:9, color:'#fbbf24', fontFamily:"'JetBrains Mono',monospace" }}>⭐ Premium</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div style={{ fontSize:11, color:'rgba(148,163,184,.45)', fontFamily:"'JetBrains Mono',monospace", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                        {u.email}
                                    </div>

                                    {/* Role */}
                                    <div>
                                        <motion.span
                                            whileHover={{ scale:1.05 }}
                                            style={{ padding:'3px 10px', borderRadius:7, fontSize:11, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", cursor:'default',
                                                background: isAdmin ? 'rgba(251,191,36,.08)' : 'rgba(96,165,250,.08)',
                                                color:      isAdmin ? '#fbbf24'              : '#60a5fa',
                                                border:`1px solid ${isAdmin ? 'rgba(251,191,36,.2)' : 'rgba(96,165,250,.2)'}`,
                                            }}
                                        >
                                            {isAdmin ? '👑 Admin' : 'Student'}
                                        </motion.span>
                                    </div>

                                    {/* Solved */}
                                    <div style={{ fontSize:13, fontWeight:600, color:'rgba(148,163,184,.6)', fontFamily:"'JetBrains Mono',monospace" }}>
                                        {u.problemsSolved || 0}
                                    </div>

                                    {/* Premium toggle */}
                                    <div>
                                        <motion.button
                                            whileHover={{ scale:1.05 }}
                                            whileTap={{ scale:.95 }}
                                            onClick={() => onPremium(u.id, !u.isPremium)}
                                            disabled={actionId === u.id}
                                            style={{ padding:'4px 10px', borderRadius:7, fontSize:11, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", cursor:'pointer', transition:'all .2s',
                                                background: u.isPremium ? 'rgba(251,191,36,.1)' : 'rgba(226,232,240,.04)',
                                                color:      u.isPremium ? '#fbbf24'             : 'rgba(148,163,184,.4)',
                                                border:`1px solid ${u.isPremium ? 'rgba(251,191,36,.25)' : 'rgba(226,232,240,.1)'}`,
                                                opacity: actionId === u.id ? .5 : 1,
                                            }}
                                        >
                                            {u.isPremium ? '⭐ On' : 'Off'}
                                        </motion.button>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display:'flex', gap:6 }}>
                                        <motion.button
                                            whileHover={{ scale:1.1 }}
                                            whileTap={{ scale:.9 }}
                                            className="ut-icon-btn"
                                            title={isAdmin ? 'Demote to Student' : 'Promote to Admin'}
                                            style={{ background: isAdmin ? 'rgba(251,191,36,.08)':'rgba(167,139,250,.08)', borderColor: isAdmin ? 'rgba(251,191,36,.2)':'rgba(167,139,250,.2)', color: isAdmin ? '#fbbf24':'#a78bfa' }}
                                            onClick={() => onRoleChange(u.id, isAdmin ? 'Student' : 'Admin')}
                                            disabled={actionId === u.id}
                                        >
                                            <Shield size={13}/>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale:1.1 }}
                                            whileTap={{ scale:.9 }}
                                            className="ut-icon-btn"
                                            title="Delete user"
                                            style={{ background:'rgba(239,68,68,.08)', borderColor:'rgba(239,68,68,.2)', color:'#f87171' }}
                                            onClick={() => onDelete(u.id)}
                                            disabled={actionId === u.id}
                                        >
                                            <Trash2 size={13}/>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                )}
            </div>

            {/* Footer count */}
            {!loading && filtered.length > 0 && (
                <div style={{ marginTop:10, fontSize:11, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", textAlign:'right' }}>
                    Showing {filtered.length} of {users.length} users
                </div>
            )}
        </>
    )
}

export default UserTable