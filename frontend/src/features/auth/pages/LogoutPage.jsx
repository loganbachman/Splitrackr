import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";
import {useEffect} from "react";
import api from "../../../app/http.js";
import '../../styling/Main.css'

const LogoutPage = () => {
    const { setToken } = useAuth();
    const navigate = useNavigate();

    // logout and remove token from storage
    useEffect(() => {
        setToken(null);
        localStorage.removeItem("token")
        delete api.defaults.headers.common.Authorization
        navigate("/", { replace: true });
    }, [navigate, setToken])
};

export default LogoutPage;