import React from 'react';
import { Link } from 'react-router-dom';
import { FiCode, FiMessageSquare, FiUsers } from 'react-icons/fi';
import './Landing.css';

const Landing: React.FC = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1>Prico</h1>
        <p>Code. Chat. Collaborate.</p>
      </header>
      <main className="landing-main">
        <div className="feature-cards">
          <div className="card">
            <FiCode size={50} />
            <h2>Real-time Collaboration</h2>
            <p>Work on code with your team in a shared, real-time editor.</p>
          </div>
          <div className="card">
            <FiMessageSquare size={50} />
            <h2>Integrated Chat</h2>
            <p>Communicate with your team without leaving the editor.</p>
          </div>
          <div className="card">
            <FiUsers size={50} />
            <h2>Project Management</h2>
            <p>Manage your projects, files, and pull requests with ease.</p>
          </div>
        </div>
        <div className="cta-buttons">
          <Link to="/login" className="btn btn-primary">Get Started</Link>
          <Link to="/register" className="btn btn-secondary">Sign Up</Link>
        </div>
      </main>
      <footer className="landing-footer">
        <p>&copy; 2025 Prico. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
