import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../App.css';

const Session = () => {
  const { session_id } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [polls, setPolls] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedPollId, setSelectedPollId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newPoll, setNewPoll] = useState({
    question: '',
    type: 'multiple_choice',
    options: ['', '']
  });

  useEffect(() => {
    loadSessionData();
    // Poll for updates every 5 seconds
    const interval = setInterval(loadPolls, 5000);
    return () => clearInterval(interval);
  }, [session_id]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSession(),
        loadPolls(),
        loadParticipants()
      ]);
    } catch (err) {
      console.error('Failed to load session data:', err);
      setError('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async () => {
    try {
      const response = await api.get(`/session/${session_id}`);
      setSession(response.data.data.session);
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  };

  const loadPolls = async () => {
    try {
      // Get all polls for this session
      const response = await api.get(`/polls/published/${session_id}`);
      setPolls(response.data.data || []);
    } catch (err) {
      console.error('Failed to load polls:', err);
    }
  };

  const loadParticipants = async () => {
    try {
      const response = await api.get(`/participants/${session_id}/polls`);
      // This endpoint returns polls, we need a different endpoint for participants
      // For now, participants will be empty or we need to add this endpoint
      setParticipants([]);
    } catch (err) {
      console.error('Failed to load participants:', err);
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    setError('');

    // Validate options
    const validOptions = newPoll.options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      setError('Please provide at least 2 options');
      return;
    }

    try {
      const pollData = {
        session_id: parseInt(session_id),
        question: newPoll.question,
        type: newPoll.type,
        options: JSON.stringify(validOptions.map((text, idx) => ({
          id: `opt${idx + 1}`,
          text
        })))
      };

      const response = await api.post('/polls', pollData);
      const createdPoll = response.data.data;
      
      setPolls([...polls, createdPoll]);
      setShowCreateModal(false);
      setNewPoll({ question: '', type: 'multiple_choice', options: ['', ''] });
    } catch (err) {
      console.error('Failed to create poll:', err);
      setError(err.response?.data?.error || 'Failed to create poll');
    }
  };

  const handlePublishPoll = async (poll_id) => {
    try {
      await api.put(`/polls/${poll_id}/publish`, { session_id: parseInt(session_id) });
      loadPolls(); // Reload to get updated status
    } catch (err) {
      console.error('Failed to publish poll:', err);
      alert('Failed to publish poll');
    }
  };

  const handleClosePoll = async (poll_id) => {
    try {
      await api.put(`/polls/${poll_id}/close`, { session_id: parseInt(session_id) });
      loadPolls(); // Reload to get updated status
    } catch (err) {
      console.error('Failed to close poll:', err);
      alert('Failed to close poll');
    }
  };

  const addOption = () => {
    setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
  };

  const updateOption = (index, value) => {
    const newOptions = [...newPoll.options];
    newOptions[index] = value;
    setNewPoll({ ...newPoll, options: newOptions });
  };

  const removeOption = (index) => {
    if (newPoll.options.length <= 2) return;
    setNewPoll({
      ...newPoll,
      options: newPoll.options.filter((_, i) => i !== index)
    });
  };

  const selectedPoll = polls.find(p => p.poll_id === selectedPollId);

  if (loading) {
    return <div className="loading-container">Loading session...</div>;
  }

  if (!session) {
    return <div className="loading-container">Session not found</div>;
  }

  return (
    <div className="session-page-container">
      <div className="session-page-header">
        <div className="session-page-header-left">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Back
          </button>
          <h1>{session.title}</h1>
          <div className="session-info">
            <span className="badge">Code: {session.session_code}</span>
            <span className="badge">Status: {session.status}</span>
            <span className="badge">Participants: {participants.length}</span>
          </div>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="create-button">
          + New Poll
        </button>
      </div>

      <div className="main-content">
        {/* Left Panel - Polls List */}
        <div className="left-panel">
          <h2 className="panel-title">Polls ({polls.length})</h2>
          {polls.length === 0 ? (
            <p className="empty-text">No polls yet. Create one to get started!</p>
          ) : (
            polls.map(poll => (
              <div
                key={poll.poll_id}
                className={`poll-item ${selectedPollId === poll.poll_id ? 'poll-item-active' : ''}`}
                onClick={() => setSelectedPollId(poll.poll_id)}
              >
                <div className="poll-item-header">
                  <h3 className="poll-item-title">{poll.question}</h3>
                  <span className={`poll-status-${poll.status}`}>
                    {poll.status}
                  </span>
                </div>
                <div className="poll-item-actions">
                  {poll.status === 'draft' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePublishPoll(poll.poll_id); }}
                      className="publish-btn"
                    >
                      Publish
                    </button>
                  )}
                  {poll.status === 'published' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleClosePoll(poll.poll_id); }}
                      className="close-btn"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Center Panel - Poll Results */}
        <div className="center-panel">
          {selectedPoll ? (
            <PollResults poll={selectedPoll} session_id={session_id} />
          ) : (
            <div className="empty-results">
              <p>Select a poll to view results</p>
            </div>
          )}
        </div>

        {/* Right Panel - Participants */}
        <div className="right-panel">
          <h2 className="panel-title">Participants ({participants.length})</h2>
          <div className="participant-list">
            {participants.length === 0 ? (
              <p className="empty-text">No participants yet</p>
            ) : (
              participants.map(participant => (
                <div key={participant.participant_id} className="participant-item">
                  <div className="participant-avatar">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="participant-name">{participant.name}</p>
                    {participant.email && (
                      <p className="participant-email">{participant.email}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="modal" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Create New Poll</h2>
            
            {error && (
              <div className="error" style={{ marginBottom: '15px' }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleCreatePoll}>
              <div className="form-group">
                <label>Poll Question</label>
                <input
                  type="text"
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                  placeholder="What's your question?"
                  required
                />
              </div>

              <div className="form-group">
                <label>Poll Type</label>
                <select
                  value={newPoll.type}
                  onChange={(e) => setNewPoll({ ...newPoll, type: e.target.value })}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="single_choice">Single Choice</option>
                </select>
              </div>

              <div className="form-group">
                <label>Options</label>
                {newPoll.options.map((option, index) => (
                  <div key={index} className="option-row">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="option-input"
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    {newPoll.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="remove-option-btn"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addOption} className="add-option-btn">
                  + Add Option
                </button>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Create Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Poll Results Component
const PollResults = ({ poll, session_id }) => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [poll.poll_id]);

  const options = typeof poll.options === 'string' 
    ? JSON.parse(poll.options) 
    : poll.options || [];

  const totalResponses = responses.length;

  return (
    <div className="results-container">
      <h2 className="results-title">{poll.question}</h2>
      <p className="results-subtitle">
        Type: {poll.type} | Status: {poll.status}
      </p>
      <p className="results-subtitle">Total Responses: {totalResponses}</p>

      <div className="results-list">
        {options.map((option, index) => {
          const count = 0; // Would calculate from responses
          const percentage = 0;

          return (
            <div key={option.id || index} className="result-item">
              <div className="result-header">
                <span className="result-label">{option.text}</span>
                <span className="result-count">
                  {count} ({Math.round(percentage)}%)
                </span>
              </div>
              <div className="result-bar">
                <div
                  className="result-bar-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Session;