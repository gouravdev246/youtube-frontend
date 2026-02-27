import './App.css'
import { createContext } from 'react'
import { ChatSection } from './components/chatSection'
import Register from './components/register'
import Login from './components/login'
import ChatPage from './components/ChatPage'
import Sidebar from './components/Sidebar'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Analytics } from "@vercel/analytics/react"

export const CounterContext = createContext()
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [isLogin, setIsLogin] = useState(false)
  const [user, setUser] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API}/api/auth/me`, {
          withCredentials: true
        })
        if (res.data.success) {
          setIsLogin(true)
          setUser(res.data.user)
        }
      } catch (error) {
        console.log("Session expired or not logged in")
      } finally {
        setIsRefreshing(false)
      }
    }
    checkAuth()
  }, [])

  if (isRefreshing) return <div className="loading">Loading...</div>
  return (
    <CounterContext value={{ isLogin, setIsLogin, user, setUser }}>
      <BrowserRouter>
        <div className="app-layout">
          <Sidebar />
          <div className="app-layout__main">
            <Routes>
              <Route path="/" element={<ChatSection />} />
              <Route path="/chat/:chatId" element={<ChatPage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
      <Analytics />
    </CounterContext>
  )
}

export default App
