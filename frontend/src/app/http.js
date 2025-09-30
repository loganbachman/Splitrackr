import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

api.interceptors.request.use((config) => {
    const url = config.url
    if(url.startsWith('/auth')) {
        if(config.headers) delete config.headers.Authorization
        return config
    }
    const token = localStorage.getItem("token") // or wire via context getter
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
    return config
});

export default api