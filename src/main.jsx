import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'; // <--- 1. Importar
import './index.css'
import App from './App.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* <--- 2. Envolver <App /> */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)