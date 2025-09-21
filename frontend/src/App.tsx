import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import './App.css';

const App: React.FC = () => {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={token ? <Home /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={token ? "/home" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default App;
