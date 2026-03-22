// src/components/compiler/CodeEditor.jsx
import Editor from '@monaco-editor/react'
import { PROGRAMMING_LANGUAGES } from '../../config/constants.js'

const editorLang = (langId) => {
    const name = PROGRAMMING_LANGUAGES.find(l => l.id === langId)?.name?.toLowerCase() || ''
    if (name.includes('python'))                              return 'python'
    if (name.includes('java') && !name.includes('javascript')) return 'java'
    if (name.includes('javascript'))                           return 'javascript'
    if (name.includes('c#'))                                   return 'csharp'
    if (name.includes('go'))                                   return 'go'
    if (name.includes('ruby'))                                 return 'ruby'
    return 'cpp'
}

const CodeEditor = ({ code, onChange, langId, onMount }) => (
    <Editor
        height="100%"
        language={editorLang(langId)}
        value={code}
        onChange={val => onChange(val || '')}
        onMount={onMount}
        theme="vs-dark"
        options={{
            fontSize:                   13.5,
            fontFamily:                 "'JetBrains Mono', monospace",
            fontLigatures:              true,
            lineHeight:                 1.8,
            minimap:                    { enabled: false },
            scrollBeyondLastLine:       false,
            padding:                    { top:16, bottom:16 },
            tabSize:                    4,
            wordWrap:                   'on',
            cursorBlinking:             'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling:            true,
            renderLineHighlight:        'all',
            bracketPairColorization:    { enabled: true },
            guides:                     { bracketPairs: true },
        }}
    />
)

export default CodeEditor