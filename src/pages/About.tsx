import { Link } from 'react-router-dom'

export function About() {
  return (
    <div>
      <h1>About Page</h1>
      <p>This is the About Page.</p>
        <Link to="/">Go to Home Page</Link><br />
        <Link to="/login">Go to Login Page</Link>
    </div>
  )
}
