import React from 'react'
import '../../styling/Main.css'

const TransferList = ({ transfers, currentUser }) => {
    if (!transfers || !currentUser) return null
    const normalize = (t) => ({
        fromUserId: t.fromUserId ?? t.fromUser?.id,
        toUserId:   t.toUserId   ?? t.toUser?.id,
        fromUserName: t.fromUserName ?? [t.fromUser?.firstName, t.fromUser?.lastName].filter(Boolean).join(' ') ?? 'Unknown',
        toUserName:   t.toUserName   ?? [t.toUser?.firstName, t.toUser?.lastName].filter(Boolean).join(' ') ?? 'Unknown',
        amountCents: t.amountCents ?? 0,
    })

    const list = transfers.map(normalize)
    const userTransfers = list.filter(t => t.fromUserId === currentUser.id || t.toUserId === currentUser.id)
    const otherTransfers = list.filter(t => t.fromUserId !== currentUser.id && t.toUserId !== currentUser.id)

    return (
        <div className="transfer-list">
            {/* Your Transfers */}
            {userTransfers.length > 0 && (
                <div className="transfer-section">
                    <h4 className="transfer-section-title">Your Transfers</h4>
                    <div className="transfer-items">
                        {userTransfers.map(transfer => (
                            <div key={`${transfer.fromUserId}-${transfer.toUserId}`} className="transfer-item user-transfer">
                                <div className="transfer-content">
                                    <div className="transfer-direction">
                                        {transfer.fromUserId === currentUser.id ? (
                                            <>
                                                <svg className="transfer-icon outgoing" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                                <span className="transfer-text">
                                                    You pay <strong>{transfer.toUserName}</strong>
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="transfer-icon incoming" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                                                </svg>
                                                <span className="transfer-text">
                                                    <strong>{transfer.fromUserName}</strong> pays you
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <div className="transfer-amount">
                                        ${(transfer.amountCents / 100).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Other Transfers */}
            {otherTransfers.length > 0 && (
                <div className="transfer-section">
                    <h4 className="transfer-section-title">Other Transfers</h4>
                    <div className="transfer-items">
                        {otherTransfers.map(transfer => (
                            <div key={`${transfer.fromUserId}-${transfer.toUserId}`} className="transfer-item other-transfer">
                                <div className="transfer-content">
                                    <div className="transfer-direction">
                                        <svg className="transfer-icon neutral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                        </svg>
                                        <span className="transfer-text">
                                            <strong>{transfer.fromUserName}</strong> pays <strong>{transfer.toUserName}</strong>
                                        </span>
                                    </div>
                                    <div className="transfer-amount">
                                        ${(transfer.amountCents / 100).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default TransferList