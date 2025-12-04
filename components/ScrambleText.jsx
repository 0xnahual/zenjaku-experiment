import { useState, useEffect, useRef } from 'react'

const CHARS = '-_~=+*^&%$#@!/\\|'

export default function ScrambleText({ text, className, useMask = false, maskLength = null }) {
    const activeMaskLength = maskLength !== null ? maskLength : text.length
    const maskText = '*'.repeat(activeMaskLength)
    const [displayText, setDisplayText] = useState(useMask ? maskText : text)
    const intervalRef = useRef(null)

    const scrambleTo = (target) => {
        let iteration = 0
        clearInterval(intervalRef.current)

        intervalRef.current = setInterval(() => {
            setDisplayText(prev =>
                target
                    .split('')
                    .map((letter, index) => {
                        if (index < iteration) {
                            return target[index]
                        }
                        return CHARS[Math.floor(Math.random() * CHARS.length)]
                    })
                    .join('')
            )

            if (iteration >= target.length) {
                clearInterval(intervalRef.current)
            }

            iteration += 1 / 3
        }, 30)
    }

    useEffect(() => {
        if (!useMask) {
            scrambleTo(text)
        }
        return () => clearInterval(intervalRef.current)
    }, [])

    const handleMouseEnter = () => {
        scrambleTo(text)
    }

    const handleMouseLeave = () => {
        if (useMask) {
            scrambleTo(maskText)
        }
    }

    return (
        <span
            className={`inline-block cursor-help ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ fontFamily: 'monospace' }}
        >
            {displayText}
        </span>
    )
}
