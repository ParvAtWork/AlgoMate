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
    const rafRef = useRef(null)

    useEffect(() => {
        console.log('FloatingBackground mounted, mode:', mode)
        const W = window.innerWidth
        const H = window.innerHeight
        const particles = []

        BG_ITEMS.forEach((item) => {
            let x
            if (mode === 'auth') {
                const cL   = (W - cardWidth) / 2
                const cR   = cL + cardWidth
                const side = Math.random() > 0.5 ? 'left' : 'right'
                x = side === 'left'
                    ? Math.random() * Math.max(cL - 20, 10)
                    : cR + 10 + Math.random() * Math.max(W - cR - 220, 10)
            } else {
                const side = Math.random() > 0.5 ? 'left' : 'right'
                x = side === 'left'
                    ? Math.random() * (W * 0.22)
                    : (W * 0.78) + Math.random() * (W * 0.18)
            }

            const y       = Math.random() * H
            const speed   = 0.5 + Math.random() * 0.8
            const isQuote = item.text.startsWith('//')
            const op      = isQuote ? 0.32 : 0.22
            const color   = item.color.replace('VAL', op)
            const shadow  = item.color.replace('VAL', op * 0.4)

            const el = document.createElement('div')
            el.textContent         = item.text
            el.style.position      = 'fixed'
            el.style.left          = `${x}px`
            el.style.top           = '0px'
            el.style.animation     = 'none'
            el.style.transform     = `translateY(${y}px)`
            el.style.fontFamily    = "'JetBrains Mono', monospace"
            el.style.fontSize      = `${item.size}px`
            el.style.fontWeight    = isQuote ? '500' : '400'
            el.style.color         = color
            el.style.textShadow    = `0 0 8px ${shadow}`
            el.style.whiteSpace    = 'nowrap'
            el.style.pointerEvents = 'none'
            el.style.userSelect    = 'none'
            el.style.zIndex        = '0'
            el.style.willChange    = 'transform'

            document.body.appendChild(el)
            particles.push({ el, y, speed })
        })

        console.log('Total particles:', particles.length)

        let running = true

        const tick = () => {
            if (!running) return
            particles.forEach(p => {
                p.y -= p.speed
                if (p.y < -40) p.y = H + 10
                p.el.style.transform = `translateY(${p.y}px)`
            })
            rafRef.current = requestAnimationFrame(tick)
        }

        const timer = setTimeout(() => {
            console.log('RAF starting...')
            rafRef.current = requestAnimationFrame(tick)
        }, 100)

        return () => {
            running = false
            clearTimeout(timer)
            cancelAnimationFrame(rafRef.current)
            particles.forEach(p => {
                try { document.body.removeChild(p.el) } catch(e) {}
            })
        }
    }, [mode, cardWidth])

    return null
}

export default FloatingBackground