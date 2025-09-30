import {useState} from 'react'
import {useNavigate, Link} from 'react-router-dom'
import api from "../../../../app/http.js";
import '../../../styling/Main.css'

const JoinForm = () => {

    const [inviteCode, setInviteCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const navigate = useNavigate()

    const joinHouse = async () => {
        setLoading(true)
        setError('')

        try {
            const response = await api.post('/household/join', {
                inviteCode
            })
            if(response.status >= 200 && response.status < 300) {
                alert("Successfully joined household")
                navigate("/app/dashboard", {replace: true})
            }
        } catch(error) {
            setError(`Failed to join household ` + error.response)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="onboarding-page">
            <div className="onboarding-container">
                <div className="onboarding-header">
                    <h1>Splitrackr</h1>
                    <h2>Join a Household</h2>
                    <p>Enter the invite code shared by your household member</p>
                </div>

                <div className="onboarding-card">
                    {error && (
                        <div className="error-message">
                            <div className="error-icon">!</div>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Invite Code</label>
                        <input
                            className="input invite-code-input"
                            type="text"
                            placeholder="Enter the 6-char invite code"
                            value={inviteCode}
                            onChange={e => setInviteCode(e.target.value.toUpperCase())}
                            onKeyPress={(e) => e.key === 'Enter' && joinHouse()}
                            maxLength={8}
                        />
                        <p className="input-help">
                            Ask your household member to share their invite code from the dashboard
                        </p>
                    </div>

                    <button
                        className="auth-button"
                        onClick={joinHouse}
                        disabled={loading || !inviteCode.trim()}
                    >
                        {loading ? 'Joining Household...' : 'Join Household'}
                    </button>

                    <div className="onboarding-alternatives">
                        <div className="divider">
                            <span>or</span>
                        </div>
                        <Link to="/app/create-house" className="alt-action">
                            Create a new household instead
                        </Link>
                    </div>
                </div>

                <div className="onboarding-footer">
                    <Link to="/app/logout" className="logout-link">
                        Sign Out
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default JoinForm