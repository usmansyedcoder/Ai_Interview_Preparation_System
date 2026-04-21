// D:\TNC\TNC_Apprenticeship02\ai-interview-system\frontend\src\components\ResumeUpload.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = "http://localhost:8000";

function ResumeUpload({ onAnalysisComplete }) {
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please upload a resume');
      return;
    }
    if (!jobTitle) {
      toast.error('Please enter job title');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_title', jobTitle);
    if (jobDescription) formData.append('job_description', jobDescription);

    try {
      // FIX: Use the full URL with API_URL
      const response = await axios.post(`${API_URL}/api/resume/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        toast.success('Resume analyzed successfully!');
        onAnalysisComplete(response.data.analysis);
        navigate('/analysis');
      }
    } catch (error) {
      console.error(error);
      if (error.response) {
        // Server responded with error status
        toast.error(`Server error: ${error.response.status} - ${error.response.data?.detail || 'Unknown error'}`);
      } else if (error.request) {
        // Request was made but no response
        toast.error('Cannot connect to backend server. Make sure it\'s running on port 8000');
      } else {
        toast.error('Failed to analyze resume. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Resume & Job Analysis</h2>
        <p className="text-gray-600 mb-6">Upload your resume and provide job details for AI-powered analysis</p>

        <div className="dropzone" style={{ marginBottom: '24px' }}>
          <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'block', margin: '0 auto' }} />
          {file && <p className="mt-2 text-sm text-green-600">Selected: {file.name}</p>}
        </div>

        <div className="mb-4">
          <label>Job Title *</label>
          <input 
            type="text" 
            className="input-field" 
            value={jobTitle} 
            onChange={(e) => setJobTitle(e.target.value)} 
            placeholder="e.g., Senior Software Engineer" 
          />
        </div>

        <div className="mb-4">
          <label>Job Description (Optional)</label>
          <textarea 
            className="input-field" 
            rows="4" 
            value={jobDescription} 
            onChange={(e) => setJobDescription(e.target.value)} 
            placeholder="Paste the job description here for better analysis..." 
          />
        </div>

        <button 
          className="btn btn-primary w-full" 
          onClick={handleAnalyze} 
          disabled={loading || !file || !jobTitle}
        >
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </div>
    </div>
  );
}

export default ResumeUpload;