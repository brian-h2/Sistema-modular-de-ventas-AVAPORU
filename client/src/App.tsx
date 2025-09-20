import { BrowserRouter } from 'react-router-dom'
import './App.css'
import Navbar from './components/ui/Navbar'
import AppRoutes from './routes/AppRoutes'

function App() {

  return (
  <BrowserRouter>
    <div className='bg-green-400' >
      <Navbar/>
      <AppRoutes/>
    </div>
  </BrowserRouter>
  )
}

export default App
