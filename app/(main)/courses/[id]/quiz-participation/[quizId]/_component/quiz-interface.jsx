"use client"

import { useState, useEffect, useRef, useCallback, useReducer } from "react"
import { toast } from "sonner" // NEW: Import the toast function
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Shield, ChevronLeft, ChevronRight, WifiOff, Wifi, Clock } from "lucide-react"
import QuizTimer from "./quiz-timer"
import AntiCheatMonitor from "./anti-cheat-monitor"

function QuizQuestion({ question, answer, onAnswerChange, disabled }) {
    const handleMCQChange = (checked, optionLabel) => {
        const currentAnswers = answer?.answer || []
        let newAnswers
        if (checked) {
            newAnswers = [...currentAnswers, optionLabel]
        } else {
            newAnswers = currentAnswers.filter((label) => label !== optionLabel)
        }
        onAnswerChange(question.id, newAnswers, 'mcq')
    }

    switch (question.type) {
        case 'mcq':
            return (
                <div className="space-y-4">
                    <p className="text-lg font-medium text-card-foreground">{question.text}</p>
                    <div className="space-y-3">
                        {question.options.map((opt, i) => (
                            <div key={i} className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent/50 transition-colors">
                                <Checkbox
                                    id={`q-${question.id}-opt-${i}`}
                                    checked={answer?.answer?.includes(opt.label) || false}
                                    onCheckedChange={(checked) => handleMCQChange(checked, opt.label)}
                                    disabled={disabled}
                                />
                                <Label htmlFor={`q-${question.id}-opt-${i}`} className="text-base font-normal cursor-pointer flex-1">
                                    {opt.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            )
        case 'short_answer':
            return (
                <div className="space-y-4">
                    <p className="text-lg font-medium text-card-foreground">{question.text}</p>
                    <Input
                        placeholder="Type your short answer here..."
                        value={answer?.answer || ""}
                        onChange={(e) => onAnswerChange(question.id, e.target.value, 'short_answer')}
                        disabled={disabled}
                    />
                </div>
            )
        case 'long_answer':
            return (
                <div className="space-y-4">
                    <p className="text-lg font-medium text-card-foreground">{question.text}</p>
                    <Textarea
                        placeholder="Type your detailed answer here..."
                        value={answer?.answer || ""}
                        onChange={(e) => onAnswerChange(question.id, e.target.value, 'long_answer')}
                        rows={8}
                        disabled={disabled}
                    />
                </div>
            )
        default:
            return <p>Unsupported question type.</p>
    }
}

const quizReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_VIOLATION':
            return {
                ...state,
                violations: [...state.violations, action.payload],
                warningCount: state.warningCount + 1
            }
        case 'SET_SUBMITTING':
            return { ...state, isSubmitting: action.payload }
        case 'UPDATE_ANSWER':
            return {
                ...state,
                answers: {
                    ...state.answers,
                    [action.payload.questionId]: action.payload
                }
            }
        case 'SET_WARNING':
            return {
                ...state,
                showWarning: action.payload.show,
                warningMessage: action.payload.message || state.warningMessage
            }
        case 'SET_FULLSCREEN_STATUS':
            return { ...state, isFullscreenSupported: action.payload }
        case 'SET_OFFLINE_STATE':
            return {
                ...state,
                isOffline: action.payload.isOffline,
                offlineStartTime: action.payload.offlineStartTime,
                disconnectionCount: action.payload.disconnectionCount !== undefined
                    ? action.payload.disconnectionCount
                    : state.disconnectionCount,
                totalOfflineTime: action.payload.totalOfflineTime !== undefined
                    ? action.payload.totalOfflineTime
                    : state.totalOfflineTime,
                shouldAutoSubmitOnReconnect: action.payload.shouldAutoSubmitOnReconnect !== undefined
                    ? action.payload.shouldAutoSubmitOnReconnect
                    : state.shouldAutoSubmitOnReconnect,
                autoSubmitReason: action.payload.autoSubmitReason || state.autoSubmitReason
            }
        case 'UPDATE_OFFLINE_TRACKING':
            return {
                ...state,
                totalOfflineTime: action.payload.totalOfflineTime,
                disconnectionCount: action.payload.disconnectionCount
            }
        case 'MARK_FOR_AUTO_SUBMIT':
            return {
                ...state,
                shouldAutoSubmitOnReconnect: true,
                autoSubmitReason: action.payload.reason
            }
        default:
            return state
    }
}

export default function QuizInterface({ quiz, currentUser, courseId, userSubmissions }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit * 60)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [timerPaused, setTimerPaused] = useState(false)

    // Use reducer for complex state management
    const [state, dispatch] = useReducer(quizReducer, {
        answers: {},
        violations: [],
        warningCount: 0,
        isSubmitting: false,
        showWarning: false,
        warningMessage: "",
        isFullscreenSupported: true,
        isOffline: false,
        offlineStartTime: null,
        disconnectionCount: 0,
        totalOfflineTime: 0,
        shouldAutoSubmitOnReconnect: false,
        autoSubmitReason: ""
    })

    console.log("Enhanced Offline State: ", {
        isOffline: state.isOffline,
        disconnectionCount: state.disconnectionCount,
        totalOfflineTime: state.totalOfflineTime,
        shouldAutoSubmitOnReconnect: state.shouldAutoSubmitOnReconnect,
        autoSubmitReason: state.autoSubmitReason
    })

    const quizContainerRef = useRef(null)
    const heartbeatIntervalRef = useRef(null)
    const submissionTimeoutRef = useRef(null)
    const offlineTimeoutRef = useRef(null)
    const offlineTrackingIntervalRef = useRef(null)
    const hasAutoSubmittedRef = useRef(false) // Prevent duplicate submissions
    const fullscreenAttempted = useRef(false)

    const currentQuestion = quiz.questions[currentQuestionIndex]
    const totalQuestions = quiz.questions.length
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

    // Enhanced offline handling with smart submission logic
    const handleOffline = useCallback(() => {
        if (state.isOffline || hasAutoSubmittedRef.current) return

        const offlineStartTime = Date.now()
        const newDisconnectionCount = state.disconnectionCount + 1

        console.log(`🔴 User went offline - Disconnection #${newDisconnectionCount}`)

        dispatch({
            type: 'SET_OFFLINE_STATE',
            payload: {
                isOffline: true,
                offlineStartTime,
                disconnectionCount: newDisconnectionCount,
                shouldAutoSubmitOnReconnect: false // Reset this initially
            }
        })

        // Pause the timer immediately
        setTimerPaused(true)

        // Store current quiz state in localStorage for recovery
        const offlineQuizState = {
            quizId: quiz.id,
            userId: currentUser.id,
            answers: state.answers,
            violations: state.violations,
            timeRemaining,
            currentQuestionIndex,
            offlineStartTime,
            disconnectionCount: newDisconnectionCount,
            totalOfflineTime: state.totalOfflineTime,
            timestamp: new Date().toISOString()
        }

        try {
            localStorage.setItem(`quiz_${quiz.id}_offline_state`, JSON.stringify(offlineQuizState))
            console.log("📱 Offline state stored in localStorage")
        } catch (error) {
            console.error("❌ Failed to store offline state:", error)
        }

        // Start tracking offline time with 1-second precision
        offlineTrackingIntervalRef.current = setInterval(() => {
            const currentOfflineTime = Date.now() - offlineStartTime

            // Update the stored state periodically
            const updatedState = {
                ...offlineQuizState,
                currentOfflineTime,
                lastUpdate: new Date().toISOString()
            }

            try {
                localStorage.setItem(`quiz_${quiz.id}_offline_state`, JSON.stringify(updatedState))
            } catch (error) {
                console.error("❌ Failed to update offline state:", error)
            }
        }, 1000)

        // Handle disconnection logic based on count
        if (newDisconnectionCount === 1) {
            // First disconnection: Wait 30 seconds before flagging for auto-submit
            showWarningMessage("⚠️ Connection lost. Reconnect within 30 seconds to avoid auto-submission.")

            offlineTimeoutRef.current = setTimeout(() => {
                console.log("⏰ 30-second grace period expired - marking for auto-submit")

                dispatch({
                    type: 'MARK_FOR_AUTO_SUBMIT',
                    payload: {
                        reason: "First disconnection exceeded 30 seconds"
                    }
                })

                // Update localStorage with auto-submit flag
                try {
                    const storedState = localStorage.getItem(`quiz_${quiz.id}_offline_state`)
                    if (storedState) {
                        const data = JSON.parse(storedState)
                        data.shouldAutoSubmit = true
                        data.autoSubmitReason = "First disconnection exceeded 30 seconds"
                        localStorage.setItem(`quiz_${quiz.id}_offline_state`, JSON.stringify(data))
                        console.log("🚨 Auto-submit flag set in localStorage")
                    }
                } catch (error) {
                    console.error("❌ Failed to update auto-submit flag:", error)
                }

                showWarningMessage("🔥 Grace period expired! Quiz will auto-submit when connection returns.")
            }, 30000) // 30 seconds

        } else {
            // Second or subsequent disconnections: Immediate auto-submit when online
            console.log("🚨 Multiple disconnections detected - immediate auto-submit on reconnect")

            dispatch({
                type: 'MARK_FOR_AUTO_SUBMIT',
                payload: {
                    reason: `Multiple disconnections detected (${newDisconnectionCount} times)`
                }
            })

            showWarningMessage(`🚨 Multiple disconnections detected! Quiz will auto-submit immediately when connection returns.`)

            // Update localStorage immediately for multiple disconnections
            try {
                const storedState = localStorage.getItem(`quiz_${quiz.id}_offline_state`)
                if (storedState) {
                    const data = JSON.parse(storedState)
                    data.shouldAutoSubmit = true
                    data.autoSubmitReason = `Multiple disconnections (${newDisconnectionCount} times)`
                    localStorage.setItem(`quiz_${quiz.id}_offline_state`, JSON.stringify(data))
                }
            } catch (error) {
                console.error("❌ Failed to set immediate auto-submit flag:", error)
            }
        }
    }, [state.isOffline, state.disconnectionCount, state.answers, state.violations, timeRemaining, currentQuestionIndex, quiz.id, currentUser.id])

    const handleOnline = useCallback(() => {
        if (!state.isOffline || hasAutoSubmittedRef.current) return

        console.log("🟢 Connection restored")

        // Calculate offline duration
        const offlineDuration = state.offlineStartTime ? Date.now() - state.offlineStartTime : 0
        const offlineSeconds = Math.floor(offlineDuration / 1000)
        const newTotalOfflineTime = state.totalOfflineTime + offlineDuration

        console.log(`📊 Offline duration: ${offlineSeconds} seconds, Total offline: ${Math.floor(newTotalOfflineTime / 1000)} seconds`)

        // Clear offline tracking intervals
        if (offlineTrackingIntervalRef.current) {
            clearInterval(offlineTrackingIntervalRef.current)
            offlineTrackingIntervalRef.current = null
        }

        if (offlineTimeoutRef.current) {
            clearTimeout(offlineTimeoutRef.current)
            offlineTimeoutRef.current = null
        }

        // Check if we need to auto-submit
        let shouldAutoSubmit = state.shouldAutoSubmitOnReconnect
        let autoSubmitReason = state.autoSubmitReason

        // Also check localStorage in case of page refresh
        try {
            const storedState = localStorage.getItem(`quiz_${quiz.id}_offline_state`)
            if (storedState) {
                const offlineData = JSON.parse(storedState)
                if (offlineData.shouldAutoSubmit) {
                    shouldAutoSubmit = true
                    autoSubmitReason = offlineData.autoSubmitReason || autoSubmitReason
                    console.log("📱 Auto-submit flag found in localStorage:", autoSubmitReason)
                }
            }
        } catch (error) {
            console.error("❌ Failed to check localStorage for auto-submit flag:", error)
        }

        if (shouldAutoSubmit) {
            // Auto-submit immediately
            console.log("🚨 Auto-submitting due to offline conditions:", autoSubmitReason)

            // Add offline violation
            const offlineViolation = {
                type: "network_disconnect_violation",
                timestamp: new Date(),
                duration: offlineDuration,
                disconnectionNumber: state.disconnectionCount,
                reason: autoSubmitReason,
                totalOfflineTime: newTotalOfflineTime
            }

            dispatch({ type: 'ADD_VIOLATION', payload: offlineViolation })

            // Update offline tracking
            dispatch({
                type: 'UPDATE_OFFLINE_TRACKING',
                payload: {
                    totalOfflineTime: newTotalOfflineTime,
                    disconnectionCount: state.disconnectionCount
                }
            })

            // Clean up and submit
            try {
                localStorage.removeItem(`quiz_${quiz.id}_offline_state`)
            } catch (error) {
                console.error("❌ Failed to clean up localStorage:", error)
            }

            autoSubmitQuiz(autoSubmitReason)
            return
        }

        // Resume normal operation - No auto-submit needed
        console.log("✅ Resuming normal operation - no auto-submit needed")

        // Update offline state
        dispatch({
            type: 'SET_OFFLINE_STATE',
            payload: {
                isOffline: false,
                offlineStartTime: null,
                disconnectionCount: state.disconnectionCount,
                totalOfflineTime: newTotalOfflineTime,
                shouldAutoSubmitOnReconnect: false,
                autoSubmitReason: ""
            }
        })

        // Resume timer with time deduction
        setTimerPaused(false)
        const timeAfterDeduction = Math.max(0, timeRemaining - offlineSeconds)
        setTimeRemaining(timeAfterDeduction)

        console.log(`⏰ Time deduction: ${offlineSeconds}s, Remaining: ${timeAfterDeduction}s`)

        // Clean up stored state
        try {
            localStorage.removeItem(`quiz_${quiz.id}_offline_state`)
        } catch (error) {
            console.error("❌ Failed to clean up localStorage:", error)
        }

        // Show reconnection message
        showWarningMessage(
            `✅ Connection restored! ${offlineSeconds}s deducted from quiz time. Total offline: ${Math.floor(newTotalOfflineTime / 1000)}s`
        )
    }, [
        state.isOffline,
        state.offlineStartTime,
        state.totalOfflineTime,
        state.disconnectionCount,
        state.shouldAutoSubmitOnReconnect,
        state.autoSubmitReason,
        timeRemaining,
        quiz.id
    ])

    // Improved violation handler with better dependency management
    const handleViolation = useCallback((type, message) => {
        // Prevent handling violations if already submitting or offline
        if (hasAutoSubmittedRef.current || state.isOffline) return

        const newViolation = {
            type,
            timestamp: new Date(),
            count: state.violations.filter((v) => v.type === type).length + 1,
        }

        dispatch({ type: 'ADD_VIOLATION', payload: newViolation })

        // Immediate auto-submit violations (but not for fullscreen issues if not supported)
        const immediateSubmitTypes = ["developer_tools", "copy_paste_success"]
        if (immediateSubmitTypes.includes(type)) {
            autoSubmitQuiz(message)
            return
        }

        // Only auto-submit for fullscreen exit if fullscreen is actually supported and was working
        if (type === "fullscreen_exit" && state.isFullscreenSupported && isFullscreen) {
            autoSubmitQuiz(message)
            return
        }

        // Warning system for gradual violations
        const warningTypes = ["tab_switch", "window_minimize", "copy_paste_attempt", "keyboard_shortcut"]
        if (warningTypes.includes(type)) {
            const typeViolations = state.violations.filter((v) => v.type === type).length + 1

            if (typeViolations >= 2) {
                autoSubmitQuiz(`Too many ${type.replace("_", " ")} violations`)
            } else {
                showWarningMessage(`⚠️ Warning: ${message}. Next violation will auto-submit the quiz.`)
            }
        }

        // Log violation (TODO: Replace with actual server action)
        console.log("🔍 Logging violation:", newViolation)
    }, [state.violations, state.isFullscreenSupported, state.isOffline, isFullscreen])

    // Improved auto-submit with race condition prevention
    const autoSubmitQuiz = useCallback((reason) => {
        if (hasAutoSubmittedRef.current) {
            console.log("🚫 Auto-submit already in progress, skipping...")
            return
        }

        hasAutoSubmittedRef.current = true
        dispatch({ type: 'SET_SUBMITTING', payload: true })

        console.log("🚨 AUTO-SUBMITTING QUIZ:", reason)
        console.log("📋 Final answers:", state.answers)
        console.log("⚠️ Violations:", state.violations)
        console.log("📊 Offline tracking:", {
            disconnectionCount: state.disconnectionCount,
            totalOfflineTime: state.totalOfflineTime
        })

        // Clear any existing timeouts and intervals
        if (submissionTimeoutRef.current) {
            clearTimeout(submissionTimeoutRef.current)
        }
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current)
        }
        if (offlineTimeoutRef.current) {
            clearTimeout(offlineTimeoutRef.current)
        }
        if (offlineTrackingIntervalRef.current) {
            clearInterval(offlineTrackingIntervalRef.current)
        }

        // Clean up any stored offline state
        try {
            localStorage.removeItem(`quiz_${quiz.id}_offline_state`)
            console.log("🧹 Cleaned up localStorage")
        } catch (error) {
            console.error("❌ Failed to clean up offline state:", error)
        }

        // TODO: Replace with actual server action
        submissionTimeoutRef.current = setTimeout(() => {
            // REPLACED: alert(`🚨 Quiz auto-submitted due to: ${reason}`)
            toast.error("Quiz Auto-Submitted", {
                description: reason,
                duration: 10000, // Keep message on screen longer
            });
            // TODO: Redirect to results page
        }, 2000)
    }, [state.answers, state.violations, state.disconnectionCount, state.totalOfflineTime, quiz.id])

    const showWarningMessage = (message) => {
        dispatch({
            type: 'SET_WARNING',
            payload: { show: true, message }
        })

        setTimeout(() => {
            dispatch({
                type: 'SET_WARNING',
                payload: { show: false }
            })
        }, 6000) // Increased to 6 seconds for better readability
    }

    // Check fullscreen support and capabilities
    const checkFullscreenSupport = useCallback(() => {
        const isSupported = !!(
            document.fullscreenEnabled ||
            document.webkitFullscreenEnabled ||
            document.mozFullScreenEnabled ||
            document.msFullscreenEnabled
        )

        if (!isSupported) {
            console.warn("Fullscreen API not supported in this browser")
            dispatch({ type: 'SET_FULLSCREEN_STATUS', payload: false })
            showWarningMessage("Fullscreen mode not supported in this browser. Quiz will continue in normal mode.")
        }

        return isSupported
    }, [])

    // Robust fullscreen handling with better error management
    const attemptFullscreen = useCallback(async () => {
        if (fullscreenAttempted.current || !state.isFullscreenSupported) return

        fullscreenAttempted.current = true

        try {
            const element = quizContainerRef.current
            if (!element) {
                console.warn("Quiz container not found")
                return
            }

            // Check if already in fullscreen
            if (document.fullscreenElement || document.webkitFullscreenElement ||
                document.mozFullScreenElement || document.msFullscreenElement) {
                setIsFullscreen(true)
                return
            }

            // Try different fullscreen methods based on browser support
            if (element.requestFullscreen) {
                await element.requestFullscreen()
            } else if (element.webkitRequestFullscreen) {
                await element.webkitRequestFullscreen()
            } else if (element.mozRequestFullScreen) {
                await element.mozRequestFullScreen()
            } else if (element.msRequestFullscreen) {
                await element.msRequestFullscreen()
            } else {
                throw new Error("No fullscreen method available")
            }

            setIsFullscreen(true)
            console.log("✅ Successfully entered fullscreen mode")

        } catch (error) {
            console.error("❌ Failed to enter fullscreen:", error)

            // Handle different types of errors
            if (error.name === 'NotAllowedError') {
                showWarningMessage("Fullscreen blocked by browser. Please allow fullscreen and refresh to take quiz in secure mode.")
            } else if (error.name === 'TypeError' && error.message.includes('Permissions')) {
                showWarningMessage("Browser permissions prevent fullscreen. Quiz will continue in normal mode.")
            } else {
                console.warn("Fullscreen not available, continuing with enhanced monitoring")
                showWarningMessage("Fullscreen unavailable. Enhanced monitoring is active.")
            }

            // Don't treat fullscreen failure as a violation if it's not supported
            setIsFullscreen(false)
        }
    }, [state.isFullscreenSupported])

    // Initialize fullscreen
    useEffect(() => {
        const isSupported = checkFullscreenSupport()

        if (isSupported) {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                attemptFullscreen()
            }, 500)

            return () => clearTimeout(timer)
        }
    }, [checkFullscreenSupport, attemptFullscreen])

    // Handle fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            )

            setIsFullscreen(isCurrentlyFullscreen)

            // Only trigger violation if fullscreen was working and user intentionally exited
            if (!isCurrentlyFullscreen && fullscreenAttempted.current &&
                state.isFullscreenSupported && !hasAutoSubmittedRef.current && !state.isOffline) {

                // Give a brief moment to check if this was intentional or system-caused
                setTimeout(() => {
                    if (!document.fullscreenElement && !hasAutoSubmittedRef.current && !state.isOffline) {
                        handleViolation("fullscreen_exit", "Exited fullscreen mode - Auto-submitting quiz")
                    }
                }, 1000)
            }
        }

        // Add event listeners for different browsers
        document.addEventListener("fullscreenchange", handleFullscreenChange)
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
        document.addEventListener("mozfullscreenchange", handleFullscreenChange)
        document.addEventListener("MSFullscreenChange", handleFullscreenChange)

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange)
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
            document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
            document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
        }
    }, [handleViolation, state.isFullscreenSupported, state.isOffline])

    // Enhanced online/offline detection with immediate handling
    useEffect(() => {
        const handleOnlineEvent = () => {
            console.log("🌐 Browser online event triggered")
            handleOnline()
        }

        const handleOfflineEvent = () => {
            console.log("🌐 Browser offline event triggered")
            handleOffline()
        }

        window.addEventListener('online', handleOnlineEvent)
        window.addEventListener('offline', handleOfflineEvent)

        // Check initial connection status
        if (!navigator.onLine && !state.isOffline) {
            console.log("🔍 Initial check: User is offline")
            handleOffline()
        }

        return () => {
            window.removeEventListener('online', handleOnlineEvent)
            window.removeEventListener('offline', handleOfflineEvent)
        }
    }, [handleOnline, handleOffline, state.isOffline])

    // Improved heartbeat with proper cleanup
    useEffect(() => {
        const startHeartbeat = () => {
            heartbeatIntervalRef.current = setInterval(() => {
                if (!hasAutoSubmittedRef.current && !state.isOffline) {
                    // TODO: Call server action to validate session
                    console.log("💓 Heartbeat: Validating quiz session...")
                }
            }, 10000)
        }

        startHeartbeat()

        return () => {
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current)
            }
            if (submissionTimeoutRef.current) {
                clearTimeout(submissionTimeoutRef.current)
            }
            if (offlineTimeoutRef.current) {
                clearTimeout(offlineTimeoutRef.current)
            }
            if (offlineTrackingIntervalRef.current) {
                clearInterval(offlineTrackingIntervalRef.current)
            }
        }
    }, [state.isOffline])

    // Recovery on component mount (in case of page refresh during offline)
    useEffect(() => {
        try {
            const storedState = localStorage.getItem(`quiz_${quiz.id}_offline_state`)
            if (storedState) {
                const offlineData = JSON.parse(storedState)

                // Check if this is a valid recovery scenario
                if (offlineData.userId === currentUser.id) {
                    console.log("🔄 Recovering from offline state:", offlineData)

                    // Restore answers if any
                    Object.keys(offlineData.answers || {}).forEach(questionId => {
                        dispatch({
                            type: 'UPDATE_ANSWER',
                            payload: offlineData.answers[questionId]
                        })
                    })

                    // Update disconnection tracking
                    dispatch({
                        type: 'UPDATE_OFFLINE_TRACKING',
                        payload: {
                            disconnectionCount: offlineData.disconnectionCount || 0,
                            totalOfflineTime: offlineData.totalOfflineTime || 0
                        }
                    })

                    // Check if should auto-submit
                    if (offlineData.shouldAutoSubmit) {
                        console.log("🚨 Recovery: Auto-submitting due to stored flag")
                        autoSubmitQuiz("Recovered from offline state - " + offlineData.autoSubmitReason)
                    } else {
                        // Clean up if no auto-submit needed
                        localStorage.removeItem(`quiz_${quiz.id}_offline_state`)
                        console.log("✅ Recovery: No auto-submit needed, cleaned up localStorage")
                    }
                }
            }
        } catch (error) {
            console.error("❌ Failed to recover offline state:", error)
        }
    }, [quiz.id, currentUser.id, autoSubmitQuiz])

    const handleAnswerChange = (questionId, answer, questionType) => {
        dispatch({
            type: 'UPDATE_ANSWER',
            payload: { questionId, answer, questionType }
        })

        // Store in localStorage if offline for recovery
        if (state.isOffline) {
            try {
                const storedState = localStorage.getItem(`quiz_${quiz.id}_offline_state`)
                if (storedState) {
                    const offlineData = JSON.parse(storedState)
                    offlineData.answers = {
                        ...offlineData.answers,
                        [questionId]: { questionId, answer, questionType }
                    }
                    localStorage.setItem(`quiz_${quiz.id}_offline_state`, JSON.stringify(offlineData))
                    console.log("💾 Answer saved to localStorage while offline")
                }
            } catch (error) {
                console.error("❌ Failed to store offline answer:", error)
            }
        }

        // TODO: Call server action to save answer (only if online)
        if (!state.isOffline) {
            console.log("💾 Saving answer to server:", { questionId, answer, questionType })
        }
    }

    const handleTimeUp = () => {
        console.log("⏰ Time limit exceeded")
        autoSubmitQuiz("Time limit exceeded")
    }

    // NEW: Extracted submission logic to be called by toast action
    const proceedWithManualSubmit = () => {
        hasAutoSubmittedRef.current = true
        dispatch({ type: 'SET_SUBMITTING', payload: true })

        console.log("✅ Manually submitting quiz...")
        console.log("📋 Final answers:", state.answers)

        // TODO: Replace with actual server action
        setTimeout(() => {
            // REPLACED: alert("✅ Quiz submitted successfully!")
            toast.success("Quiz submitted successfully!")
            // TODO: Redirect to results page
        }, 2000)
    }

    const handleManualSubmit = () => {
        if (state.isSubmitting || hasAutoSubmittedRef.current) return

        const unansweredQuestions = quiz.questions.filter((q) => {
            const answerData = state.answers[q.id];
            if (!answerData) return true;
            if (Array.isArray(answerData.answer)) return answerData.answer.length === 0;
            return !answerData.answer;
        });

        if (unansweredQuestions.length > 0) {
            // REPLACED: const confirmSubmit = confirm(...)
            toast.warning("Are you sure you want to submit?", {
                description: `You have ${unansweredQuestions.length} unanswered questions.`,
                action: {
                    label: "Submit Anyway",
                    onClick: () => proceedWithManualSubmit(),
                },
                cancel: {
                    label: "Cancel",
                },
                duration: 10000,
            })
        } else {
            proceedWithManualSubmit()
        }
    }

    const nextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((prev) => prev + 1)
        }
    }

    const previousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1)
        }
    }

    const goToQuestion = (index) => {
        setCurrentQuestionIndex(index)
    }

    // Determine security badge status with enhanced offline awareness
    const getSecurityStatus = () => {
        if (state.isOffline) return {
            variant: "destructive",
            text: "Offline Mode",
            icon: WifiOff
        }
        if (state.shouldAutoSubmitOnReconnect) return {
            variant: "destructive",
            text: "Auto-Submit Pending",
            icon: AlertTriangle
        }
        if (!state.isFullscreenSupported) return {
            variant: "secondary",
            text: "Normal Mode",
            icon: Shield
        }
        if (!isFullscreen && state.isFullscreenSupported) return {
            variant: "destructive",
            text: "Security Compromised",
            icon: AlertTriangle
        }
        if (state.warningCount > 0) return {
            variant: "warning",
            text: `${state.warningCount} Warning${state.warningCount > 1 ? 's' : ''}`,
            icon: AlertTriangle
        }
        return {
            variant: "default",
            text: "Secure Mode",
            icon: Shield
        }
    }

    const securityStatus = getSecurityStatus()

    return (
        <div
            ref={quizContainerRef}
            className="min-h-screen bg-background text-foreground p-4 font-poppins"
        >
            {/* Enhanced Warning Alert with better offline messaging */}
            {state.showWarning && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
                    <Alert className="bg-card border-border shadow-lg">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-card-foreground">
                            {state.warningMessage}
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Header with Enhanced Security Status */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{quiz.title}</h1>
                        <p className="text-muted-foreground mt-1">
                            Question {currentQuestionIndex + 1} of {totalQuestions}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Enhanced Security Badge with offline status */}
                        <Badge
                            variant={securityStatus.variant}
                            className="flex items-center gap-2 px-3 py-1"
                        >
                            <securityStatus.icon className="h-3 w-3" />
                            {securityStatus.text}
                        </Badge>

                        {/* Connection Status Badge */}
                        {state.isOffline ? (
                            <Badge variant="destructive" className="flex items-center gap-2 px-3 py-1">
                                <WifiOff className="h-3 w-3" />
                                Disconnected ({state.disconnectionCount}x)
                            </Badge>
                        ) : (
                            <Badge variant="default" className="flex items-center gap-2 px-3 py-1">
                                <Wifi className="h-3 w-3" />
                                Connected
                            </Badge>
                        )}

                        {/* Offline Time Tracker */}
                        {state.totalOfflineTime > 0 && (
                            <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
                                <Clock className="h-3 w-3" />
                                Offline: {Math.floor(state.totalOfflineTime / 1000)}s
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Enhanced Progress Bar */}
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm text-foreground font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            </div>

            {/* Quiz Timer with Enhanced Status */}
            <div className="mb-6">
                <QuizTimer
                    initialTime={timeRemaining}
                    onTimeUp={handleTimeUp}
                    paused={timerPaused || state.isOffline}
                    warningThreshold={300} // 5 minutes warning
                    criticalThreshold={120} // 2 minutes critical
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Question Navigation Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-card-foreground font-poppins font-bold">
                                Questions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                                {quiz.questions.map((question, index) => {
                                    const answerData = state.answers[question.id];
                                    let isAnswered = false;
                                    if (answerData) {
                                        if (Array.isArray(answerData.answer)) {
                                            isAnswered = answerData.answer.length > 0;
                                        } else {
                                            isAnswered = !!answerData.answer;
                                        }
                                    }
                                    const isCurrent = index === currentQuestionIndex

                                    return (
                                        <Button
                                            key={question.id}
                                            variant={isCurrent ? "default" : isAnswered ? "secondary" : "outline"}
                                            size="sm"
                                            onClick={() => goToQuestion(index)}
                                            className={`
                                                h-8 w-8 p-0 text-xs
                                                ${isCurrent ? 'bg-primary text-primary-foreground' : ''}
                                                ${isAnswered && !isCurrent ? 'bg-secondary text-secondary-foreground' : ''}
                                                ${!isAnswered && !isCurrent ? 'border-border text-foreground hover:bg-accent' : ''}
                                            `}
                                            disabled={state.isSubmitting}
                                        >
                                            {index + 1}
                                        </Button>
                                    )
                                })}
                            </div>

                            {/* Answer Summary */}
                            <div className="mt-4 pt-4 border-t border-border">
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <div>Answered: {Object.values(state.answers).filter(a => (Array.isArray(a.answer) ? a.answer.length > 0 : !!a.answer)).length}/{totalQuestions}</div>
                                    <div>Remaining: {totalQuestions - Object.values(state.answers).filter(a => (Array.isArray(a.answer) ? a.answer.length > 0 : !!a.answer)).length}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Debug Information (Remove in production) */}

                    <Card className="mt-6 bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-sm text-card-foreground">Debug Info</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground space-y-1">
                                <div>Violations: {state.violations.length}</div>
                                <div>Warnings: {state.warningCount}</div>
                                <div>Fullscreen: {isFullscreen ? 'Active' : 'Inactive'}</div>
                                <div>Fullscreen Supported: {state.isFullscreenSupported ? 'Yes' : 'No'}</div>
                                <div>Offline: {state.isOffline ? 'Yes' : 'No'}</div>
                                <div>Disconnections: {state.disconnectionCount}</div>
                                <div>Total Offline Time: {Math.floor(state.totalOfflineTime / 1000)}s</div>
                                <div>Auto-Submit Pending: {state.shouldAutoSubmitOnReconnect ? 'Yes' : 'No'}</div>
                                <div>Timer Paused: {timerPaused ? 'Yes' : 'No'}</div>
                                <div>Answered Questions: {Object.keys(state.answers).length}</div>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Main Question Area */}
                <div className="lg:col-span-3">
                    <Card className="bg-card border-border">
                        <CardContent className="p-6">
                            {/* Question Component */}
                            <QuizQuestion
                                question={currentQuestion}
                                answer={state.answers[currentQuestion.id]}
                                onAnswerChange={handleAnswerChange}
                                disabled={state.isSubmitting || state.isOffline}
                            />

                            {/* Offline Mode Notice */}
                            {state.isOffline && (
                                <Alert className="mt-4 bg-destructive/10 border-destructive">
                                    <WifiOff className="h-4 w-4" />
                                    <AlertDescription className="text-foreground">
                                        <strong>Offline Mode Active</strong>
                                        <br />
                                        {state.disconnectionCount === 1 ? (
                                            state.shouldAutoSubmitOnReconnect ? (
                                                "Grace period expired. Quiz will auto-submit when connection returns."
                                            ) : (
                                                "Reconnect within 30 seconds to avoid auto-submission."
                                            )
                                        ) : (
                                            "Multiple disconnections detected. Quiz will auto-submit immediately when connection returns."
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Navigation Controls */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-8 pt-6 border-t border-border">
                                {/* Previous Button */}
                                <Button
                                    variant="outline"
                                    onClick={previousQuestion}
                                    disabled={currentQuestionIndex === 0 || state.isSubmitting}
                                    className="w-full sm:w-auto border-border text-foreground hover:bg-accent"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Previous
                                </Button>

                                {/* Question Counter */}
                                <div className="text-sm text-muted-foreground">
                                    Question {currentQuestionIndex + 1} of {totalQuestions}
                                </div>

                                {/* Next/Submit Button */}
                                {currentQuestionIndex === totalQuestions - 1 ? (
                                    <Button
                                        onClick={handleManualSubmit}
                                        disabled={state.isSubmitting || state.isOffline}
                                        className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        {state.isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Quiz'
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={nextQuestion}
                                        disabled={state.isSubmitting}
                                        className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Anti-Cheat Monitor Component */}
            <AntiCheatMonitor
                onViolation={handleViolation}
                isActive={!state.isSubmitting && !state.isOffline}
                isFullscreenSupported={state.isFullscreenSupported}
            />


        </div>
    )
}