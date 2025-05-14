
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { BrowserRouter } from 'react-router-dom'
import { BadgeNotificationProvider } from './context/BadgeNotificationContext'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <BadgeNotificationProvider>
        <App />
      </BadgeNotificationProvider>
    </AuthProvider>
  </BrowserRouter>
);
