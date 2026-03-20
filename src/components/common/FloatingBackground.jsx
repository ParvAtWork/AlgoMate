import { useEffect, useRef } from 'react'

const BG_ITEMS = [
    { text: 'function twoSum(nums, target)', color: 'rgba(96,165,250,VAL)', size: 12 },
    { text: 'const map = new Map()', color: 'rgba(96,165,250,VAL)', size: 11 },
    { text: 'while (queue.length > 0)', color: 'rgba(96,165,250,VAL)', size: 12 },
    { text: 'dp[i] = dp[i-1] + dp[i-2]', color: 'rgba(96,165,250,VAL)', size: 11 },
    { text: 'mid = (left + right) >> 1', color: 'rgba(96,165,250,VAL)', size: 12 },
    { text: 'graph[u].push(v)', color: 'rgba(96,165,250,VAL)', size: 11 },
    { text: 'O(n log n)', color: 'rgba(96,165,250,VAL)', size: 13 },
    { text: 'Binary Search O(log n)', color: 'rgba(96,165,250,VAL)', size: 11 },
    { text: 'BFS · DFS · DP', color: 'rgba(96,165,250,VAL)', size: 13 },
    { text: 'Sliding Window O(n)', color: 'rgba(96,165,250,VAL)', size: 11 },
    { text: 'Two Pointers Approach', color: 'rgba(96,165,250,VAL)', size: 12 },
    { text: 'stack.push(node.val)', color: 'rgba(96,165,250,VAL)', size: 11 },
    { text: 'const dfs = (node) =>', color: 'rgba(167,139,250,VAL)', size: 12 },
    { text: 'new TreeNode(val)', color: 'rgba(167,139,250,VAL)', size: 11 },
    { text: 'visited.add(node)', color: 'rgba(167,139,250,VAL)', size: 12 },
    { text: 'return memo[n]', color: 'rgba(167,139,250,VAL)', size: 11 },
    { text: 'LinkedList · Heap · Trie', color: 'rgba(167,139,250,VAL)', size: 12 },
    { text: 'O(1) space complexity', color: 'rgba(52,211,153,VAL)', size: 12 },
    { text: 'mergeSort(left, right)', color: 'rgba(52,211,153,VAL)', size: 11 },
    { text: 'arr.sort((a,b) => a-b)', color: 'rgba(52,211,153,VAL)', size: 12 },
    { text: 'quickSort(arr, lo, hi)', color: 'rgba(52,211,153,VAL)', size: 11 },
    { text: 'for (let i=0; i<n; i++)', color: 'rgba(52,211,153,VAL)', size: 12 },
    { text: '// Eat. Sleep. Code. Repeat.', color: 'rgba(251,191,36,VAL)', size: 12 },
    { text: '// It works on my machine 🤷', color: 'rgba(251,191,36,VAL)', size: 11 },
    { text: '// TODO: fix this later', color: 'rgba(251,191,36,VAL)', size: 12 },
    { text: "// Don't touch. It works.", color: 'rgba(251,191,36,VAL)', size: 11 },
    { text: '// import coffee from "life"', color: 'rgba(251,191,36,VAL)', size: 12 },
    { text: '// git commit -m "final_v3"', color: 'rgba(251,191,36,VAL)', size: 11 },
    { text: '// NullPointerException 💀', color: 'rgba(251,191,36,VAL)', size: 12 },
    { text: '// rubber duck debugging 🦆', color: 'rgba(251,191,36,VAL)', size: 11 },
    { text: '// Push to prod on Friday 🔥', color: 'rgba(251,191,36,VAL)', size: 12 },
    { text: '// 10x developer ☕☕☕', color: 'rgba(251,191,36,VAL)', size: 11 },
    { text: '// console.log("why???")', color: 'rgba(251,191,36,VAL)', size: 12 },
    { text: '// merge conflicts again...', color: 'rgba(251,191,36,VAL)', size: 11 },
    { text: '// undefined is not a function', color: 'rgba(251,191,36,VAL)', size: 12 },
    { text: '// First solve the problem.', color: 'rgba(251,191,36,VAL)', size: 11 },
    { text: '// sudo make me a sandwich', color: 'rgba(251,191,36,VAL)', size: 12 },
    { text: '// Talk is cheap, show code.', color: 'rgba(251,191,36,VAL)', size: 11 },
]

const FloatingBackground = ({ mode = 'auth', cardWidth = 420 }) => {
    const containerRef = useRef(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const ROW_HEIGHT = 36
        const screenH = window.innerHeight
        const screenW = window.innerWidth
        const totalRows = Math.floor(screenH / ROW_HEIGHT)

        const shuffled = [...BG_ITEMS].sort(() => Math.random() - 0.5)

        shuffled.forEach((item, i) => {
            const el = document.createElement('div')
            const row = i % totalRows
            const topPx = row * ROW_HEIGHT + Math.random() * 8

            let x

            if (mode === 'auth') {
                const cardLeft = (screenW - cardWidth) / 2
                const cardRight = cardLeft + cardWidth
                const side = Math.random() > 0.5 ? 'left' : 'right'
                if (side === 'left') {
                    x = Math.random() * Math.max(cardLeft - 20, 10)
                } else {
                    x = cardRight + 10 + Math.random() * Math.max(screenW - cardRight - 220, 10)
                }
            } else {
                // full mode — left 25% and right 25% only, avoid center
                const side = Math.random() > 0.5 ? 'left' : 'right'
                if (side === 'left') {
                    x = Math.random() * (screenW * 0.22)
                } else {
                    x = (screenW * 0.78) + Math.random() * (screenW * 0.18)
                }
            }

            const dur = 22 + Math.random() * 20
            const delay = -(Math.random() * dur)
            const isQuote = item.text.startsWith('//')
            const op = isQuote
                ? 0.28 + Math.random() * 0.1
                : 0.22 + Math.random() * 0.1
            const color = item.color.replace('VAL', op)
            const shadowColor = item.color.replace('VAL', op * 0.4)

            el.style.cssText = `
        position: absolute;
        font-family: 'JetBrains Mono', monospace;
        pointer-events: none;
        white-space: nowrap;
        user-select: none;
        left: ${x}px;
        top: ${topPx}px;
        font-size: ${item.size}px;
        color: ${color};
        text-shadow: 0 0 10px ${shadowColor};
        font-weight: ${isQuote ? 500 : 400};
        animation: bgFloat ${dur}s linear ${delay}s infinite;
        z-index: 0;
      `
            el.textContent = item.text
            container.appendChild(el)
        })

        return () => {
            while (container.firstChild) {
                container.removeChild(container.firstChild)
            }
        }
    }, [mode, cardWidth])

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                overflow: 'hidden',
                zIndex: 0,
            }}
        />
    )
}

export default FloatingBackground