import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {Item_List, Item_Creator, Item_Creator_Menu} from './Item_Card.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Item_List />
  </StrictMode>,
)
