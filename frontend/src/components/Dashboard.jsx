// D:\TNC\TNC_Apprenticeship02\ai-interview-system\frontend\src\components\Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Award, Brain, Target, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:8000';

function Dashboard() {
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    bestScore: 0,
    worstScore: 0,
    totalQuestions: 0,
    averageResponseTime: 0,
    improvementRate: 0
  });
  const [recentScores, setRecentScores] = useState([]);
  const [skillAnalysis, setSkillAnalysis] = useState({});
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = 'user_001'; // In production, get from auth

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch user stats
      const statsResponse = await axios.get(`${API_URL}/api/dashboard/stats/${userId}`);
      setStats(statsResponse.data);
      
      // Fetch interview history
      const historyResponse = await axios.get(`${API_URL}/api/dashboard/history/${userId}`, {
        params: { limit: 10 }
      });
      setRecentInterviews(historyResponse.data);
      
      // Process scores for chart
      const scores = historyResponse.data.map(interview => ({
        date: new Date(interview.date).toLocaleDateString(),
        score: interview.score,
        jobTitle: interview.job_title
      }));
      setRecentScores(scores);
      
      // Fetch skill analysis
      const skillResponse = await axios.get(`${API_URL}/api/dashboard/skill-analysis/${userId}`);
      setSkillAnalysis(skillResponse.data);
      
      // Generate recommendations based on weak skills
      const weakSkills = skillResponse.data.weak_skills || [];
      const generatedRecommendations = generateRecommendations(weakSkills);
      setRecommendations(generatedRecommendations);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Load mock data if backend not available
      loadMockData();
      toast.error('Using demo data. Connect backend for real-time stats.');
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    setStats({
      totalInterviews: 8,
      averageScore: 72.5,
      bestScore: 88,
      worstScore: 58,
      totalQuestions: 64,
      averageResponseTime: 45,
      improvementRate: 15
    });
    
    setRecentScores([
      { date: 'Week 1', score: 58, jobTitle: 'Frontend Dev' },
      { date: 'Week 2', score: 65, jobTitle: 'Backend Dev' },
      { date: 'Week 3', score: 72, jobTitle: 'Full Stack' },
      { date: 'Week 4', score: 78, jobTitle: 'Python Dev' },
      { date: 'Week 5', score: 85, jobTitle: 'AI Engineer' },
      { date: 'Week 6', score: 88, jobTitle: 'ML Engineer' }
    ]);
    
    setSkillAnalysis({
      strong_skills: ['Python', 'JavaScript', 'React', 'Node.js'],
      weak_skills: ['System Design', 'Database Optimization', 'Cloud Architecture', 'Algorithms'],
      recommended_focus: ['System Design', 'Algorithms', 'Cloud Computing'],
      skill_scores: {
        'Python': 85,
        'JavaScript': 78,
        'React': 82,
        'Node.js': 75,
        'System Design': 55,
        'Databases': 65,
        'Algorithms': 60,
        'Cloud': 45
      }
    });
    
    setRecentInterviews([
      { session_id: '1', job_title: 'AI Engineer', date: '2024-01-15', score: 88, feedback: 'Excellent performance' },
      { session_id: '2', job_title: 'ML Engineer', date: '2024-01-10', score: 85, feedback: 'Strong technical skills' },
      { session_id: '3', job_title: 'Full Stack Dev', date: '2024-01-05', score: 78, feedback: 'Good communication' },
      { session_id: '4', job_title: 'Python Dev', date: '2023-12-28', score: 72, feedback: 'Needs more practice' }
    ]);
    
    setRecommendations(generateRecommendations(['System Design', 'Database Optimization', 'Cloud Architecture']));
  };

  const generateRecommendations = (weakSkills) => {
    const recommendationsMap = {
      'System Design': {
        title: 'Master System Design',
        description: 'Practice designing scalable systems using YouTube, Twitter, or Uber architectures',
        priority: 'High',
        icon: '🎯'
      },
      'Database Optimization': {
        title: 'Improve Database Skills',
        description: 'Learn indexing, query optimization, and database sharding techniques',
        priority: 'Medium',
        icon: '🗄️'
      },
      'Cloud Architecture': {
        title: 'Get Cloud Certified',
        description: 'Consider AWS Solutions Architect or Azure Fundamentals certification',
        priority: 'High',
        icon: '☁️'
      },
      'Algorithms': {
        title: 'Practice Algorithms',
        description: 'Solve 2-3 LeetCode problems daily focusing on graphs and DP',
        priority: 'Medium',
        icon: '📊'
      }
    };
    
    return weakSkills.map(skill => recommendationsMap[skill] || {
      title: `Improve ${skill}`,
      description: `Focus on strengthening your ${skill} skills through online courses and practice`,
      priority: 'Medium',
      icon: '📚'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const COLORS = ['#667eea', '#48bb78', '#ed8936', '#f56565', '#9b59b6', '#3498db'];

  if (loading) {
    return (
      <div className="container">
        <div className="card text-center" style={{ padding: '60px' }}>
          <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
          <h3>Loading your dashboard...</h3>
          <p className="text-gray-500 mt-2">Fetching your performance data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold" style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Performance Dashboard
        </h2>
        <p className="text-gray-600 mt-2">Track your interview progress and skill development</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card" style={{ padding: '20px' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-lg" style={{ background: '#e0e7ff' }}>
              <Brain size={24} color="#667eea" />
            </div>
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <h3 className="text-2xl font-bold">{stats.totalInterviews}</h3>
          <p className="text-sm text-gray-600">Interviews Completed</p>
          <div className="mt-2 text-xs text-green-600">
            +{stats.improvementRate}% improvement
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp size={24} color="#48bb78" />
            </div>
          </div>
          <h3 className="text-2xl font-bold">{stats.averageScore}%</h3>
          <p className="text-sm text-gray-600">Average Score</p>
          <div className="mt-2 text-xs text-gray-500">Across all interviews</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Award size={24} color="#f59e0b" />
            </div>
          </div>
          <h3 className="text-2xl font-bold">{stats.bestScore}%</h3>
          <p className="text-sm text-gray-600">Best Score</p>
          <div className="mt-2 text-xs text-green-600">Personal Record</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Target size={24} color="#9b59b6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold">{stats.totalQuestions || 64}</h3>
          <p className="text-sm text-gray-600">Questions Answered</p>
          <div className="mt-2 text-xs text-gray-500">Total responses</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Progress Chart */}
        <div className="card">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Interview Performance Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={recentScores}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#667eea" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Skills Distribution */}
        <div className="card">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Brain size={20} />
            Skills Proficiency
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(skillAnalysis.skill_scores || {}).map(([skill, score]) => ({ skill, score }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skill" angle={-45} textAnchor="end" height={80} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skills Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-green-600">
            <CheckCircle size={20} />
            Strong Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {(skillAnalysis.strong_skills || []).map((skill, idx) => (
              <span key={idx} className="badge badge-success" style={{ fontSize: '14px', padding: '6px 12px' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-orange-600">
            <AlertCircle size={20} />
            Areas for Improvement
          </h3>
          <div className="flex flex-wrap gap-2">
            {(skillAnalysis.weak_skills || []).map((skill, idx) => (
              <span key={idx} className="badge badge-warning" style={{ fontSize: '14px', padding: '6px 12px' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="card mb-8">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Recent Interviews
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                <th className="text-left py-3 px-2">Job Title</th>
                <th className="text-left py-3 px-2">Date</th>
                <th className="text-left py-3 px-2">Score</th>
                <th className="text-left py-3 px-2">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {recentInterviews.map((interview, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td className="py-3 px-2 font-medium">{interview.job_title}</td>
                  <td className="py-3 px-2 text-gray-600">{new Date(interview.date).toLocaleDateString()}</td>
                  <td className="py-3 px-2">
                    <span className="badge" style={{
                      background: getScoreColor(interview.score) + '20',
                      color: getScoreColor(interview.score),
                      fontWeight: 'bold'
                    }}>
                      {interview.score}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-600">{interview.feedback || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Target size={20} />
          Personalized Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg" style={{ background: '#f9fafb' }}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">{rec.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{rec.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  <span className="badge" style={{
                    background: rec.priority === 'High' ? '#fee2e2' : '#fef3c7',
                    color: rec.priority === 'High' ? '#dc2626' : '#d97706'
                  }}>
                    {rec.priority} Priority
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <button onClick={() => window.location.href = '/'} className="btn btn-primary">
          Start New Interview
        </button>
        <button onClick={() => window.location.href = '/analysis'} className="btn btn-secondary">
          View Resume Analysis
        </button>
        <button onClick={fetchDashboardData} className="btn btn-secondary">
          Refresh Dashboard
        </button>
      </div>
    </div>
  );
}

export default Dashboard;