import { useContext, useEffect, useState } from "react"
import { CounterContext } from "../App"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import "./auth.css"

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/* ── Icons ── */
const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const Login = () => {
  const { setIsLogin, setUser, isLogin } = useContext(CounterContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isLogin) navigate("/")
  }, [isLogin])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.target)
    const email = formData.get("email")
    const password = formData.get("password")

    try {
      const response = await axios.post(`${API}/api/auth/login`, {
        email,
        password
      }, {
        withCredentials: true
      })
      setIsLogin(true)
      setUser(response.data.user)
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo__icon">▶</div>
          <span className="auth-logo__text">YouTube Analyzer</span>
        </div>

        {/* Heading */}
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {/* Error Banner */}
        {error && (
          <div className="auth-error">
            ⚠ {error}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon"><EmailIcon /></span>
              <input
                className="auth-input"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon"><LockIcon /></span>
              <input
                className="auth-input"
                type="password"
                name="password"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button className="auth-submit-btn" type="submit" disabled={loading}>
            <span className="auth-btn-content">
              {loading && <span className="auth-spinner" />}
              {loading ? "Signing in..." : "Sign In"}
            </span>
          </button>

        </form>

        {/* Footer */}
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

      </div>
    </div>
  )
}

export default Login