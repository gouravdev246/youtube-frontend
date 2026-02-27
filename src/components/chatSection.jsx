import { useState, useContext } from 'react'
import axios from 'axios'
import './chatSection.css'
import { Link, useNavigate } from 'react-router-dom'
import { CounterContext } from '../App'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/* ──── SVG Icons ──── */
const PlayIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M8 5v14l11-7z" />
    </svg>
)

const SendIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
)

const LinkIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
)

const VideoIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
    </svg>
)

/* ──── Helpers ──── */
const extractVideoID = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi
    const match = regex.exec(url)
    return match ? match[1] : null
}

const getTimeStamp = () => {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/* ──── Component ──── */
export const ChatSection = () => {
    const [videoUrl, setVideoUrl] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const navigate = useNavigate()
    const { isLogin, user, setUser } = useContext(CounterContext)

    /* Auto-scroll removed — handled by ChatPage now */

    /* ── Step 1: Set video & create session ── */
    const handleSetVideo = async (e) => {
        e.preventDefault()
        const id = extractVideoID(videoUrl)
        if (!id) {
            alert('Please paste a valid YouTube video URL.')
            return
        }
        setIsCreating(true)
        try {
            const res = await axios.post(`${API}/api/chat/create`, {
                videoId: id
            }, { withCredentials: true })

            // Update user credits in local state
            if (res.data.usageLimit !== undefined) {
                setUser({ ...user, usageLimit: res.data.usageLimit })
            }

            navigate(`/chat/${res.data.chatId}`)
        } catch (error) {
            console.error('Failed to create session:', error)
            alert('Failed to start session. Are you logged in?')
        } finally {
            setIsCreating(false)
        }
    }


    /* ──── Render ──── */
    return (
        <div className="chat-container">
            {/* Header */}
            <header className="chat-header">
                <div className="chat-header__badge">
                    <span className="chat-header__badge-dot" />
                    AI Powered
                </div>
                <h1 className="chat-header__title">YouTube Analyzer</h1>
                <p className="chat-header__subtitle">
                    Paste any YouTube video link and ask questions — our AI reads the comments so you don't have to.
                </p>
            </header>

            {/* URL Input Form */}
            <form className="url-card" onSubmit={handleSetVideo}>
                <label className="url-card__label">
                    <span className="url-card__label-icon"><LinkIcon /></span>
                    Video Link
                </label>
                <div className="url-card__input-wrapper">
                    <input
                        className="url-card__input"
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={videoUrl}
                        onChange={e => setVideoUrl(e.target.value)}
                        autoFocus
                    />
                    <button
                        className="url-card__analyze-btn"
                        type="submit"
                        disabled={!videoUrl.trim() || isCreating}
                    >
                        <PlayIcon />
                        {isCreating ? 'Starting...' : 'Analyze'}
                    </button>
                </div>
            </form>

            {/* Welcome cards */}
            <div className="chat-messages">
                <WelcomeState />
            </div>
        </div>
    )
}

/* ──── Welcome State Sub-component ──── */
const WelcomeState = () => (
    <div className="chat-welcome">
        <div className="chat-welcome__icon-grid">
            <div className="chat-welcome__feature-card">
                <span className="chat-welcome__feature-icon">💬</span>
                <span className="chat-welcome__feature-title">Sentiment Analysis</span>
                <span className="chat-welcome__feature-desc">Understand what people think about the video</span>
            </div>
            <div className="chat-welcome__feature-card">
                <span className="chat-welcome__feature-icon">🔍</span>
                <span className="chat-welcome__feature-title">Topic Extraction</span>
                <span className="chat-welcome__feature-desc">Discover common themes in the discussion</span>
            </div>
            <div className="chat-welcome__feature-card">
                <span className="chat-welcome__feature-icon">⚡</span>
                <span className="chat-welcome__feature-title">Instant Insights</span>
                <span className="chat-welcome__feature-desc">Get AI-powered answers in seconds</span>
            </div>
        </div>
    </div>
)
