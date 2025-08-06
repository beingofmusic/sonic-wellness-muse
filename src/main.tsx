
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { BadgeNotificationProvider } from './context/BadgeNotificationContext'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <BadgeNotificationProvider>
          <App />
          <Toaster position="top-center" />
        </BadgeNotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
