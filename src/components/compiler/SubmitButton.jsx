// src/components/compiler/SubmitButton.jsx
import { motion } from 'framer-motion'
import { Send, Play } from 'lucide-react'
import { Spinner } from '../common/Loader.jsx'

export const RunButton = ({ onClick, disabled, loading }) => (
    <motion.button
        whileHover={!disabled ? { scale:1.03 } : {}}
        whileTap={!disabled ? { scale:.97 } : {}}
        onClick={onClick}
        disabled={disabled}
        style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 16px', borderRadius:8, background:'rgba(226,232,240,.06)', border:'1px solid rgba(226,232,240,.12)', color:'rgba(226,232,240,.8)', fontSize:12.5, fontWeight:600, cursor: disabled?'not-allowed':'pointer', fontFamily:"'Space Grotesk',sans-serif", opacity: disabled?.5:1 }}
    >
        {loading ? <Spinner size={11}/> : <Play size={11}/>}
        {loading ? 'Running...' : 'Run'}
    </motion.button>
)

export const SubmitButton = ({ onClick, disabled, loading }) => (
    <motion.button
        whileHover={!disabled ? { scale:1.03, boxShadow:'0 4px 14px rgba(34,197,94,.3)' } : {}}
        whileTap={!disabled ? { scale:.97 } : {}}
        onClick={onClick}
        disabled={disabled}
        style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 18px', borderRadius:8, background:'linear-gradient(135deg,#22c55e,#16a34a)', border:'none', color:'#fff', fontSize:12.5, fontWeight:700, cursor: disabled?'not-allowed':'pointer', fontFamily:"'Space Grotesk',sans-serif", opacity: disabled?.5:1 }}
    >
        {loading ? <Spinner size={10} color="#fff"/> : <Send size={11}/>}
        {loading ? 'Judging...' : 'Submit'}
    </motion.button>
)

export default SubmitButton