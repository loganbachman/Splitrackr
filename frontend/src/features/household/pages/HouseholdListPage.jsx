import api from "../../../app/http.js";
import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import '../../styling/Main.css'


const HouseholdListPage = () => {
    const [houses, setHouses] = useState([])
    const [active, setActive] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {

            // get all of user's households
            const listResponse = await api.get('/household/mine')
            if(listResponse.status === 200) {
                setHouses(listResponse.data)
            } else {
                console.error("Failed to list households")
            }

            // get user's current active household
            const activeResponse = await api.get('/household/active')
            if(activeResponse.status === 200) {
                setActive(activeResponse.data.id)
            } else {
                console.error("Failed to load active household")
            }
        })()
    }, [])

    const switchHousehold = async (householdId) => {
        //setSwitchId(householdId)
        try {
            await api.put('/household/switch', {householdId})
            setActive(householdId)
            navigate('/app/dashboard', {replace: true})
        } catch (err) {
            console.error("Switch failed", err)
        }
    }


    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-left">
                    <h1>My Households</h1>
                    <p>Switch between your different households</p>
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
                <Link to="/app/create-house" className="nav-link">
                    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Household
                </Link>
                <Link to="/app/join-house" className="nav-link">
                    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Join Household
                </Link>
            </div>

            {/* Main Content */}
            <div className="main-content single-column">
                <div className="card">
                    <h3 className="card-title">Your Households</h3>

                    {houses.length === 0 ? (
                        <div className="empty-state">
                            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            </svg>
                            <h3>No households found</h3>
                            <p>You'll need to create or join a household first.</p>
                        </div>
                    ) : (
                        <div className="household-list">
                            {houses.map((house) => (
                                <div key={house.id} className="household-item">
                                    <div className="household-info">
                                        <div className="household-avatar">
                                            {house.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="household-details">
                                            <h4 className="household-name">{house.name}</h4>
                                            {house.id === active && (
                                                <span className="household-status active">
                                                    Currently Active
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {house.id !== active && (
                                        <button
                                            className="switch-btn"
                                            onClick={() => switchHousehold(house.id)}
                                        >
                                            Switch to This Household
                                        </button>
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

export default HouseholdListPage