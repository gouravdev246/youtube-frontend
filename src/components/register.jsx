import axios from "axios"
import { useContext, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { CounterContext } from "../App"
import "./auth.css"

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/* ── Icons ── */
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

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

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const Register = () => {
  const { setIsLogin, setUser } = useContext(CounterContext)
  const navigate = useNavigate()

  // Step 1 fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Step control
  const [step, setStep] = useState(1)          // 1 = details, 2 = otp
  const [otp, setOtp] = useState("")

  // UI state
  const [loadingOtp, setLoadingOtp] = useState(false)
  const [loadingRegister, setLoadingRegister] = useState(false)
  const [error, setError] = useState("")
  const [otpSent, setOtpSent] = useState(false)

  /* ── Step 1: Send OTP ── */
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setLoadingOtp(true)
    try {
      await axios.post(`${API}/api/otp/generate`, { email })
      setOtpSent(true)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.")
    } finally {
      setLoadingOtp(false)
    }
  }

  /* ── Step 2: Register with OTP ── */
  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")
    setLoadingRegister(true)

    try {
      const response = await axios.post(`${API}/api/auth/register`, {
        name,
        email,
        password,
        otp
      }, {
        withCredentials: true
      })
      setIsLogin(true)
      setUser(response.data.user)
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setLoadingRegister(false)
    }
  }

  /* ── Resend OTP ── */
  const handleResendOtp = async () => {
    setError("")
    setLoadingOtp(true)
    try {
      await axios.post(`${API}/api/otp/generate`, { email })
      setOtp("")
      setError("")
    } catch (err) {
      setError("Failed to resend OTP.")
    } finally {
      setLoadingOtp(false)
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

        {/* Step Indicator */}
        <div className="auth-steps">
          <div className={`auth-step ${step >= 1 ? "auth-step--active" : ""} ${step > 1 ? "auth-step--done" : ""}`}>
            <div className="auth-step__dot">
              {step > 1 ? <CheckIcon /> : "1"}
            </div>
            <span className="auth-step__label">Your Details</span>
          </div>
          <div className="auth-step__line" />
          <div className={`auth-step ${step >= 2 ? "auth-step--active" : ""}`}>
            <div className="auth-step__dot">2</div>
            <span className="auth-step__label">Verify OTP</span>
          </div>
        </div>

        {/* Heading */}
        {step === 1 ? (
          <>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Fill your details and we'll send an OTP to your email</p>
          </>
        ) : (
          <>
            <h1 className="auth-title">Verify your email</h1>
            <p className="auth-subtitle">
              We sent a 6-digit code to <strong style={{ color: "#f0f0f5" }}>{email}</strong>
            </p>
          </>
        )}

        {/* Error Banner */}
        {error && <div className="auth-error">⚠ {error}</div>}

        {/* ── STEP 1: Details Form ── */}
        {step === 1 && (
          <form className="auth-form" onSubmit={handleSendOtp}>

            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><UserIcon /></span>
                <input
                  className="auth-input"
                  type="text"
                  placeholder="John Doe"
                  required
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><EmailIcon /></span>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                  placeholder="Min. 6 characters"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button className="auth-submit-btn" type="submit" disabled={loadingOtp}>
              <span className="auth-btn-content">
                {loadingOtp && <span className="auth-spinner" />}
                {loadingOtp ? "Sending OTP..." : "Send OTP →"}
              </span>
            </button>

          </form>
        )}

        {/* ── STEP 2: OTP Form ── */}
        {step === 2 && (
          <form className="auth-form" onSubmit={handleRegister}>

            <div className="auth-field">
              <label className="auth-label">6-Digit OTP</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><ShieldIcon /></span>
                <input
                  className="auth-input auth-input--otp"
                  type="text"
                  placeholder="• • • • • •"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/, ""))}
                />
              </div>
            </div>

            <button className="auth-submit-btn" type="submit" disabled={loadingRegister || otp.length < 6}>
              <span className="auth-btn-content">
                {loadingRegister && <span className="auth-spinner" />}
                {loadingRegister ? "Creating account..." : "Create Account"}
              </span>
            </button>

            {/* Resend / Back */}
            <div className="auth-otp-actions">
              <button type="button" className="auth-text-btn" onClick={() => { setStep(1); setError(""); setOtp(""); }}>
                ← Change details
              </button>
              <button type="button" className="auth-text-btn" onClick={handleResendOtp} disabled={loadingOtp}>
                {loadingOtp ? "Sending..." : "Resend OTP"}
              </button>
            </div>

          </form>
        )}

        {/* Footer */}
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

      </div>
    </div>
  )
}

export default Register