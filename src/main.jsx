import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './shared/styles/index.css'
import Routes from './routes/Routes'
import { AuthProvider } from './shared/context/AuthContext'
import { ThemeProvider } from './shared/context/ThemeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={Routes} />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
