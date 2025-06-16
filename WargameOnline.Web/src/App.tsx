import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider,useAuth } from './context/AuthContext'
import LanguageSelector from './components/LanguageSelector'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/auth" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="relative min-h-screen bg-bg text-white">
          {/* 🌐 Selettore lingua globale in alto a destra */}
          <div className="absolute top-4 right-4 z-50">
            <LanguageSelector />
          </div>

          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
export default App