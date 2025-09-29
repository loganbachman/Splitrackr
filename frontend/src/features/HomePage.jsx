import {Link, useNavigate} from "react-router-dom"
import './styling/Main.css'

const HomePage = () => {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">Splitrackr</h1>
                        <p className="hero-subtitle">
                            Split expenses with roommates, friends, and family.
                            Track who owes what and settle up with ease.
                        </p>
                        <div className="hero-actions">
                            <Link to="/register" className="cta-button primary">
                                Get Started Free
                            </Link>
                            <Link to="/login" className="cta-button secondary">
                                Sign In
                            </Link>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="feature-preview">
                            <div className="preview-card">
                                <div className="preview-header">
                                    <div className="preview-dot"></div>
                                    <div className="preview-dot"></div>
                                    <div className="preview-dot"></div>
                                </div>
                                <div className="preview-content">
                                    <div className="preview-expense">
                                        <span className="expense-name">Groceries</span>
                                        <span className="expense-amount">$84.50</span>
                                    </div>
                                    <div className="preview-expense">
                                        <span className="expense-name">Utilities</span>
                                        <span className="expense-amount">$156.00</span>
                                    </div>
                                    <div className="preview-balance">
                                        <span className="balance-label">You owe</span>
                                        <span className="balance-amount">$45.25</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="features-section">
                <div className="features-container">
                    <h2 className="features-title">Why Choose Splitrackr?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <div className="icon-circle">$</div>
                            </div>
                            <h3>Easy Expense Tracking</h3>
                            <p>Add expenses in seconds and split them fairly among your household members.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <div className="icon-circle">⚖</div>
                            </div>
                            <h3>Smart Settlements</h3>
                            <p>Automatically calculate who owes what and get optimal payment suggestions.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <div className="icon-circle">👥</div>
                            </div>
                            <h3>Multiple Households</h3>
                            <p>Manage expenses across different groups - roommates, family, friends.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="cta-section">
                <div className="cta-container">
                    <h2>Ready to simplify your shared expenses?</h2>
                    <p>Join other users who trust Splitrackr to manage their household finances.</p>
                    <Link to="/register" className="cta-button primary large">
                        Start Tracking Today
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default HomePage