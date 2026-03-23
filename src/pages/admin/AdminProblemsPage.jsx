// src/pages/admin/AdminProblemsPage.jsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { addProblem, updateProblem, deleteProblem, getAdminProblemById } from '../../api/adminApi.js'
import { getAllProblems } from '../../api/problemApi.js'
import Navbar from '../../components/common/Navbar.jsx'
import { DIFFICULTY, TOPICS } from '../../config/constants.js'
import { Plus, Edit3, Trash2, X, Save, Search, Eye, EyeOff, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'

const EMPTY_FORM = {
    title:'', description:'', difficulty:'Easy', topic:'Arrays',
    inputFormat:'', outputFormat:'', sampleInput:'', sampleOutput:'',
    constraints:'', timeLimitMs:2000, memoryLimitMb:256, maxScore:100,
    contributorName:'', hints:'',
    testCases: []
}

const EMPTY_TC = { input:'', expectedOutput:'', isHidden:true, points:10 }

const diffColor = d => d==='Easy'
    ? {c:'#22c55e',b:'rgba(34,197,94,.08)',br:'rgba(34,197,94,.2)'}
    : d==='Medium'
        ? {c:'#f59e0b',b:'rgba(245,158,11,.08)',br:'rgba(245,158,11,.2)'}
        : {c:'#ef4444',b:'rgba(239,68,68,.08)',br:'rgba(239,68,68,.2)'}

const AdminProblemsPage = () => {
    const [problems, setProblems]     = useState([])
    const [loading, setLoading]       = useState(true)
    const [search, setSearch]         = useState('')
    const [diffFilter, setDiff]       = useState('All')
    const [showModal, setShowModal]   = useState(false)
    const [editingId, setEditingId]   = useState(null)
    const [form, setForm]             = useState(EMPTY_FORM)
    const [saving, setSaving]         = useState(false)
    const [deleting, setDeleting]     = useState(null)
    const [msg, setMsg]               = useState(null)
    const [tcExpanded, setTcExpanded] = useState(true)
    const [hintExpanded, setHintExpanded] = useState(true)

    const load = async () => {
        try { setLoading(true); const r = await getAllProblems(); setProblems(r.data || []) }
        catch { setProblems([]) } finally { setLoading(false) }
    }

    useEffect(() => { load() }, [])

    const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3000) }

    const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true) }

    const openEdit = async (p) => {
        setForm({
            title:p.title||'', description:p.description||'',
            difficulty:p.difficulty||'Easy', topic:p.topic||'Arrays',
            inputFormat:p.inputFormat||'', outputFormat:p.outputFormat||'',
            sampleInput:p.sampleInput||'', sampleOutput:p.sampleOutput||'',
            constraints:p.constraints||'', timeLimitMs:p.timeLimitMs||2000,
            memoryLimitMb:p.memoryLimitMb||256, maxScore:p.maxScore||100,
            contributorName:p.contributorName||'',
            hints: p.hints || '',
            testCases: []
        })
        setEditingId(p.id)
        setShowModal(true)

        try {
            const res = await getAdminProblemById(p.id)
            const tcs = res.data?.testCases || []
            setForm(prev => ({
                ...prev,
                testCases: tcs.map(tc => ({
                    id: tc.id, input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    isHidden: tc.isHidden, points: tc.points,
                }))
            }))
        } catch {}
    }

    const handleSave = async () => {
        if (!form.title.trim()) return
        try {
            setSaving(true)
            if (editingId) await updateProblem(editingId, form)
            else           await addProblem(form)
            showMsg('success', editingId ? 'Problem updated!' : 'Problem added!')
            setShowModal(false)
            await load()
        } catch { showMsg('error', 'Failed to save problem.') }
        finally  { setSaving(false) }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this problem and all its test cases?')) return
        try {
            setDeleting(id); await deleteProblem(id)
            showMsg('success', 'Problem deleted!'); await load()
        } catch { showMsg('error', 'Failed to delete.') }
        finally  { setDeleting(null) }
    }

    const addTc    = () => setForm(prev => ({ ...prev, testCases: [...prev.testCases, { ...EMPTY_TC }] }))
    const removeTc = (i) => setForm(prev => ({ ...prev, testCases: prev.testCases.filter((_,idx)=>idx!==i) }))
    const updateTc = (i, key, val) => setForm(prev => {
        const tcs = [...prev.testCases]; tcs[i] = { ...tcs[i], [key]: val }
        return { ...prev, testCases: tcs }
    })

    const filtered = problems.filter(p => {
        const ms = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.topic?.toLowerCase().includes(search.toLowerCase())
        const md = diffFilter === 'All' || p.difficulty === diffFilter
        return ms && md
    })

    const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

    const hintCount = form.hints?.split('\n').filter(h => h.trim()).length || 0

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
                @keyframes ap-grid  { 0%,100%{opacity:.02} 50%{opacity:.05} }
                @keyframes ap-glow  { 0%,100%{opacity:.07} 50%{opacity:.14} }
                @keyframes ap-skel  { 0%{background-position:200% center} 100%{background-position:-200% center} }
                @keyframes ap-modal { from{opacity:0;transform:scale(.96) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
                .ap-page { min-height:100vh; background:#06080e; font-family:'Space Grotesk',sans-serif; }
                .ap-grid { position:fixed; inset:0; background:repeating-linear-gradient(90deg,rgba(226,232,240,.018) 0,transparent 1px,transparent 80px),repeating-linear-gradient(180deg,rgba(226,232,240,.018) 0,transparent 1px,transparent 80px); animation:ap-grid 5s ease-in-out infinite; pointer-events:none; z-index:0; }
                .ap-glow { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; animation:ap-glow 5s ease-in-out infinite; }
                .ap-inner { max-width:1100px; margin:0 auto; padding:28px 24px 60px; position:relative; z-index:1; }
                .ap-sel { padding:8px 12px; border-radius:9px; background:rgba(226,232,240,.04); border:1px solid rgba(226,232,240,.1); color:rgba(226,232,240,.7); font-size:12.5px; font-family:'Space Grotesk',sans-serif; cursor:pointer; outline:none; }
                .ap-thead { display:grid; grid-template-columns:60px 1fr 100px 110px 90px 100px; padding:9px 16px; background:rgba(226,232,240,.025); border-bottom:1px solid rgba(226,232,240,.07); font-size:10px; font-weight:700; color:rgba(148,163,184,.4); letter-spacing:.07em; text-transform:uppercase; font-family:'JetBrains Mono',monospace; border-radius:10px 10px 0 0; }
                .ap-row { display:grid; grid-template-columns:60px 1fr 100px 110px 90px 100px; padding:13px 16px; border-bottom:1px solid rgba(226,232,240,.05); align-items:center; transition:background .2s; }
                .ap-row:hover { background:rgba(226,232,240,.03); }
                .ap-skel { height:52px; background:linear-gradient(90deg,rgba(226,232,240,.04) 25%,rgba(226,232,240,.08) 50%,rgba(226,232,240,.04) 75%); background-size:200% auto; animation:ap-skel 1.5s linear infinite; border-bottom:1px solid rgba(226,232,240,.05); }
                .ap-icon-btn { display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:7px; cursor:pointer; transition:all .2s; border:1px solid; background:none; }
                .ap-overlay { position:fixed; inset:0; background:rgba(0,0,0,.7); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(4px); }
                .ap-modal { background:#0d1117; border:1px solid rgba(226,232,240,.12); border-radius:16px; width:100%; max-width:700px; max-height:90vh; overflow-y:auto; animation:ap-modal .3s ease-out both; }
                .ap-modal::-webkit-scrollbar { width:4px; }
                .ap-modal::-webkit-scrollbar-thumb { background:rgba(226,232,240,.1); border-radius:2px; }
                .ap-input { width:100%; padding:9px 12px; border-radius:8px; background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.1); color:#e2e8f0; font-size:13px; font-family:'JetBrains Mono',monospace; outline:none; transition:all .2s; box-sizing:border-box; }
                .ap-input:focus { border-color:rgba(96,165,250,.35); background:rgba(96,165,250,.04); }
                .ap-lbl { font-size:10px; font-weight:700; color:rgba(148,163,184,.5); letter-spacing:.08em; text-transform:uppercase; margin-bottom:5px; font-family:'JetBrains Mono',monospace; }
                .ap-ta { width:100%; padding:9px 12px; border-radius:8px; background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.1); color:#e2e8f0; font-size:12.5px; font-family:'JetBrains Mono',monospace; outline:none; transition:all .2s; resize:vertical; min-height:70px; box-sizing:border-box; }
                .ap-ta:focus { border-color:rgba(96,165,250,.35); }
                .ap-tc-card { background:rgba(226,232,240,.03); border:1px solid rgba(226,232,240,.07); border-radius:10px; padding:14px; margin-bottom:10px; position:relative; }
                .ap-tc-card.hidden-tc { border-color:rgba(251,191,36,.15); background:rgba(251,191,36,.03); }
                .ap-toggle { display:flex; align-items:center; gap:6px; padding:5px 10px; border-radius:7px; font-size:11px; font-weight:600; cursor:pointer; border:1px solid; font-family:'JetBrains Mono',monospace; transition:all .2s; background:none; }
                .ap-section-header { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-radius:9px; cursor:pointer; margin-bottom:10px; transition:all .2s; }
                .ap-section-header:hover { opacity:.85; }
            `}</style>

            <div className="ap-page">
                <div className="ap-grid" />
                <div className="ap-glow" style={{ width:500, height:400, background:'rgba(96,165,250,.05)', top:-100, left:'20%' }} />
                <div className="ap-glow" style={{ width:300, height:300, background:'rgba(167,139,250,.04)', bottom:'10%', right:'5%', animationDelay:'2s' }} />
                <Navbar />
                <div style={{ height:72 }} />

                <div className="ap-inner">
                    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4 }}
                                style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:24 }}>
                        <div>
                            <div style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:'rgba(167,139,250,.5)', letterSpacing:'.18em', textTransform:'uppercase', marginBottom:6 }}>// Admin</div>
                            <div style={{ fontSize:24, fontWeight:800, color:'#e2e8f0', letterSpacing:'-.03em' }}>
                                Problems <span style={{ background:'linear-gradient(90deg,#60a5fa,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{problems.length}</span>
                            </div>
                            <div style={{ fontSize:13, color:'rgba(148,163,184,.5)', marginTop:4 }}>Add, edit, and manage DSA problems with test cases</div>
                        </div>
                        <button onClick={openAdd} style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 20px', borderRadius:10, background:'linear-gradient(135deg,#60a5fa,#818cf8)', border:'none', color:'#fff', fontSize:13.5, fontWeight:700, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}>
                            <Plus size={15} /> Add Problem
                        </button>
                    </motion.div>

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
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search problems..." style={{ background:'none', border:'none', outline:'none', color:'#e2e8f0', fontSize:13, fontFamily:"'JetBrains Mono',monospace", width:'100%' }} />
                        </div>
                        <select className="ap-sel" value={diffFilter} onChange={e => setDiff(e.target.value)}>
                            <option value="All">All Difficulty</option>
                            {Object.values(DIFFICULTY).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </motion.div>

                    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2 }}
                                style={{ border:'1px solid rgba(226,232,240,.07)', borderRadius:12, overflow:'hidden' }}>
                        <div className="ap-thead"><div>#</div><div>Title</div><div>Topic</div><div>Difficulty</div><div>Score</div><div>Actions</div></div>
                        {loading ? Array(5).fill(0).map((_,i) => <div key={i} className="ap-skel" />) :
                            filtered.length === 0 ? (
                                <div style={{ padding:'60px 20px', textAlign:'center' }}>
                                    <div style={{ fontSize:32, marginBottom:12 }}>📋</div>
                                    <div style={{ fontSize:14, fontWeight:600, color:'rgba(226,232,240,.6)', marginBottom:6 }}>No problems found</div>
                                    <button onClick={openAdd} style={{ marginTop:8, padding:'8px 18px', borderRadius:8, background:'rgba(96,165,250,.1)', border:'1px solid rgba(96,165,250,.2)', color:'#60a5fa', fontSize:13, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}>Add First Problem</button>
                                </div>
                            ) : filtered.map((p, i) => {
                                const dc = diffColor(p.difficulty)
                                return (
                                    <motion.div key={p.id||i} className="ap-row" initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*.03 }}>
                                        <div style={{ fontSize:11, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace" }}>#{p.id}</div>
                                        <div style={{ fontSize:13.5, fontWeight:600, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</div>
                                        <div style={{ fontSize:11.5, color:'rgba(148,163,184,.5)', fontFamily:"'JetBrains Mono',monospace" }}>{p.topic}</div>
                                        <div><span style={{ padding:'2px 9px', borderRadius:8, fontSize:11, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", background:dc.b, color:dc.c, border:`1px solid ${dc.br}` }}>{p.difficulty}</span></div>
                                        <div style={{ fontSize:12, color:'rgba(148,163,184,.5)', fontFamily:"'JetBrains Mono',monospace" }}>{p.maxScore}</div>
                                        <div style={{ display:'flex', gap:6 }}>
                                            <button className="ap-icon-btn" style={{ background:'rgba(96,165,250,.08)', borderColor:'rgba(96,165,250,.2)', color:'#60a5fa' }} onClick={() => openEdit(p)}><Edit3 size={13} /></button>
                                            <button className="ap-icon-btn" style={{ background:'rgba(239,68,68,.08)', borderColor:'rgba(239,68,68,.2)', color:'#f87171', opacity: deleting===p.id?.5:1 }} onClick={() => handleDelete(p.id)} disabled={deleting===p.id}><Trash2 size={13} /></button>
                                        </div>
                                    </motion.div>
                                )
                            })}
                    </motion.div>
                </div>
            </div>

            {/* ── MODAL ── */}
            <AnimatePresence>
                {showModal && (
                    <motion.div className="ap-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                                onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                        <div className="ap-modal">
                            <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(226,232,240,.08)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                <div style={{ fontSize:16, fontWeight:800, color:'#e2e8f0' }}>{editingId ? 'Edit Problem' : 'Add New Problem'}</div>
                                <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', color:'rgba(148,163,184,.5)', cursor:'pointer', display:'flex' }}><X size={18} /></button>
                            </div>

                            <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 }}>

                                {/* Basic Info */}
                                <div><div className="ap-lbl">Title *</div><input className="ap-input" value={form.title} onChange={e => f('title', e.target.value)} placeholder="Problem title" /></div>

                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                                    <div><div className="ap-lbl">Difficulty</div>
                                        <select className="ap-input" value={form.difficulty} onChange={e => f('difficulty', e.target.value)}>
                                            {Object.values(DIFFICULTY).map(d => <option key={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div><div className="ap-lbl">Topic</div>
                                        <select className="ap-input" value={form.topic} onChange={e => f('topic', e.target.value)}>
                                            {TOPICS.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div><div className="ap-lbl">Description</div>
                                    <textarea className="ap-ta" value={form.description} onChange={e => f('description', e.target.value)} placeholder="Problem description (markdown supported)" style={{ minHeight:100 }} />
                                </div>

                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                                    <div><div className="ap-lbl">Sample Input</div><textarea className="ap-ta" value={form.sampleInput} onChange={e => f('sampleInput', e.target.value)} placeholder="Sample input" /></div>
                                    <div><div className="ap-lbl">Sample Output</div><textarea className="ap-ta" value={form.sampleOutput} onChange={e => f('sampleOutput', e.target.value)} placeholder="Sample output" /></div>
                                </div>

                                <div><div className="ap-lbl">Constraints</div><input className="ap-input" value={form.constraints} onChange={e => f('constraints', e.target.value)} placeholder="e.g. 1 <= n <= 10^5" /></div>

                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                                    <div><div className="ap-lbl">Time (ms)</div><input className="ap-input" type="number" value={form.timeLimitMs} onChange={e => f('timeLimitMs', Number(e.target.value))} /></div>
                                    <div><div className="ap-lbl">Memory (MB)</div><input className="ap-input" type="number" value={form.memoryLimitMb} onChange={e => f('memoryLimitMb', Number(e.target.value))} /></div>
                                    <div><div className="ap-lbl">Max Score</div><input className="ap-input" type="number" value={form.maxScore} onChange={e => f('maxScore', Number(e.target.value))} /></div>
                                </div>

                                <div><div className="ap-lbl">Contributor</div><input className="ap-input" value={form.contributorName} onChange={e => f('contributorName', e.target.value)} placeholder="Your name" /></div>

                                {/* ── HINTS SECTION ── */}
                                <div>
                                    <div className="ap-section-header"
                                         style={{ background:'rgba(245,158,11,.05)', border:'1px solid rgba(245,158,11,.15)' }}
                                         onClick={() => setHintExpanded(e => !e)}>
                                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                            <Lightbulb size={13} style={{ color:'#f59e0b' }}/>
                                            <div style={{ fontSize:12, fontWeight:700, color:'#f59e0b', fontFamily:"'JetBrains Mono',monospace" }}>Hints</div>
                                            <span style={{ padding:'1px 8px', borderRadius:6, background:'rgba(245,158,11,.15)', color:'#f59e0b', fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>
                                                {hintCount}
                                            </span>
                                        </div>
                                        {hintExpanded
                                            ? <ChevronUp   size={14} style={{ color:'#f59e0b' }}/>
                                            : <ChevronDown size={14} style={{ color:'#f59e0b' }}/>
                                        }
                                    </div>

                                    <AnimatePresence>
                                        {hintExpanded && (
                                            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}>
                                                <textarea
                                                    className="ap-ta"
                                                    value={form.hints}
                                                    onChange={e => f('hints', e.target.value)}
                                                    placeholder={`Think about sorting the array first\nConsider using a hash map for O(1) lookup\nTwo pointer approach works efficiently here`}
                                                    style={{ minHeight:90, fontSize:12, borderColor:'rgba(245,158,11,.15)', background:'rgba(245,158,11,.03)' }}
                                                />
                                                <div style={{ fontSize:10, color:'rgba(148,163,184,.3)', fontFamily:"'JetBrains Mono',monospace", marginTop:4 }}>
                                                    💡 Har hint ek alag line pe likho — students ek ek karke reveal kar sakte hain
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* ── TEST CASES SECTION ── */}
                                <div>
                                    <div className="ap-section-header"
                                         style={{ background:'rgba(96,165,250,.06)', border:'1px solid rgba(96,165,250,.15)' }}
                                         onClick={() => setTcExpanded(e => !e)}>
                                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                            <div style={{ fontSize:12, fontWeight:700, color:'#60a5fa', fontFamily:"'JetBrains Mono',monospace" }}>Test Cases</div>
                                            <span style={{ padding:'1px 8px', borderRadius:6, background:'rgba(96,165,250,.15)', color:'#60a5fa', fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>
                                                {form.testCases.length}
                                            </span>
                                            <span style={{ padding:'1px 8px', borderRadius:6, background:'rgba(251,191,36,.1)', color:'#fbbf24', fontSize:10, fontFamily:"'JetBrains Mono',monospace" }}>
                                                {form.testCases.filter(t=>t.isHidden).length} hidden
                                            </span>
                                        </div>
                                        {tcExpanded
                                            ? <ChevronUp   size={14} style={{ color:'#60a5fa' }}/>
                                            : <ChevronDown size={14} style={{ color:'#60a5fa' }}/>
                                        }
                                    </div>

                                    <AnimatePresence>
                                        {tcExpanded && (
                                            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}>
                                                {form.testCases.length === 0 && (
                                                    <div style={{ textAlign:'center', padding:'20px', fontSize:12, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", background:'rgba(226,232,240,.02)', borderRadius:8, marginBottom:10, border:'1px dashed rgba(226,232,240,.08)' }}>
                                                        No test cases yet — add at least one to enable Submit
                                                    </div>
                                                )}
                                                {form.testCases.map((tc, i) => (
                                                    <div key={i} className={`ap-tc-card ${tc.isHidden ? 'hidden-tc' : ''}`}>
                                                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                                                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                                                <span style={{ fontSize:11, fontWeight:700, color:'rgba(148,163,184,.6)', fontFamily:"'JetBrains Mono',monospace" }}>Test Case #{i+1}</span>
                                                                {tc.isHidden
                                                                    ? <span style={{ padding:'1px 7px', borderRadius:5, background:'rgba(251,191,36,.1)', color:'#fbbf24', fontSize:10, fontFamily:"'JetBrains Mono',monospace" }}>🔒 Hidden</span>
                                                                    : <span style={{ padding:'1px 7px', borderRadius:5, background:'rgba(34,197,94,.1)', color:'#22c55e', fontSize:10, fontFamily:"'JetBrains Mono',monospace" }}>👁 Visible</span>
                                                                }
                                                            </div>
                                                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                                                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                                                                    <span style={{ fontSize:10, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace" }}>pts:</span>
                                                                    <input type="number" value={tc.points} onChange={e => updateTc(i,'points',Number(e.target.value))}
                                                                           style={{ width:48, padding:'3px 6px', borderRadius:5, background:'rgba(226,232,240,.06)', border:'1px solid rgba(226,232,240,.1)', color:'#e2e8f0', fontSize:11, fontFamily:"'JetBrains Mono',monospace", outline:'none' }} />
                                                                </div>
                                                                <button className="ap-toggle" onClick={() => updateTc(i,'isHidden',!tc.isHidden)}
                                                                        style={{ borderColor: tc.isHidden ? 'rgba(251,191,36,.2)' : 'rgba(34,197,94,.2)', color: tc.isHidden ? '#fbbf24' : '#22c55e' }}>
                                                                    {tc.isHidden ? <EyeOff size={10}/> : <Eye size={10}/>}
                                                                    {tc.isHidden ? 'Hidden' : 'Visible'}
                                                                </button>
                                                                <button onClick={() => removeTc(i)}
                                                                        style={{ display:'flex', alignItems:'center', justifyContent:'center', width:24, height:24, borderRadius:6, background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', color:'#f87171', cursor:'pointer' }}>
                                                                    <X size={11}/>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                                                            <div>
                                                                <div className="ap-lbl">Input</div>
                                                                <textarea className="ap-ta" value={tc.input} onChange={e => updateTc(i,'input',e.target.value)} placeholder="Test case input" style={{ minHeight:60, fontSize:12 }} />
                                                            </div>
                                                            <div>
                                                                <div className="ap-lbl">Expected Output</div>
                                                                <textarea className="ap-ta" value={tc.expectedOutput} onChange={e => updateTc(i,'expectedOutput',e.target.value)} placeholder="Expected output" style={{ minHeight:60, fontSize:12 }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button onClick={addTc}
                                                        style={{ display:'flex', alignItems:'center', gap:7, width:'100%', padding:'10px', borderRadius:9, background:'rgba(96,165,250,.05)', border:'1px dashed rgba(96,165,250,.2)', color:'#60a5fa', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif", justifyContent:'center' }}>
                                                    <Plus size={13}/> Add Test Case
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Save Buttons */}
                                <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:4, paddingTop:14, borderTop:'1px solid rgba(226,232,240,.07)' }}>
                                    <button onClick={() => setShowModal(false)} style={{ padding:'9px 18px', borderRadius:9, background:'rgba(226,232,240,.04)', border:'1px solid rgba(226,232,240,.1)', color:'rgba(148,163,184,.6)', fontSize:13, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}>
                                        Cancel
                                    </button>
                                    <button onClick={handleSave} disabled={saving} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 20px', borderRadius:9, background:'linear-gradient(135deg,#60a5fa,#818cf8)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif", opacity: saving?.7:1 }}>
                                        <Save size={13} /> {saving ? 'Saving...' : `Save Problem${form.testCases.length > 0 ? ` + ${form.testCases.length} TC` : ''}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default AdminProblemsPage