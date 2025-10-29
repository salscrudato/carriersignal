import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ArticleProvider } from './context/ArticleContext'
import { UIProvider } from './context/UIContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ArticleProvider>
      <UIProvider>
        <App />
      </UIProvider>
    </ArticleProvider>
  </StrictMode>,
)
