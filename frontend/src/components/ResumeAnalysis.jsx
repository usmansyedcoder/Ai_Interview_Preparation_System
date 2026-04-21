// D:\TNC\TNC_Apprenticeship02\ai-interview-system\frontend\src\components\ResumeAnalysis.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function ResumeAnalysis({ analysisData, onStartInterview }) {
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);

  // Check if analysisData exists and has required properties
  if (!analysisData) {
    return (
      <div className="container">
        <div className="card text-center">
          <p>No analysis data. Please upload a resume first.</p>
        </div>
      </div>
    );
  }

  // Safe extraction with fallbacks
  const overallScore = analysisData.overall_score ?? analysisData.overallScore ?? 0;
  const skillMatch = analysisData.skill_match_percentage ?? analysisData.skillMatchPercentage ?? 0;
  const experienceMatch = analysisData.experience_match ?? analysisData.experienceMatch ?? 0;
  const educationMatch = analysisData.education_match ?? analysisData.educationMatch ?? 0;
  const strongPoints = analysisData.strong_points ?? analysisData.strongPoints ?? [];
  const weakPoints = analysisData.weak_points ?? analysisData.weakPoints ?? [];
  const missingKeywords = analysisData.missing_keywords ?? analysisData.missingKeywords ?? [];
  const suggestions = analysisData.suggestions ?? [];

  const handleStartInterview = async () => {
    setStarting(true);
    try {
      const API_URL = 'http://localhost:8000';
      const response = await axios.post(`${API_URL}/api/interview/start`, {
        job_title: analysisData.job_title || 'Software Engineer',
        job_description: analysisData.job_description || '',
        interview_type: 'mixed',
        difficulty: 'intermediate',
        resume_data: analysisData.resume_data || {}
      });
      
      if (response.data.success) {
        onStartInterview({ 
          session_id: response.data.session_id, 
          job_title: analysisData.job_title 
        });
        navigate('/interview');
      } else {
        toast.error('Failed to start interview');
      }
    } catch (error) {
      console.error('Start interview error:', error);
      toast.error('Failed to start interview. Please make sure backend is running.');
    } finally {
      setStarting(false);
    }
  };

  const downloadPDF = async () => {
    const element = document.getElementById('report-content');
    if (!element) {
      toast.error('Report content not found');
      return;
    }
    
    toast.loading('Generating PDF...', { id: 'pdf-gen' });
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `resume_analysis_${(analysisData.job_title || 'report').replace(/\s/g, '_')}.pdf`;
      pdf.save(fileName);
      toast.success('PDF downloaded successfully!', { id: 'pdf-gen' });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(`Failed to generate PDF: ${error.message}`, { id: 'pdf-gen' });
    }
  };

  return (
    <div className="container">
      <div id="report-content" className="card">
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          margin: '-24px -24px 24px -24px', 
          padding: '24px', 
          borderRadius: '12px 12px 0 0' 
        }}>
          <h2 className="text-2xl font-bold text-white">Resume Analysis Report</h2>
          <p className="text-white" style={{ opacity: 0.9 }}>
            Position: {analysisData.job_title || 'Not specified'}
          </p>
          <p className="text-white" style={{ opacity: 0.7, fontSize: '12px', marginTop: '8px' }}>
            Generated on: {new Date().toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-4" style={{ marginBottom: '24px', gap: '16px' }}>
          <div className="score-card" style={{ textAlign: 'center', padding: '16px', background: '#f0f4ff', borderRadius: '8px' }}>
            <div className="score-value" style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>
              {Math.round(overallScore)}%
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Overall</div>
          </div>
          <div className="score-card" style={{ textAlign: 'center', padding: '16px', background: '#f0f4ff', borderRadius: '8px' }}>
            <div className="score-value" style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>
              {Math.round(skillMatch)}%
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Skills Match</div>
          </div>
          <div className="score-card" style={{ textAlign: 'center', padding: '16px', background: '#f0f4ff', borderRadius: '8px' }}>
            <div className="score-value" style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>
              {Math.round(experienceMatch)}%
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Experience</div>
          </div>
          <div className="score-card" style={{ textAlign: 'center', padding: '16px', background: '#f0f4ff', borderRadius: '8px' }}>
            <div className="score-value" style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>
              {Math.round(educationMatch)}%
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Education</div>
          </div>
        </div>

        {strongPoints && strongPoints.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg mb-4" style={{ background: '#f0fff4', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <h3 className="font-bold text-green-800 mb-2" style={{ fontWeight: 'bold', color: '#22543d', marginBottom: '8px' }}>✓ Strengths</h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {strongPoints.map((s, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>• {s}</li>
              ))}
            </ul>
          </div>
        )}

        {weakPoints && weakPoints.length > 0 && (
          <div className="bg-red-50 p-4 rounded-lg mb-4" style={{ background: '#fff5f5', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <h3 className="font-bold text-red-800 mb-2" style={{ fontWeight: 'bold', color: '#742a2a', marginBottom: '8px' }}>! Areas for Improvement</h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {weakPoints.map((w, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>• {w}</li>
              ))}
            </ul>
          </div>
        )}

        {missingKeywords && missingKeywords.length > 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg mb-4" style={{ background: '#fffff0', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <h3 className="font-bold text-yellow-800 mb-2" style={{ fontWeight: 'bold', color: '#744210', marginBottom: '8px' }}>Missing Keywords</h3>
            <div className="flex flex-wrap gap-2" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {missingKeywords.map((k, i) => (
                <span key={i} className="badge badge-warning" style={{ background: '#fef3c7', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}

        {suggestions && suggestions.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4" style={{ background: '#eff6ff', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <h3 className="font-bold text-blue-800 mb-2" style={{ fontWeight: 'bold', color: '#1e3a8a', marginBottom: '8px' }}>Recommendations</h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {suggestions.map((s, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>→ {s}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-4 mt-4" style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <button 
            className="btn btn-primary flex-1" 
            onClick={handleStartInterview} 
            disabled={starting}
            style={{ flex: 1, padding: '12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            {starting ? 'Starting...' : 'Start Mock Interview'}
          </button>
          <button 
            className="btn btn-secondary flex-1" 
            onClick={downloadPDF}
            style={{ flex: 1, padding: '12px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Download Report (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResumeAnalysis;