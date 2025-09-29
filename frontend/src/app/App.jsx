import AuthProvider from './providers/AuthProvider'
import Routes from "./Routes"

function App() {
    return (
        <AuthProvider>
            <Routes/>
        </AuthProvider>
    )
}

export default App