import { useState } from 'react'
import { signUpWithRetry } from './auth'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [retryStatus, setRetryStatus] = useState<{
    isWaiting: boolean;
    secondsRemaining?: number;
    message?: string;
  }>({ isWaiting: false })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent multiple submissions
    if (isLoading || retryStatus.isWaiting) {
      console.log('⚠️ Signup already in progress or waiting for retry, ignoring duplicate submission');
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
      const result = await signUpWithRetry(email, password, fullName, 3, (status) => {
        setRetryStatus(status);
        if (status.message) {
          setMessage(status.message);
        }
      })

      if (result.success) {
        setMessage('Signup successful! Check your email for confirmation.')
        // Clear form
        setEmail('')
        setPassword('')
        setFullName('')
      } else {
        setMessage(`Error: ${result.error?.message || 'Unknown error occurred'}`)
      }
    } catch (error) {
      console.error('Unexpected error in SignupForm:', error);
      setMessage('Unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false)
      setRetryStatus({ isWaiting: false })
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
      <button type="submit" disabled={isLoading || retryStatus.isWaiting}>
        {retryStatus.isWaiting 
          ? `Please wait ${retryStatus.secondsRemaining || '...'}s` 
          : isLoading 
            ? 'Creating Account...' 
            : 'Sign Up'
        }
      </button>
      <p style={{ color: retryStatus.isWaiting ? '#f59e0b' : undefined }}>
        {message}
      </p>
      {retryStatus.isWaiting && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#fef3c7', 
          border: '1px solid #f59e0b', 
          borderRadius: '4px',
          marginTop: '10px'
        }}>
          <strong>⏱️ Rate Limited:</strong> Please wait {retryStatus.secondsRemaining} seconds before the next attempt.
        </div>
      )}
    </form>
  )
}
