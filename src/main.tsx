import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './context/ToastContext.tsx'
import { SiteSettingsProvider } from './context/SiteSettingsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <SiteSettingsProvider>
        <App />
      </SiteSettingsProvider>
    </ToastProvider>
  </StrictMode>,
)
