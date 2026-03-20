import { BrowserRouter } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { selectAuthLoading } from './store/slices/authSlice.js'
import AppRoutes from './routes/AppRoutes.jsx'

const AppContent = () => {
  const loading = useSelector(selectAuthLoading)

  if (loading) {
    return (
        <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )
  }

  return <AppRoutes />
}

const App = () => {
  return (
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
  )
}

export default App