import React, { useState } from "react"
import BalanceDisplay from "./BalanceDisplay"
import TransferList from "./TransferList"
import '../../styling/Main.css'

const SettlementSnapshot = ({ settlement, currentUser, onFinalize }) => {
    const [finalizing, setFinalizing] = useState(false)

    const handleFinalize = async () => {
        if (!confirm('Finalize this settlement? This action cannot be undone.')) return

        setFinalizing(true)
        try {
            await onFinalize(settlement.settlementId)
            alert('Settlement finalized successfully!')
        } catch(error) {
            alert('Failed to finalize settlement')
        } finally {
            setFinalizing(false)
        }
    }

    return (
        <div className="settlement-snapshot">
            {/* Settlement Info */}
            <div className="settlement-info-card">
                <div className="settlement-period-info">
                    <div className="period-detail">
                        <span className="period-label">Period:</span>
                        <span className="period-dates">
                            {settlement.periodStart ? new Date(settlement.periodStart).toLocaleDateString() : 'Start'}
                            {' '}→ {new Date(settlement.periodEnd ?? settlement.asOf).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Balances Section */}
            <div className="snapshot-section">
                <h4 className="section-title">
                    <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Balances at Settlement
                </h4>
                <BalanceDisplay balances={settlement.balances} currentUser={currentUser} />
            </div>

            {/* Transfers Section */}
            <div className="snapshot-section">
                <h4 className="section-title">
                    <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Required Transfers
                </h4>
                <TransferList transfers={settlement.transfers} currentUser={currentUser} />
            </div>

            {/* Finalize Button */}
            {settlement.status === 'OPEN' && (
                <div className="finalize-section">
                    <button
                        className="settle-btn"
                        onClick={handleFinalize}
                        disabled={finalizing}
                        style={{width: '100%', marginTop: '16px'}}
                    >
                        {finalizing ? 'Finalizing...' : 'Finalize Settlement'}
                    </button>
                    <p className="finalize-note">
                        Finalizing will mark this settlement as complete and cannot be undone.
                    </p>
                </div>
            )}
        </div>
    )
}

export default SettlementSnapshot