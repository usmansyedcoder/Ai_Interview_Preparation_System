// D:\TNC\TNC_Apprenticeship02\ai-interview-system\frontend\src\App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import ResumeUpload from "./components/ResumeUpload";
import ResumeAnalysis from "./components/ResumeAnalysis";
import InterviewChat from "./components/InterviewChat";
import FeedbackReport from "./components/FeedbackReport";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [interviewSession, setInterviewSession] = useState(null);
  const [interviewFeedback, setInterviewFeedback] = useState(null);

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={<ResumeUpload onAnalysisComplete={setAnalysisData} />}
          />
          <Route
            path="/analysis"
            element={
              <ResumeAnalysis
                analysisData={analysisData}
                onStartInterview={(session) => {
                  setInterviewSession(session);
                  setInterviewFeedback(null);
                }}
              />
            }
          />
          <Route
            path="/interview"
            element={
              <InterviewChat
                sessionData={interviewSession}
                onComplete={(feedback) => {
                  setInterviewFeedback(feedback);
                }}
              />
            }
          />
          <Route
            path="/feedback"
            element={
              <FeedbackReport
                evaluation={interviewFeedback?.evaluation}
                sessionSummary={interviewFeedback?.sessionSummary}
                resumeAnalysis={analysisData}
              />
            }
          />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

// Modern Navbar Component
function Navbar() {
  const location = useLocation();
  
  const navItems = [
    { path: "/", name: "Upload Resume", icon: "📄" },
    { path: "/dashboard", name: "Dashboard", icon: "📊" },
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo-section">
          <div className="logo-icon">🤖</div>
          <div>
            <h1 className="logo-text">AI Interview System</h1>
            <p className="logo-subtext">Smart Interview Analysis & Preparation for Any Job.</p>
          </div>
        </div>

        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default App;