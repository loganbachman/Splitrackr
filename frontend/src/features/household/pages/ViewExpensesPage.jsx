import {useEffect, useState} from "react";
import api from "../../../app/http.js";
import {Link} from "react-router-dom";
import '../../styling/Main.css'

const centsToDollars = (c) => (c / 100).toFixed(2)
const dollarsToCents = (d) => Math.round((parseFloat(d)) * 100)

export default function ViewExpensesPage() {
    const [expenses, setExpenses] = useState([])
    const [editingId, setEditingId] = useState(true)
    const [description, setDescription] = useState('')
    const [amountDollars, setAmountDollars] = useState('')
    const [saving, setSaving] = useState(false)

    const loadExpenses = async () => {
        try {
            const response = await api.get("/expense/returnUser")
            setExpenses(response.data)
        } catch(error) {
            console.error("Faied to load your expenses", error)
        }
    }

    useEffect(() => {
        loadExpenses()
    },[])

    const edit = (e) => {
        setEditingId(e.id)
        setDescription(e.description)
        setAmountDollars(centsToDollars(e.amountCents))
    }

    const cancelEdit = () => {
        setEditingId(null)
        setDescription('')
        setAmountDollars('')
    }

    const saveEdit = async  () => {
        setSaving(true)

        // warning message for recalculation of shares
        const currentExpense = expenses.find(e => e.id === editingId)
        if (currentExpense && currentExpense.type === 'FIXED') {
            if (!confirm("This will convert custom amounts to an equal split. Continue?")) {
                setSaving(false)
                return;
            }
        }

        try {
            await api.put("/expense/update",
                {
                    description: description.trim(),
                    amountCents: dollarsToCents(amountDollars)
                },
                {params: {expenseId: editingId}}
                )
            await loadExpenses()
            cancelEdit()
        } catch(error) {
            console.error("Update failed", error)
        }
    }

    const deleteExpense = async (id) => {
        if(!confirm("Delete this expense?")) return;
        try {
            await api.delete("/expense/delete", {
                params: {expenseId: id}
            })
            await loadExpenses()
        } catch(error) {
            console.error("Delete failed", error)
        }
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-left">
                    <h1>My Expenses</h1>
                    <p>Edit and manage expenses you've created</p>
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
                <Link to="/app/create-expense" className="nav-link">
                    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Expense
                </Link>
            </div>

            {/* Main Content */}
            <div className="main-content single-column">
                <div className="card">
                    <h3 className="card-title">Your Expenses</h3>

                    {expenses.length === 0 ? (
                        <div className="empty-state">
                            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <h3>No expenses yet</h3>
                            <p>Start by creating your first expense.</p>
                            <Link to="/app/create-expense" className="settle-btn" style={{display: 'inline-block', textDecoration: 'none', marginTop: '16px'}}>
                                Create Expense
                            </Link>
                        </div>
                    ) : (
                        <div className="my-expenses-list">
                            {expenses.map((expense) => (
                                <div key={expense.id} className="my-expense-item">
                                    {editingId === expense.id ? (
                                        <div className="expense-edit-form">
                                            <div className="form-group">
                                                <label className="form-label">Description</label>
                                                <input
                                                    className="input"
                                                    type="text"
                                                    value={description}
                                                    onChange={(ev) => setDescription(ev.target.value)}
                                                    placeholder="Enter expense description"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Amount ($)</label>
                                                <input
                                                    className="input"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={amountDollars}
                                                    onChange={(ev) => setAmountDollars(ev.target.value)}
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div className="expense-edit-actions">
                                                <button
                                                    className="settle-btn"
                                                    onClick={saveEdit}
                                                    disabled={saving || !description.trim() || !amountDollars}
                                                    style={{marginRight: '8px'}}
                                                >
                                                    {saving ? "Saving..." : "Save Changes"}
                                                </button>
                                                <button
                                                    className="cancel-btn"
                                                    onClick={cancelEdit}
                                                    disabled={saving}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="expense-view">
                                            <div className="expense-header">
                                                <h4 className="expense-title">{expense.description}</h4>
                                                <div className="expense-actions">
                                                    <button
                                                        className="edit-btn"
                                                        onClick={() => edit(expense)}
                                                        title="Edit expense"
                                                    >
                                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => deleteExpense(expense.id)}
                                                        title="Delete expense"
                                                    >
                                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="expense-details">
                                                <span className="expense-amount">
                                                    ${centsToDollars(expense.amountCents)}
                                                </span>
                                                <span className={`expense-type ${expense.type?.toLowerCase() || 'equal'}`}>
                                                    {expense.type || 'EQUAL'}
                                                </span>
                                            </div>
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