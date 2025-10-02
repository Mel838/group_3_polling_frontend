import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../App.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hostname: '',
    host_email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Validate username (alphanumeric only)
    if (!/^[a-zA-Z0-9]+$/.test(formData.hostname)) {
      setError('Username must contain only letters and numbers');
      return;
    }

    setLoading(true);

    try {
      // Send only the required fields to backend
      const { confirmPassword, ...registrationData } = formData;
      const res = await api.post('/auth/register', registrationData);

      // Cookie is automatically set by backend
      // Just store user info in localStorage for UI purposes
      if (res.data.data?.host) {
        localStorage.setItem('user', JSON.stringify(res.data.data.host));
      }

      setMessage('Registration successful! Redirecting...');
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="hostname"
            placeholder="Username (alphanumeric only)"
            value={formData.hostname}
            onChange={handleChange}
            disabled={loading}
            minLength={3}
            maxLength={30}
            required
          />
          <input
            type="email"
            name="host_email"
            placeholder="Email"
            value={formData.host_email}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            minLength={6}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
        <p>
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;