import { useEffect, useState, useCallback } from 'react'
import { login as apiLogin, logout as apiLogout, checkSession } from '../api/auth.js'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await checkSession()
        if (mounted && data?.authenticated && data?.user) setUser(data.user)
      } catch (_) {}
      if (mounted) setLoading(false)
    })()
    return () => { mounted = false }
  }, [])

  const login = useCallback(async (email, contrasena) => {
    setMessage('')
    const data = await apiLogin(email, contrasena)
    setUser(data.user)
    setMessage('Sesión iniciada correctamente')
    return data
  }, [])

  const logout = useCallback(async () => {
    setMessage('')
    await apiLogout()
    setUser(null)
    setMessage('Sesión cerrada correctamente')
  }, [])

  return { user, loading, message, setMessage, login, logout, setUser }
}


