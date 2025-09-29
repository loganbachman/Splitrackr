import {Link, useNavigate} from "react-router-dom";
import api from "../../../app/http.js";
import {useEffect, useState} from "react";
import '../../styling/Main.css'


const DashboardPage = () => {
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const [houseId, setHouseId] = useState(null)
    const [members, setMembers] = useState([])
    const [house, setHouse] = useState(null)
    const [expenses, setExpenses] = useState([])
    const [settlementSummary, setSettlementSummary] = useState(null)
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)


    useEffect(() => {
        let alive = true;

        // check if user has active household, if not then direct to join household
        (async () => {
            try {
                const [actResponse, userResponse] = await Promise.all([
                    api.get("/household/active"),
                    api.get('/user/me')
                ]);

                if (alive) {
                    setLoading(false) // has active household, show dashboard
                    setHouse(actResponse.data)
                    setHouseId(actResponse.data.id)
                    setCurrentUser(userResponse.data)
                }

                // if no active household
            } catch (err) {
                const s = err.response?.status;
                if (alive) {
                    if (s === 404 || s === 401 || s === 403) {
                        navigate("/app/join-house", { replace: true })
                    } else {
                        console.error("Active check failed:", err)
                        navigate("/app/join-house", { replace: true })
                    }
                }
            }
        })()
        return () => { alive = false }
    }, [navigate])


    // get householdUsers & active household
    useEffect(() => {
        if(!houseId) {
            return
        }
        (async () => {

            try {
                const response = await api.get('/household/houseUsers', {
                    params: {houseId}
                })
                if (response.status === 200) {
                    setMembers(response.data)
                } else {
                    console.error("Failed to retrieve members", response.status)
                }
            } catch (error) {
                console.error("Failed to retrieve household members" + error)
            }
        })()
    }, [houseId])

    // get list of all house expenses
    useEffect(() => {
        (async() => {
            try {
                const listResponse = await api.get('/expense/list')
                setExpenses(listResponse.data)
            } catch(error) {
                console.error("Failed to retrieve expenses" + error)
            }
        })()
    },[])

    // handle settlement balances
    useEffect(() => {
        if (!currentUser?.id) return;

        (async () => {
            try {
                // load both the balances and the current user
                const balanceResponse = await api.get('/settlement');
                const balances = balanceResponse.data?.balances || [];

                // find the current user's balance
                const mine = balances.find(b => (b.userId ?? b.user?.id) === currentUser.id);
                const net = Number(mine?.netCents) || 0;

                setSettlementSummary({ netCents: net });
            } catch (error) {
                console.error("Failed to retrieve settlement summary", error);
            }
        })();
    }, [currentUser?.id]);

    // handle click outside the profile menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.profile-section')) {
                setProfileMenuOpen(false)
            }
        };

        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])


    const copyInviteCode = () => {
        if (house?.inviteCode) {
            navigator.clipboard.writeText(house.inviteCode)
            // You could add a toast notification here
        }
    }

    const getMemberInitials = (member) => {
        return `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase()
    }

    const getDisplayName = (user) => {
        if (!user) return 'User'
        const first = user.firstName?.trim()
        const last = user.lastName?.trim()
        if (first || last) return [first, last].filter(Boolean).join(' ')
        return user.username || user.email || 'User'
    };

    const getUserInitialsFromAny = (user) => {
        if (!user) return 'U'
        const first = user.firstName?.[0]
        const last = user.lastName?.[0]
        if (first || last) return `${first || ''}${last || ''}`.toUpperCase()
        // fall back to email or username initials
        const src = user.username || user.email || ''
        const parts = src.split(/[@._\s]+/).filter(Boolean)
        const a = parts[0]?.[0], b = parts[1]?.[0]
        return `${(a || 'U')}${(b || '')}`.toUpperCase()
    }

    const getPayerName = (expense, membersArr = []) => {
        // Your model: ManyToOne User payer
        const payerObj = expense?.payer;
        if (payerObj && typeof payerObj === 'object') {
            return getDisplayName(payerObj);
        }

        // Fallback: map by payer.id if only id is present,
        // or by a flat payerId if your serializer flattens it
        const payerId = payerObj?.id ?? expense?.payerId;
        if (payerId != null) {
            const m = membersArr.find(u => u?.id === payerId);
            if (m) return getDisplayName(m);
        }

        return 'Unknown';
    };

    if (loading) return (
        <div className="dashboard-container">
            <div className="loading-container">
                Loading...
            </div>
        </div>
    )

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Splitrackr</h1>
                    <p>Welcome to your home dashboard</p>
                </div>
                <div className="profile-section">
                    <div
                        className={`profile-trigger ${profileMenuOpen ? 'active' : ''}`}
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    >
                        <div className="profile-avatar">
                            {getUserInitialsFromAny(currentUser)}
                        </div>
                        <div className="profile-info">
                            <div className="profile-name">
                                {currentUser ? getDisplayName(currentUser) : 'Loading...'}
                            </div>
                            <div className="profile-role">
                                {members.find(m => m.id === currentUser?.id)?.role?.toLowerCase() || 'member'}
                            </div>
                        </div>
                        <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <div className={`profile-menu ${profileMenuOpen ? 'active' : ''}`}>
                        <Link to="/app/logout" className="menu-item danger">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                            </svg>
                            Logout
                        </Link>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="nav-tabs">
                <Link to="/app/house-list" className="nav-link">
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    Your Households
                </Link>
                <Link to="/app/create-expense" className="nav-link">
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Create an Expense
                </Link>
                <Link to="/app/my-expenses" className="nav-link">
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    View your expenses
                </Link>
                <Link to="/app/settle-history" className="nav-link">
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <line x1="18" y1="20" x2="18" y2="10"/>
                        <line x1="12" y1="20" x2="12" y2="4"/>
                        <line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                    Settlement History
                </Link>
            </nav>

            {/* Main Content Grid */}
            <div className="main-content">
                {/* Left Column */}
                <div className="left-column">
                    {/* Settlement Summary */}
                    {settlementSummary && (
                        <div className="card settlement-summary">
                            <h3 className="card-title">Net Balance</h3>

                            <div className="balance-row">
                                <div className="balance-label">
                                    <svg className="balance-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path d="M17 1l4 4-4 4"/>
                                        <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                                        <path d="M7 23l-4-4 4-4"/>
                                        <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                                    </svg>
                                    Net balance:
                                </div>

                                {(() => {
                                    const net = Number(settlementSummary?.netCents) || 0;
                                    const amt = `$${(Math.abs(net) / 100).toFixed(2)}`; // always $ + 2 decimals
                                    const cls = net >= 0 ? 'amount-owed-to' : 'amount-owed'; // green / red
                                    return (
                                        <span className={`balance-amount`}>
                                            <span className={`${cls}`}>
                                                {net < 0 ? `-${amt}` : amt}
                                            </span>
                                        </span>
                                    );
                                })()}
                            </div>

                            {/* Always show Settle Up */}
                            <Link to="/app/settle">
                                <button className="settle-btn">Settle Up</button>
                            </Link>
                        </div>
                    )}

                    {/* Recent Expenses */}
                    <div className="card expenses-section">
                        <h3 className="card-title">Recent Household Expenses</h3>
                        <div className="expenses-list">
                            {expenses.map((expense) => (
                                <div className="expense-item" key={expense.expenseId ?? expense.id}>
                                    <div className="expense-header">
                                        <div className="expense-title">{expense.description}</div>
                                        <span className={`expense-type ${(expense.type || '').toLowerCase()}`}>
                                            {(expense.type || '').toLowerCase()}
                                        </span>
                                    </div>

                                    <div className="expense-details expense-details--stacked">
                                        <div className="expense-row">
                                            <span className="expense-amount">
                                                ${(expense.amountCents / 100).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="expense-paidby">
                                            Paid by <strong>{getPayerName(expense, members)}</strong>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>{/* end left-column */}

                {/* Right Sidebar */}
                <div className="right-column">
                    {/* House Info */}
                    <div className="card house-info">
                        <div className="house-name">{house?.name?.toUpperCase() || 'HOUSEHOLD'}</div>
                        <div className="house-label">Household</div>

                        <div className="invite-section">
                            <div className="invite-label">House invite code</div>
                            <div className="invite-code-box">
                                <span className="invite-code">{house?.inviteCode || '--------'}</span>
                                <button
                                    type="button"
                                    className="copy-btn"
                                    onClick={copyInviteCode}
                                    aria-label="Copy invite code"
                                    title="Copy invite code"
                                >
                                    <svg className="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="card members-section" style={{ marginTop: 24 }}>
                        <h3 className="card-title">Current Household Members</h3>
                        <div className="members-list">
                            {members.map((m) => (
                                <div className="member-item" key={m.id}>
                                    <div className="member-avatar">{getMemberInitials(m)}</div>
                                    <div className="member-info">
                                        <div className="member-name">
                                            {m.firstName} {m.lastName}
                                            {m.role?.toLowerCase() === 'owner' ? (
                                                <svg className="role-icon owner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                                </svg>
                                            ) : (
                                                <svg className="role-icon member" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                    <circle cx="12" cy="7" r="4"/>
                                                </svg>
                                            )}
                                        </div>
                                        <div className="member-role">{m.role?.toLowerCase() || 'member'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>{/* end right-column */}
            </div>{/* end main-content */}
        </div>
    )
}

export default DashboardPage