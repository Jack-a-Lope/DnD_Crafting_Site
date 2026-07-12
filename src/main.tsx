import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import User_Auth from './User_Auth.tsx'
import { AuthProvider } from './Auth_Context.tsx'
import App from "./App.tsx"
import {Item_List, Item_Creator, Item_Creator_Menu} from './Item_Card.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
