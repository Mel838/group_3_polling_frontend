import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../App.css';

const ParticipantJoin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    session_code: '',
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate at least email or phone
    if (!formData.email && !formData.phone) {
      setError('Please provide either email or phone number');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/participants/join', formData);
      const participant = response.data.data;
      
      // Store participant info
      localStorage.setItem('participant', JSON.stringify(participant));
      
      // Navigate to participant poll page
      navigate(`/participant/${participant.session_id}`);
    } catch (err) {
      console.error('Failed to join session:', err);
      setError(err.response?.data?.message || 'Failed to join session. Please check the session code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <h2>Join Session</h2>
        <p style={{ textAlign: 'center', color: '#718096', marginBottom: '20px' }}>
          Enter the session code provided by your host
        </p>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="session_code"
            placeholder="Session Code (e.g., ABC123)"
            value={formData.session_code}
            onChange={handleChange}
            disabled={loading}
            required
            maxLength={6}
            style={{ textTransform: 'uppercase' }}
          />
          
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            required
          />
          
          <input
            type="email"
            name="email"
            placeholder="Email (optional if phone provided)"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          
          <input
            type="tel"
            name="phone"
            placeholder="Phone (optional if email provided)"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
          />
          
          <button type="submit" disabled={loading}>
            {loading ? 'Joining...' : 'Join Session'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="/">← Back to Home</a>
        </p>
      </div>
    </div>
  );
};

export default ParticipantJoin;
