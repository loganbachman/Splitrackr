import React, {useState} from 'react'
import {Link, useNavigate} from "react-router-dom"
import {useAuth} from '../../../app/providers/AuthProvider'
import api from "../../../app/http.js";
import '../../styling/Main.css'

const LoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const {setToken} = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await api.post('/auth/authenticate', {
                email,
                password
            })

            const {token} = response.data
            setToken(token)
            navigate('/app/dashboard')
        } catch(err) {
            setError('Login failed')
            console.error('Login error: ', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <Link to="/" className="auth-logo">
                        <h1>Splitrackr</h1>
                    </Link>
                    <h2>Welcome back</h2>
                    <p>Sign in to your account to continue</p>
                </div>

                <div className="auth-card">
                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && (
                            <div className="error-message">
                                <div className="error-icon">!</div>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                className="input"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                className="input"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Don't have an account?
                            <Link to="/register" className="auth-link">Create one</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default LoginPage