import { Link } from 'react-router-dom';
import '../App.css';

const Home = () => {
  return (
    <div className="landingPage">
      <section className="view">
        <h1>Welcome to Easypoll</h1>
        <p>Create and share real-time polls in seconds.</p>
        <Link to="/Register">
           <button className="cta-button">Get Started</button>
        </Link> 
      </section>
      <section className="features">
        <div className="feature">
          <h2>Instant Polls</h2>
          <p>
            Get started as a host and get the opportunity to: 
            - Create sessions
            - Set up a poll
            - Get live feedback from your audience in real time.
          </p>
        </div>
        <div className="feature">
          <h2>No Signup Needed</h2>
          <p>
            Input your details and session code and start polling instantly. 
            No login required!
          </p>
        </div>
        <div className="feature">
          <h2>Easy Sharing</h2>
          <p>
            Share your session with a simple code. 
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