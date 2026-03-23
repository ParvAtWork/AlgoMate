// src/pages/admin/AdminUsersPage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser } from '../../store/slices/authSlice.js'
import { getAllUsers, updateUserRole, togglePremium, deleteUser } from '../../api/adminApi.js'
import Navbar from '../../components/common/Navbar.jsx'
import { Search, Shield, Star, Trash2, Users, ExternalLink, ChevronDown } from 'lucide-react'

// Role hierarchy
const ROLE_LEVELS = {
    'SuperAdmin':   4,
    'Admin':        3,
    'Contributor':  2,
    'Student':      1,
    'User':         1,
}

const ROLES_ALL         = ['Student', 'Contributor', 'Admin', 'SuperAdmin']
const ROLES_ADMIN_ASSIGN = ['Student', 'Contributor', 'Admin'] // Admin 2/3 can assign these

const AdminUsersPage = () => {
    const navigate   = useNavigate()
    const adminUser  = useSelector(selectUser)
    const isSuperAdmin = adminUser?.id === 1 || adminUser?.role === 'SuperAdmin'

    const [users,     setUsers]     = useState([])
    const [loading,   setLoading]   = useState(true)
    const [search,    setSearch]    = useState('')
    const [roleFilter,setRole]      = useState('All')
    const [msg,       setMsg]       = useState(null)
    const [actionId,  setActionId]  = useState(null)
    const [openDropdown, setOpenDropdown] = useState(null)

    const load = async () => {
        try { setLoading(true); const r = await getAllUsers(); setUsers(r.data || []) }
        catch { setUsers([]) } finally { setLoading(false) }
    }

    useEffect(() => { load() }, [])

    const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3000) }

    // Check if current admin can modify target user
    const canModify = (targetUser) => {
        if (!adminUser) return false
        // Cannot modify yourself
        if (targetUser.id === adminUser.id) return false
        // SuperAdmin (id=1) cannot be modified by anyone
        if (targetUser.id === 1) return false
        // SuperAdmin can modify everyone
        if (isSuperAdmin) return true
        // Regular admin cannot modify other admins or superadmins
        if (targetUser.role === 'Admin' || targetUser.role === 'SuperAdmin') return false
        return true
    }

    // Get assignable roles for current admin
    const getAssignableRoles = (targetUser) => {
        if (isSuperAdmin) return ROLES_ALL
        return ROLES_ADMIN_ASSIGN.filter(r => r !== 'SuperAdmin')
    }

    const handleRoleChange = async (id, role, targetUser) => {
        if (!canModify(targetUser)) {
            showMsg('error', 'You do not have permission to modify this user.')
            return
        }
        setOpenDropdown(null)
        try {
            setActionId(id)
            await updateUserRole(id, role)
            showMsg('success', `Role updated to ${role}`)
            await load()
        } catch { showMsg('error', 'Failed to update role.') }
        finally { setActionId(null) }
    }

    const handlePremium = async (id, isPremium, targetUser) => {
        if (!canModify(targetUser)) { showMsg('error', 'Permission denied.'); return }
        try {
            setActionId(id)
            await togglePremium(id, isPremium)
            showMsg('success', isPremium ? 'Premium granted!' : 'Premium removed.')
            await load()
        } catch { showMsg('error', 'Failed to toggle premium.') }
        finally { setActionId(null) }
    }

    const handleDelete = async (id, targetUser) => {
        if (!canModify(targetUser)) { showMsg('error', 'Permission denied.'); return }
        if (!window.confirm('Delete this user? This cannot be undone.')) return
        try {
            setActionId(id)
            await deleteUser(id)
            showMsg('success', 'User deleted.')
            await load()
        } catch { showMsg('error', 'Failed to delete user.') }
        finally { setActionId(null) }
    }

    const filtered = users.filter(u => {
        const ms = !search || u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
        const mr = roleFilter === 'All' || u.role === roleFilter
        return ms && mr
    })

    const roleColor = (role) => ({
        'SuperAdmin':  { c:'#f87171', b:'rgba(248,113,113,.08)', br:'rgba(248,113,113,.2)' },
        'Admin':       { c:'#fbbf24', b:'rgba(251,191,36,.08)',  br:'rgba(251,191,36,.2)'  },
        'Contributor': { c:'#a78bfa', b:'rgba(167,139,250,.08)', br:'rgba(167,139,250,.2)' },
        'Student':     { c:'#60a5fa', b:'rgba(96,165,250,.08)',  br:'rgba(96,165,250,.2)'  },
    })[role] || { c:'#60a5fa', b:'rgba(96,165,250,.08)', br:'rgba(96,165,250,.2)' }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
                @keyframes au-grid { 0%,100%{opacity:.02} 50%{opacity:.05} }
                @keyframes au-glow { 0%,100%{opacity:.07} 50%{opacity:.14} }
                @keyframes au-skel { 0%{background-position:200% center} 100%{background-position:-200% center} }
                .au-page  { min-height:100vh; background:#06080e; font-family:'Space Grotesk',sans-serif; }
                .au-grid  { position:fixed; inset:0; background:repeating-linear-gradient(90deg,rgba(226,232,240,.018) 0,transparent 1px,transparent 80px),repeating-linear-gradient(180deg,rgba(226,232,240,.018) 0,transparent 1px,transparent 80px); animation:au-grid 5s ease-in-out infinite; pointer-events:none; z-index:0; }
                .au-glow  { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; animation:au-glow 5s ease-in-out infinite; }
                .au-inner { max-width:1100px; margin:0 auto; padding:28px 24px 60px; position:relative; z-index:1; }
                .au-sel   { padding:7px 10px; border-radius:7px; background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.1); color:rgba(226,232,240,.8); font-size:11.5px; font-family:'JetBrains Mono',monospace; outline:none; cursor:pointer; }
                .au-thead { display:grid; grid-template-columns:50px 1fr 130px 130px 80px 80px 130px; padding:9px 16px; background:rgba(226,232,240,.025); border-bottom:1px solid rgba(226,232,240,.07); font-size:10px; font-weight:700; color:rgba(148,163,184,.4); letter-spacing:.07em; text-transform:uppercase; font-family:'JetBrains Mono',monospace; }
                .au-row   { display:grid; grid-template-columns:50px 1fr 130px 130px 80px 80px 130px; padding:13px 16px; border-bottom:1px solid rgba(226,232,240,.05); align-items:center; transition:background .2s; }
                .au-row:hover { background:rgba(226,232,240,.03); }
                .au-skel  { height:58px; background:linear-gradient(90deg,rgba(226,232,240,.04) 25%,rgba(226,232,240,.08) 50%,rgba(226,232,240,.04) 75%); background-size:200% auto; animation:au-skel 1.5s linear infinite; border-bottom:1px solid rgba(226,232,240,.05); }
                .au-icon-btn { display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:7px; cursor:pointer; transition:all .2s; border:1px solid; background:none; }
                .au-avatar { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; font-family:'JetBrains Mono',monospace; flex-shrink:0; }
                .au-user-link { color:#60a5fa; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:5px; transition:all .15s; }
                .au-user-link:hover { color:#93c5fd; text-decoration:underline; }
                .au-role-dd { position:absolute; top:calc(100% + 4px); left:0; background:#0d1117; border:1px solid rgba(226,232,240,.12); border-radius:9px; overflow:hidden; z-index:50; min-width:130px; box-shadow:0 8px 24px rgba(0,0,0,.5); }
                .au-role-item { padding:9px 14px; font-size:12px; cursor:pointer; transition:background .15s; font-family:'JetBrains Mono',monospace; display:flex; align-items:center; gap:7px; }
                .au-role-item:hover { background:rgba(226,232,240,.06); }
                .au-locked { opacity:.4; cursor:not-allowed; }
            `}</style>

            <div className="au-page">
                <div className="au-grid"/>
                <div className="au-glow" style={{ width:500, height:400, background:'rgba(167,139,250,.04)', top:-100, left:'25%' }}/>
                <div className="au-glow" style={{ width:300, height:300, background:'rgba(96,165,250,.04)', bottom:'10%', right:'5%', animationDelay:'2s' }}/>
                <Navbar/>
                <div style={{ height:72 }}/>

                <div className="au-inner">
                    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4 }} style={{ marginBottom:20 }}>
                        <div style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:'rgba(167,139,250,.5)', letterSpacing:'.18em', textTransform:'uppercase', marginBottom:6 }}>// Admin</div>
                        <div style={{ fontSize:24, fontWeight:800, color:'#e2e8f0', letterSpacing:'-.03em' }}>
                            Users <span style={{ background:'linear-gradient(90deg,#a78bfa,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{users.length}</span>
                        </div>
                        <div style={{ fontSize:13, color:'rgba(148,163,184,.5)', marginTop:4 }}>
                            Manage user roles, premium status, and accounts
                            {isSuperAdmin && <span style={{ marginLeft:10, padding:'2px 8px', borderRadius:6, background:'rgba(248,113,113,.1)', color:'#f87171', fontSize:11, fontFamily:"'JetBrains Mono',monospace", border:'1px solid rgba(248,113,113,.2)' }}>👑 Super Admin Mode</span>}
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
                        {[
                            { label:'Total Users',   value:users.length,                                color:'#e2e8f0', icon:Users  },
                            { label:'Super Admins',  value:users.filter(u=>u.id===1||u.role==='SuperAdmin').length, color:'#f87171', icon:Shield },
                            { label:'Admins',        value:users.filter(u=>u.role==='Admin').length,   color:'#fbbf24', icon:Shield },
                            { label:'Contributors',  value:users.filter(u=>u.role==='Contributor').length, color:'#a78bfa', icon:Users },
                            { label:'Premium',       value:users.filter(u=>u.isPremium).length,        color:'#60a5fa', icon:Star   },
                        ].map((s,i) => (
                            <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.06 }}
                                        style={{ padding:'14px 18px', borderRadius:10, background:'rgba(226,232,240,.03)', border:'1px solid rgba(226,232,240,.07)', flex:1, minWidth:110, display:'flex', alignItems:'center', gap:10 }}>
                                <s.icon size={16} style={{ color:s.color }}/>
                                <div>
                                    <div style={{ fontSize:20, fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>{s.value}</div>
                                    <div style={{ fontSize:9.5, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.06em', textTransform:'uppercase' }}>{s.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {msg && (
                        <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                                    style={{ marginBottom:14, padding:'8px 14px', borderRadius:8, fontSize:12, fontFamily:"'JetBrains Mono',monospace",
                                        background:msg.type==='success'?'rgba(34,197,94,.08)':'rgba(239,68,68,.08)',
                                        border:`1px solid ${msg.type==='success'?'rgba(34,197,94,.2)':'rgba(239,68,68,.2)'}`,
                                        color:msg.type==='success'?'#22c55e':'#f87171' }}>
                            {msg.text}
                        </motion.div>
                    )}

                    {/* Search + Filter */}
                    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.15 }}
                                style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:9, background:'rgba(226,232,240,.04)', border:'1px solid rgba(226,232,240,.1)', flex:1, minWidth:200 }}>
                            <Search size={13} style={{ color:'rgba(148,163,184,.4)', flexShrink:0 }}/>
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by username or email..."
                                   style={{ background:'none', border:'none', outline:'none', color:'#e2e8f0', fontSize:13, fontFamily:"'JetBrains Mono',monospace", width:'100%' }}/>
                        </div>
                        <select className="au-sel" value={roleFilter} onChange={e => setRole(e.target.value)}>
                            <option value="All">All Roles</option>
                            {ROLES_ALL.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </motion.div>

                    {/* RBAC Info */}
                    {!isSuperAdmin && (
                        <div style={{ marginBottom:14, padding:'10px 14px', borderRadius:8, background:'rgba(245,158,11,.06)', border:'1px solid rgba(245,158,11,.15)', fontSize:12, color:'rgba(245,158,11,.8)', fontFamily:"'JetBrains Mono',monospace" }}>
                            ⚠ You can assign Contributor/Admin roles. SuperAdmin (#1) cannot be modified.
                        </div>
                    )}

                    {/* Table */}
                    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2 }}
                                style={{ border:'1px solid rgba(226,232,240,.07)', borderRadius:12, overflow:'hidden' }}>
                        <div className="au-thead">
                            <div>#</div><div>User</div><div>Email</div><div>Role</div><div>Solved</div><div>Premium</div><div>Actions</div>
                        </div>

                        {loading ? Array(5).fill(0).map((_,i) => <div key={i} className="au-skel"/>) :
                            filtered.length === 0 ? (
                                <div style={{ padding:'60px 20px', textAlign:'center' }}>
                                    <div style={{ fontSize:32, marginBottom:12 }}>👥</div>
                                    <div style={{ fontSize:14, fontWeight:600, color:'rgba(226,232,240,.6)' }}>No users found</div>
                                </div>
                            ) : filtered.map((u, i) => {
                                const hue       = (u.id * 47) % 360
                                const rc        = roleColor(u.role)
                                const modifiable = canModify(u)
                                const isSuper   = u.id === 1 || u.role === 'SuperAdmin'
                                const assignableRoles = getAssignableRoles(u)

                                return (
                                    <motion.div key={u.id||i} className={`au-row ${!modifiable ? 'au-locked' : ''}`}
                                                initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*.03 }}>

                                        <div style={{ fontSize:11, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace" }}>#{u.id}</div>

                                        {/* User */}
                                        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                                            <div className="au-avatar" style={{ background:`hsl(${hue},40%,18%)`, color:`hsl(${hue},70%,65%)`, border:`1px solid hsl(${hue},40%,28%)` }}>
                                                {u.username?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <div className="au-user-link" onClick={() => navigate(`/profile?userId=${u.id}`)}>
                                                    {u.username} <ExternalLink size={10}/>
                                                </div>
                                                <div style={{ display:'flex', gap:4, marginTop:2 }}>
                                                    {isSuper && <span style={{ fontSize:9, padding:'1px 5px', borderRadius:4, background:'rgba(248,113,113,.1)', color:'#f87171', fontFamily:"'JetBrains Mono',monospace" }}>🔒 Protected</span>}
                                                    {u.isPremium && <span style={{ fontSize:9, color:'#fbbf24', fontFamily:"'JetBrains Mono',monospace" }}>⭐</span>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div style={{ fontSize:11, color:'rgba(148,163,184,.45)', fontFamily:"'JetBrains Mono',monospace", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                            {u.email}
                                        </div>

                                        {/* Role dropdown */}
                                        <div style={{ position:'relative' }}>
                                            <button
                                                disabled={!modifiable || actionId===u.id}
                                                onClick={() => modifiable && setOpenDropdown(openDropdown===u.id ? null : u.id)}
                                                style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:7, fontSize:11, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", cursor:modifiable?'pointer':'not-allowed', background:rc.b, color:rc.c, border:`1px solid ${rc.br}`, transition:'all .2s' }}>
                                                {u.role || 'Student'}
                                                {modifiable && <ChevronDown size={10}/>}
                                            </button>

                                            {openDropdown === u.id && modifiable && (
                                                <div className="au-role-dd">
                                                    {assignableRoles.map(role => {
                                                        const src = roleColor(role)
                                                        return (
                                                            <div key={role} className="au-role-item"
                                                                 style={{ color: u.role===role ? src.c : 'rgba(226,232,240,.7)', background: u.role===role ? src.b : 'transparent' }}
                                                                 onClick={() => handleRoleChange(u.id, role, u)}>
                                                                <span style={{ width:8, height:8, borderRadius:'50%', background:src.c, flexShrink:0 }}/>
                                                                {role}
                                                                {u.role === role && ' ✓'}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Solved */}
                                        <div style={{ fontSize:12, color:'rgba(148,163,184,.55)', fontFamily:"'JetBrains Mono',monospace" }}>
                                            {u.problemsSolved || 0}
                                        </div>

                                        {/* Premium */}
                                        <div>
                                            <button onClick={() => modifiable && handlePremium(u.id, !u.isPremium, u)}
                                                    disabled={!modifiable || actionId===u.id}
                                                    style={{ padding:'3px 10px', borderRadius:7, fontSize:11, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", cursor:modifiable?'pointer':'not-allowed', transition:'all .2s',
                                                        background:u.isPremium?'rgba(251,191,36,.08)':'rgba(226,232,240,.04)',
                                                        color:u.isPremium?'#fbbf24':'rgba(148,163,184,.4)',
                                                        border:`1px solid ${u.isPremium?'rgba(251,191,36,.2)':'rgba(226,232,240,.1)'}` }}>
                                                {u.isPremium ? '⭐ On' : 'Off'}
                                            </button>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display:'flex', gap:6 }}>
                                            <button className="au-icon-btn"
                                                    style={{ background:'rgba(96,165,250,.08)', borderColor:'rgba(96,165,250,.2)', color:'#60a5fa' }}
                                                    onClick={() => navigate(`/profile?userId=${u.id}`)}
                                                    title="View Profile">
                                                <ExternalLink size={12}/>
                                            </button>
                                            {modifiable && (
                                                <button className="au-icon-btn"
                                                        style={{ background:'rgba(239,68,68,.08)', borderColor:'rgba(239,68,68,.2)', color:'#f87171', opacity:actionId===u.id?.5:1 }}
                                                        onClick={() => handleDelete(u.id, u)}
                                                        disabled={actionId===u.id}
                                                        title="Delete User">
                                                    <Trash2 size={12}/>
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })
                        }
                    </motion.div>

                    {/* Click outside to close dropdown */}
                    {openDropdown && (
                        <div style={{ position:'fixed', inset:0, zIndex:49 }} onClick={() => setOpenDropdown(null)}/>
                    )}
                </div>
            </div>
        </>
    )
}

export default AdminUsersPage

// src/pages/admin/AdminUsersPage.jsx
// import { useEffect, useState } from 'react'
// import { motion } from 'framer-motion'
// import { getAllUsers, updateUserRole, togglePremium, deleteUser } from '../../api/adminApi.js'
// import Navbar from '../../components/common/Navbar.jsx'
// import { Search, Shield, Star, Trash2, Users } from 'lucide-react'
//
// const AdminUsersPage = () => {
//     const [users, setUsers]       = useState([])
//     const [loading, setLoading]   = useState(true)
//     const [search, setSearch]     = useState('')
//     const [roleFilter, setRole]   = useState('All')
//     const [msg, setMsg]           = useState(null)
//     const [actionId, setActionId] = useState(null)
//
//     const load = async () => {
//         try { setLoading(true); const r = await getAllUsers(); setUsers(r.data || []) }
//         catch { setUsers([]) } finally { setLoading(false) }
//     }
//
//     useEffect(() => { load() }, [])
//
//     const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3000) }
//
//     const handleRoleChange = async (id, role) => {
//         try { setActionId(id); await updateUserRole(id, role); showMsg('success', `Role updated to ${role}`); await load() }
//         catch { showMsg('error', 'Failed to update role.') }
//         finally { setActionId(null) }
//     }
//
//     const handlePremium = async (id, isPremium) => {
//         try { setActionId(id); await togglePremium(id, isPremium); showMsg('success', isPremium ? 'Premium granted!' : 'Premium removed.'); await load() }
//         catch { showMsg('error', 'Failed to toggle premium.') }
//         finally { setActionId(null) }
//     }
//
//     const handleDelete = async (id) => {
//         if (!window.confirm('Delete this user? This cannot be undone.')) return
//         try { setActionId(id); await deleteUser(id); showMsg('success', 'User deleted.'); await load() }
//         catch { showMsg('error', 'Failed to delete user.') }
//         finally { setActionId(null) }
//     }
//
//     const filtered = users.filter(u => {
//         const ms = !search || u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
//         const mr = roleFilter === 'All' || u.role === roleFilter
//         return ms && mr
//     })
//
//     return (
//         <>
//             <style>{`
//                 @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
//                 @keyframes au-grid { 0%,100%{opacity:.02} 50%{opacity:.05} }
//                 @keyframes au-glow { 0%,100%{opacity:.07} 50%{opacity:.14} }
//                 @keyframes au-skel { 0%{background-position:200% center} 100%{background-position:-200% center} }
//                 .au-page { min-height:100vh; background:#06080e; font-family:'Space Grotesk',sans-serif; }
//                 .au-grid { position:fixed; inset:0; background:repeating-linear-gradient(90deg,rgba(226,232,240,.018) 0,transparent 1px,transparent 80px),repeating-linear-gradient(180deg,rgba(226,232,240,.018) 0,transparent 1px,transparent 80px); animation:au-grid 5s ease-in-out infinite; pointer-events:none; z-index:0; }
//                 .au-glow { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; animation:au-glow 5s ease-in-out infinite; }
//                 .au-inner { max-width:1100px; margin:0 auto; padding:28px 24px 60px; position:relative; z-index:1; }
//                 .au-sel { padding:7px 10px; border-radius:7px; background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.1); color:rgba(226,232,240,.8); font-size:11.5px; font-family:'JetBrains Mono',monospace; outline:none; cursor:pointer; }
//                 .au-thead { display:grid; grid-template-columns:50px 1fr 130px 100px 80px 90px 100px; padding:9px 16px; background:rgba(226,232,240,.025); border-bottom:1px solid rgba(226,232,240,.07); font-size:10px; font-weight:700; color:rgba(148,163,184,.4); letter-spacing:.07em; text-transform:uppercase; font-family:'JetBrains Mono',monospace; border-radius:10px 10px 0 0; }
//                 .au-row { display:grid; grid-template-columns:50px 1fr 130px 100px 80px 90px 100px; padding:13px 16px; border-bottom:1px solid rgba(226,232,240,.05); align-items:center; transition:background .2s; }
//                 .au-row:hover { background:rgba(226,232,240,.03); }
//                 .au-skel { height:52px; background:linear-gradient(90deg,rgba(226,232,240,.04) 25%,rgba(226,232,240,.08) 50%,rgba(226,232,240,.04) 75%); background-size:200% auto; animation:au-skel 1.5s linear infinite; border-bottom:1px solid rgba(226,232,240,.05); }
//                 .au-icon-btn { display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:7px; cursor:pointer; transition:all .2s; border:1px solid; background:none; }
//                 .au-avatar { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; font-family:'JetBrains Mono',monospace; flex-shrink:0; }
//             `}</style>
//
//             <div className="au-page">
//                 <div className="au-grid" />
//                 <div className="au-glow" style={{ width:500, height:400, background:'rgba(167,139,250,.04)', top:-100, left:'25%' }} />
//                 <div className="au-glow" style={{ width:300, height:300, background:'rgba(96,165,250,.04)', bottom:'10%', right:'5%', animationDelay:'2s' }} />
//                 <Navbar />
//                 <div style={{ height:72 }} />
//
//                 <div className="au-inner">
//                     <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4 }} style={{ marginBottom:20 }}>
//                         <div style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:'rgba(167,139,250,.5)', letterSpacing:'.18em', textTransform:'uppercase', marginBottom:6 }}>// Admin</div>
//                         <div style={{ fontSize:24, fontWeight:800, color:'#e2e8f0', letterSpacing:'-.03em' }}>Users <span style={{ background:'linear-gradient(90deg,#a78bfa,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{users.length}</span></div>
//                         <div style={{ fontSize:13, color:'rgba(148,163,184,.5)', marginTop:4 }}>Manage user roles, premium status, and accounts</div>
//                     </motion.div>
//
//                     <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
//                         {[
//                             { label:'Total Users', value:users.length,                           color:'#e2e8f0', icon:Users  },
//                             { label:'Admins',      value:users.filter(u=>u.role==='Admin').length, color:'#f59e0b', icon:Shield },
//                             { label:'Premium',     value:users.filter(u=>u.isPremium).length,     color:'#60a5fa', icon:Star   },
//                         ].map((s, i) => (
//                             <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*.08 }}
//                                         style={{ padding:'16px 20px', borderRadius:10, background:'rgba(226,232,240,.03)', border:'1px solid rgba(226,232,240,.08)', flex:1, minWidth:120, display:'flex', alignItems:'center', gap:12 }}>
//                                 <s.icon size={18} style={{ color:s.color }} />
//                                 <div>
//                                     <div style={{ fontSize:22, fontWeight:800, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>{s.value}</div>
//                                     <div style={{ fontSize:10, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.06em', textTransform:'uppercase' }}>{s.label}</div>
//                                 </div>
//                             </motion.div>
//                         ))}
//                     </div>
//
//                     {msg && (
//                         <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
//                                     style={{ marginBottom:14, padding:'8px 14px', borderRadius:8, fontSize:12, fontFamily:"'JetBrains Mono',monospace",
//                                         background: msg.type==='success' ? 'rgba(34,197,94,.08)' : 'rgba(239,68,68,.08)',
//                                         border:`1px solid ${msg.type==='success' ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}`,
//                                         color: msg.type==='success' ? '#22c55e' : '#f87171' }}>
//                             {msg.text}
//                         </motion.div>
//                     )}
//
//                     <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.15 }}
//                                 style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
//                         <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:9, background:'rgba(226,232,240,.04)', border:'1px solid rgba(226,232,240,.1)', flex:1, minWidth:200 }}>
//                             <Search size={13} style={{ color:'rgba(148,163,184,.4)', flexShrink:0 }} />
//                             <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by username or email..." style={{ background:'none', border:'none', outline:'none', color:'#e2e8f0', fontSize:13, fontFamily:"'JetBrains Mono',monospace", width:'100%' }} />
//                         </div>
//                         <select className="au-sel" value={roleFilter} onChange={e => setRole(e.target.value)}>
//                             <option value="All">All Roles</option>
//                             <option value="Student">Student</option>
//                             <option value="Admin">Admin</option>
//                         </select>
//                     </motion.div>
//
//                     <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2 }}
//                                 style={{ border:'1px solid rgba(226,232,240,.07)', borderRadius:12, overflow:'hidden' }}>
//                         <div className="au-thead"><div>#</div><div>User</div><div>Email</div><div>Role</div><div>Solved</div><div>Premium</div><div>Actions</div></div>
//                         {loading ? Array(5).fill(0).map((_,i) => <div key={i} className="au-skel" />) :
//                             filtered.length === 0 ? (
//                                 <div style={{ padding:'60px 20px', textAlign:'center' }}>
//                                     <div style={{ fontSize:32, marginBottom:12 }}>👥</div>
//                                     <div style={{ fontSize:14, fontWeight:600, color:'rgba(226,232,240,.6)' }}>No users found</div>
//                                 </div>
//                             ) : filtered.map((u, i) => {
//                                 const isAdmin = u.role === 'Admin'
//                                 const hue = (u.id * 47) % 360
//                                 return (
//                                     <motion.div key={u.id||i} className="au-row" initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*.03 }}>
//                                         <div style={{ fontSize:11, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace" }}>#{u.id}</div>
//                                         <div style={{ display:'flex', alignItems:'center', gap:9 }}>
//                                             <div className="au-avatar" style={{ background:`hsl(${hue},40%,18%)`, color:`hsl(${hue},70%,65%)`, border:`1px solid hsl(${hue},40%,28%)` }}>
//                                                 {u.username?.[0]?.toUpperCase() || '?'}
//                                             </div>
//                                             <div>
//                                                 <div style={{ fontSize:13, fontWeight:600, color:'#e2e8f0' }}>{u.username}</div>
//                                                 {u.isPremium && <div style={{ fontSize:9, color:'#fbbf24', fontFamily:"'JetBrains Mono',monospace" }}>⭐ Premium</div>}
//                                             </div>
//                                         </div>
//                                         <div style={{ fontSize:11, color:'rgba(148,163,184,.45)', fontFamily:"'JetBrains Mono',monospace", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</div>
//                                         <div><span style={{ padding:'2px 9px', borderRadius:7, fontSize:11, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", background: isAdmin ? 'rgba(251,191,36,.08)' : 'rgba(96,165,250,.08)', color: isAdmin ? '#fbbf24' : '#60a5fa', border:`1px solid ${isAdmin ? 'rgba(251,191,36,.2)' : 'rgba(96,165,250,.2)'}` }}>{isAdmin ? '👑 Admin' : 'Student'}</span></div>
//                                         <div style={{ fontSize:12, color:'rgba(148,163,184,.55)', fontFamily:"'JetBrains Mono',monospace" }}>{u.problemsSolved || 0}</div>
//                                         <div>
//                                             <button onClick={() => handlePremium(u.id, !u.isPremium)} disabled={actionId===u.id}
//                                                     style={{ padding:'3px 10px', borderRadius:7, fontSize:11, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", cursor:'pointer', transition:'all .2s', background: u.isPremium ? 'rgba(251,191,36,.08)' : 'rgba(226,232,240,.04)', color: u.isPremium ? '#fbbf24' : 'rgba(148,163,184,.4)', border:`1px solid ${u.isPremium ? 'rgba(251,191,36,.2)' : 'rgba(226,232,240,.1)'}` }}>
//                                                 {u.isPremium ? '⭐ On' : 'Off'}
//                                             </button>
//                                         </div>
//                                         <div style={{ display:'flex', gap:6 }}>
//                                             <button className="au-icon-btn" style={{ background: isAdmin ? 'rgba(251,191,36,.08)' : 'rgba(167,139,250,.08)', borderColor: isAdmin ? 'rgba(251,191,36,.2)' : 'rgba(167,139,250,.2)', color: isAdmin ? '#fbbf24' : '#a78bfa' }}
//                                                     onClick={() => handleRoleChange(u.id, isAdmin ? 'Student' : 'Admin')} disabled={actionId===u.id} title={isAdmin ? 'Demote' : 'Promote to Admin'}>
//                                                 <Shield size={13} />
//                                             </button>
//                                             <button className="au-icon-btn" style={{ background:'rgba(239,68,68,.08)', borderColor:'rgba(239,68,68,.2)', color:'#f87171' }} onClick={() => handleDelete(u.id)} disabled={actionId===u.id}>
//                                                 <Trash2 size={13} />
//                                             </button>
//                                         </div>
//                                     </motion.div>
//                                 )
//                             })}
//                     </motion.div>
//                 </div>
//             </div>
//         </>
//     )
// }
//
// export default AdminUsersPage