// App.jsx (mantén como estaba)
import { BrowserRouter } from 'react-router-dom'
import './App.css'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <div className='bg-green-400'>
        <AppRoutes />
      </div>
    </BrowserRouter>
  )
}

export default App