import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../App.css';

const ParticipantPoll = () => {
  const { session_id } = useParams();
  const navigate = useNavigate();
  
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  
  const participant = JSON.parse(localStorage.getItem('participant') || '{}');

  useEffect(() => {
    if (!participant.participant_id) {
      navigate('/join');
      return;
    }
    
    loadPolls();
    
    // Poll for new polls every 5 seconds
    const interval = setInterval(loadPolls, 5000);
    return () => clearInterval(interval);
  }, [session_id]);

  const loadPolls = async () => {
    try {
      const response = await api.get(`/participants/${session_id}/polls`);
      setPolls(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load polls:', err);
      setError('Failed to load polls');
      setLoading(false);
    }
  };

  const handleAnswerChange = (poll_id, option_id, isMultiple) => {
    if (isMultiple) {
      // Multiple choice - toggle option
      const current = selectedAnswers[poll_id] || [];
      const newAnswers = current.includes(option_id)
        ? current.filter(id => id !== option_id)
        : [...current, option_id];
      
      setSelectedAnswers({
        ...selectedAnswers,
        [poll_id]: newAnswers
      });
    } else {
      // Single choice - replace
      setSelectedAnswers({
        ...selectedAnswers,
        [poll_id]: [option_id]
      });
    }
  };

  const handleSubmitResponse = async (poll_id) => {
    const answer = selectedAnswers[poll_id];
    
    if (!answer || answer.length === 0) {
      alert('Please select at least one option');
      return;
    }

    setSubmitting(true);
    
    try {
      await api.post('/participants/responses', {
        poll_id: parseInt(poll_id),
        participant_id: participant.participant_id,
        response: JSON.stringify({ option_ids: answer })
      });
      
      alert('Response submitted successfully!');
      
      // Clear selection for this poll
      const newAnswers = { ...selectedAnswers };
      delete newAnswers[poll_id];
      setSelectedAnswers(newAnswers);
    } catch (err) {
      console.error('Failed to submit response:', err);
      alert(err.response?.data?.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading polls...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1>Active Polls</h1>
          <p>Welcome, {participant.name}!</p>
        </div>
        <button onClick={() => navigate('/join')} className="logout-button">
          Leave Session
        </button>
      </div>

      {error && (
        <div className="error" style={{ margin: '20px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        {polls.length === 0 ? (
          <div className="empty-state">
            <p>No active polls yet. Wait for the host to publish a poll.</p>
          </div>
        ) : (
          polls.map(poll => {
            const options = typeof poll.options === 'string' 
              ? JSON.parse(poll.options) 
              : poll.options || [];
            
            const isMultiple = poll.type === 'multiple_choice';
            const userAnswers = selectedAnswers[poll.poll_id] || [];

            return (
              <div key={poll.poll_id} className="session-card" style={{ marginBottom: '20px' }}>
                <h3 className="session-title">{poll.question}</h3>
                <p style={{ color: '#718096', marginBottom: '15px', fontSize: '14px' }}>
                  {isMultiple ? 'Select all that apply' : 'Select one option'}
                </p>
                
                <div style={{ marginBottom: '15px' }}>
                  {options.map((option, index) => {
                    const optionId = option.id || `opt${index + 1}`;
                    const isSelected = userAnswers.includes(optionId);
                    
                    return (
                      <label
                        key={optionId}
                        style={{
                          display: 'block',
                          padding: '12px',
                          marginBottom: '8px',
                          border: `2px solid ${isSelected ? '#3182ce' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#e6f3ff' : 'white',
                          transition: 'all 0.2s'
                        }}
                      >
                        <input
                          type={isMultiple ? 'checkbox' : 'radio'}
                          name={`poll_${poll.poll_id}`}
                          checked={isSelected}
                          onChange={() => handleAnswerChange(poll.poll_id, optionId, isMultiple)}
                          style={{ marginRight: '10px' }}
                        />
                        <span>{option.text}</span>
                      </label>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handleSubmitResponse(poll.poll_id)}
                  disabled={submitting || userAnswers.length === 0}
                  className="submit-button"
                  style={{ width: '100%' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Response'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ParticipantPoll;