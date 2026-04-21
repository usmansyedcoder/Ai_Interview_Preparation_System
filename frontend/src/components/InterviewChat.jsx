// D:\TNC\TNC_Apprenticeship02\ai-interview-system\frontend\src\components\InterviewChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function InterviewChat({ sessionData, onComplete }) {
  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  const API_URL = 'http://localhost:8000';

  useEffect(() => {
    if (sessionData?.session_id) {
      loadFirstQuestion();
    } else {
      toast.error('No interview session found. Please start a new interview.');
      navigate('/');
    }
  }, [sessionData]);

  const loadFirstQuestion = async () => {
    setThinking(true);
    
    // Add welcome message
    const welcomeMessage = {
      type: 'bot',
      content: `👋 Welcome to your AI interview for the **${sessionData?.job_title || 'position'}** position!\n\nI'll be conducting this interview. Take your time with each answer. Let's begin!`
    };
    
    setMessages([welcomeMessage]);
    
    // Simulate thinking before first question
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: sessionData?.first_question || "Can you tell me about yourself and your experience relevant to this position?"
      }]);
      setCurrentQuestionNumber(1);
      setThinking(false);
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    if (loading) return;

    const userAnswer = answer.trim();
    setAnswer('');
    setLoading(true);
    
    // Add user message to chat
    setMessages(prev => [...prev, { 
      type: 'user', 
      content: userAnswer,
      timestamp: new Date().toISOString()
    }]);
    
    // Show thinking indicator
    setThinking(true);
    
    try {
      const response = await axios.post(`${API_URL}/api/interview/answer`, {
        session_id: sessionData.session_id,
        answer: userAnswer
      });
      
      setThinking(false);
      
      if (response.data.interview_complete) {
        setInterviewComplete(true);
        setMessages(prev => [...prev, {
          type: 'bot',
          content: "✨ Thank you for completing the interview! I'm now generating your detailed feedback report..."
        }]);
        
        toast.success('Interview completed! Generating feedback...');
        
        // Fetch final evaluation
        try {
          const feedbackResponse = await axios.post(`${API_URL}/api/interview/feedback`, {
            session_id: sessionData.session_id
          });
          
          if (feedbackResponse.data.success && onComplete) {
            onComplete({
              evaluation: feedbackResponse.data.evaluation,
              sessionSummary: feedbackResponse.data.session_summary
            });
          }
          
          // Navigate to feedback after delay
          setTimeout(() => {
            navigate('/feedback', {
              state: {
                evaluation: feedbackResponse.data.evaluation,
                sessionSummary: feedbackResponse.data.session_summary,
                jobTitle: sessionData?.job_title
              }
            });
          }, 2000);
        } catch (error) {
          console.error('Error fetching feedback:', error);
          toast.error('Failed to generate feedback report');
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      } else {
        // Update question number
        const newQuestionNumber = currentQuestionNumber + 1;
        setCurrentQuestionNumber(newQuestionNumber);
        setTotalQuestions(response.data.total_questions || 8);
        
        // Add bot response with feedback
        setMessages(prev => [...prev, {
          type: 'bot',
          content: response.data.question,
          feedback: response.data.feedback,
          score: response.data.score
        }]);
        
        // Show score toast for feedback
        if (response.data.score) {
          toast.success(`Question ${currentQuestionNumber} score: ${Math.round(response.data.score)}/100`);
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setThinking(false);
      
      let errorMessage = 'Failed to submit answer. Please try again.';
      if (error.response?.status === 404) {
        errorMessage = 'Interview session not found. Please restart the interview.';
        setTimeout(() => navigate('/'), 2000);
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
      }
      
      toast.error(errorMessage);
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        type: 'bot',
        content: "❌ Sorry, I encountered an error. Please try submitting your answer again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    // Send message on Enter (without Shift key)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && answer.trim()) {
        handleSubmit();
      }
    }
  };

  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [answer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const formatMessageContent = (content) => {
    // Convert markdown-like syntax to HTML
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
    return formatted;
  };

  if (interviewComplete) {
    return (
      <div className="container">
        <div className="card text-center" style={{ padding: '40px' }}>
          <div className="spinner" style={{ margin: '0 auto 20px', width: '40px', height: '40px' }}></div>
          <h2 className="text-2xl font-bold mb-2">Interview Complete! 🎉</h2>
          <p className="text-gray-600">Generating your personalized feedback report...</p>
          <p className="text-sm text-gray-500 mt-4">You will be redirected shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="chat-container" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100vh - 120px)',
        backgroundColor: '#f7f9fc',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          padding: '16px 24px', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>🎯 Mock Interview: {sessionData?.job_title || 'Position'}</h3>
            {totalQuestions > 0 && (
              <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.9 }}>
                Question {currentQuestionNumber} of {totalQuestions}
              </p>
            )}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>
            {loading && <span>AI is thinking...</span>}
          </div>
        </div>

        {/* Messages Area */}
        <div className="chat-messages" style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`message ${msg.type}`}
              style={{ 
                display: 'flex', 
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                animation: 'fadeIn 0.3s ease-in'
              }}
            >
              <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: msg.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                backgroundColor: msg.type === 'user' ? '#667eea' : '#ffffff',
                color: msg.type === 'user' ? '#ffffff' : '#333333',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                <div dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }} />
                {msg.feedback && (
                  <div style={{ 
                    marginTop: '8px', 
                    paddingTop: '8px', 
                    borderTop: '1px solid rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    color: msg.type === 'user' ? '#e0e0e0' : '#666'
                  }}>
                    💡 {msg.feedback}
                  </div>
                )}
                {msg.score && (
                  <div style={{
                    marginTop: '4px',
                    fontSize: '11px',
                    color: msg.type === 'user' ? '#d0d0d0' : '#888'
                  }}>
                    Score: {Math.round(msg.score)}/100
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Thinking Indicator */}
          {thinking && (
            <div className="message bot" style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '18px',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                <div className="thinking-dots">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ 
          padding: '16px 20px', 
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          <textarea
            ref={textareaRef}
            rows="1"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer here... (Press Enter to send, Shift+Enter for new line)"
            disabled={loading || thinking}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '24px',
              resize: 'none',
              fontFamily: 'inherit',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
              minHeight: '44px'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit} 
            disabled={loading || thinking || !answer.trim()}
            style={{
              padding: '10px 24px',
              borderRadius: '24px',
              backgroundColor: (!loading && !thinking && answer.trim()) ? '#667eea' : '#ccc',
              color: 'white',
              border: 'none',
              cursor: (!loading && !thinking && answer.trim()) ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Sending...' : 'Send ✨'}
          </button>
        </div>
        
        {/* Progress Bar */}
        {totalQuestions > 0 && (
          <div style={{ height: '3px', backgroundColor: '#e0e0e0' }}>
            <div style={{
              height: '100%',
              width: `${(currentQuestionNumber / totalQuestions) * 100}%`,
              backgroundColor: '#667eea',
              transition: 'width 0.3s ease'
            }} />
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .thinking-dots span {
          animation: blink 1.4s infinite;
          font-size: 20px;
        }
        
        .thinking-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .thinking-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes blink {
          0%, 20% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          80%, 100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default InterviewChat;