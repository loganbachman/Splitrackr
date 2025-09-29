import React from 'react'
import '../../styling/Main.css'

const BalanceDisplay = ({balances, currentUser}) => {
    if (!balances || !currentUser) return null

    const normalize = (b) => ({
        userId: b.userId ?? b.user?.id,
        userName: b.userName ?? [b.user?.firstName, b.user?.lastName].filter(Boolean).join(' ') ?? 'Unknown',
        netCents: b.netCents ?? 0,
    });

    const list = balances.map(normalize)
    const userBalance = list.find(b => b.userId === currentUser.id);
    const otherBalances = list.filter(b => b.userId !== currentUser.id);
    // const userBalance = balances.find(b => b.userId === currentUser.id)
    // const otherBalances = balances.filter(b => b.userId !== currentUser.id)

    if (!userBalance) return <div>Unable to find your balance</div>

    return (
        <div className="balance-display">
            {/* Your Balance - Prominent Display */}
            <div className="balance-row">
                <div className="balance-label">
                    <svg className="balance-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Your Balance
                </div>
                <div className={`balance-amount ${userBalance.netCents >= 0 ? 'amount-owed-to' : 'amount-owed'}`}>
                    <span className={`${userBalance.netCents >= 0 ? 'amount-owed-to' : 'amount-owed'}`}>
                        {userBalance.netCents >= 0
                            ? `+$${(userBalance.netCents / 100).toFixed(2)}`
                            : `-$${(Math.abs(userBalance.netCents) / 100).toFixed(2)}`
                        }
                    </span>
                </div>
            </div>

            {/* Other Members */}
            {otherBalances.map(balance => (
                <div key={balance.userId} className="balance-row">
                    <div className="balance-label">
                        <div className="member-avatar" style={{width: '20px', height: '20px', fontSize: '10px'}}>
                            {balance.userName.charAt(0).toUpperCase()}
                        </div>
                        {balance.userName}
                    </div>
                    <div className={`balance-amount ${balance.netCents >= 0 ? 'amount-owed-to' : 'amount-owed'}`}>
                        <span className={`${balance.netCents >= 0 ? 'amount-owed-to' : 'amount-owed'}`}>
                            {balance.netCents >= 0
                                ? `+$${(balance.netCents / 100).toFixed(2)}`
                                : `-$${(Math.abs(balance.netCents) / 100).toFixed(2)}`
                            }
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default BalanceDisplay