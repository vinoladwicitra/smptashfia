import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './context/ToastContext.tsx'
import { SiteSettingsProvider } from './context/SiteSettingsContext.tsx'
import { DarkModeProvider } from './context/DarkModeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DarkModeProvider>
      <ToastProvider>
        <SiteSettingsProvider>
          <App />
        </SiteSettingsProvider>
      </ToastProvider>
    </DarkModeProvider>
  </StrictMode>,
)
