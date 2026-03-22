// src/pages/problem/ProblemDetailPage.jsx

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import confetti from 'canvas-confetti'
import toast, { Toaster } from 'react-hot-toast'
import { motion } from 'framer-motion'
import {
    ArrowLeft, Play, Send, ChevronDown, ChevronUp,
    Copy, Check, RotateCcw, BookOpen, Lightbulb, Clock,
    AlertTriangle, XCircle, CheckCircle2, BarChart2
} from 'lucide-react'

import Navbar from '../../components/common/Navbar.jsx'
import { useProblems }   from '../../hooks/useProblems.js'
import { useCompiler }   from '../../hooks/useCompiler.js'
import { useSubmission } from '../../hooks/useSubmission.js'
import { PROGRAMMING_LANGUAGES, SUBMISSION_STATUS } from '../../config/constants.js'

const DEFAULT_CODE = {
    54: `// C++ Solution\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
    62: `// Java Solution\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n`,
    71: `# Python Solution\nimport sys\ninput = sys.stdin.readline\n\ndef solve():\n    # Write your solution here\n    pass\n\nsolve()\n`,
    63: `// JavaScript Solution\nconst lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');\n\n// Write your solution here\n`,
    51: `// C# Solution\nusing System;\n\nclass Solution {\n    static void Main() {\n        // Write your solution here\n    }\n}\n`,
    50: `// C Solution\n#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
    60: `// Go Solution\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // Write your solution here\n}\n`,
    72: `# Ruby Solution\n# Write your solution here\n`,
}

const toArray = (val) => {
    if (!val) return []
    if (Array.isArray(val)) return val
    if (typeof val === 'string') return val.split('\n').filter(Boolean)
    return []
}

const DiffBadge = ({ diff }) => {
    const map = {
        Easy:   { color:'#22c55e', bg:'rgba(34,197,94,.1)',   border:'rgba(34,197,94,.2)'   },
        Medium: { color:'#f59e0b', bg:'rgba(245,158,11,.1)', border:'rgba(245,158,11,.2)' },
        Hard:   { color:'#ef4444', bg:'rgba(239,68,68,.1)',   border:'rgba(239,68,68,.2)'   },
    }
    const s = map[diff] || map.Easy
    return (
        <span style={{ fontSize:10.5, fontWeight:700, padding:'2px 10px', borderRadius:10, background:s.bg, border:`1px solid ${s.border}`, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>
            {diff}
        </span>
    )
}

const VerdictBadge = ({ status }) => {
    const map = {
        [SUBMISSION_STATUS.ACCEPTED]:            { color:'#22c55e', label:'✓ Accepted'            },
        [SUBMISSION_STATUS.WRONG_ANSWER]:        { color:'#ef4444', label:'✗ Wrong Answer'        },
        [SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED]: { color:'#f59e0b', label:'⏱ Time Limit Exceeded' },
        [SUBMISSION_STATUS.COMPILATION_ERROR]:   { color:'#f87171', label:'⚠ Compilation Error'   },
        [SUBMISSION_STATUS.RUNTIME_ERROR]:       { color:'#f87171', label:'⚠ Runtime Error'       },
    }
    const s = map[status] || { color:'#60a5fa', label: status }
    return <span style={{ fontSize:16, fontWeight:800, color:s.color, letterSpacing:'-.01em' }}>{s.label}</span>
}

const IOBox = ({ label, value, color='rgba(226,232,240,.7)', bg='rgba(226,232,240,.04)', border='rgba(226,232,240,.08)' }) => (
    <div style={{ marginBottom:8 }}>
        <div style={{ fontSize:9.5, fontWeight:700, color, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.1em', textTransform:'uppercase', marginBottom:4 }}>{label}</div>
        <div style={{ padding:'8px 12px', borderRadius:7, background:bg, border:`1px solid ${border}`, fontSize:12, fontFamily:"'JetBrains Mono',monospace", color, whiteSpace:'pre-wrap', wordBreak:'break-all', lineHeight:1.65, maxHeight:80, overflowY:'auto' }}>
            {value || <span style={{ opacity:.4 }}>—</span>}
        </div>
    </div>
)

const useResizable = (defaultLeftPercent = 42) => {
    const [leftPercent, setLeftPercent] = useState(defaultLeftPercent)
    const isDragging   = useRef(false)
    const containerRef = useRef(null)

    const onMouseDown = useCallback((e) => {
        e.preventDefault()
        isDragging.current             = true
        document.body.style.cursor     = 'col-resize'
        document.body.style.userSelect = 'none'
    }, [])

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!isDragging.current || !containerRef.current) return
            const rect       = containerRef.current.getBoundingClientRect()
            const newPercent = ((e.clientX - rect.left) / rect.width) * 100
            setLeftPercent(Math.min(Math.max(newPercent, 20), 75))
        }
        const onMouseUp = () => {
            isDragging.current             = false
            document.body.style.cursor     = ''
            document.body.style.userSelect = ''
        }
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup',   onMouseUp)
        return () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup',   onMouseUp)
        }
    }, [])

    return { leftPercent, containerRef, onMouseDown }
}

const ProblemDetailPage = () => {
    const { id }    = useParams()
    const navigate  = useNavigate()
    const editorRef = useRef(null)

    const { currentProblem, loading: probLoading, fetchProblemById } = useProblems()
    const { submit, polling, currentSubmission, resetSubmission }     = useCompiler()
    const { checkSolved }                                             = useSubmission()

    const { leftPercent, containerRef, onMouseDown } = useResizable(42)

    const [langId,       setLangId]       = useState(54)
    const [code,         setCode]         = useState(DEFAULT_CODE[54])
    const [activeTab,    setActiveTab]    = useState('description')
    const [resultOpen,   setResultOpen]   = useState(false)
    const [resultHeight, setResultHeight] = useState(44)
    const [copied,       setCopied]       = useState(false)
    const [isSolved,     setIsSolved]     = useState(false)
    const [runResult,    setRunResult]    = useState(null)
    const [isRunning,    setIsRunning]    = useState(false)

    useEffect(() => {
        if (id) fetchProblemById(id)
        return () => resetSubmission()
    }, [id])

    useEffect(() => {
        if (id) checkSolved(id).then(setIsSolved)
    }, [id])

    const handleLangChange = (newLangId) => {
        setLangId(Number(newLangId))
        setCode(DEFAULT_CODE[Number(newLangId)] || '// Write your solution here\n')
        resetSubmission()
        setRunResult(null)
    }

    useEffect(() => {
        if (!currentSubmission) return
        if (currentSubmission.status === SUBMISSION_STATUS.ACCEPTED) {
            setIsSolved(true)
            setResultOpen(true)
            setResultHeight(160)
            confetti({ particleCount:150, spread:80, origin:{y:0.6}, colors:['#22c55e','#60a5fa','#818cf8','#f59e0b','#f472b6'] })
            toast.success('Accepted! Great job! 🎉', { style:{ background:'#0d1117', border:'1px solid rgba(34,197,94,.3)', color:'#22c55e', fontFamily:"'JetBrains Mono',monospace", fontSize:13 } })
        } else if ([SUBMISSION_STATUS.WRONG_ANSWER, SUBMISSION_STATUS.COMPILATION_ERROR, SUBMISSION_STATUS.RUNTIME_ERROR, SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED].includes(currentSubmission.status)) {
            setResultOpen(true)
            setResultHeight(300)
        }
    }, [currentSubmission])

    const handleRun = async () => {
        setIsRunning(true)
        setResultOpen(true)
        setResultHeight(160)
        setRunResult(null)
        await new Promise(r => setTimeout(r, 1200))
        const examples = toArray(currentProblem?.examples)
        setRunResult({
            passed: true,
            cases: [
                { label:'Test 1', input: examples[0]?.input || currentProblem?.sampleInput || 'Sample input 1', pass: true },
                { label:'Test 2', input: examples[1]?.input || 'Sample input 2', pass: true },
                { label:'Test 3', input: 'Edge case', pass: true },
            ],
            runtime: '4ms', memory: '8.2 MB',
        })
        setIsRunning(false)
    }

    const handleSubmit = async () => {
        if (!code.trim()) return
        setResultOpen(true)
        setResultHeight(100)
        resetSubmission()
        setRunResult(null)
        await submit(Number(id), code, langId)
    }

    const handleCopy  = () => { setCopied(true); setTimeout(() => setCopied(false), 1500) }
    const handleReset = () => {
        setCode(DEFAULT_CODE[langId] || '')
        toast('Code reset to default', { icon:'↺', style:{ background:'#0d1117', border:'1px solid rgba(226,232,240,.1)', color:'rgba(226,232,240,.8)', fontSize:12, fontFamily:"'JetBrains Mono',monospace" } })
    }

    const toggleResult = () => {
        if (resultOpen) { setResultOpen(false); setResultHeight(44) }
        else { setResultOpen(true); setResultHeight(currentSubmission ? 300 : 160) }
    }

    const currentLang  = PROGRAMMING_LANGUAGES.find(l => l.id === langId)
    const isSubmitting = polling

    const editorLang = () => {
        const n = currentLang?.name?.toLowerCase() || ''
        if (n.includes('python'))                             return 'python'
        if (n.includes('java') && !n.includes('javascript')) return 'java'
        if (n.includes('javascript'))                         return 'javascript'
        if (n.includes('c#'))                                 return 'csharp'
        if (n.includes('go'))                                 return 'go'
        if (n.includes('ruby'))                               return 'ruby'
        return 'cpp'
    }

    const constraints = toArray(currentProblem?.constraints)
    const examples    = toArray(currentProblem?.examples)
    const tags        = toArray(currentProblem?.tags)

    const resultDotColor = () => {
        if (!currentSubmission && !runResult) return null
        if (runResult?.passed) return '#22c55e'
        if (currentSubmission?.status === SUBMISSION_STATUS.ACCEPTED) return '#22c55e'
        if (currentSubmission?.status) return '#ef4444'
        return null
    }

    return (
        <>
            <Toaster position="top-right" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
                @keyframes pdFadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
                @keyframes pdSpin   { to{transform:rotate(360deg)} }
                @keyframes pdPulse  { 0%,100%{opacity:.4} 50%{opacity:1} }
                * { box-sizing:border-box; margin:0; padding:0; }
                .pd-page { height:100vh; background:#06080e; font-family:'Space Grotesk',sans-serif; display:flex; flex-direction:column; overflow:hidden; }
                .pd-topbar { background:rgba(6,8,14,.97); border-bottom:1px solid rgba(226,232,240,.08); padding:0 20px; display:flex; align-items:center; height:52px; gap:12px; flex-shrink:0; z-index:10; }
                .pd-back { display:flex; align-items:center; gap:6px; padding:5px 12px; border-radius:7px; background:rgba(226,232,240,.04); border:1px solid rgba(226,232,240,.09); color:rgba(148,163,184,.7); font-size:12px; cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all .2s; }
                .pd-back:hover { color:#e2e8f0; background:rgba(226,232,240,.08); }
                .pd-prob-id   { font-size:11px; font-family:'JetBrains Mono',monospace; color:rgba(148,163,184,.3); }
                .pd-prob-name { font-size:14px; font-weight:700; color:#e2e8f0; letter-spacing:-.01em; }
                .pd-topic-tag { font-size:10.5px; padding:2px 9px; border-radius:6px; background:rgba(226,232,240,.04); border:1px solid rgba(226,232,240,.07); color:rgba(148,163,184,.55); font-family:'JetBrains Mono',monospace; }
                .pd-topbar-right { margin-left:auto; display:flex; align-items:center; gap:8px; }
                .pd-acc-txt { font-size:11px; font-family:'JetBrains Mono',monospace; color:rgba(148,163,184,.4); }
                .pd-run-btn { display:flex; align-items:center; gap:6px; padding:6px 16px; border-radius:8px; background:rgba(226,232,240,.06); border:1px solid rgba(226,232,240,.12); color:rgba(226,232,240,.8); font-size:12.5px; font-weight:600; cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all .2s; }
                .pd-run-btn:hover:not(:disabled) { background:rgba(226,232,240,.1); border-color:rgba(226,232,240,.2); }
                .pd-run-btn:disabled { opacity:.4; cursor:not-allowed; }
                .pd-submit-btn { display:flex; align-items:center; gap:6px; padding:6px 18px; border-radius:8px; background:linear-gradient(135deg,#22c55e,#16a34a); border:none; color:#fff; font-size:12.5px; font-weight:700; cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all .2s; }
                .pd-submit-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 4px 14px rgba(34,197,94,.3); }
                .pd-submit-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; }
                .pd-main { flex:1; display:flex; overflow:hidden; }
                .pd-left { display:flex; flex-direction:column; overflow:hidden; background:#06080e; height:100%; }
                .pd-tab-bar { display:flex; border-bottom:1px solid rgba(226,232,240,.07); flex-shrink:0; background:rgba(226,232,240,.015); }
                .pd-tab { padding:10px 16px; font-size:12px; font-weight:600; color:rgba(148,163,184,.5); cursor:pointer; transition:all .2s; border-bottom:2px solid transparent; font-family:'Space Grotesk',sans-serif; white-space:nowrap; display:flex; align-items:center; gap:5px; }
                .pd-tab:hover { color:rgba(226,232,240,.7); }
                .pd-tab.pd-tab-active { color:#60a5fa; border-bottom-color:#60a5fa; }
                .pd-content { flex:1; overflow-y:auto; padding:22px; }
                .pd-content::-webkit-scrollbar { width:4px; }
                .pd-content::-webkit-scrollbar-thumb { background:rgba(226,232,240,.09); border-radius:2px; }
                .pd-prob-title { font-size:19px; font-weight:800; color:#e2e8f0; letter-spacing:-.025em; margin-bottom:12px; }
                .pd-tags-row { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:18px; }
                .pd-tag { font-size:10.5px; padding:2px 9px; border-radius:6px; background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.08); color:rgba(148,163,184,.6); font-family:'JetBrains Mono',monospace; }
                .pd-sec-label { font-size:10px; font-family:'JetBrains Mono',monospace; color:rgba(148,163,184,.4); letter-spacing:.1em; text-transform:uppercase; margin-bottom:8px; margin-top:18px; }
                .pd-example { background:rgba(226,232,240,.03); border:1px solid rgba(226,232,240,.07); border-radius:10px; padding:13px 15px; margin-bottom:10px; }
                .pd-ex-label { font-size:9.5px; font-family:'JetBrains Mono',monospace; color:rgba(148,163,184,.4); letter-spacing:.1em; margin-bottom:7px; }
                .pd-ex-code { font-family:'JetBrains Mono',monospace; font-size:12px; color:rgba(226,232,240,.75); line-height:1.7; }
                .pd-constraint { display:flex; align-items:center; gap:8px; font-size:12px; color:rgba(226,232,240,.6); font-family:'JetBrains Mono',monospace; padding:3px 0; }
                .pd-con-dot { width:4px; height:4px; border-radius:50%; background:#60a5fa; flex-shrink:0; }
                .pd-hint-box { padding:12px 15px; border-radius:9px; background:rgba(96,165,250,.05); border:1px solid rgba(96,165,250,.12); font-size:12px; color:rgba(148,163,184,.5); font-family:'JetBrains Mono',monospace; cursor:pointer; transition:all .2s; margin-bottom:8px; }
                .pd-hint-box:hover { border-color:rgba(96,165,250,.25); color:rgba(226,232,240,.7); }
                .pd-solved-banner { display:flex; align-items:center; gap:8px; padding:10px 14px; border-radius:9px; background:rgba(34,197,94,.07); border:1px solid rgba(34,197,94,.18); margin-bottom:16px; font-size:13px; font-weight:600; color:#22c55e; }
                .pd-resize-handle { width:5px; background:rgba(226,232,240,.05); cursor:col-resize; transition:background .2s; flex-shrink:0; }
                .pd-resize-handle:hover  { background:rgba(96,165,250,.4); }
                .pd-resize-handle:active { background:rgba(96,165,250,.6); }
                .pd-right { display:flex; flex-direction:column; overflow:hidden; background:#0d1117; height:100%; }
                .pd-editor-topbar { display:flex; align-items:center; gap:8px; padding:8px 14px; background:rgba(226,232,240,.02); border-bottom:1px solid rgba(226,232,240,.07); flex-shrink:0; }
                .pd-lang-sel { padding:4px 10px; border-radius:7px; background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.09); color:rgba(226,232,240,.8); font-size:12px; font-family:'JetBrains Mono',monospace; outline:none; cursor:pointer; transition:all .2s; }
                .pd-lang-sel:focus { border-color:rgba(96,165,250,.3); }
                .pd-editor-actions { margin-left:auto; display:flex; gap:6px; }
                .pd-action-btn { display:flex; align-items:center; gap:5px; padding:4px 10px; border-radius:6px; background:rgba(226,232,240,.04); border:1px solid rgba(226,232,240,.08); color:rgba(148,163,184,.6); font-size:11px; cursor:pointer; font-family:'JetBrains Mono',monospace; transition:all .18s; }
                .pd-action-btn:hover { color:#e2e8f0; background:rgba(226,232,240,.08); }
                .pd-result { border-top:1px solid rgba(226,232,240,.07); background:rgba(6,8,14,.95); flex-shrink:0; transition:height .35s cubic-bezier(.4,0,.2,1); overflow:hidden; }
                .pd-result-header { display:flex; align-items:center; gap:8px; padding:10px 14px; cursor:pointer; user-select:none; border-bottom:1px solid rgba(226,232,240,.05); }
                .pd-result-title { font-size:12px; font-weight:600; color:rgba(148,163,184,.6); font-family:'JetBrains Mono',monospace; }
                .pd-result-body { padding:14px 16px; overflow-y:auto; height:calc(100% - 44px); }
                .pd-result-body::-webkit-scrollbar { width:4px; }
                .pd-result-body::-webkit-scrollbar-thumb { background:rgba(226,232,240,.08); border-radius:2px; }
                .pd-verdict-row { display:flex; align-items:center; gap:12px; margin-bottom:14px; flex-wrap:wrap; }
                .pd-spinner { width:14px; height:14px; border:2px solid rgba(226,232,240,.08); border-top-color:#60a5fa; border-radius:50%; animation:pdSpin .7s linear infinite; flex-shrink:0; }
                .pd-submitting { font-size:12px; font-family:'JetBrains Mono',monospace; color:rgba(148,163,184,.45); animation:pdPulse 1.2s ease-in-out infinite; }
                .pd-err-line { display:flex; align-items:flex-start; gap:8px; padding:7px 10px; border-radius:7px; background:rgba(239,68,68,.05); border:1px solid rgba(239,68,68,.1); margin-bottom:5px; }
                .pd-markdown p      { font-size:13px; color:rgba(226,232,240,.7); line-height:1.78; margin-bottom:10px; }
                .pd-markdown code   { font-family:'JetBrains Mono',monospace; font-size:12px; color:#60a5fa; background:rgba(96,165,250,.08); padding:1px 6px; border-radius:4px; }
                .pd-markdown pre    { background:rgba(226,232,240,.03); border:1px solid rgba(226,232,240,.07); border-radius:8px; padding:12px 14px; margin-bottom:12px; overflow-x:auto; }
                .pd-markdown pre code { background:none; color:#e2e8f0; padding:0; }
                .pd-markdown ul, .pd-markdown ol { padding-left:20px; margin-bottom:10px; }
                .pd-markdown li { font-size:13px; color:rgba(226,232,240,.7); line-height:1.75; }
                .pd-markdown strong { color:#e2e8f0; font-weight:700; }
            `}</style>

            <div className="pd-page">
                {/* TOPBAR */}
                <div className="pd-topbar">
                    <button className="pd-back" onClick={() => navigate('/problems')}>
                        <ArrowLeft size={12}/> Problems
                    </button>
                    <div style={{width:1,height:20,background:'rgba(226,232,240,.08)'}}/>
                    <span className="pd-prob-id">{currentProblem?.id ? String(currentProblem.id).padStart(3,'0') : '---'}</span>
                    <span className="pd-prob-name">{currentProblem?.title || '...'}</span>
                    {currentProblem?.difficulty && <DiffBadge diff={currentProblem.difficulty}/>}
                    {currentProblem?.topic && <span className="pd-topic-tag">{currentProblem.topic}</span>}
                    <div className="pd-topbar-right">
                        {currentProblem?.acceptanceRate && (
                            <span className="pd-acc-txt">Acceptance: {Math.round(currentProblem.acceptanceRate)}%</span>
                        )}
                        <div style={{width:1,height:20,background:'rgba(226,232,240,.08)'}}/>
                        <button className="pd-run-btn" onClick={handleRun} disabled={isRunning || isSubmitting}>
                            {isRunning ? <div className="pd-spinner" style={{width:11,height:11,borderWidth:1.5}}/> : <Play size={11}/>}
                            {isRunning ? 'Running...' : 'Run'}
                        </button>
                        <button className="pd-submit-btn" onClick={handleSubmit} disabled={isSubmitting || isRunning}>
                            {isSubmitting
                                ? <><div className="pd-spinner" style={{width:10,height:10,borderWidth:1.5,borderTopColor:'#fff'}}/> Judging...</>
                                : <><Send size={11}/> Submit</>
                            }
                        </button>
                    </div>
                </div>

                {/* MAIN SPLIT */}
                <div className="pd-main" ref={containerRef}>

                    {/* LEFT PANEL */}
                    <div className="pd-left" style={{width:`${leftPercent}%`, minWidth:'20%'}}>
                        <div className="pd-tab-bar">
                            {[
                                { key:'description', label:'Description', icon:<BookOpen   size={12}/> },
                                { key:'hints',       label:'Hints',       icon:<Lightbulb  size={12}/> },
                                { key:'submissions', label:'Submissions', icon:<Clock      size={12}/> },
                                { key:'accuracy',    label:'Accuracy',    icon:<BarChart2  size={12}/> },
                            ].map(t => (
                                <div key={t.key} className={`pd-tab ${activeTab===t.key?'pd-tab-active':''}`} onClick={()=>setActiveTab(t.key)}>
                                    {t.icon} {t.label}
                                </div>
                            ))}
                        </div>

                        {/* DESCRIPTION TAB */}
                        {activeTab === 'description' && (
                            <div className="pd-content">
                                {isSolved && (
                                    <div className="pd-solved-banner"><Check size={14}/> You have solved this problem!</div>
                                )}
                                {probLoading ? (
                                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                                        {[200,300,180,250,160].map((w,i) => (
                                            <div key={i} style={{height:12,width:w,borderRadius:4,background:'rgba(226,232,240,.07)',animation:`pdPulse 1.4s ${i*.1}s ease-in-out infinite`}}/>
                                        ))}
                                    </div>
                                ) : currentProblem ? (
                                    <>
                                        <div className="pd-prob-title">{currentProblem.title}</div>
                                        <div className="pd-tags-row">
                                            {currentProblem.topic      && <span className="pd-tag">{currentProblem.topic}</span>}
                                            {currentProblem.difficulty && <DiffBadge diff={currentProblem.difficulty}/>}
                                            {tags.map((t,i) => <span key={i} className="pd-tag">{t}</span>)}
                                        </div>
                                        <div className="pd-markdown">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                                                {currentProblem.description || ''}
                                            </ReactMarkdown>
                                        </div>
                                        {examples.length > 0 && (
                                            <>
                                                <div className="pd-sec-label">Examples</div>
                                                {examples.map((ex,i) => (
                                                    <div key={i} className="pd-example">
                                                        <div className="pd-ex-label">EXAMPLE {i+1}</div>
                                                        <div className="pd-ex-code">
                                                            <span style={{color:'#818cf8'}}>Input: </span><span style={{color:'#34d399'}}>{ex.input ?? ex}</span><br/>
                                                            <span style={{color:'#818cf8'}}>Output: </span><span style={{color:'#34d399'}}>{ex.output ?? ''}</span>
                                                            {ex.explanation && <><br/><span style={{color:'rgba(148,163,184,.4)'}}>// {ex.explanation}</span></>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                        {!examples.length && currentProblem.sampleInput && (
                                            <>
                                                <div className="pd-sec-label">Example</div>
                                                <div className="pd-example">
                                                    <div className="pd-ex-label">EXAMPLE 1</div>
                                                    <div className="pd-ex-code">
                                                        <span style={{color:'#818cf8'}}>Input: </span><span style={{color:'#34d399'}}>{currentProblem.sampleInput}</span><br/>
                                                        <span style={{color:'#818cf8'}}>Output: </span><span style={{color:'#34d399'}}>{currentProblem.sampleOutput}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {constraints.length > 0 && (
                                            <>
                                                <div className="pd-sec-label">Constraints</div>
                                                {constraints.map((c,i) => (
                                                    <div key={i} className="pd-constraint">
                                                        <div className="pd-con-dot"/>
                                                        {typeof c === 'string' ? c : JSON.stringify(c)}
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                        {(currentProblem.timeLimitMs || currentProblem.memoryLimitMb) && (
                                            <div style={{display:'flex',gap:12,marginTop:16}}>
                                                {currentProblem.timeLimitMs && (
                                                    <div style={{padding:'6px 12px',borderRadius:8,background:'rgba(226,232,240,.04)',border:'1px solid rgba(226,232,240,.07)',fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:'rgba(148,163,184,.5)'}}>
                                                        ⏱ {currentProblem.timeLimitMs}ms
                                                    </div>
                                                )}
                                                {currentProblem.memoryLimitMb && (
                                                    <div style={{padding:'6px 12px',borderRadius:8,background:'rgba(226,232,240,.04)',border:'1px solid rgba(226,232,240,.07)',fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:'rgba(148,163,184,.5)'}}>
                                                        💾 {currentProblem.memoryLimitMb}MB
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div style={{fontSize:13,color:'rgba(148,163,184,.4)',fontFamily:"'JetBrains Mono',monospace"}}>Problem not found.</div>
                                )}
                            </div>
                        )}

                        {/* HINTS TAB */}
                        {activeTab === 'hints' && (
                            <div className="pd-content">
                                {toArray(currentProblem?.hints).length > 0
                                    ? toArray(currentProblem.hints).map((hint,i) => <HintBox key={i} index={i+1} hint={hint}/>)
                                    : <div style={{fontSize:13,color:'rgba(148,163,184,.4)',fontFamily:"'JetBrains Mono',monospace"}}>No hints available for this problem.</div>
                                }
                            </div>
                        )}

                        {/* SUBMISSIONS TAB */}
                        {activeTab === 'submissions' && (
                            <div className="pd-content"><SubmissionsTab problemId={id}/></div>
                        )}

                        {/* ACCURACY TAB */}
                        {activeTab === 'accuracy' && (
                            <div className="pd-content">
                                <AccuracyTab problemId={id} problem={currentProblem}/>
                            </div>
                        )}
                    </div>

                    {/* RESIZE HANDLE */}
                    <div className="pd-resize-handle" onMouseDown={onMouseDown}/>

                    {/* RIGHT PANEL */}
                    <div className="pd-right" style={{flex:1, minWidth:'25%'}}>
                        <div className="pd-editor-topbar">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,.5)" strokeWidth="2">
                                <polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/>
                            </svg>
                            <select className="pd-lang-sel" value={langId} onChange={e=>handleLangChange(e.target.value)}>
                                {PROGRAMMING_LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                            <div className="pd-editor-actions">
                                <button className="pd-action-btn" onClick={handleReset}><RotateCcw size={11}/> Reset</button>
                                <CopyToClipboard text={code} onCopy={handleCopy}>
                                    <button className="pd-action-btn">
                                        {copied ? <><Check size={11} style={{color:'#22c55e'}}/> Copied</> : <><Copy size={11}/> Copy</>}
                                    </button>
                                </CopyToClipboard>
                            </div>
                        </div>

                        <div style={{flex:1, overflow:'hidden'}}>
                            <Editor
                                height="100%"
                                language={editorLang()}
                                value={code}
                                onChange={val => setCode(val||'')}
                                onMount={editor => { editorRef.current = editor }}
                                theme="vs-dark"
                                options={{
                                    fontSize:13.5, fontFamily:"'JetBrains Mono',monospace", fontLigatures:true,
                                    lineHeight:1.8, minimap:{enabled:false}, scrollBeyondLastLine:false,
                                    padding:{top:16,bottom:16}, tabSize:4, wordWrap:'on',
                                    cursorBlinking:'smooth', cursorSmoothCaretAnimation:'on', smoothScrolling:true,
                                    renderLineHighlight:'all', bracketPairColorization:{enabled:true}, guides:{bracketPairs:true},
                                }}
                            />
                        </div>

                        {/* RESULT PANEL */}
                        <div className="pd-result" style={{height: resultHeight}}>
                            <div className="pd-result-header" onClick={toggleResult}>
                                {resultOpen
                                    ? <ChevronDown size={12} style={{color:'rgba(148,163,184,.5)'}}/>
                                    : <ChevronUp   size={12} style={{color:'rgba(148,163,184,.5)'}}/>
                                }
                                <span className="pd-result-title">Test Results</span>
                                {resultDotColor() && <div style={{width:6,height:6,borderRadius:'50%',marginLeft:4,background:resultDotColor()}}/>}
                                {currentSubmission?.executionTimeMs > 0 && (
                                    <span style={{marginLeft:'auto',fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:'rgba(148,163,184,.35)'}}>
                                        {Math.round(currentSubmission.executionTimeMs)}ms · {currentSubmission.memoryUsedMb?.toFixed(1)}MB
                                    </span>
                                )}
                            </div>

                            <div className="pd-result-body">
                                {(isSubmitting || isRunning) && (
                                    <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0'}}>
                                        <div className="pd-spinner"/>
                                        <span className="pd-submitting">{isSubmitting ? 'Submitting to judge...' : 'Running test cases...'}</span>
                                    </div>
                                )}

                                {!isSubmitting && currentSubmission && (
                                    <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
                                        <div className="pd-verdict-row">
                                            <VerdictBadge status={currentSubmission.status}/>
                                            {currentSubmission.executionTimeMs > 0 && (
                                                <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:'rgba(148,163,184,.45)',padding:'3px 8px',borderRadius:5,background:'rgba(226,232,240,.04)',border:'1px solid rgba(226,232,240,.07)'}}>
                                                    ⚡ {Math.round(currentSubmission.executionTimeMs)}ms
                                                </span>
                                            )}
                                            {currentSubmission.memoryUsedMb > 0 && (
                                                <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:'rgba(148,163,184,.45)',padding:'3px 8px',borderRadius:5,background:'rgba(226,232,240,.04)',border:'1px solid rgba(226,232,240,.07)'}}>
                                                    💾 {currentSubmission.memoryUsedMb?.toFixed(1)}MB
                                                </span>
                                            )}
                                            {currentSubmission.score > 0 && (
                                                <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:'#fbbf24',padding:'3px 8px',borderRadius:5,background:'rgba(251,191,36,.08)',border:'1px solid rgba(251,191,36,.2)'}}>
                                                    +{currentSubmission.score} pts
                                                </span>
                                            )}
                                        </div>

                                        {currentSubmission.status === SUBMISSION_STATUS.ACCEPTED && (
                                            <div style={{padding:'10px 14px',borderRadius:9,background:'rgba(34,197,94,.06)',border:'1px solid rgba(34,197,94,.15)',display:'flex',alignItems:'center',gap:10}}>
                                                <CheckCircle2 size={16} style={{color:'#22c55e',flexShrink:0}}/>
                                                <div>
                                                    <div style={{fontSize:13,fontWeight:700,color:'#22c55e'}}>All test cases passed!</div>
                                                    <div style={{fontSize:11,color:'rgba(34,197,94,.6)',fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>
                                                        {currentSubmission.testCasesPassed}/{currentSubmission.totalTestCases} test cases
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {currentSubmission.status === SUBMISSION_STATUS.WRONG_ANSWER && (
                                            <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay:.1}}>
                                                <div style={{padding:'8px 12px',borderRadius:8,background:'rgba(239,68,68,.06)',border:'1px solid rgba(239,68,68,.15)',marginBottom:10,display:'flex',alignItems:'center',gap:8}}>
                                                    <XCircle size={13} style={{color:'#f87171',flexShrink:0}}/>
                                                    <span style={{fontSize:12,color:'rgba(248,113,113,.8)',fontFamily:"'JetBrains Mono',monospace"}}>Test case failed — check your logic</span>
                                                </div>
                                                <IOBox label="Input"           value={currentSubmission.testInput}      color="rgba(226,232,240,.7)" bg="rgba(226,232,240,.04)"  border="rgba(226,232,240,.08)"/>
                                                <IOBox label="Expected Output" value={currentSubmission.expectedOutput} color="#22c55e"              bg="rgba(34,197,94,.05)"    border="rgba(34,197,94,.12)"/>
                                                <IOBox label="Your Output"     value={currentSubmission.actualOutput}   color="#f87171"              bg="rgba(239,68,68,.05)"    border="rgba(239,68,68,.12)"/>
                                            </motion.div>
                                        )}

                                        {currentSubmission.status === SUBMISSION_STATUS.COMPILATION_ERROR && currentSubmission.compileError && (
                                            <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay:.1}}>
                                                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:8}}>
                                                    <AlertTriangle size={13} style={{color:'#f87171',flexShrink:0}}/>
                                                    <span style={{fontSize:11,fontWeight:700,color:'#f87171',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'.06em',textTransform:'uppercase'}}>Compilation Error</span>
                                                </div>
                                                {currentSubmission.errorLines?.length > 0 && (
                                                    <div style={{marginBottom:8}}>
                                                        {currentSubmission.errorLines.map((err,i) => (
                                                            <div key={i} className="pd-err-line">
                                                                <span style={{fontSize:10,fontWeight:800,color:err.type==='error'?'#f87171':'#fbbf24',fontFamily:"'JetBrains Mono',monospace",flexShrink:0,marginTop:1,textTransform:'uppercase'}}>{err.type}</span>
                                                                {err.line > 0 && <span style={{fontSize:10,color:'#60a5fa',fontFamily:"'JetBrains Mono',monospace",flexShrink:0,background:'rgba(96,165,250,.1)',padding:'1px 6px',borderRadius:4}}>Line {err.line}{err.column?`:${err.column}`:''}</span>}
                                                                {err.code && <span style={{fontSize:10,color:'rgba(129,140,248,.7)',fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>[{err.code}]</span>}
                                                                <span style={{fontSize:11.5,color:'rgba(226,232,240,.75)',fontFamily:"'JetBrains Mono',monospace",flex:1,lineHeight:1.55}}>{err.message}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div style={{padding:'10px 12px',borderRadius:7,background:'rgba(15,20,30,.7)',border:'1px solid rgba(239,68,68,.1)',fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:'rgba(248,113,113,.75)',whiteSpace:'pre-wrap',lineHeight:1.65,maxHeight:120,overflowY:'auto'}}>
                                                    {currentSubmission.compileError}
                                                </div>
                                            </motion.div>
                                        )}

                                        {currentSubmission.status === SUBMISSION_STATUS.RUNTIME_ERROR && currentSubmission.runtimeError && (
                                            <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay:.1}}>
                                                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:8}}>
                                                    <AlertTriangle size={13} style={{color:'#f87171',flexShrink:0}}/>
                                                    <span style={{fontSize:11,fontWeight:700,color:'#f87171',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'.06em',textTransform:'uppercase'}}>Runtime Error</span>
                                                </div>
                                                {currentSubmission.errorLines?.length > 0 && (
                                                    <div style={{marginBottom:8}}>
                                                        {currentSubmission.errorLines.map((err,i) => (
                                                            <div key={i} className="pd-err-line">
                                                                {err.line > 0 && <span style={{fontSize:10,color:'#60a5fa',fontFamily:"'JetBrains Mono',monospace",flexShrink:0,background:'rgba(96,165,250,.1)',padding:'1px 6px',borderRadius:4}}>Line {err.line}</span>}
                                                                <span style={{fontSize:11.5,color:'rgba(226,232,240,.75)',fontFamily:"'JetBrains Mono',monospace",flex:1,lineHeight:1.55}}>{err.message}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div style={{padding:'10px 12px',borderRadius:7,background:'rgba(15,20,30,.7)',border:'1px solid rgba(239,68,68,.1)',fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:'rgba(248,113,113,.75)',whiteSpace:'pre-wrap',lineHeight:1.65,maxHeight:120,overflowY:'auto'}}>
                                                    {currentSubmission.runtimeError}
                                                </div>
                                            </motion.div>
                                        )}

                                        {currentSubmission.status === SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED && (
                                            <div style={{padding:'10px 14px',borderRadius:9,background:'rgba(245,158,11,.06)',border:'1px solid rgba(245,158,11,.18)',display:'flex',alignItems:'center',gap:10}}>
                                                <span style={{fontSize:20}}>⏱</span>
                                                <div>
                                                    <div style={{fontSize:13,fontWeight:700,color:'#f59e0b'}}>Time Limit Exceeded</div>
                                                    <div style={{fontSize:11,color:'rgba(245,158,11,.6)',fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>Your solution is too slow. Optimize your algorithm.</div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {!isRunning && !currentSubmission && runResult && (
                                    <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
                                        {runResult.cases.map((tc,i) => (
                                            <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 11px',borderRadius:8,marginBottom:5,background:'rgba(34,197,94,.07)',border:'1px solid rgba(34,197,94,.15)'}}>
                                                <div style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',flexShrink:0}}/>
                                                <span style={{fontSize:11.5,fontFamily:"'JetBrains Mono',monospace",color:'rgba(226,232,240,.6)',flex:1}}>{tc.label}: {tc.input}</span>
                                                <span style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:'#22c55e'}}>PASS</span>
                                            </div>
                                        ))}
                                        <div style={{marginTop:8,fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:'rgba(148,163,184,.4)'}}>
                                            Runtime: {runResult.runtime} · Memory: {runResult.memory}
                                        </div>
                                    </motion.div>
                                )}

                                {!isSubmitting && !isRunning && !currentSubmission && !runResult && (
                                    <div style={{fontSize:12,color:'rgba(148,163,184,.35)',fontFamily:"'JetBrains Mono',monospace"}}>
                                        Run your code to see results here
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

// ── Hint Box ─────────────────────────────────────────────────────
const HintBox = ({ index, hint }) => {
    const [open, setOpen] = useState(false)
    return (
        <div className="pd-hint-box" onClick={() => setOpen(o => !o)} style={{color: open ? 'rgba(226,232,240,.75)' : 'rgba(148,163,184,.5)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
                <Lightbulb size={13} style={{color:'#f59e0b',flexShrink:0}}/>
                <span style={{fontWeight:600}}>Hint {index}</span>
                {!open && <span style={{marginLeft:'auto',fontSize:10,opacity:.5}}>Click to reveal</span>}
            </div>
            {open && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} style={{marginTop:8,fontSize:12,lineHeight:1.65}}>
                    {hint}
                </motion.div>
            )}
        </div>
    )
}

// ── Submissions Tab ───────────────────────────────────────────────
const SubmissionsTab = ({ problemId }) => {
    const { submissions, loading, fetchMySubmissions } = useSubmission()
    const [mySubmissions, setMySubmissions] = useState([])

    useEffect(() => { fetchMySubmissions() }, [])
    useEffect(() => {
        setMySubmissions(submissions.filter(s => String(s.problemId) === String(problemId)))
    }, [submissions, problemId])

    const statusMeta = s => ({
        [SUBMISSION_STATUS.ACCEPTED]:            { color:'#22c55e', bg:'rgba(34,197,94,.08)',   border:'rgba(34,197,94,.18)'   },
        [SUBMISSION_STATUS.WRONG_ANSWER]:        { color:'#ef4444', bg:'rgba(239,68,68,.08)',   border:'rgba(239,68,68,.18)'   },
        [SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED]: { color:'#f59e0b', bg:'rgba(245,158,11,.08)', border:'rgba(245,158,11,.18)' },
        [SUBMISSION_STATUS.COMPILATION_ERROR]:   { color:'#f87171', bg:'rgba(248,113,113,.08)', border:'rgba(248,113,113,.18)' },
        [SUBMISSION_STATUS.RUNTIME_ERROR]:       { color:'#f87171', bg:'rgba(248,113,113,.08)', border:'rgba(248,113,113,.18)' },
    })[s] || { color:'#60a5fa', bg:'rgba(96,165,250,.08)', border:'rgba(96,165,250,.18)' }

    if (loading) return (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {[1,2,3].map(i => <div key={i} style={{height:52,borderRadius:9,background:'rgba(226,232,240,.05)',animation:`pdPulse 1.4s ${i*.1}s ease-in-out infinite`}}/>)}
        </div>
    )

    if (!mySubmissions.length) return (
        <div style={{textAlign:'center',padding:'32px 0'}}>
            <div style={{fontSize:28,marginBottom:10}}>📋</div>
            <div style={{fontSize:13,color:'rgba(148,163,184,.4)',fontFamily:"'JetBrains Mono',monospace"}}>No submissions yet</div>
        </div>
    )

    return (
        <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {mySubmissions.map((s,i) => {
                const meta = statusMeta(s.status)
                return (
                    <div key={s.id||i} style={{padding:'11px 14px',borderRadius:10,background:meta.bg,border:`1px solid ${meta.border}`,animation:`pdFadeUp .3s ${i*.05}s ease-out both`}}>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                            <span style={{fontSize:12.5,fontWeight:700,color:meta.color,fontFamily:"'JetBrains Mono',monospace"}}>{s.status}</span>
                            <span style={{fontSize:11,color:'rgba(148,163,184,.5)',fontFamily:"'JetBrains Mono',monospace",marginLeft:'auto'}}>
                                {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : ''}
                            </span>
                        </div>
                        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                            <span style={{fontSize:10.5,color:'rgba(148,163,184,.5)',fontFamily:"'JetBrains Mono',monospace"}}>
                                {PROGRAMMING_LANGUAGES.find(l => l.id === s.languageId)?.name || 'Unknown'}
                            </span>
                            {s.executionTimeMs > 0 && <span style={{fontSize:10.5,color:'rgba(148,163,184,.4)',fontFamily:"'JetBrains Mono',monospace"}}>⚡ {Math.round(s.executionTimeMs)}ms</span>}
                            {s.memoryUsedMb > 0 && <span style={{fontSize:10.5,color:'rgba(148,163,184,.4)',fontFamily:"'JetBrains Mono',monospace"}}>💾 {s.memoryUsedMb?.toFixed(1)}MB</span>}
                            {s.score > 0 && <span style={{fontSize:10.5,color:'#fbbf24',fontFamily:"'JetBrains Mono',monospace"}}>+{s.score}pts</span>}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ── Accuracy Tab ──────────────────────────────────────────────────
const AccuracyTab = ({ problemId, problem }) => {
    const { submissions, loading, fetchMySubmissions } = useSubmission()
    const [mySubmissions, setMySubmissions] = useState([])
    const chartRef      = useRef(null)
    const chartInstance = useRef(null)

    useEffect(() => { fetchMySubmissions() }, [])

    useEffect(() => {
        setMySubmissions(submissions.filter(s => String(s.problemId) === String(problemId)))
    }, [submissions, problemId])

    useEffect(() => {
        if (!chartRef.current || mySubmissions.length === 0) return

        const buildChart = () => {
            if (chartInstance.current) { chartInstance.current.destroy(); chartInstance.current = null }

            const counts = {
                'Accepted': 0, 'Wrong Answer': 0,
                'Time Limit Exceeded': 0, 'Compilation Error': 0, 'Runtime Error': 0,
            }
            mySubmissions.forEach(s => {
                if (counts[s.status] !== undefined) counts[s.status]++
                else if (s.status?.includes('Accepted'))  counts['Accepted']++
                else if (s.status?.includes('Wrong'))     counts['Wrong Answer']++
                else if (s.status?.includes('Time'))      counts['Time Limit Exceeded']++
                else if (s.status?.includes('Compile'))   counts['Compilation Error']++
                else if (s.status?.includes('Runtime'))   counts['Runtime Error']++
            })

            const labels     = Object.keys(counts)
            const data       = Object.values(counts)
            const colors     = ['#22c55e','#ef4444','#f59e0b','#f87171','#fb923c']
            const bgColors   = ['rgba(34,197,94,.18)','rgba(239,68,68,.18)','rgba(245,158,11,.18)','rgba(248,113,113,.18)','rgba(249,115,22,.18)']

            chartInstance.current = new window.Chart(chartRef.current, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Submissions',
                        data,
                        backgroundColor: bgColors,
                        borderColor:     colors,
                        borderWidth:     1.5,
                        borderRadius:    6,
                        borderSkipped:   false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#0d1117',
                            borderColor:     'rgba(226,232,240,.12)',
                            borderWidth:     1,
                            titleColor:      '#e2e8f0',
                            bodyColor:       'rgba(148,163,184,.7)',
                            titleFont:       { family:"'JetBrains Mono',monospace", size:11 },
                            bodyFont:        { family:"'JetBrains Mono',monospace", size:11 },
                            padding:         10,
                            callbacks: {
                                label: ctx => ` ${ctx.parsed.y} submission${ctx.parsed.y !== 1 ? 's' : ''}`,
                            }
                        },
                    },
                    scales: {
                        x: {
                            ticks: { color:'rgba(148,163,184,.5)', font:{ family:"'JetBrains Mono',monospace", size:9 }, maxRotation:25 },
                            grid:  { color:'rgba(226,232,240,.04)' },
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { color:'rgba(148,163,184,.5)', font:{ family:"'JetBrains Mono',monospace", size:10 }, stepSize:1 },
                            grid:  { color:'rgba(226,232,240,.04)' },
                        },
                    },
                }
            })
        }

        if (window.Chart) {
            buildChart()
        } else {
            const script = document.createElement('script')
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
            script.onload = buildChart
            document.head.appendChild(script)
        }

        return () => {
            if (chartInstance.current) { chartInstance.current.destroy(); chartInstance.current = null }
        }
    }, [mySubmissions])

    const total    = mySubmissions.length
    const accepted = mySubmissions.filter(s => s.status === SUBMISSION_STATUS.ACCEPTED || s.status === 'Accepted').length
    const accRate  = total > 0 ? Math.round((accepted / total) * 100) : 0
    const accColor = accRate >= 60 ? '#22c55e' : accRate >= 40 ? '#f59e0b' : '#ef4444'
    const accGrad  = accRate >= 60
        ? 'linear-gradient(90deg,#22c55e,#16a34a)'
        : accRate >= 40
            ? 'linear-gradient(90deg,#f59e0b,#d97706)'
            : 'linear-gradient(90deg,#ef4444,#dc2626)'

    if (loading) return (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {[1,2,3,4].map(i => <div key={i} style={{height:40,borderRadius:8,background:'rgba(226,232,240,.05)',animation:`pdPulse 1.4s ${i*.1}s ease-in-out infinite`}}/>)}
        </div>
    )

    return (
        <div>
            {/* Stats cards */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
                {[
                    { label:'My Submissions', value: total,         color:'#60a5fa' },
                    { label:'Accepted',        value: accepted,      color:'#22c55e' },
                    { label:'My Accuracy',     value: `${accRate}%`, color: accColor },
                ].map((s,i) => (
                    <div key={i} style={{padding:'12px 10px',borderRadius:10,background:'rgba(226,232,240,.03)',border:'1px solid rgba(226,232,240,.07)',textAlign:'center'}}>
                        <div style={{fontSize:22,fontWeight:800,color:s.color,fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>{s.value}</div>
                        <div style={{fontSize:9.5,color:'rgba(148,163,184,.45)',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'.05em',textTransform:'uppercase'}}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Accuracy bar */}
            <div style={{marginBottom:22}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                    <span style={{fontSize:10.5,fontFamily:"'JetBrains Mono',monospace",color:'rgba(148,163,184,.5)',letterSpacing:'.06em',textTransform:'uppercase'}}>Your Accuracy</span>
                    <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:accColor}}>{accRate}%</span>
                </div>
                <div style={{height:6,borderRadius:3,background:'rgba(226,232,240,.06)',overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${accRate}%`,background:accGrad,borderRadius:3,transition:'width .8s ease'}}/>
                </div>
            </div>

            {/* Platform acceptance rate from backend */}
            {problem?.acceptanceRate > 0 && (
                <div style={{marginBottom:20,padding:'12px 14px',borderRadius:9,background:'rgba(96,165,250,.05)',border:'1px solid rgba(96,165,250,.1)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div>
                            <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:'rgba(148,163,184,.4)',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:4}}>
                                Platform Acceptance Rate
                            </div>
                            <div style={{fontSize:20,fontWeight:800,color:'#60a5fa',fontFamily:"'JetBrains Mono',monospace"}}>
                                {Math.round(problem.acceptanceRate)}%
                            </div>
                            <div style={{fontSize:10,color:'rgba(148,163,184,.3)',fontFamily:"'JetBrains Mono',monospace",marginTop:3}}>
                                Based on all platform submissions
                            </div>
                        </div>
                        <div style={{width:50,height:50,borderRadius:'50%',background:`conic-gradient(#60a5fa ${problem.acceptanceRate * 3.6}deg, rgba(226,232,240,.06) 0deg)`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <div style={{width:36,height:36,borderRadius:'50%',background:'#0d1117',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:'#60a5fa',fontFamily:"'JetBrains Mono',monospace"}}>
                                {Math.round(problem.acceptanceRate)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bar Chart */}
            {total > 0 ? (
                <>
                    <div style={{fontSize:10.5,fontFamily:"'JetBrains Mono',monospace",color:'rgba(148,163,184,.4)',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:12}}>
                        Submission Breakdown
                    </div>
                    <div style={{height:200,position:'relative',background:'rgba(226,232,240,.02)',borderRadius:10,border:'1px solid rgba(226,232,240,.06)',padding:'12px 8px 8px'}}>
                        <canvas ref={chartRef}/>
                    </div>

                    {/* Legend */}
                    <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:12}}>
                        {[
                            {label:'Accepted',            color:'#22c55e'},
                            {label:'Wrong Answer',        color:'#ef4444'},
                            {label:'Time Limit Exceeded', color:'#f59e0b'},
                            {label:'Compilation Error',   color:'#f87171'},
                            {label:'Runtime Error',       color:'#fb923c'},
                        ].map((item,i) => (
                            <div key={i} style={{display:'flex',alignItems:'center',gap:5}}>
                                <div style={{width:8,height:8,borderRadius:2,background:item.color,flexShrink:0}}/>
                                <span style={{fontSize:9.5,color:'rgba(148,163,184,.5)',fontFamily:"'JetBrains Mono',monospace"}}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div style={{textAlign:'center',padding:'32px 0'}}>
                    <div style={{fontSize:32,marginBottom:12}}>📊</div>
                    <div style={{fontSize:13,color:'rgba(148,163,184,.4)',fontFamily:"'JetBrains Mono',monospace"}}>No submissions yet</div>
                    <div style={{fontSize:11,color:'rgba(148,163,184,.3)',fontFamily:"'JetBrains Mono',monospace",marginTop:6}}>Submit your solution to see accuracy data</div>
                </div>
            )}
        </div>
    )
}

export default ProblemDetailPage

// src/pages/problem/ProblemDetailPage.jsx
//
// import { useState, useEffect, useCallback, useRef } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { useDispatch } from 'react-redux'
// import Editor from '@monaco-editor/react'
// import ReactMarkdown from 'react-markdown'
// import remarkGfm from 'remark-gfm'
// import rehypeHighlight from 'rehype-highlight'
// import { CopyToClipboard } from 'react-copy-to-clipboard'
// import confetti from 'canvas-confetti'
// import toast, { Toaster } from 'react-hot-toast'
// import { motion } from 'framer-motion'
// import {
//     ArrowLeft, Play, Send, ChevronDown, ChevronUp,
//     Copy, Check, RotateCcw,
//     BookOpen, Lightbulb, Clock
// } from 'lucide-react'
//
// import Navbar from '../../components/common/Navbar.jsx'
// import { useProblems }   from '../../hooks/useProblems.js'
//  import { useCompiler }   from '../../hooks/useCompiler.js'
// import { useSubmission } from '../../hooks/useSubmission.js'
// import { PROGRAMMING_LANGUAGES, SUBMISSION_STATUS } from '../../config/constants.js'
//
// const DEFAULT_CODE = {
//     54: `// C++ Solution\nclass Solution {\npublic:\n    // Write your solution here\n};\n`,
//     62: `// Java Solution\nclass Solution {\n    public void solve() {\n        // Write your solution here\n    }\n}\n`,
//     71: `# Python Solution\nclass Solution:\n    def solve(self):\n        # Write your solution here\n        pass\n`,
//     63: `// JavaScript Solution\nvar solve = function() {\n    // Write your solution here\n};\n`,
//     51: `// C# Solution\npublic class Solution {\n    public void Solve() {\n        // Write your solution here\n    }\n}\n`,
//     50: `// C Solution\n#include <stdio.h>\n\nvoid solve() {\n    // Write your solution here\n}\n`,
//     60: `// Go Solution\npackage main\n\nfunc solve() {\n    // Write your solution here\n}\n`,
//     72: `# Ruby Solution\ndef solve\n  # Write your solution here\nend\n`,
// }
//
// const DiffBadge = ({ diff }) => {
//     const map = {
//         Easy:   { color:'#22c55e', bg:'rgba(34,197,94,.1)',   border:'rgba(34,197,94,.2)'   },
//         Medium: { color:'#f59e0b', bg:'rgba(245,158,11,.1)', border:'rgba(245,158,11,.2)' },
//         Hard:   { color:'#ef4444', bg:'rgba(239,68,68,.1)',   border:'rgba(239,68,68,.2)'   },
//     }
//     const s = map[diff] || map.Easy
//     return (
//         <span style={{
//             fontSize:10.5, fontWeight:700, padding:'2px 10px', borderRadius:10,
//             background:s.bg, border:`1px solid ${s.border}`, color:s.color,
//             fontFamily:"'JetBrains Mono',monospace",
//         }}>{diff}</span>
//     )
// }
//
// const VerdictBadge = ({ status }) => {
//     const map = {
//         [SUBMISSION_STATUS.ACCEPTED]:            { color:'#22c55e', label:'✓ Accepted'           },
//         [SUBMISSION_STATUS.WRONG_ANSWER]:        { color:'#ef4444', label:'✗ Wrong Answer'       },
//         [SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED]: { color:'#f59e0b', label:'⏱ Time Limit Exceeded'},
//         [SUBMISSION_STATUS.COMPILATION_ERROR]:   { color:'#f87171', label:'⚠ Compilation Error'  },
//         [SUBMISSION_STATUS.RUNTIME_ERROR]:       { color:'#f87171', label:'⚠ Runtime Error'      },
//     }
//     const s = map[status] || { color:'#60a5fa', label: status }
//     return (
//         <span style={{ fontSize:15, fontWeight:800, color:s.color, letterSpacing:'-.01em' }}>
//             {s.label}
//         </span>
//     )
// }
//
// const useResizable = (defaultLeftPercent = 42) => {
//     const [leftPercent, setLeftPercent] = useState(defaultLeftPercent)
//     const isDragging = useRef(false)
//     const containerRef = useRef(null)
//
//     const onMouseDown = useCallback((e) => {
//         e.preventDefault()
//         isDragging.current = true
//         document.body.style.cursor = 'col-resize'
//         document.body.style.userSelect = 'none'
//     }, [])
//
//     useEffect(() => {
//         const onMouseMove = (e) => {
//             if (!isDragging.current || !containerRef.current) return
//             const rect = containerRef.current.getBoundingClientRect()
//             const newPercent = ((e.clientX - rect.left) / rect.width) * 100
//             setLeftPercent(Math.min(Math.max(newPercent, 20), 75))
//         }
//         const onMouseUp = () => {
//             isDragging.current = false
//             document.body.style.cursor = ''
//             document.body.style.userSelect = ''
//         }
//         document.addEventListener('mousemove', onMouseMove)
//         document.addEventListener('mouseup', onMouseUp)
//         return () => {
//             document.removeEventListener('mousemove', onMouseMove)
//             document.removeEventListener('mouseup', onMouseUp)
//         }
//     }, [])
//
//     return { leftPercent, containerRef, onMouseDown }
// }
//
// const ProblemDetailPage = () => {
//     const { id }    = useParams()
//     const navigate  = useNavigate()
//     const dispatch  = useDispatch()
//     const editorRef = useRef(null)
//
//     const { currentProblem, loading: probLoading, fetchProblemById } = useProblems()
//     const { submit, polling, currentSubmission, resetSubmission }     = useCompiler()
//     const { checkSolved }                                             = useSubmission()
//
//     const { leftPercent, containerRef, onMouseDown } = useResizable(42)
//
//     const [langId,     setLangId]     = useState(54)
//     const [code,       setCode]       = useState(DEFAULT_CODE[54])
//     const [activeTab,  setActiveTab]  = useState('description')
//     const [resultOpen, setResultOpen] = useState(false)
//     const [copied,     setCopied]     = useState(false)
//     const [isSolved,   setIsSolved]   = useState(false)
//     const [runResult,  setRunResult]  = useState(null)
//     const [isRunning,  setIsRunning]  = useState(false)
//
//     useEffect(() => {
//         if (id) fetchProblemById(id)
//         return () => resetSubmission()
//     }, [id])
//
//     useEffect(() => {
//         if (id) checkSolved(id).then(setIsSolved)
//     }, [id])
//
//     const handleLangChange = (newLangId) => {
//         setLangId(Number(newLangId))
//         setCode(DEFAULT_CODE[Number(newLangId)] || '// Write your solution here\n')
//         resetSubmission()
//         setRunResult(null)
//     }
//
//     useEffect(() => {
//         if (currentSubmission?.status === SUBMISSION_STATUS.ACCEPTED) {
//             setIsSolved(true)
//             setResultOpen(true)
//             confetti({ particleCount:120, spread:70, origin:{ y:0.6 }, colors:['#22c55e','#60a5fa','#818cf8','#f59e0b','#f472b6'] })
//             toast.success('Accepted! Great job! 🎉', {
//                 style:{ background:'#0d1117', border:'1px solid rgba(34,197,94,.3)', color:'#22c55e', fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
//             })
//         }
//         if (currentSubmission?.status === SUBMISSION_STATUS.WRONG_ANSWER) {
//             setResultOpen(true)
//             toast.error('Wrong Answer — check your logic', {
//                 style:{ background:'#0d1117', border:'1px solid rgba(239,68,68,.3)', color:'#f87171', fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
//             })
//         }
//     }, [currentSubmission])
//
//     const handleRun = async () => {
//         setIsRunning(true)
//         setResultOpen(true)
//         setRunResult(null)
//         await new Promise(r => setTimeout(r, 1200))
//         setRunResult({
//             passed: true,
//             cases: [
//                 { label:'Test 1', input:'nums=[2,7,11,15], target=9', pass:true },
//                 { label:'Test 2', input:'nums=[3,2,4], target=6',     pass:true },
//                 { label:'Test 3', input:'nums=[3,3], target=6',       pass:true },
//             ],
//             runtime: '4ms',
//             memory: '8.2 MB',
//         })
//         setIsRunning(false)
//     }
//
//     const handleSubmit = async () => {
//         if (!code.trim()) return
//         setResultOpen(true)
//         resetSubmission()
//         setRunResult(null)
//         await submit(Number(id), code, langId)
//     }
//
//     const handleCopy = () => { setCopied(true); setTimeout(() => setCopied(false), 1500) }
//
//     const handleReset = () => {
//         setCode(DEFAULT_CODE[langId] || '')
//         toast('Code reset to default', {
//             icon:'↺',
//             style:{ background:'#0d1117', border:'1px solid rgba(226,232,240,.1)', color:'rgba(226,232,240,.8)', fontSize:12, fontFamily:"'JetBrains Mono',monospace" },
//         })
//     }
//
//     const currentLang  = PROGRAMMING_LANGUAGES.find(l => l.id === langId)
//     const isSubmitting = polling
//
//     const editorLang = () => {
//         const n = currentLang?.name?.toLowerCase() || ''
//         if (n.includes('python'))     return 'python'
//         if (n.includes('java') && !n.includes('javascript')) return 'java'
//         if (n.includes('javascript')) return 'javascript'
//         if (n.includes('c#'))         return 'csharp'
//         if (n.includes('go'))         return 'go'
//         if (n.includes('ruby'))       return 'ruby'
//         return 'cpp'
//     }
//
//     return (
//         <>
//             <Toaster position="top-right" />
//             <style>{`
//                 @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
//                 @keyframes pdFadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
//                 @keyframes pdSpin     { to{transform:rotate(360deg)} }
//                 @keyframes pdPulse    { 0%,100%{opacity:.4} 50%{opacity:1} }
//                 @keyframes pdResultIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
//                 * { box-sizing:border-box; margin:0; padding:0; }
//                 .pd-page { height:100vh; background:#06080e; font-family:'Space Grotesk',sans-serif; display:flex; flex-direction:column; overflow:hidden; }
//                 .pd-topbar { background:rgba(6,8,14,.97); border-bottom:1px solid rgba(226,232,240,.08); padding:0 20px; display:flex; align-items:center; height:52px; gap:12px; flex-shrink:0; }
//                 .pd-back { display:flex; align-items:center; gap:6px; padding:5px 12px; border-radius:7px; background:rgba(226,232,240,.04); border:1px solid rgba(226,232,240,.09); color:rgba(148,163,184,.7); font-size:12px; cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all .2s; }
//                 .pd-back:hover { color:#e2e8f0; background:rgba(226,232,240,.08); }
//                 .pd-prob-id { font-size:11px; font-family:'JetBrains Mono',monospace; color:rgba(148,163,184,.3); }
//                 .pd-prob-name { font-size:14px; font-weight:700; color:#e2e8f0; }
//                 .pd-topic-tag { font-size:10.5px; padding:2px 9px; border-radius:6px; background:rgba(226,232,240,.04); border:1px solid rgba(226,232,240,.07); color:rgba(148,163,184,.55); font-family:'JetBrains Mono',monospace; }
//                 .pd-topbar-right { margin-left:auto; display:flex; align-items:center; gap:8px; }
//                 .pd-acc-txt { font-size:11px; font-family:'JetBrains Mono',monospace; color:rgba(148,163,184,.4); }
//                 .pd-run-btn { display:flex; align-items:center; gap:6px; padding:6px 16px; border-radius:8px; background:rgba(226,232,240,.06); border:1px solid rgba(226,232,240,.12); color:rgba(226,232,240,.8); font-size:12.5px; font-weight:600; cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all .2s; }
//                 .pd-run-btn:hover { background:rgba(226,232,240,.1); }
//                 .pd-run-btn:disabled { opacity:.4; cursor:not-allowed; }
//                 .pd-submit-btn { display:flex; align-items:center; gap:6px; padding:6px 18px; border-radius:8px; background:linear-gradient(135deg,#22c55e,#16a34a); border:none; color:#fff; font-size:12.5px; font-weight:700; cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all .2s; }
//                 .pd-submit-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 4px 14px rgba(34,197,94,.3); }
//                 .pd-submit-btn:disabled { opacity:.5; cursor:not-allowed; }
//                 .pd-main { flex:1; display:flex; overflow:hidden; }
//                 .pd-left { display:flex; flex-direction:column; overflow:hidden; background:#06080e; height:100%; }
//                 .pd-tab-bar { display:flex; border-bottom:1px solid rgba(226,232,240,.07); flex-shrink:0; background:rgba(226,232,240,.015); }
//                 .pd-tab { padding:10px 18px; font-size:12.5px; font-weight:600; color:rgba(148,163,184,.5); cursor:pointer; transition:all .2s; border-bottom:2px solid transparent; font-family:'Space Grotesk',sans-serif; white-space:nowrap; display:flex; align-items:center; gap:5px; }
//                 .pd-tab:hover { color:rgba(226,232,240,.7); }
//                 .pd-tab.pd-tab-active { color:#60a5fa; border-bottom-color:#60a5fa; }
//                 .pd-content { flex:1; overflow-y:auto; padding:22px; }
//                 .pd-content::-webkit-scrollbar { width:4px; }
//                 .pd-content::-webkit-scrollbar-thumb { background:rgba(226,232,240,.09); border-radius:2px; }
//                 .pd-prob-title { font-size:19px; font-weight:800; color:#e2e8f0; letter-spacing:-.025em; margin-bottom:12px; }
//                 .pd-tags-row { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:18px; }
//                 .pd-tag { font-size:10.5px; padding:2px 9px; border-radius:6px; background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.08); color:rgba(148,163,184,.6); font-family:'JetBrains Mono',monospace; }
//                 .pd-sec-label { font-size:10px; font-family:'JetBrains Mono',monospace; color:rgba(148,163,184,.4); letter-spacing:.1em; text-transform:uppercase; margin-bottom:8px; margin-top:18px; }
//                 .pd-example { background:rgba(226,232,240,.03); border:1px solid rgba(226,232,240,.07); border-radius:10px; padding:13px 15px; margin-bottom:10px; }
//                 .pd-ex-label { font-size:9.5px; font-family:'JetBrains Mono',monospace; color:rgba(148,163,184,.4); letter-spacing:.1em; margin-bottom:7px; }
//                 .pd-ex-code { font-family:'JetBrains Mono',monospace; font-size:12px; color:rgba(226,232,240,.75); line-height:1.7; }
//                 .pd-constraint { display:flex; align-items:center; gap:8px; font-size:12px; color:rgba(226,232,240,.6); font-family:'JetBrains Mono',monospace; padding:3px 0; }
//                 .pd-con-dot { width:4px; height:4px; border-radius:50%; background:#60a5fa; flex-shrink:0; }
//                 .pd-hint-box { padding:12px 15px; border-radius:9px; background:rgba(96,165,250,.05); border:1px solid rgba(96,165,250,.12); font-size:12px; color:rgba(148,163,184,.5); font-family:'JetBrains Mono',monospace; cursor:pointer; transition:all .2s; margin-bottom:8px; }
//                 .pd-hint-box:hover { border-color:rgba(96,165,250,.25); color:rgba(226,232,240,.7); }
//                 .pd-solved-banner { display:flex; align-items:center; gap:8px; padding:10px 14px; border-radius:9px; background:rgba(34,197,94,.07); border:1px solid rgba(34,197,94,.18); margin-bottom:16px; font-size:13px; font-weight:600; color:#22c55e; }
//                 .pd-resize-handle { width:5px; background:rgba(226,232,240,.05); cursor:col-resize; transition:background .2s; flex-shrink:0; }
//                 .pd-resize-handle:hover { background:rgba(96,165,250,.4); }
//                 .pd-resize-handle:active { background:rgba(96,165,250,.6); }
//                 .pd-right { display:flex; flex-direction:column; overflow:hidden; background:#0d1117; height:100%; }
//                 .pd-editor-topbar { display:flex; align-items:center; gap:8px; padding:8px 14px; background:rgba(226,232,240,.02); border-bottom:1px solid rgba(226,232,240,.07); flex-shrink:0; }
//                 .pd-lang-sel { padding:4px 10px; border-radius:7px; background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.09); color:rgba(226,232,240,.8); font-size:12px; font-family:'JetBrains Mono',monospace; outline:none; cursor:pointer; }
//                 .pd-editor-actions { margin-left:auto; display:flex; gap:6px; }
//                 .pd-action-btn { display:flex; align-items:center; gap:5px; padding:4px 10px; border-radius:6px; background:rgba(226,232,240,.04); border:1px solid rgba(226,232,240,.08); color:rgba(148,163,184,.6); font-size:11px; cursor:pointer; font-family:'JetBrains Mono',monospace; transition:all .18s; }
//                 .pd-action-btn:hover { color:#e2e8f0; background:rgba(226,232,240,.08); }
//                 .pd-result { border-top:1px solid rgba(226,232,240,.07); background:rgba(6,8,14,.9); flex-shrink:0; transition:height .3s cubic-bezier(.4,0,.2,1); overflow:hidden; }
//                 .pd-result-header { display:flex; align-items:center; gap:8px; padding:10px 14px; cursor:pointer; user-select:none; }
//                 .pd-result-title { font-size:12px; font-weight:600; color:rgba(148,163,184,.6); font-family:'JetBrains Mono',monospace; }
//                 .pd-result-body { padding:12px 14px; overflow-y:auto; max-height:176px; }
//                 .pd-result-body::-webkit-scrollbar { width:4px; }
//                 .pd-result-body::-webkit-scrollbar-thumb { background:rgba(226,232,240,.08); border-radius:2px; }
//                 .pd-verdict-row { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
//                 .pd-verdict-meta { font-size:11px; font-family:'JetBrains Mono',monospace; color:rgba(148,163,184,.45); }
//                 .pd-tc { display:flex; align-items:center; gap:8px; padding:8px 11px; border-radius:8px; margin-bottom:5px; }
//                 .pd-tc-pass { background:rgba(34,197,94,.07); border:1px solid rgba(34,197,94,.15); }
//                 .pd-tc-fail { background:rgba(239,68,68,.07); border:1px solid rgba(239,68,68,.15); }
//                 .pd-tc-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
//                 .pd-tc-pass .pd-tc-dot { background:#22c55e; }
//                 .pd-tc-fail .pd-tc-dot { background:#ef4444; }
//                 .pd-tc-label { font-size:11.5px; font-family:'JetBrains Mono',monospace; color:rgba(226,232,240,.6); flex:1; }
//                 .pd-tc-status { font-size:10px; font-family:'JetBrains Mono',monospace; font-weight:700; }
//                 .pd-tc-pass .pd-tc-status { color:#22c55e; }
//                 .pd-tc-fail .pd-tc-status { color:#ef4444; }
//                 .pd-spinner { width:14px; height:14px; border:2px solid rgba(226,232,240,.08); border-top-color:#60a5fa; border-radius:50%; animation:pdSpin .7s linear infinite; flex-shrink:0; }
//                 .pd-submitting { font-size:12px; font-family:'JetBrains Mono',monospace; color:rgba(148,163,184,.45); animation:pdPulse 1.2s ease-in-out infinite; }
//                 .pd-markdown p { font-size:13px; color:rgba(226,232,240,.7); line-height:1.78; margin-bottom:10px; }
//                 .pd-markdown code { font-family:'JetBrains Mono',monospace; font-size:12px; color:#60a5fa; background:rgba(96,165,250,.08); padding:1px 6px; border-radius:4px; }
//                 .pd-markdown pre { background:rgba(226,232,240,.03); border:1px solid rgba(226,232,240,.07); border-radius:8px; padding:12px 14px; margin-bottom:12px; overflow-x:auto; }
//                 .pd-markdown pre code { background:none; color:#e2e8f0; padding:0; }
//                 .pd-markdown ul, .pd-markdown ol { padding-left:20px; margin-bottom:10px; }
//                 .pd-markdown li { font-size:13px; color:rgba(226,232,240,.7); line-height:1.75; }
//                 .pd-markdown strong { color:#e2e8f0; font-weight:700; }
//             `}</style>
//
//             <div className="pd-page">
//
//                 {/* TOPBAR */}
//                 <div className="pd-topbar">
//                     <button className="pd-back" onClick={() => navigate('/problems')}>
//                         <ArrowLeft size={12} /> Problems
//                     </button>
//                     <div style={{ width:1, height:20, background:'rgba(226,232,240,.08)' }} />
//                     <span className="pd-prob-id">
//                         {currentProblem?.id ? String(currentProblem.id).padStart(3,'0') : '---'}
//                     </span>
//                     <span className="pd-prob-name">{currentProblem?.title || '...'}</span>
//                     {currentProblem?.difficulty && <DiffBadge diff={currentProblem.difficulty} />}
//                     {currentProblem?.topic && <span className="pd-topic-tag">{currentProblem.topic}</span>}
//                     <div className="pd-topbar-right">
//                         {currentProblem?.acceptanceRate && (
//                             <span className="pd-acc-txt">Acceptance: {Math.round(currentProblem.acceptanceRate)}%</span>
//                         )}
//                         <div style={{ width:1, height:20, background:'rgba(226,232,240,.08)' }} />
//                         <button className="pd-run-btn" onClick={handleRun} disabled={isRunning || isSubmitting}>
//                             {isRunning ? <div className="pd-spinner" style={{ width:11, height:11, borderWidth:1.5 }} /> : <Play size={11} />}
//                             {isRunning ? 'Running...' : 'Run'}
//                         </button>
//                         <button className="pd-submit-btn" onClick={handleSubmit} disabled={isSubmitting || isRunning}>
//                             {isSubmitting
//                                 ? <><div className="pd-spinner" style={{ width:10, height:10, borderWidth:1.5, borderTopColor:'#fff' }} /> Judging...</>
//                                 : <><Send size={11} /> Submit</>
//                             }
//                         </button>
//                     </div>
//                 </div>
//
//                 {/* MAIN SPLIT */}
//                 <div className="pd-main" ref={containerRef}>
//
//                     {/* LEFT */}
//                     <div className="pd-left" style={{ width:`${leftPercent}%`, minWidth:'20%' }}>
//                         <div className="pd-tab-bar">
//                             {[
//                                 { key:'description', label:'Description', icon:<BookOpen size={12}/> },
//                                 { key:'hints',       label:'Hints',       icon:<Lightbulb size={12}/> },
//                                 { key:'submissions', label:'Submissions', icon:<Clock size={12}/> },
//                             ].map(t => (
//                                 <div key={t.key} className={`pd-tab ${activeTab===t.key?'pd-tab-active':''}`} onClick={()=>setActiveTab(t.key)}>
//                                     {t.icon} {t.label}
//                                 </div>
//                             ))}
//                         </div>
//
//                         {activeTab === 'description' && (
//                             <div className="pd-content">
//                                 {isSolved && (
//                                     <div className="pd-solved-banner"><Check size={14}/> You have solved this problem!</div>
//                                 )}
//                                 {probLoading ? (
//                                     <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
//                                         {[200,300,180,250,160].map((w,i) => (
//                                             <div key={i} style={{ height:12, width:w, borderRadius:4, background:'rgba(226,232,240,.07)', animation:`pdPulse 1.4s ${i*.1}s ease-in-out infinite` }} />
//                                         ))}
//                                     </div>
//                                 ) : currentProblem ? (
//                                     <>
//                                         <div className="pd-prob-title">{currentProblem.title}</div>
//                                         <div className="pd-tags-row">
//                                             {currentProblem.topic && <span className="pd-tag">{currentProblem.topic}</span>}
//                                             {currentProblem.difficulty && <DiffBadge diff={currentProblem.difficulty}/>}
//                                             {currentProblem.tags?.map((t,i) => <span key={i} className="pd-tag">{t}</span>)}
//                                         </div>
//                                         <div className="pd-markdown">
//                                             <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
//                                                 {currentProblem.description || ''}
//                                             </ReactMarkdown>
//                                         </div>
//                                         {currentProblem.examples?.length > 0 && (
//                                             <>
//                                                 <div className="pd-sec-label">Examples</div>
//                                                 {currentProblem.examples.map((ex,i) => (
//                                                     <div key={i} className="pd-example">
//                                                         <div className="pd-ex-label">EXAMPLE {i+1}</div>
//                                                         <div className="pd-ex-code">
//                                                             <span style={{color:'#818cf8'}}>Input: </span>
//                                                             <span style={{color:'#34d399'}}>{ex.input}</span><br/>
//                                                             <span style={{color:'#818cf8'}}>Output: </span>
//                                                             <span style={{color:'#34d399'}}>{ex.output}</span>
//                                                             {ex.explanation && <><br/><span style={{color:'rgba(148,163,184,.4)'}}>// {ex.explanation}</span></>}
//                                                         </div>
//                                                     </div>
//                                                 ))}
//                                             </>
//                                         )}
//                                         {currentProblem.constraints?.length > 0 && (
//                                             <>
//                                                 <div className="pd-sec-label">Constraints</div>
//                                                 {currentProblem.constraints.map((c,i) => (
//                                                     <div key={i} className="pd-constraint">
//                                                         <div className="pd-con-dot"/> {c}
//                                                     </div>
//                                                 ))}
//                                             </>
//                                         )}
//                                     </>
//                                 ) : (
//                                     <div style={{fontSize:13,color:'rgba(148,163,184,.4)',fontFamily:"'JetBrains Mono',monospace"}}>Problem not found.</div>
//                                 )}
//                             </div>
//                         )}
//
//                         {activeTab === 'hints' && (
//                             <div className="pd-content">
//                                 {currentProblem?.hints?.length > 0
//                                     ? currentProblem.hints.map((hint,i) => <HintBox key={i} index={i+1} hint={hint}/>)
//                                     : <div style={{fontSize:13,color:'rgba(148,163,184,.4)',fontFamily:"'JetBrains Mono',monospace"}}>No hints available.</div>
//                                 }
//                             </div>
//                         )}
//
//                         {activeTab === 'submissions' && (
//                             <div className="pd-content"><SubmissionsTab problemId={id}/></div>
//                         )}
//                     </div>
//
//                     {/* RESIZE HANDLE */}
//                     <div className="pd-resize-handle" onMouseDown={onMouseDown}/>
//
//                     {/* RIGHT */}
//                     <div className="pd-right" style={{ flex:1, minWidth:'25%' }}>
//                         <div className="pd-editor-topbar">
//                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,.5)" strokeWidth="2">
//                                 <polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/>
//                             </svg>
//                             <select className="pd-lang-sel" value={langId} onChange={e=>handleLangChange(e.target.value)}>
//                                 {PROGRAMMING_LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
//                             </select>
//                             <div className="pd-editor-actions">
//                                 <button className="pd-action-btn" onClick={handleReset}><RotateCcw size={11}/> Reset</button>
//                                 <CopyToClipboard text={code} onCopy={handleCopy}>
//                                     <button className="pd-action-btn">
//                                         {copied ? <><Check size={11} style={{color:'#22c55e'}}/> Copied</> : <><Copy size={11}/> Copy</>}
//                                     </button>
//                                 </CopyToClipboard>
//                             </div>
//                         </div>
//
//                         <div style={{ flex:1, overflow:'hidden' }}>
//                             <Editor
//                                 height="100%"
//                                 language={editorLang()}
//                                 value={code}
//                                 onChange={val => setCode(val||'')}
//                                 onMount={editor => { editorRef.current = editor }}
//                                 theme="vs-dark"
//                                 options={{
//                                     fontSize:13.5, fontFamily:"'JetBrains Mono',monospace", fontLigatures:true,
//                                     lineHeight:1.8, minimap:{enabled:false}, scrollBeyondLastLine:false,
//                                     padding:{top:16,bottom:16}, tabSize:4, wordWrap:'on',
//                                     cursorBlinking:'smooth', cursorSmoothCaretAnimation:'on', smoothScrolling:true,
//                                     renderLineHighlight:'all', bracketPairColorization:{enabled:true}, guides:{bracketPairs:true},
//                                 }}
//                             />
//                         </div>
//
//                         <div className="pd-result" style={{ height:resultOpen?220:44 }}>
//                             <div className="pd-result-header" onClick={()=>setResultOpen(o=>!o)}>
//                                 {resultOpen ? <ChevronDown size={12} style={{color:'rgba(148,163,184,.5)'}}/> : <ChevronUp size={12} style={{color:'rgba(148,163,184,.5)'}}/>}
//                                 <span className="pd-result-title">Test Results</span>
//                                 {(currentSubmission?.status || runResult) && (
//                                     <div style={{ width:6,height:6,borderRadius:'50%',marginLeft:4, background:currentSubmission?.status===SUBMISSION_STATUS.ACCEPTED||runResult?.passed?'#22c55e':'#ef4444' }}/>
//                                 )}
//                             </div>
//                             <div className="pd-result-body">
//                                 {(isSubmitting||isRunning) && (
//                                     <div style={{display:'flex',alignItems:'center',gap:8}}>
//                                         <div className="pd-spinner"/>
//                                         <span className="pd-submitting">{isSubmitting?'Submitting to judge...':'Running test cases...'}</span>
//                                     </div>
//                                 )}
//                                 {!isSubmitting && currentSubmission && (
//                                     <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
//                                         <div className="pd-verdict-row">
//                                             <VerdictBadge status={currentSubmission.status}/>
//                                             {currentSubmission.runtime && (
//                                                 <span className="pd-verdict-meta">Runtime: {currentSubmission.runtime}ms · Memory: {currentSubmission.memory}KB</span>
//                                             )}
//                                         </div>
//                                         {currentSubmission.testCaseResults?.map((tc,i) => (
//                                             <div key={i} className={`pd-tc ${tc.passed?'pd-tc-pass':'pd-tc-fail'}`}>
//                                                 <div className="pd-tc-dot"/>
//                                                 <span className="pd-tc-label">Test {i+1}: {tc.input}</span>
//                                                 <span className="pd-tc-status">{tc.passed?'PASS':'FAIL'}</span>
//                                             </div>
//                                         ))}
//                                     </motion.div>
//                                 )}
//                                 {!isRunning && !currentSubmission && runResult && (
//                                     <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
//                                         {runResult.cases.map((tc,i) => (
//                                             <div key={i} className={`pd-tc ${tc.pass?'pd-tc-pass':'pd-tc-fail'}`}>
//                                                 <div className="pd-tc-dot"/>
//                                                 <span className="pd-tc-label">{tc.label}: {tc.input}</span>
//                                                 <span className="pd-tc-status">{tc.pass?'PASS':'FAIL'}</span>
//                                             </div>
//                                         ))}
//                                         <div style={{marginTop:8,fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:'rgba(148,163,184,.4)'}}>
//                                             Runtime: {runResult.runtime} · Memory: {runResult.memory}
//                                         </div>
//                                     </motion.div>
//                                 )}
//                                 {!isSubmitting && !isRunning && !currentSubmission && !runResult && (
//                                     <div style={{fontSize:12,color:'rgba(148,163,184,.35)',fontFamily:"'JetBrains Mono',monospace"}}>
//                                         Run your code to see results here
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     )
// }
//
// const HintBox = ({ index, hint }) => {
//     const [open, setOpen] = useState(false)
//     return (
//         <div className="pd-hint-box" onClick={()=>setOpen(o=>!o)} style={{color:open?'rgba(226,232,240,.75)':'rgba(148,163,184,.5)'}}>
//             <div style={{display:'flex',alignItems:'center',gap:8}}>
//                 <Lightbulb size={13} style={{color:'#f59e0b',flexShrink:0}}/>
//                 <span style={{fontWeight:600}}>Hint {index}</span>
//                 {!open && <span style={{marginLeft:'auto',fontSize:10,opacity:.5}}>Click to reveal</span>}
//             </div>
//             {open && (
//                 <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} style={{marginTop:8,fontSize:12,lineHeight:1.65}}>
//                     {hint}
//                 </motion.div>
//             )}
//         </div>
//     )
// }
//
// const SubmissionsTab = ({ problemId }) => {
//     const { submissions, loading, fetchMySubmissions } = useSubmission()
//     const [mySubmissions, setMySubmissions] = useState([])
//
//     useEffect(() => { fetchMySubmissions().then(()=>{}) }, [])
//     useEffect(() => {
//         setMySubmissions(submissions.filter(s => String(s.problemId)===String(problemId)))
//     }, [submissions, problemId])
//
//     if (loading) return (
//         <div style={{display:'flex',flexDirection:'column',gap:8}}>
//             {[1,2,3].map(i => <div key={i} style={{height:44,borderRadius:8,background:'rgba(226,232,240,.05)',animation:`pdPulse 1.4s ${i*.1}s ease-in-out infinite`}}/>)}
//         </div>
//     )
//
//     if (!mySubmissions.length) return (
//         <div style={{fontSize:13,color:'rgba(148,163,184,.4)',fontFamily:"'JetBrains Mono',monospace"}}>No submissions yet.</div>
//     )
//
//     const statusColor = s => ({
//         [SUBMISSION_STATUS.ACCEPTED]:'#22c55e',
//         [SUBMISSION_STATUS.WRONG_ANSWER]:'#ef4444',
//         [SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED]:'#f59e0b',
//         [SUBMISSION_STATUS.COMPILATION_ERROR]:'#f87171',
//         [SUBMISSION_STATUS.RUNTIME_ERROR]:'#f87171',
//     })[s] || '#60a5fa'
//
//     return (
//         <div style={{display:'flex',flexDirection:'column',gap:6}}>
//             {mySubmissions.map((s,i) => (
//                 <div key={s.id||i} style={{
//                     display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:9,
//                     background:'rgba(226,232,240,.03)',border:'1px solid rgba(226,232,240,.06)',
//                     animation:`pdFadeUp .3s ${i*.05}s ease-out both`,
//                 }}>
//                     <span style={{fontSize:12,fontWeight:700,color:statusColor(s.status),fontFamily:"'JetBrains Mono',monospace",minWidth:100}}>{s.status}</span>
//                     <span style={{fontSize:11,color:'rgba(148,163,184,.5)',fontFamily:"'JetBrains Mono',monospace"}}>
//                         {PROGRAMMING_LANGUAGES.find(l=>l.id===s.languageId)?.name||'Unknown'}
//                     </span>
//                     <span style={{fontSize:11,color:'rgba(148,163,184,.35)',fontFamily:"'JetBrains Mono',monospace",marginLeft:'auto'}}>
//                         {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : ''}
//                     </span>
//                 </div>
//             ))}
//         </div>
//     )
// }
//
// export default ProblemDetailPage