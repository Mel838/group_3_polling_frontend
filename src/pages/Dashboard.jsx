import { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import api from '../services/api';
import '../App.css';

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newSession, setNewSession] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/session');
      setSessions(response.data.data.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setError('');

    if (!newSession.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      const response = await api.post('/session', newSession);
      const createdSession = response.data.data.session;
      
      setSessions([createdSession, ...sessions]);
      setShowModal(false);
      setNewSession({ title: '', description: '' });
      
      // Navigate to the new session
      navigate(`/session/${createdSession.session_id}`);
    } catch (err) {
      console.error('Failed to create session:', err);
      setError(err.response?.data?.error || 'Failed to create session');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading-container">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1>My Sessions</h1>
          <p>Welcome back, {user.hostname}!</p>
        </div>
        <div className="dashboard-header-actions">
          <button onClick={() => setShowModal(true)} className="create-button">
            + New Session
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      {error && !showModal && (
        <div className="error" style={{ margin: '20px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <div className="session-grid">
        {sessions.length === 0 ? (
          <div className="empty-state">
            <p>No sessions yet. Create your first session to get started!</p>
            <button onClick={() => setShowModal(true)} className="create-button">
              Create Session
            </button>
          </div>
        ) : (
          sessions.map(session => (
            <div key={session.session_id} className="session-card">
              <div className="session-header">
                <h3 className="session-title">{session.title}</h3>
                <span className="session-code">{session.session_code}</span>
              </div>
              {session.description && (
                <p className="session-description">{session.description}</p>
              )}
              <div className="session-footer">
                <span className="session-date">{formatDate(session.created_at)}</span>
                <div className="session-actions">
                  <button
                    onClick={() => navigate(`/session/${session.session_id}`)}
                    className="open-button"
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Create New Session</h2>
            
            {error && (
              <div className="error" style={{ marginBottom: '15px' }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleCreateSession}>
              <div className="form-group">
                <label>Session Title</label>
                <input
                  type="text"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  placeholder="e.g., Product Feedback Q1 2025"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  placeholder="Brief description of this session"
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;