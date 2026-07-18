
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initializeTheme } from './utils/themeUtils.js'

initializeTheme();

createRoot(document.getElementById('root')).render(
  <>
    <App />
  </>
)
