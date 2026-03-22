// src/components/compiler/LanguageSelector.jsx
import { PROGRAMMING_LANGUAGES } from '../../config/constants.js'

const LanguageSelector = ({ langId, onChange }) => (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,.5)" strokeWidth="2">
            <polyline points="16,18 22,12 16,6"/>
            <polyline points="8,6 2,12 8,18"/>
        </svg>
        <select
            value={langId}
            onChange={e => onChange(Number(e.target.value))}
            style={{ padding:'4px 10px', borderRadius:7, background:'rgba(226,232,240,.05)', border:'1px solid rgba(226,232,240,.09)', color:'rgba(226,232,240,.8)', fontSize:12, fontFamily:"'JetBrains Mono',monospace", outline:'none', cursor:'pointer' }}
        >
            {PROGRAMMING_LANGUAGES.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
            ))}
        </select>
    </div>
)

export default LanguageSelector