import {useEffect, useState} from 'react'
import {useNavigate, Link} from 'react-router-dom'
import api from "../../../../app/http.js";
import '../../../styling/Main.css'

const ExpenseForm = () => {
    const [formData, setFormData] = useState({
        description: '',
        amountDollars: '',
        type: 'EQUAL',
        share: []
    })

    const [householdMembers, setHouseholdMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedMembers, setSelectedMembers] = useState([])
    const navigate = useNavigate()

    // call api
    useEffect(() => {
        (async () => {
            try {
                const activeHouse = await api.get('/household/active')
                const houseId = activeHouse.data.id

                const response = await api.get('/household/houseUsers', {
                        params: {houseId} })
                if (response.status === 200) {
                    setHouseholdMembers(response.data)
                }
            } catch (error) {
                console.error("Failed to retrieve members", error)
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    // dollars to cents for backend
    const dollarsToCents = (dollars) => {
        return Math.round(parseFloat(dollars || '0') * 100)
    }

    // select member logic
    const handleMemberToggle = (member) => {
        setSelectedMembers(prev => {
            const isSelected = prev.find(m => m.id === member.id)
            const newSelection = isSelected
                ? prev.filter(m => m.id !== member.id)
                : [...prev, member]

            const newShares = updateShares(newSelection)

            setFormData({
                ...formData,
                share: newShares
            })

            return newSelection
        })
    }

    // updates share object based on input
    const updateShares = (members, amountDollars = formData.amountDollars) => {

        const totalCents = dollarsToCents(amountDollars)
        let newShares = []

        if (formData.type === 'EQUAL') {
            newShares = members.map(member => ({
                payerId: member.id,
                amountCents: null
            }))
        } else if (formData.type === 'FIXED') {
            const equalAmountCents = members.length > 0 ?
                Math.floor(totalCents / members.length) : 0
                newShares = members.map(member => ({
                payerId: member.id,
                amountCents: equalAmountCents
            }))
        }
        return newShares
    }

    // for user switching split type
    const handleTypeChange = (newType) => {
        const newShares = updateShares(selectedMembers)

        setFormData({
            ...formData,
            type: newType,
            share: newShares
        })
    }


    const handleFixedChange = (payerId, newAmountDollars) => {
        const amountCents = dollarsToCents(newAmountDollars)
        const updatedShare = formData.share.map(share =>
            share.payerId === payerId ?
                {...share, amountCents: amountCents}
                : share
        )

        setFormData({
            ...formData,
            share: updatedShare
        })
    }

    const getFixedTotal = () => {
        return formData.share.reduce((sum, share) => sum + (share.amountCents || 0), 0)
    }

    // handles form submission
    const handleSubmit = async () => {
        if (!formData.description.trim()) {
            alert("Please enter a description")
            return
        }

        if (!formData.amountDollars || formData.amountDollars <= 0) {
            alert("Please enter a valid amount")
            return
        }

        if (selectedMembers.length === 0) {
            alert("Please select at least one member")
            return
        }

        const totalCents = dollarsToCents(formData.amountDollars)
        const fixedTotal = getFixedTotal()

        if (formData.type === "FIXED" && fixedTotal !== totalCents) {
            alert(`Fixed amounts ($${(fixedTotal / 100).toFixed(2)}) must equal total expense ($${(totalCents / 100).toFixed(2)})`)
            return
        }

        // parameters for api call
        const payload = {
            description: formData.description,
            amountCents: totalCents, // convert to cents for backend
            type: formData.type,
            share: formData.share
        }

        try {
            const response = await api.post('/expense', payload)
            if (response.status >= 200 && response.status < 300) {
                alert('Expense created successfully!')
                navigate('/app/dashboard', {replace: true})
            }
        } catch (error) {
            console.error('Error creating expense:', error)
            alert('Error creating expense: ' + error.response?.data || error.message)
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    const totalCents = dollarsToCents(formData.amountDollars)
    const fixedTotal = getFixedTotal()
    const isFixedBalanced = formData.type === "FIXED" && fixedTotal === totalCents

    return (
        <div className="dashboard-container create-expense-page">
            <div className="main-content">
                {/* Left: Form */}
                <div className="left-column">
                    <div className="card form-card">
                        <h3 className="card-title">Create an Expense</h3>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="Expense description"
                                value={formData.description}
                                onChange={e =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Total Amount</label>
                            <input
                                className="input"
                                type="number"
                                step="0.01"
                                min="1"
                                placeholder="Enter amount"
                                value={formData.amountDollars}
                                onChange={e => {
                                    const newAmount = e.target.value
                                    const newShares = updateShares(selectedMembers, newAmount)
                                    setFormData({ ...formData, amountDollars: newAmount, share: newShares })
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Split Type</label>
                            <div className="segmented">
                                <button
                                    type="button"
                                    className={`seg-btn ${formData.type === 'EQUAL' ? 'active' : ''}`}
                                    onClick={() => handleTypeChange('EQUAL')}
                                >
                                    Split Equally
                                </button>
                                <button
                                    type="button"
                                    className={`seg-btn ${formData.type === 'FIXED' ? 'active' : ''}`}
                                    onClick={() => handleTypeChange('FIXED')}
                                >
                                    Custom Amounts
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Select Users</label>
                            <div className="member-list">
                                {householdMembers.map(member => {
                                    const isSelected = selectedMembers.find(m => m.id === member.id)
                                    const memberShare = formData.share.find(s => s.payerId === member.id)

                                    return (
                                        <div key={member.id} className={`member-row ${isSelected ? 'selected' : ''}`}>
                                            <label className="member-check">
                                                <input
                                                    type="checkbox"
                                                    checked={!!isSelected}
                                                    onChange={() => handleMemberToggle(member)}
                                                />
                                                <span>{member.firstName} {member.lastName}</span>
                                            </label>

                                            {isSelected && formData.type === 'FIXED' && (
                                                <input
                                                    className="input amount-input"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="Amount"
                                                    value={memberShare ? (memberShare.amountCents / 100).toFixed(2) : ''}
                                                    onChange={e => handleFixedChange(member.id, e.target.value)}
                                                />
                                            )}

                                            {isSelected && formData.type === 'EQUAL' && (
                                                <span className="auto-chip">Auto-calculated</span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {formData.type === 'FIXED' && selectedMembers.length > 0 && (
                            <div className={`status-box ${isFixedBalanced ? 'success' : 'error'}`}>
                                <div>Total: ${(totalCents / 100).toFixed(2)}</div>
                                <div>Fixed sum: ${(fixedTotal / 100).toFixed(2)}</div>
                                {!isFixedBalanced && <div>⚠ Amounts must equal total</div>}
                                {isFixedBalanced && <div>✓ Amounts are balanced</div>}
                            </div>
                        )}

                        <div className="actions">
                            <button
                                className="settle-btn"
                                onClick={handleSubmit}
                                disabled={
                                    !formData.description.trim() ||
                                    !formData.amountDollars ||
                                    selectedMembers.length === 0 ||
                                    (formData.type === 'FIXED' && !isFixedBalanced)
                                }
                            >
                                Create Expense
                            </button>
                        </div>

                        <div className="nav-container" style={{marginTop: 12}}>
                            <Link to="/app/dashboard" className="nav-link">Back to Dashboard</Link>
                        </div>
                    </div>
                </div>

                {/* Right: Preview */}
                <div className="right-column">
                    <div className="card">
                        <h3 className="card-title">Expense Preview</h3>
                        <div className="preview-row"><strong>Description:</strong> {formData.description || 'No description'}</div>
                        <div className="preview-row"><strong>Total:</strong> ${(totalCents / 100).toFixed(2)}</div>
                        <div className="preview-row"><strong>Split Type:</strong> {formData.type}</div>
                        <div className="preview-row"><strong>Members ({selectedMembers.length}):</strong></div>
                        <ul className="preview-list">
                            {selectedMembers.map(member => (
                                <li key={member.id} className="preview-item">
                                    {member.firstName} {member.lastName}
                                    {formData.type === 'EQUAL' && <span className="preview-note"> — Amount will be calculated equally</span>}
                                    {formData.type === 'FIXED' && (
                                        <span className="preview-note">
                    {' '}— ${((formData.share.find(s => s.payerId === member.id)?.amountCents || 0) / 100).toFixed(2)}
                  </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExpenseForm