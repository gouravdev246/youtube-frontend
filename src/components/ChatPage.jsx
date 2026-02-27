import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import './chatSection.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/* ──── Icons ──── */
const SendIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
)

/* ──── Component ──── */
const ChatPage = () => {
    const { chatId } = useParams()
    const navigate = useNavigate()

    const [messages, setMessages] = useState([])
    const [videoId, setVideoId] = useState(null)
    const [question, setQuestion] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)

    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading])

    // Load the session from backend using chatId from URL
    useEffect(() => {
        const loadSession = async () => {
            try {
                const res = await axios.get(`${API}/api/chat/${chatId}`, { withCredentials: true })
                setVideoId(res.data.videoId)
                // Map DB format (role/content) to display format (role/text)
                setMessages(res.data.messages.map(m => ({ role: m.role, text: m.content })))
            } catch (error) {
                console.error('Failed to load chat session:', error)
                navigate('/')  // Redirect home if session not found or unauthorized
            } finally {
                setIsFetching(false)
                setTimeout(() => inputRef.current?.focus(), 100)
            }
        }
        loadSession()
    }, [chatId])

    // Send a question and stream the AI response
    const handleAskQuestion = async (e) => {
        e.preventDefault()
        if (!question.trim() || isLoading) return

        const userMsg = { role: 'user', text: question.trim() }
        setMessages(prev => [...prev, userMsg])
        setQuestion('')
        setIsLoading(true)

        // Add an empty assistant message that we'll fill in as stream arrives
        setMessages(prev => [...prev, { role: 'assistant', text: '', streaming: true }])

        try {
            const response = await fetch(`${API}/api/chat/${chatId}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userQuestion: userMsg.text })
            })

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() // Keep incomplete last line in buffer

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue
                    const data = line.slice(6).trim()
                    if (data === '[DONE]') break
                    try {
                        const { token } = JSON.parse(data)
                        // Append each token to the last message in real-time
                        setMessages(prev => {
                            const updated = [...prev]
                            updated[updated.length - 1] = {
                                ...updated[updated.length - 1],
                                text: updated[updated.length - 1].text + token
                            }
                            return updated
                        })
                    } catch { /* skip malformed lines */ }
                }
            }

            // Mark streaming done — removes the blinking cursor
            setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { ...updated[updated.length - 1], streaming: false }
                return updated
            })

        } catch (error) {
            console.error('Stream Error:', error)
            setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', text: 'Sorry, something went wrong.', streaming: false }
                return updated
            })
        } finally {
            setIsLoading(false)
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }

    if (isFetching) {
        return <div className="loading">Loading session...</div>
    }

    return (
        <div className="chat-container">
            {/* Video Info Banner */}
            {videoId && (
                <div className="video-banner">
                    <div className="video-banner__info">
                        <div className="video-banner__label">Analyzing Video</div>
                        <div className="video-banner__id">{videoId}</div>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="chat-messages">
                {messages.length === 0 && (
                    <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>
                        No messages yet. Ask your first question below!
                    </p>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`chat-bubble chat-bubble--${msg.role === 'assistant' ? 'ai' : 'user'}`}>
                        <div className={`chat-bubble__avatar chat-bubble__avatar--${msg.role === 'assistant' ? 'ai' : 'user'}`}>
                            {msg.role === 'assistant' ? '✦' : 'U'}
                        </div>
                        <div className="chat-bubble__content">
                            <div className="chat-bubble__meta">
                                <span className="chat-bubble__name">
                                    {msg.role === 'assistant' ? 'AI Assistant' : 'You'}
                                </span>
                            </div>
                            <div className="chat-bubble__body">
                                {msg.text}
                                {msg.streaming && <span className="stream-cursor" />}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading dots only shown before first token arrives */}
                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="chat-bubble chat-bubble--ai">
                        <div className="chat-bubble__avatar chat-bubble__avatar--ai">✦</div>
                        <div className="chat-bubble__content">
                            <div className="chat-bubble__meta">
                                <span className="chat-bubble__name">AI Assistant</span>
                            </div>
                            <div className="chat-bubble__loading">
                                <span className="loading-dot" />
                                <span className="loading-dot" />
                                <span className="loading-dot" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Bar */}
            <div className="question-bar">
                <div className="question-bar__inner">
                    <form className="question-bar__form" onSubmit={handleAskQuestion}>
                        <input
                            ref={inputRef}
                            className="question-bar__input"
                            type="text"
                            placeholder="Ask anything about this video..."
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            className="question-bar__send-btn"
                            type="submit"
                            disabled={!question.trim() || isLoading}
                        >
                            <SendIcon />
                        </button>
                    </form>
                    <div className="question-bar__hint">AI analyzes video comments to answer your questions</div>
                </div>
            </div>
        </div>
    )
}

export default ChatPage
