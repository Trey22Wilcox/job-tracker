import {Routes, Route} from 'react-router-dom'
import NavBar from "./components/NavBar";
import Dashboard from './pages/Dashboard'
import Resume from './pages/Resume'
import './App.css'

function App() {
  return (
    <div>
      <navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/resume" element={<Resume />} />
      </Routes>
    </div>
  )
}

export default App