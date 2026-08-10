
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initializeTheme } from './utils/themeUtils.js'
import { LanguageProvider } from './context/LanguageContext.jsx'

initializeTheme();

createRoot(document.getElementById('root')).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
)
