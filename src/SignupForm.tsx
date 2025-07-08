import { useState } from 'react'
import { signUp } from './auth'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent multiple submissions
    if (isLoading) {
      console.log('⚠️ Signup already in progress, ignoring duplicate submission');
      return;
    }
    
    // Basic validation
    if (!email || !password || !fullName) {
      setMessage('Please fill in all fields.')
      return
    }
    
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.')
      return
    }
    
    setIsLoading(true)
    setMessage('Creating your account...')
    console.log('🚀 Starting signup process from SignupForm');
    
    try {
      const result = await signUp(email, password, fullName)

      if (result.success) {
        setMessage('Signup successful! Check your email for confirmation.')
        // Clear form
        setEmail('')
        setPassword('')
        setFullName('')
      } else if (result.error?.isRateLimit) {
        setMessage('Signup in progress, please check your email or try again shortly')
      } else {
        setMessage(`Error: ${result.error?.message || 'Unknown error occurred'}`)
      }
    } catch (error) {
      console.error('Unexpected error in SignupForm:', error);
      setMessage('Unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </button>
      <p>{message}</p>
    </form>
  )
}
