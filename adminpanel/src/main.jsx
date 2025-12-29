import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { CompanyProvider } from './contextApi/CompanyContext.jsx'
import { ToastContainer } from 'react-toastify'
import { CategoryProvider } from './contextApi/CategoryContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CategoryProvider>
      <CompanyProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CompanyProvider>
    </CategoryProvider>
  </StrictMode>,
)
