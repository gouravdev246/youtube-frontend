import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { CounterContext } from '../App'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/* ──── Icons ──── */
const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="16" height="16">
        <path d="M12 5v14M5 12h14" />
    </svg>
)

const ChatIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="15" height="15">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
)

const MenuIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20">
        <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
)

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
)

const LogoutIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="15" height="15">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
)

const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="13" height="13">
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
)

/* ──── Sidebar Component ──── */
const Sidebar = () => {
    const { chatId: activeChatId } = useParams()
    const navigate = useNavigate()
    const { isLogin, setIsLogin, user, setUser } = useContext(CounterContext)

    const [sessions, setSessions] = useState([])
    const [isOpen, setIsOpen] = useState(false)  // Mobile toggle

    // Load chat history from backend
    useEffect(() => {
        if (!isLogin) return
        const fetchSessions = async () => {
            try {
                const res = await axios.get(`${API}/api/chat`, { withCredentials: true })
                setSessions(res.data)
            } catch (err) {
                console.error('Failed to load sessions:', err)
            }
        }
        fetchSessions()
    }, [isLogin, activeChatId])  // Re-fetch when chatId changes (new session created)

    const handleLogout = async () => {
        try {
            await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true })
            setIsLogin(false)
            setUser(null)
            navigate('/login')
        } catch (err) {
            console.error('Logout failed:', err)
        }
    }

    const handleDelete = async (e, sessionId) => {
        e.preventDefault()   // Don't navigate to the chat
        e.stopPropagation()
        try {
            await axios.delete(`${API}/api/chat/${sessionId}`, { withCredentials: true })
            setSessions(prev => prev.filter(s => s._id !== sessionId))
            // If we deleted the active chat, go home
            if (activeChatId === sessionId) navigate('/')
        } catch (err) {
            console.error('Delete failed:', err)
        }
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        return date.toLocaleDateString()
    }

    return (
        <>
            {/* Mobile toggle button */}
            <button
                className="sidebar-toggle"
                onClick={() => setIsOpen(prev => !prev)}
                aria-label="Toggle sidebar"
            >
                {isOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

            {/* Sidebar Panel */}
            <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
                {/* Logo / Brand */}
                <div className="sidebar__brand">
                    <span className="sidebar__brand-icon">✦</span>
                    <span className="sidebar__brand-name">YT Analyzer</span>
                </div>

                {/* New Chat Button */}
                <Link to="/" className="sidebar__new-btn" onClick={() => setIsOpen(false)}>
                    <PlusIcon />
                    New Chat
                </Link>

                {/* Sessions List */}
                <div className="sidebar__section">
                    <span className="sidebar__section-title">Recent Chats</span>

                    {!isLogin ? (
                        <p className="sidebar__empty">
                            <Link to="/login" className="sidebar__login-link">Login</Link> to see your history
                        </p>
                    ) : sessions.length === 0 ? (
                        <p className="sidebar__empty">No chats yet. Analyze a video to get started!</p>
                    ) : (
                        <ul className="sidebar__list">
                            {sessions.map(session => (
                                <li key={session._id} className="sidebar__list-item">
                                    <Link
                                        to={`/chat/${session._id}`}
                                        className={`sidebar__item ${activeChatId === session._id ? 'sidebar__item--active' : ''}`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span className="sidebar__item-icon"><ChatIcon /></span>
                                        <span className="sidebar__item-body">
                                            <span className="sidebar__item-title">{session.title}</span>
                                            <span className="sidebar__item-meta">
                                                {session.videoId} · {formatDate(session.createdAt)}
                                            </span>
                                        </span>
                                    </Link>
                                    <button
                                        className="sidebar__delete-btn"
                                        onClick={(e) => handleDelete(e, session._id)}
                                        title="Delete chat"
                                    >
                                        <TrashIcon />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* User profile at bottom */}
                <div className="sidebar__footer">
                    {isLogin ? (
                        <>
                            <div className="sidebar__credits">
                                <span className="sidebar__credit-label">Credits Remaining</span>
                                <div className="sidebar__credit-badge">
                                    {user?.usageLimit || 0} / 4
                                </div>
                            </div>
                            <span className="sidebar__user-email">{user?.email}</span>
                            <button className="sidebar__logout-btn" onClick={handleLogout}>
                                <LogoutIcon />
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="sidebar__auth-links">
                            <Link to="/login" className="sidebar__auth-link">Login</Link>
                            <Link to="/register" className="sidebar__auth-link sidebar__auth-link--primary">Register</Link>
                        </div>
                    )}
                </div>
            </aside>
        </>
    )
}

export default Sidebar
