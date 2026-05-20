import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { LangProvider, ThemeProvider } from './lib/i18n'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <LangProvider>
        <App />
      </LangProvider>
    </ThemeProvider>
  </BrowserRouter>,
)
