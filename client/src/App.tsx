// App.jsx (mantén como estaba)
import { BrowserRouter } from 'react-router-dom'
import './App.css'
import AppRoutes from './routes/AppRoutes'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className='min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors'>
          <AppRoutes />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App