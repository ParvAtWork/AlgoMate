// src/components/compiler/ResultPanel.jsx
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { SUBMISSION_STATUS } from '../../config/constants.js'
import { Spinner } from '../common/Loader.jsx'

// ── IO Box ───────────────────────────────────────────────────────
const IOBox = ({ label, value, color, bg, border }) => (
    <div style={{ marginBottom:8 }}>
        <div style={{ fontSize:9.5, fontWeight:700, color, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.1em', textTransform:'uppercase', marginBottom:4 }}>
            {label}
        </div>
        <div style={{ padding:'8px 12px', borderRadius:7, background:bg, border:`1px solid ${border}`, fontSize:12, fontFamily:"'JetBrains Mono',monospace", color, whiteSpace:'pre-wrap', lineHeight:1.65, maxHeight:80, overflowY:'auto' }}>
            {value || <span style={{opacity:.4}}>—</span>}
        </div>
    </div>
)

const ResultPanel = ({
                         height,
                         open,
                         onToggle,
                         isSubmitting,
                         isRunning,
                         currentSubmission,
                         runResult,
                     }) => {
    const dotColor = () => {
        if (!currentSubmission && !runResult) return null
        if (runResult?.passed) return '#22c55e'
        if (currentSubmission?.status === SUBMISSION_STATUS.ACCEPTED) return '#22c55e'
        if (currentSubmission?.status) return '#ef4444'
        return null
    }

    return (
        <div style={{ borderTop:'1px solid rgba(226,232,240,.07)', background:'rgba(6,8,14,.95)', flexShrink:0, transition:'height .35s cubic-bezier(.4,0,.2,1)', overflow:'hidden', height }}>

            {/* Header */}
            <div onClick={onToggle} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', cursor:'pointer', userSelect:'none', borderBottom:'1px solid rgba(226,232,240,.05)' }}>
                {open
                    ? <ChevronDown size={12} style={{color:'rgba(148,163,184,.5)'}}/>
                    : <ChevronUp   size={12} style={{color:'rgba(148,163,184,.5)'}}/>
                }
                <span style={{ fontSize:12, fontWeight:600, color:'rgba(148,163,184,.6)', fontFamily:"'JetBrains Mono',monospace" }}>
                    Test Results
                </span>
                {dotColor() && (
                    <div style={{ width:6, height:6, borderRadius:'50%', background:dotColor(), marginLeft:2 }}/>
                )}
                {currentSubmission?.executionTimeMs > 0 && (
                    <span style={{ marginLeft:'auto', fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.35)' }}>
                        ⚡ {Math.round(currentSubmission.executionTimeMs)}ms · 💾 {currentSubmission.memoryUsedMb?.toFixed(1)}MB
                    </span>
                )}
            </div>

            {/* Body */}
            <div style={{ padding:'14px 16px', overflowY:'auto', height:'calc(100% - 44px)' }}>

                {/* Loading */}
                {(isSubmitting || isRunning) && (
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <Spinner size={14}/>
                        <span style={{ fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.45)' }}>
                            {isSubmitting ? 'Submitting to judge...' : 'Running test cases...'}
                        </span>
                    </div>
                )}

                {/* Submission result */}
                {!isSubmitting && currentSubmission && (
                    <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
                        {/* Verdict */}
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, flexWrap:'wrap' }}>
                            <span style={{ fontSize:16, fontWeight:800, color:
                                    currentSubmission.status === SUBMISSION_STATUS.ACCEPTED ? '#22c55e' :
                                        currentSubmission.status === SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED ? '#f59e0b' : '#f87171'
                            }}>
                                {currentSubmission.status === SUBMISSION_STATUS.ACCEPTED ? '✓' :
                                    currentSubmission.status === SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED ? '⏱' : '✗'} {currentSubmission.status}
                            </span>
                            {currentSubmission.score > 0 && (
                                <span style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'#fbbf24', padding:'2px 8px', borderRadius:5, background:'rgba(251,191,36,.08)', border:'1px solid rgba(251,191,36,.2)' }}>
                                    +{currentSubmission.score} pts
                                </span>
                            )}
                        </div>

                        {/* Accepted */}
                        {currentSubmission.status === SUBMISSION_STATUS.ACCEPTED && (
                            <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(34,197,94,.06)', border:'1px solid rgba(34,197,94,.15)', display:'flex', alignItems:'center', gap:10 }}>
                                <CheckCircle2 size={16} style={{color:'#22c55e',flexShrink:0}}/>
                                <div>
                                    <div style={{ fontSize:13, fontWeight:700, color:'#22c55e' }}>All test cases passed!</div>
                                    <div style={{ fontSize:11, color:'rgba(34,197,94,.6)', fontFamily:"'JetBrains Mono',monospace", marginTop:2 }}>
                                        {currentSubmission.testCasesPassed}/{currentSubmission.totalTestCases} test cases
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Wrong Answer */}
                        {currentSubmission.status === SUBMISSION_STATUS.WRONG_ANSWER && (
                            <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay:.1}}>
                                <div style={{ padding:'7px 12px', borderRadius:8, background:'rgba(239,68,68,.06)', border:'1px solid rgba(239,68,68,.15)', marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                                    <XCircle size={13} style={{color:'#f87171',flexShrink:0}}/>
                                    <span style={{ fontSize:12, color:'rgba(248,113,113,.8)', fontFamily:"'JetBrains Mono',monospace" }}>Test case failed — check your logic</span>
                                </div>
                                <IOBox label="Input"           value={currentSubmission.testInput}      color="rgba(226,232,240,.7)" bg="rgba(226,232,240,.04)" border="rgba(226,232,240,.08)"/>
                                <IOBox label="Expected Output" value={currentSubmission.expectedOutput} color="#22c55e"               bg="rgba(34,197,94,.05)"   border="rgba(34,197,94,.12)"/>
                                <IOBox label="Your Output"     value={currentSubmission.actualOutput}   color="#f87171"               bg="rgba(239,68,68,.05)"   border="rgba(239,68,68,.12)"/>
                            </motion.div>
                        )}

                        {/* Compile Error */}
                        {currentSubmission.status === SUBMISSION_STATUS.COMPILATION_ERROR && (
                            <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay:.1}}>
                                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
                                    <AlertTriangle size={13} style={{color:'#f87171',flexShrink:0}}/>
                                    <span style={{ fontSize:11, fontWeight:700, color:'#f87171', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.06em', textTransform:'uppercase' }}>Compilation Error</span>
                                </div>
                                {currentSubmission.errorLines?.map((err,i) => (
                                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'7px 10px', borderRadius:7, background:'rgba(239,68,68,.05)', border:'1px solid rgba(239,68,68,.1)', marginBottom:5 }}>
                                        <span style={{ fontSize:10, fontWeight:800, color:'#f87171', fontFamily:"'JetBrains Mono',monospace", flexShrink:0, textTransform:'uppercase' }}>{err.type}</span>
                                        {err.line > 0 && (
                                            <span style={{ fontSize:10, color:'#60a5fa', fontFamily:"'JetBrains Mono',monospace", flexShrink:0, background:'rgba(96,165,250,.1)', padding:'1px 6px', borderRadius:4 }}>
                                                Line {err.line}{err.column ? `:${err.column}` : ''}
                                            </span>
                                        )}
                                        {err.code && <span style={{ fontSize:10, color:'rgba(129,140,248,.7)', fontFamily:"'JetBrains Mono',monospace" }}>[{err.code}]</span>}
                                        <span style={{ fontSize:11.5, color:'rgba(226,232,240,.75)', fontFamily:"'JetBrains Mono',monospace", flex:1, lineHeight:1.55 }}>{err.message}</span>
                                    </div>
                                ))}
                                <div style={{ padding:'10px 12px', borderRadius:7, background:'rgba(15,20,30,.7)', border:'1px solid rgba(239,68,68,.1)', fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'rgba(248,113,113,.75)', whiteSpace:'pre-wrap', lineHeight:1.65, maxHeight:100, overflowY:'auto' }}>
                                    {currentSubmission.compileError}
                                </div>
                            </motion.div>
                        )}

                        {/* Runtime Error */}
                        {currentSubmission.status === SUBMISSION_STATUS.RUNTIME_ERROR && (
                            <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay:.1}}>
                                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
                                    <AlertTriangle size={13} style={{color:'#f87171',flexShrink:0}}/>
                                    <span style={{ fontSize:11, fontWeight:700, color:'#f87171', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.06em', textTransform:'uppercase' }}>Runtime Error</span>
                                </div>
                                <div style={{ padding:'10px 12px', borderRadius:7, background:'rgba(15,20,30,.7)', border:'1px solid rgba(239,68,68,.1)', fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'rgba(248,113,113,.75)', whiteSpace:'pre-wrap', lineHeight:1.65, maxHeight:100, overflowY:'auto' }}>
                                    {currentSubmission.runtimeError}
                                </div>
                            </motion.div>
                        )}

                        {/* TLE */}
                        {currentSubmission.status === SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED && (
                            <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(245,158,11,.06)', border:'1px solid rgba(245,158,11,.18)', display:'flex', alignItems:'center', gap:10 }}>
                                <span style={{fontSize:20}}>⏱</span>
                                <div>
                                    <div style={{ fontSize:13, fontWeight:700, color:'#f59e0b' }}>Time Limit Exceeded</div>
                                    <div style={{ fontSize:11, color:'rgba(245,158,11,.6)', fontFamily:"'JetBrains Mono',monospace", marginTop:2 }}>Your solution is too slow. Optimize your algorithm.</div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Mock run result */}
                {!isRunning && !currentSubmission && runResult && (
                    <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
                        {runResult.cases?.map((tc,i) => (
                            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 11px', borderRadius:8, marginBottom:5, background:'rgba(34,197,94,.07)', border:'1px solid rgba(34,197,94,.15)' }}>
                                <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', flexShrink:0 }}/>
                                <span style={{ fontSize:11.5, fontFamily:"'JetBrains Mono',monospace", color:'rgba(226,232,240,.6)', flex:1 }}>{tc.label}: {tc.input}</span>
                                <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:'#22c55e' }}>PASS</span>
                            </div>
                        ))}
                        <div style={{ marginTop:8, fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.4)' }}>
                            Runtime: {runResult.runtime} · Memory: {runResult.memory}
                        </div>
                    </motion.div>
                )}

                {/* Empty */}
                {!isSubmitting && !isRunning && !currentSubmission && !runResult && (
                    <div style={{ fontSize:12, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace" }}>
                        Run your code to see results here
                    </div>
                )}
            </div>
        </div>
    )
}

export default ResultPanel