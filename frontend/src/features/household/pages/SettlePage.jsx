import React, { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../../../app/http.js"
import BalanceDisplay from "../components/BalanceDisplay"
import TransferList from "../components/TransferList"
import '../../styling/Main.css'

const SettlePage = () => {
    const [balanceData, setBalanceData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)
    const navigate = useNavigate()

    // Load balances and get current authenticated user
    useEffect(() => {
        (async() => {
            try {
                const balanceResponse = await api.get('/settlement')
                setBalanceData(balanceResponse.data)

                // Get current authenticated user using your endpoint
                const userResponse = await api.get('/user/me')
                setCurrentUser(userResponse.data)
            } catch(error) {
                console.error("Failed to load settlement data", error)
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    const handleSaveSettlement = async () => {
        setSaving(true)
        try {
            const response = await api.post('/settlement/open')
            alert('Settlement saved successfully!')
            navigate('/app/settle-history')
        } catch(error) {
            if (error.response?.status === 422) {
                alert('All balances are zero - nothing to settle')
            } else {
                alert('Failed to save settlement')
                console.error('Settlement save error:', error)
            }
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-container">
                    Loading settlement data...
                </div>
            </div>
        )
    }

    if (!balanceData) {
        return (
            <div className="dashboard-container">
                <div className="loading-container">
                    Unable to load settlement data
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-left">
                    <h1>Settlement</h1>
                    <p>Review and settle outstanding balances</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="nav-tabs">
                <Link to="/app/dashboard" className="nav-link">
                    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                </Link>
                <Link to="/app/settle-history" className="nav-link">
                    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    History
                </Link>
            </div>

            {/* Main Content */}
            <div className="main-content single-column">
                {/* Balance Summary Card */}
                <div className="card settlement-summary">
                    <h3 className="card-title">Current Balances</h3>
                    <BalanceDisplay balances={balanceData.balances} currentUser={currentUser} />
                </div>

                {/* Transfer Instructions Card */}
                <div className="card">
                    <h3 className="card-title">Recommended Transfers</h3>
                    <TransferList transfers={balanceData.transfers} currentUser={currentUser} />

                    <button
                        className="settle-btn"
                        onClick={handleSaveSettlement}
                        disabled={saving || !balanceData.transfers || balanceData.transfers.length === 0}
                    >
                        {saving ? 'Saving Settlement...' : 'Save Settlement'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SettlePage