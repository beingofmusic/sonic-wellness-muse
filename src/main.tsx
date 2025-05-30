
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { BadgeNotificationProvider } from './context/BadgeNotificationContext'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <BadgeNotificationProvider>
        <App />
        <Toaster position="top-center" />
      </BadgeNotificationProvider>
    </AuthProvider>
  </BrowserRouter>
);
