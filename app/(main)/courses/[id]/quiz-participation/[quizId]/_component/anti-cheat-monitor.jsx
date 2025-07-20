"use client"

import { useEffect, useRef } from "react"


export default function AntiCheatMonitor({ onViolation }) {
    const networkCheckRef = useRef()
    const devToolsCheckRef = useRef()
    const lastNetworkCheckRef = useRef(Date.now())

    // Disable right-click and keyboard shortcuts
    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault()
            onViolation("right_click", "Right-click is disabled during quiz")
        }

        const handleKeyDown = (e) => {
            // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Ctrl+P, etc.
            const forbiddenKeys = [
                "F12",
                { key: "I", ctrl: true, shift: true },
                { key: "J", ctrl: true, shift: true },
                { key: "U", ctrl: true },
                { key: "S", ctrl: true },
                { key: "P", ctrl: true },
                { key: "A", ctrl: true },
                { key: "C", ctrl: true },
                { key: "V", ctrl: true },
                { key: "X", ctrl: true },
                { key: "Z", ctrl: true },
                { key: "Y", ctrl: true },
            ]

            const isForbidden = forbiddenKeys.some((forbidden) => {
                if (typeof forbidden === "string") {
                    return e.key === forbidden
                }
                return e.key === forbidden.key && e.ctrlKey === forbidden.ctrl && (forbidden.shift ? e.shiftKey : true)
            })

            if (isForbidden) {
                e.preventDefault()
                onViolation("keyboard_shortcut", `Keyboard shortcut ${e.key} is disabled`)
            }
        }

        const handleCopy = (e) => {
            e.preventDefault()
            onViolation("copy_paste_attempt", "Copy operation blocked")
        }

        const handlePaste = (e) => {
            e.preventDefault()
            onViolation("copy_paste_attempt", "Paste operation blocked")
        }

        const handleCut = (e) => {
            e.preventDefault()
            onViolation("copy_paste_attempt", "Cut operation blocked")
        }

        const handleSelectStart = (e) => {
            e.preventDefault()
        }

        const handleDragStart = (e) => {
            e.preventDefault()
        }

        // Add event listeners
        document.addEventListener("contextmenu", handleContextMenu)
        document.addEventListener("keydown", handleKeyDown)
        document.addEventListener("copy", handleCopy)
        document.addEventListener("paste", handlePaste)
        document.addEventListener("cut", handleCut)
        document.addEventListener("selectstart", handleSelectStart)
        document.addEventListener("dragstart", handleDragStart)

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu)
            document.removeEventListener("keydown", handleKeyDown)
            document.removeEventListener("copy", handleCopy)
            document.removeEventListener("paste", handlePaste)
            document.removeEventListener("cut", handleCut)
            document.removeEventListener("selectstart", handleSelectStart)
            document.removeEventListener("dragstart", handleDragStart)
        }
    }, [onViolation])

    // Monitor tab switching and window focus
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                onViolation("tab_switch", "Tab switching detected")
            }
        }

        const handleWindowBlur = () => {
            onViolation("window_minimize", "Window lost focus")
        }

        const handleWindowFocus = () => {
            // Window regained focus - could be returning from another app
            console.log("Window regained focus")
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)
        window.addEventListener("blur", handleWindowBlur)
        window.addEventListener("focus", handleWindowFocus)

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange)
            window.removeEventListener("blur", handleWindowBlur)
            window.removeEventListener("focus", handleWindowFocus)
        }
    }, [onViolation])

    // Monitor developer tools
    useEffect(() => {
        const devtools = { open: false, orientation: null }

        const threshold = 160

        const checkDevTools = () => {
            if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true
                    onViolation("developer_tools", "Developer tools opened - Auto-submitting quiz")
                }
            } else {
                devtools.open = false
            }
        }

        devToolsCheckRef.current = setInterval(checkDevTools, 500)

        return () => {
            if (devToolsCheckRef.current) {
                clearInterval(devToolsCheckRef.current)
            }
        }
    }, [onViolation])

    // Monitor network connectivity
    useEffect(() => {
        const handleOnline = () => {
            console.log("Network connection restored")
        }

        const handleOffline = () => {
            console.log("Network connection lost")
            // Start monitoring for extended disconnection
            setTimeout(() => {
                if (!navigator.onLine) {
                    onViolation("network_disconnect", "Network disconnected for more than 10 seconds")
                }
            }, 10000)
        }

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [onViolation])

    // Monitor for virtual machines and suspicious environments
    useEffect(() => {
        const checkEnvironment = () => {
            // Check for common VM indicators
            const userAgent = navigator.userAgent.toLowerCase()
            const suspiciousPatterns = ["virtualbox", "vmware", "qemu", "xen", "parallels"]

            const isSuspicious = suspiciousPatterns.some((pattern) => userAgent.includes(pattern))

            if (isSuspicious) {
                console.log("Suspicious environment detected:", userAgent)
                // Could log this but not necessarily auto-submit
            }

            // Check screen resolution (VMs often have unusual resolutions)
            const { screen } = window
            if (screen.width < 800 || screen.height < 600) {
                console.log("Unusual screen resolution detected:", screen.width, "x", screen.height)
            }
        }

        checkEnvironment()
    }, [])

    // Detect successful copy-paste (if somehow bypassed)
    useEffect(() => {
        const detectSuccessfulCopyPaste = () => {
            // Monitor clipboard changes (limited by browser security)
            if (navigator.clipboard && navigator.clipboard.readText) {
                let lastClipboardContent = ""

                const checkClipboard = async () => {
                    try {
                        const currentContent = await navigator.clipboard.readText()
                        if (currentContent !== lastClipboardContent && currentContent.length > 0) {
                            lastClipboardContent = currentContent
                            onViolation("copy_paste_success", "Successful copy-paste operation detected")
                        }
                    } catch (error) {
                        // Clipboard access denied - this is expected and good
                    }
                }

                const clipboardInterval = setInterval(checkClipboard, 2000)
                return () => clearInterval(clipboardInterval)
            }
        }

        const cleanup = detectSuccessfulCopyPaste()
        return cleanup
    }, [onViolation])

    // This component doesn't render anything visible
    return null
}
