import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../../../app/http.js"
import SettlementSnapshot from "../components/SettlementSnapshot"
import '../../styling/Main.css'

const SettleHistoryPage = () => {
    const [settlements, setSettlements] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedSettlement, setExpandedSettlement] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)

    useEffect(() => {
        (async() => {
            try {
                const response = await api.get('/settlement/history')
                setSettlements(response.data)

                // Get current authenticated user using your endpoint
                const userResponse = await api.get('/user/me')
                setCurrentUser(userResponse.data)
            } catch(error) {
                console.error("Failed to load settlement history", error)
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    const toggleDetails = (settlementId) => {
        setExpandedSettlement(expandedSettlement === settlementId ? null : settlementId)
    }

    const handleFinalize = async (settlementId) => {
        try {
            await api.put('/settlement/finalize', null, {
                params: { settlementId }
            })

            // Refresh settlements list
            const response = await api.get('/settlement/history')
            const normalize = s => ({
                ...s,
                createdAt: s.createdAt ?? s.created_at,
                periodStart: s.periodStart ?? s.period_start,
                periodEnd: s.periodEnd ?? s.period_end,
            });
            setSettlements(response.data.map(normalize));
        } catch(error) {
            console.error("Failed to finalize settlement", error)
            throw error
        }
    }

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-container">
                    Loading settlement history...
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-left">
                    <h1>Settlement History</h1>
                    <p>View past settlements and their status</p>
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
                <Link to="/app/settle" className="nav-link">
                    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Current Settlement
                </Link>
            </div>

            {/* Main Content */}
            <div className="main-content single-column">
                <div className="card">
                    {settlements.length === 0 ? (
                        <div className="empty-state">
                            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3>No settlements yet</h3>
                            <p>Settlements will appear here once you create them.</p>
                        </div>
                    ) : (
                        <div className="settlement-history-list">
                            {settlements.map((settlement) => (
                                <div key={settlement.settlementId} className="settlement-history-item">
                                    <div
                                        className="settlement-summary-row"
                                        onClick={() => toggleDetails(settlement.settlementId)}
                                    >
                                        <div className="settlement-basic-info">
                                            <h4 className="settlement-date">
                                                {new Date(settlement.createdAt).toLocaleDateString()}
                                            </h4>
                                            <div className="settlement-meta">
                                                <span className={`settlement-status status-${settlement.status.toLowerCase()}`}>
                                                    {settlement.status}
                                                </span>
                                                <span className="settlement-transfers">
                                                    {settlement.transfers.length} transfers
                                                </span>
                                            </div>
                                        </div>
                                        <svg className="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>

                                    {expandedSettlement === settlement.settlementId && (
                                        <div className="settlement-details">
                                            <SettlementSnapshot
                                                settlement={settlement}
                                                currentUser={currentUser}
                                                onFinalize={handleFinalize}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SettleHistoryPage