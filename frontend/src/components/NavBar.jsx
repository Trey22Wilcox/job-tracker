import { NavLink } from 'react-router-dom'

function NavBar() {
  return (
    <nav>
      <NavLink to="/">Dashboard</NavLink>
      <NavLink to="/resume">Resume</NavLink>
    </nav>
  )
}

export default NavBar