import React, {useState} from 'react'
import {Link, useNavigate} from "react-router-dom"
import {useAuth} from '../../../app/providers/AuthProvider'
import api from "../../../app/http.js";
import '../../styling/Main.css'

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    })

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const {setToken} = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await api.post('/auth/register', formData)
            const {token} = response.data
            setToken(token)
            navigate('/app/dashboard')
        } catch(err) {
            setError('Registration failed')
            console.error('Registration error:', err)
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
                    <h2>Create your account</h2>
                    <p>Start tracking and splitting expenses today</p>
                </div>

                <div className="auth-card">
                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && (
                            <div className="error-message">
                                <div className="error-icon">!</div>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input
                                    className="input"
                                    name="firstName"
                                    type="text"
                                    placeholder="Enter your first name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input
                                    className="input"
                                    name="lastName"
                                    type="text"
                                    placeholder="Enter your last name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                className="input"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                className="input"
                                name="password"
                                type="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account?
                            <Link to="/login" className="auth-link">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default RegisterPage