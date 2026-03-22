const Label = ({ children, required = false, htmlFor, hint, style: extra = {} }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:3, ...extra }}>
        <label
            htmlFor={htmlFor}
            style={{ fontSize:10, fontWeight:700, color:'rgba(148,163,184,.5)', letterSpacing:'.08em', textTransform:'uppercase', fontFamily:"'JetBrains Mono',monospace", display:'flex', alignItems:'center', gap:4 }}
        >
            {children}
            {required && <span style={{color:'#f87171'}}>*</span>}
        </label>
        {hint && (
            <span style={{ fontSize:10, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace" }}>
                {hint}
            </span>
        )}
    </div>
)

export default Label