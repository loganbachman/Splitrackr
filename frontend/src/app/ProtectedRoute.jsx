import {Navigate, Outlet} from 'react-router-dom'
import {useAuth} from './providers/AuthProvider'

export const ProtectedRoute = () => {
    const {token} = useAuth()
    // if no token, navigate user to login page
    if(!token) {
        return <Navigate to="/login"/>
    }
    return <Outlet/>
}