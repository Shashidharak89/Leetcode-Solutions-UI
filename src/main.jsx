import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Import your context provider
import { LeetCodeProvider } from './context/LeetcodeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LeetCodeProvider>
      <App />
    </LeetCodeProvider>
  </StrictMode>,
)
