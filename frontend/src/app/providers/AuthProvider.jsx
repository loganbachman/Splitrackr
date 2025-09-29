import axios from 'axios'
import { createContext, useContext, useEffect, useMemo, useState} from 'react'
import api from "../http.js";


const AuthContext = createContext()

const AuthProvider = ({children}) => {
    const [token, set_Token] = useState(localStorage.getItem("token"))
    // set new token value and update state
    const setToken = (newToken) => {
        set_Token(newToken);
    }

    useEffect(() => {
        if(token) {
            // set auth header if token exists
            axios.defaults.headers.common["Authorization"] = "Bearer " + token
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common["Authorization"]
            localStorage.removeItem('token')
        }
    },[token])

    const contextValue = useMemo(() => ({
        token,
        setToken,
    }), [token])

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}

export default AuthProvider