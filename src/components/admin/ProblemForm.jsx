// src/components/admin/ProblemForm.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DIFFICULTY, TOPICS } from '../../config/constants.js'
import {
    X, Save, Plus, Eye, EyeOff,
    ChevronDown, ChevronUp, Lightbulb, AlertCircle
} from 'lucide-react'

const EMPTY_TC = { input:'', expectedOutput:'', isHidden:true, points:10 }

const ProblemForm = ({
                         form,
                         setForm,
                         editingId,
                         saving,
                         onSave,
                         onClose,
                     }) => {
    const [tcExpanded,   setTcExpanded]   = useState(true)
    const [hintExpanded, setHintExpanded] = useState(true)
    const [errors,       setErrors]       = useState({})

    const f = (k, v) => {
        setForm(prev => ({ ...prev, [k]: v }))
        if (errors[k]) setErrors(prev => ({ ...prev, [k]: null }))
    }

    const validate = () => {
        const e = {}
        if (!form.title?.trim())       e.title       = 'Title is required'
        if (!form.description?.trim()) e.description = 'Description is required'
        if (!form.sampleInput?.trim()) e.sampleInput = 'Sample input is required'
        if (!form.sampleOutput?.trim())e.sampleOutput= 'Sample output is required'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSave = () => { if (validate()) onSave() }

    // TestCase helpers
    const addTc    = () => setForm(p => ({ ...p, testCases:[...p.testCases, {...EMPTY_TC}] }))
    const removeTc = (i) => setForm(p => ({ ...p, testCases:p.testCases.filter((_,idx)=>idx!==i) }))
    const updateTc = (i,k,v) => setForm(p => {
        const tcs=[...p.testCases]; tcs[i]={...tcs[i],[k]:v}; return {...p,testCases:tcs}
    })

    const hintCount = form.hints?.split('\n').filter(h=>h.trim()).length || 0

    return (
        <>
            <style>{`
                .pf-input { width:100%; padding:9px 12px; border-radius:8px; background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.1); color:#e2e8f0; font-size:13px; font-family:'JetBrains Mono',monospace; outline:none; transition:all .2s; box-sizing:border-box; }
                .pf-input:focus { border-color:rgba(96,165,250,.35); background:rgba(96,165,250,.04); box-shadow:0 0 0 3px rgba(96,165,250,.06); }
                .pf-input.error { border-color:rgba(239,68,68,.4); background:rgba(239,68,68,.04); }
                .pf-lbl { font-size:10px; font-weight:700; color:rgba(148,163,184,.5); letter-spacing:.08em; text-transform:uppercase; margin-bottom:5px; font-family:'JetBrains Mono',monospace; display:flex; align-items:center; gap:5px; }
                .pf-ta { width:100%; padding:9px 12px; border-radius:8px; background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.1); color:#e2e8f0; font-size:12.5px; font-family:'JetBrains Mono',monospace; outline:none; transition:all .2s; resize:vertical; min-height:70px; box-sizing:border-box; }
                .pf-ta:focus { border-color:rgba(96,165,250,.35); }
                .pf-ta.error { border-color:rgba(239,68,68,.4); }
                .pf-err { font-size:10.5px; color:#f87171; font-family:'JetBrains Mono',monospace; margin-top:4px; display:flex; align-items:center; gap:4px; }
                .pf-sec { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-radius:9px; cursor:pointer; margin-bottom:10px; transition:opacity .2s; }
                .pf-sec:hover { opacity:.85; }
                .pf-tc-card { background:rgba(226,232,240,.03); border:1px solid rgba(226,232,240,.07); border-radius:10px; padding:14px; margin-bottom:10px; }
                .pf-tc-card.hidden { border-color:rgba(251,191,36,.15); background:rgba(251,191,36,.03); }
                .pf-toggle { display:flex; align-items:center; gap:5px; padding:4px 10px; border-radius:7px; font-size:11px; font-weight:600; cursor:pointer; border:1px solid; font-family:'JetBrains Mono',monospace; transition:all .2s; background:none; }
            `}</style>

            {/* Modal Header */}
            <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(226,232,240,.08)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                    <div style={{ fontSize:16, fontWeight:800, color:'#e2e8f0' }}>
                        {editingId ? 'Edit Problem' : 'Add New Problem'}
                    </div>
                    <div style={{ fontSize:11, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", marginTop:2 }}>
                        {editingId ? `Editing Problem #${editingId}` : 'Fill all required fields *'}
                    </div>
                </div>
                <motion.button
                    whileHover={{ rotate:90, scale:1.1 }}
                    whileTap={{ scale:.9 }}
                    onClick={onClose}
                    style={{ background:'rgba(226,232,240,.06)', border:'1px solid rgba(226,232,240,.1)', borderRadius:8, color:'rgba(148,163,184,.6)', cursor:'pointer', display:'flex', padding:6 }}
                >
                    <X size={16}/>
                </motion.button>
            </div>

            {/* Modal Body */}
            <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:14, overflowY:'auto', maxHeight:'calc(90vh - 140px)' }}>

                {/* Title */}
                <div>
                    <div className="pf-lbl">Title <span style={{color:'#f87171'}}>*</span></div>
                    <input
                        className={`pf-input ${errors.title ? 'error' : ''}`}
                        value={form.title}
                        onChange={e => f('title', e.target.value)}
                        placeholder="e.g. Two Sum, Reverse a String"
                    />
                    {errors.title && <div className="pf-err"><AlertCircle size={10}/>{errors.title}</div>}
                </div>

                {/* Difficulty + Topic */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div>
                        <div className="pf-lbl">Difficulty</div>
                        <select className="pf-input" value={form.difficulty} onChange={e => f('difficulty', e.target.value)}>
                            {Object.values(DIFFICULTY).map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <div className="pf-lbl">Topic</div>
                        <select className="pf-input" value={form.topic} onChange={e => f('topic', e.target.value)}>
                            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <div className="pf-lbl">Description <span style={{color:'#f87171'}}>*</span></div>
                    <textarea
                        className={`pf-ta ${errors.description ? 'error' : ''}`}
                        value={form.description}
                        onChange={e => f('description', e.target.value)}
                        placeholder="Explain the problem clearly. Markdown supported."
                        style={{ minHeight:110 }}
                    />
                    {errors.description && <div className="pf-err"><AlertCircle size={10}/>{errors.description}</div>}
                </div>

                {/* Sample Input / Output */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div>
                        <div className="pf-lbl">Sample Input <span style={{color:'#f87171'}}>*</span></div>
                        <textarea
                            className={`pf-ta ${errors.sampleInput ? 'error' : ''}`}
                            value={form.sampleInput}
                            onChange={e => f('sampleInput', e.target.value)}
                            placeholder="5&#10;1 2 3 4 5"
                            style={{ minHeight:80 }}
                        />
                        {errors.sampleInput && <div className="pf-err"><AlertCircle size={10}/>{errors.sampleInput}</div>}
                    </div>
                    <div>
                        <div className="pf-lbl">Sample Output <span style={{color:'#f87171'}}>*</span></div>
                        <textarea
                            className={`pf-ta ${errors.sampleOutput ? 'error' : ''}`}
                            value={form.sampleOutput}
                            onChange={e => f('sampleOutput', e.target.value)}
                            placeholder="15"
                            style={{ minHeight:80 }}
                        />
                        {errors.sampleOutput && <div className="pf-err"><AlertCircle size={10}/>{errors.sampleOutput}</div>}
                    </div>
                </div>

                {/* Constraints */}
                <div>
                    <div className="pf-lbl">Constraints</div>
                    <input className="pf-input" value={form.constraints} onChange={e => f('constraints', e.target.value)} placeholder="1 <= N <= 10^5, -10^9 <= arr[i] <= 10^9" />
                </div>

                {/* Time / Memory / Score */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                    <div>
                        <div className="pf-lbl">⏱ Time (ms)</div>
                        <input className="pf-input" type="number" value={form.timeLimitMs} onChange={e => f('timeLimitMs', Number(e.target.value))} />
                    </div>
                    <div>
                        <div className="pf-lbl">💾 Memory (MB)</div>
                        <input className="pf-input" type="number" value={form.memoryLimitMb} onChange={e => f('memoryLimitMb', Number(e.target.value))} />
                    </div>
                    <div>
                        <div className="pf-lbl">🏆 Max Score</div>
                        <input className="pf-input" type="number" value={form.maxScore} onChange={e => f('maxScore', Number(e.target.value))} />
                    </div>
                </div>

                {/* Contributor */}
                <div>
                    <div className="pf-lbl">Contributor</div>
                    <input className="pf-input" value={form.contributorName} onChange={e => f('contributorName', e.target.value)} placeholder="Your name" />
                </div>

                {/* ── HINTS SECTION ── */}
                <div>
                    <div
                        className="pf-sec"
                        style={{ background:'rgba(245,158,11,.05)', border:'1px solid rgba(245,158,11,.15)' }}
                        onClick={() => setHintExpanded(e => !e)}
                    >
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <Lightbulb size={13} style={{ color:'#f59e0b' }}/>
                            <span style={{ fontSize:12, fontWeight:700, color:'#f59e0b', fontFamily:"'JetBrains Mono',monospace" }}>Hints</span>
                            <span style={{ padding:'1px 8px', borderRadius:6, background:'rgba(245,158,11,.15)', color:'#f59e0b', fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>
                                {hintCount}
                            </span>
                        </div>
                        {hintExpanded ? <ChevronUp size={14} style={{color:'#f59e0b'}}/> : <ChevronDown size={14} style={{color:'#f59e0b'}}/>}
                    </div>
                    <AnimatePresence>
                        {hintExpanded && (
                            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}>
                                <textarea
                                    className="pf-ta"
                                    value={form.hints}
                                    onChange={e => f('hints', e.target.value)}
                                    placeholder={`Think about sorting the array first\nConsider using a hash map for O(1) lookup\nTwo pointer approach works efficiently here`}
                                    style={{ minHeight:90, fontSize:12, borderColor:'rgba(245,158,11,.15)', background:'rgba(245,158,11,.03)' }}
                                />
                                <div style={{ fontSize:10, color:'rgba(148,163,184,.3)', fontFamily:"'JetBrains Mono',monospace", marginTop:4 }}>
                                    💡 Har hint ek alag line pe likho
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── TEST CASES SECTION ── */}
                <div>
                    <div
                        className="pf-sec"
                        style={{ background:'rgba(96,165,250,.06)', border:'1px solid rgba(96,165,250,.15)' }}
                        onClick={() => setTcExpanded(e => !e)}
                    >
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ fontSize:12, fontWeight:700, color:'#60a5fa', fontFamily:"'JetBrains Mono',monospace" }}>Test Cases</span>
                            <span style={{ padding:'1px 8px', borderRadius:6, background:'rgba(96,165,250,.15)', color:'#60a5fa', fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>
                                {form.testCases?.length || 0}
                            </span>
                            <span style={{ padding:'1px 8px', borderRadius:6, background:'rgba(251,191,36,.1)', color:'#fbbf24', fontSize:10, fontFamily:"'JetBrains Mono',monospace" }}>
                                {form.testCases?.filter(t=>t.isHidden).length || 0} hidden
                            </span>
                        </div>
                        {tcExpanded ? <ChevronUp size={14} style={{color:'#60a5fa'}}/> : <ChevronDown size={14} style={{color:'#60a5fa'}}/>}
                    </div>

                    <AnimatePresence>
                        {tcExpanded && (
                            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}>
                                {!form.testCases?.length && (
                                    <div style={{ textAlign:'center', padding:'20px', fontSize:12, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", background:'rgba(226,232,240,.02)', borderRadius:8, marginBottom:10, border:'1px dashed rgba(226,232,240,.08)' }}>
                                        No test cases — add at least one to enable Submit
                                    </div>
                                )}
                                <AnimatePresence>
                                    {form.testCases?.map((tc, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity:0, y:-8 }}
                                            animate={{ opacity:1, y:0 }}
                                            exit={{ opacity:0, x:-20, height:0 }}
                                            transition={{ duration:.2 }}
                                            className={`pf-tc-card ${tc.isHidden ? 'hidden' : ''}`}
                                        >
                                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                                    <span style={{ fontSize:11, fontWeight:700, color:'rgba(148,163,184,.6)', fontFamily:"'JetBrains Mono',monospace" }}>
                                                        #{i+1}
                                                    </span>
                                                    {tc.isHidden
                                                        ? <span style={{ padding:'1px 7px', borderRadius:5, background:'rgba(251,191,36,.1)', color:'#fbbf24', fontSize:10, fontFamily:"'JetBrains Mono',monospace" }}>🔒 Hidden</span>
                                                        : <span style={{ padding:'1px 7px', borderRadius:5, background:'rgba(34,197,94,.1)', color:'#22c55e', fontSize:10, fontFamily:"'JetBrains Mono',monospace" }}>👁 Visible</span>
                                                    }
                                                </div>
                                                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                                                        <span style={{ fontSize:10, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace" }}>pts:</span>
                                                        <input
                                                            type="number"
                                                            value={tc.points}
                                                            onChange={e => updateTc(i,'points',Number(e.target.value))}
                                                            style={{ width:48, padding:'3px 6px', borderRadius:5, background:'rgba(226,232,240,.06)', border:'1px solid rgba(226,232,240,.1)', color:'#e2e8f0', fontSize:11, fontFamily:"'JetBrains Mono',monospace", outline:'none' }}
                                                        />
                                                    </div>
                                                    <button
                                                        className="pf-toggle"
                                                        onClick={() => updateTc(i,'isHidden',!tc.isHidden)}
                                                        style={{ borderColor: tc.isHidden ? 'rgba(251,191,36,.2)':'rgba(34,197,94,.2)', color: tc.isHidden ? '#fbbf24':'#22c55e' }}
                                                    >
                                                        {tc.isHidden ? <EyeOff size={10}/> : <Eye size={10}/>}
                                                        {tc.isHidden ? 'Hidden' : 'Visible'}
                                                    </button>
                                                    <motion.button
                                                        whileHover={{ scale:1.1 }}
                                                        whileTap={{ scale:.9 }}
                                                        onClick={() => removeTc(i)}
                                                        style={{ display:'flex', alignItems:'center', justifyContent:'center', width:26, height:26, borderRadius:6, background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', color:'#f87171', cursor:'pointer' }}
                                                    >
                                                        <X size={11}/>
                                                    </motion.button>
                                                </div>
                                            </div>
                                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                                                <div>
                                                    <div className="pf-lbl">Input</div>
                                                    <textarea className="pf-ta" value={tc.input} onChange={e => updateTc(i,'input',e.target.value)} placeholder="Test input" style={{ minHeight:60, fontSize:12 }} />
                                                </div>
                                                <div>
                                                    <div className="pf-lbl">Expected Output</div>
                                                    <textarea className="pf-ta" value={tc.expectedOutput} onChange={e => updateTc(i,'expectedOutput',e.target.value)} placeholder="Expected output" style={{ minHeight:60, fontSize:12 }} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <motion.button
                                    whileHover={{ scale:1.02 }}
                                    whileTap={{ scale:.98 }}
                                    onClick={addTc}
                                    style={{ display:'flex', alignItems:'center', gap:7, width:'100%', padding:'10px', borderRadius:9, background:'rgba(96,165,250,.05)', border:'1px dashed rgba(96,165,250,.2)', color:'#60a5fa', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif", justifyContent:'center' }}
                                >
                                    <Plus size={13}/> Add Test Case
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Save / Cancel ── */}
                <div style={{ display:'flex', gap:8, justifyContent:'flex-end', paddingTop:14, borderTop:'1px solid rgba(226,232,240,.07)' }}>
                    <motion.button
                        whileHover={{ scale:1.02 }}
                        whileTap={{ scale:.97 }}
                        onClick={onClose}
                        style={{ padding:'9px 18px', borderRadius:9, background:'rgba(226,232,240,.04)', border:'1px solid rgba(226,232,240,.1)', color:'rgba(148,163,184,.6)', fontSize:13, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        whileHover={{ scale:1.02, boxShadow:'0 6px 20px rgba(96,165,250,.3)' }}
                        whileTap={{ scale:.97 }}
                        onClick={handleSave}
                        disabled={saving}
                        style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 22px', borderRadius:9, background:'linear-gradient(135deg,#60a5fa,#818cf8)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif", opacity: saving?.7:1 }}
                    >
                        {saving
                            ? <><div style={{ width:12, height:12, border:'2px solid rgba(255,255,255,.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin .7s linear infinite' }}/> Saving...</>
                            : <><Save size={13}/> Save{form.testCases?.length > 0 ? ` + ${form.testCases.length} TC` : ''}</>
                        }
                    </motion.button>
                </div>
            </div>
        </>
    )
}

export default ProblemForm