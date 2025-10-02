import { Link } from 'react-router-dom';
import '../App.css';

const Home = () => {
  return (
    <div className="landingPage">
      <section className="view">
        <h1>Welcome to Easypoll</h1>
        <p>Create and share real-time polls in seconds.</p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register">
            <button className="cta-button">Get Started as Host</button>
          </Link>
          <Link to="/join">
            <button className="cta-button" style={{ background: 'linear-gradient(135deg, #48bb78, #38a169)' }}>
              Join a Session as Participant
            </button>
          </Link>
        </div>
      </section>
      
      <section className="features">
        <div className="feature">
          <h2>Instant Polls</h2>
          <p>
            Get started as a host and get the opportunity to:{'\n'}
            • Create sessions{'\n'}
            • Set up a poll{'\n'}
            • Get live feedback from your audience in real time.
          </p>
        </div>
        <div className="feature">
          <h2>No Signup Needed</h2>
          <p>
            Input your details and session code and start polling instantly.{'\n'}
            No login required for participants!
          </p>
        </div>
        <div className="feature">
          <h2>Easy Sharing</h2>
          <p>
            Share your session with a simple code.{'\n'}
            Anyone can participate!
          </p>
        </div>
      </section>

      <footer className="footer">
        © 2025 Easypoll. Built for real-time interaction.
      </footer>
    </div>
  );
};

export default Home;