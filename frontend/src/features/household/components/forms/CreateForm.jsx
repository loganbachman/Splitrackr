import {useState} from 'react'
import {useNavigate, Link} from 'react-router-dom'
import api from "../../../../app/http.js";
import '../../../styling/Main.css'

const CreateForm = () => {

    const [houseHoldName, setHouseHoldName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const navigate = useNavigate()

    const createHouse = async () => {
        setLoading(true)
        setError('')

        try {
            const response = await api.post('/household', {
                houseHoldName
            })
            if (response.status >= 200 && response.status < 300) {
                alert("Successfully created household")
                navigate("/app/dashboard", {replace: true})
            }
        } catch (error) {
            console.error("Error response:", error.response);  // full response object
            setError("Failed to create household: " + error)
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="onboarding-page">
            <div className="onboarding-container">
                <div className="onboarding-header">
                    <h1>Splitrackr</h1>
                    <h2>Create a Household</h2>
                    <p>Set up a new household to start tracking shared expenses</p>
                </div>

                <div className="onboarding-card">
                    {error && (
                        <div className="error-message">
                            <div className="error-icon">!</div>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Household Name</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="e.g. Main Street Apartment, The Johnson House"
                            value={houseHoldName}
                            onChange={e => setHouseHoldName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && createHouse()}
                        />
                    </div>

                    <button
                        className="auth-button"
                        onClick={createHouse}
                        disabled={loading || !houseHoldName.trim()}
                    >
                        {loading ? 'Creating Household...' : 'Create Household'}
                    </button>

                    <div className="onboarding-alternatives">
                        <div className="divider">
                            <span>or</span>
                        </div>
                        <Link to="/app/join-house" className="alt-action">
                            Join an existing household instead
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

export default CreateForm