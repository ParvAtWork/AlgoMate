// src/pages/admin/AdminUsersPage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getAllUsers, updateUserRole, togglePremium, deleteUser } from '../../api/adminApi.js'
import Navbar from '../../components/common/Navbar.jsx'
import { Search, Shield, Star, Trash2, Users } from 'lucide-react'

const AdminUsersPage = () => {
    const [users, setUsers]       = useState([])
    const [loading, setLoading]   = useState(true)
    const [search, setSearch]     = useState('')
    const [roleFilter, setRole]   = useState('All')
    const [msg, setMsg]           = useState(null)
    const [actionId, setActionId] = useState(null)

    const load = async () => {
        try { setLoading(true); const r = await getAllUsers(); setUsers(r.data || []) }
        catch { setUsers([]) } finally { setLoading(false) }
    }

    useEffect(() => { load() }, [])

    const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3000) }

    const handleRoleChange = async (id, role) => {
        try { setActionId(id); await updateUserRole(id, role); showMsg('success', `Role updated to ${role}`); await load() }
        catch { showMsg('error', 'Failed to update role.') }
        finally { setActionId(null) }
    }

    const handlePremium = async (id, isPremium) => {
        try { setActionId(id); await togglePremium(id, isPremium); showMsg('success', isPremium ? 'Premium granted!' : 'Premium removed.'); await load() }
        catch { showMsg('error', 'Failed to toggle premium.') }
        finally { setActionId(null) }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user? This cannot be undone.')) return
        try { setActionId(id); await deleteUser(id); showMsg('success', 'User deleted.'); await load() }
        catch { showMsg('error', 'Failed to delete user.') }
        finally { setActionId(null) }
    }

    const filtered = users.filter(u => {
        const ms = !search || u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
        const mr = roleFilter === 'All' || u.role === roleFilter
        return ms && mr
    })

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
                @keyframes au-grid { 0%,100%{opacity:.02} 50%{opacity:.05} }
                @keyframes au-glow { 0%,100%{opacity:.07} 50%{opacity:.14} }
                @keyframes au-skel { 0%{background-position:200% center} 100%{background-position:-200% center} }
                .au-page { min-height:100vh; background:#06080e; font-family:'Space Grotesk',sans-serif; }
                .au-grid { position:fixed; inset:0; background:repeating-linear-gradient(90deg,rgba(226,232,240,.018) 0,transparent 1px,transparent 80px),repeating-linear-gradient(180deg,rgba(226,232,240,.018) 0,transparent 1px,transparent 80px); animation:au-grid 5s ease-in-out infinite; pointer-events:none; z-index:0; }
                .au-glow { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; animation:au-glow 5s ease-in-out infinite; }
                .au-inner { max-width:1100px; margin:0 auto; padding:28px 24px 60px; position:relative; z-index:1; }
                .au-sel { padding:7px 10px; border-radius:7px; background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.1); color:rgba(226,232,240,.8); font-size:11.5px; font-family:'JetBrains Mono',monospace; outline:none; cursor:pointer; }
                .au-thead { display:grid; grid-template-columns:50px 1fr 130px 100px 80px 90px 100px; padding:9px 16px; background:rgba(226,232,240,.025); border-bottom:1px solid rgba(226,232,240,.07); font-size:10px; font-weight:700; color:rgba(148,163,184,.4); letter-spacing:.07em; text-transform:uppercase; font-family:'JetBrains Mono',monospace; border-radius:10px 10px 0 0; }
                .au-row { display:grid; grid-template-columns:50px 1fr 130px 100px 80px 90px 100px; padding:13px 16px; border-bottom:1px solid rgba(226,232,240,.05); align-items:center; transition:background .2s; }
                .au-row:hover { background:rgba(226,232,240,.03); }
                .au-skel { height:52px; background:linear-gradient(90deg,rgba(226,232,240,.04) 25%,rgba(226,232,240,.08) 50%,rgba(226,232,240,.04) 75%); background-size:200% auto; animation:au-skel 1.5s linear infinite; border-bottom:1px solid rgba(226,232,240,.05); }
                .au-icon-btn { display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:7px; cursor:pointer; transition:all .2s; border:1px solid; background:none; }
                .au-avatar { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; font-family:'JetBrains Mono',monospace; flex-shrink:0; }
            `}</style>

            <div className="au-page">
                <div className="au-grid" />
                <div className="au-glow" style={{ width:500, height:400, background:'rgba(167,139,250,.04)', top:-100, left:'25%' }} />
                <div className="au-glow" style={{ width:300, height:300, background:'rgba(96,165,250,.04)', bottom:'10%', right:'5%', animationDelay:'2s' }} />
                <Navbar />
                <div style={{ height:72 }} />

                <div className="au-inner">
                    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4 }} style={{ marginBottom:20 }}>
                        <div style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:'rgba(167,139,250,.5)', letterSpacing:'.18em', textTransform:'uppercase', marginBottom:6 }}>// Admin</div>
                        <div style={{ fontSize:24, fontWeight:800, color:'#e2e8f0', letterSpacing:'-.03em' }}>Users <span style={{ background:'linear-gradient(90deg,#a78bfa,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{users.length}</span></div>
                        <div style={{ fontSize:13, color:'rgba(148,163,184,.5)', marginTop:4 }}>Manage user roles, premium status, and accounts</div>
                    </motion.div>

                    <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
                        {[
                            { label:'Total Users', value:users.length,                           color:'#e2e8f0', icon:Users  },
                            { label:'Admins',      value:users.filter(u=>u.role==='Admin').length, color:'#f59e0b', icon:Shield },
                            { label:'Premium',     value:users.filter(u=>u.isPremium).length,     color:'#60a5fa', icon:Star   },
                        ].map((s, i) => (
                            <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*.08 }}
                                        style={{ padding:'16px 20px', borderRadius:10, background:'rgba(226,232,240,.03)', border:'1px solid rgba(226,232,240,.08)', flex:1, minWidth:120, display:'flex', alignItems:'center', gap:12 }}>
                                <s.icon size={18} style={{ color:s.color }} />
                                <div>
                                    <div style={{ fontSize:22, fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>{s.value}</div>
                                    <div style={{ fontSize:10, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.06em', textTransform:'uppercase' }}>{s.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {msg && (
                        <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                                    style={{ marginBottom:14, padding:'8px 14px', borderRadius:8, fontSize:12, fontFamily:"'JetBrains Mono',monospace",
                                        background: msg.type==='success' ? 'rgba(34,197,94,.08)' : 'rgba(239,68,68,.08)',
                                        border:`1px solid ${msg.type==='success' ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}`,
                                        color: msg.type==='success' ? '#22c55e' : '#f87171' }}>
                            {msg.text}
                        </motion.div>
                    )}

                    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.15 }}
                                style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:9, background:'rgba(226,232,240,.04)', border:'1px solid rgba(226,232,240,.1)', flex:1, minWidth:200 }}>
                            <Search size={13} style={{ color:'rgba(148,163,184,.4)', flexShrink:0 }} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by username or email..." style={{ background:'none', border:'none', outline:'none', color:'#e2e8f0', fontSize:13, fontFamily:"'JetBrains Mono',monospace", width:'100%' }} />
                        </div>
                        <select className="au-sel" value={roleFilter} onChange={e => setRole(e.target.value)}>
                            <option value="All">All Roles</option>
                            <option value="Student">Student</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </motion.div>

                    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2 }}
                                style={{ border:'1px solid rgba(226,232,240,.07)', borderRadius:12, overflow:'hidden' }}>
                        <div className="au-thead"><div>#</div><div>User</div><div>Email</div><div>Role</div><div>Solved</div><div>Premium</div><div>Actions</div></div>
                        {loading ? Array(5).fill(0).map((_,i) => <div key={i} className="au-skel" />) :
                            filtered.length === 0 ? (
                                <div style={{ padding:'60px 20px', textAlign:'center' }}>
                                    <div style={{ fontSize:32, marginBottom:12 }}>👥</div>
                                    <div style={{ fontSize:14, fontWeight:600, color:'rgba(226,232,240,.6)' }}>No users found</div>
                                </div>
                            ) : filtered.map((u, i) => {
                                const isAdmin = u.role === 'Admin'
                                const hue = (u.id * 47) % 360
                                return (
                                    <motion.div key={u.id||i} className="au-row" initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*.03 }}>
                                        <div style={{ fontSize:11, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace" }}>#{u.id}</div>
                                        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                                            <div className="au-avatar" style={{ background:`hsl(${hue},40%,18%)`, color:`hsl(${hue},70%,65%)`, border:`1px solid hsl(${hue},40%,28%)` }}>
                                                {u.username?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <div style={{ fontSize:13, fontWeight:600, color:'#e2e8f0' }}>{u.username}</div>
                                                {u.isPremium && <div style={{ fontSize:9, color:'#fbbf24', fontFamily:"'JetBrains Mono',monospace" }}>⭐ Premium</div>}
                                            </div>
                                        </div>
                                        <div style={{ fontSize:11, color:'rgba(148,163,184,.45)', fontFamily:"'JetBrains Mono',monospace", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</div>
                                        <div><span style={{ padding:'2px 9px', borderRadius:7, fontSize:11, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", background: isAdmin ? 'rgba(251,191,36,.08)' : 'rgba(96,165,250,.08)', color: isAdmin ? '#fbbf24' : '#60a5fa', border:`1px solid ${isAdmin ? 'rgba(251,191,36,.2)' : 'rgba(96,165,250,.2)'}` }}>{isAdmin ? '👑 Admin' : 'Student'}</span></div>
                                        <div style={{ fontSize:12, color:'rgba(148,163,184,.55)', fontFamily:"'JetBrains Mono',monospace" }}>{u.problemsSolved || 0}</div>
                                        <div>
                                            <button onClick={() => handlePremium(u.id, !u.isPremium)} disabled={actionId===u.id}
                                                    style={{ padding:'3px 10px', borderRadius:7, fontSize:11, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", cursor:'pointer', transition:'all .2s', background: u.isPremium ? 'rgba(251,191,36,.08)' : 'rgba(226,232,240,.04)', color: u.isPremium ? '#fbbf24' : 'rgba(148,163,184,.4)', border:`1px solid ${u.isPremium ? 'rgba(251,191,36,.2)' : 'rgba(226,232,240,.1)'}` }}>
                                                {u.isPremium ? '⭐ On' : 'Off'}
                                            </button>
                                        </div>
                                        <div style={{ display:'flex', gap:6 }}>
                                            <button className="au-icon-btn" style={{ background: isAdmin ? 'rgba(251,191,36,.08)' : 'rgba(167,139,250,.08)', borderColor: isAdmin ? 'rgba(251,191,36,.2)' : 'rgba(167,139,250,.2)', color: isAdmin ? '#fbbf24' : '#a78bfa' }}
                                                    onClick={() => handleRoleChange(u.id, isAdmin ? 'Student' : 'Admin')} disabled={actionId===u.id} title={isAdmin ? 'Demote' : 'Promote to Admin'}>
                                                <Shield size={13} />
                                            </button>
                                            <button className="au-icon-btn" style={{ background:'rgba(239,68,68,.08)', borderColor:'rgba(239,68,68,.2)', color:'#f87171' }} onClick={() => handleDelete(u.id)} disabled={actionId===u.id}>
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )
                            })}
                    </motion.div>
                </div>
            </div>
        </>
    )
}

export default AdminUsersPage