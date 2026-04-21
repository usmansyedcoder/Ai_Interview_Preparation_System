// D:\TNC\TNC_Apprenticeship02\ai-interview-system\frontend\src\components\FeedbackReport.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

// Import auto-table properly
import 'jspdf-autotable';

function FeedbackReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const { evaluation, sessionSummary, resumeAnalysis } = location.state || {};

  // Debug: Log what data we received
  console.log('FeedbackReport received data:', { evaluation, sessionSummary, resumeAnalysis });

  // Check if data exists
  if (!evaluation) {
    return (
      <div className="container">
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">No Feedback Data</h2>
          <p className="text-gray-600 mb-4">No interview feedback found. Please complete an interview first.</p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Safe value extraction with multiple fallbacks
  const overallScore = evaluation.overall_score ?? evaluation.overallScore ?? evaluation.overall ?? 0;
  const technicalScore = evaluation.technical_score ?? evaluation.technicalScore ?? evaluation.technical ?? 0;
  const communicationScore = evaluation.communication_score ?? evaluation.communicationScore ?? evaluation.communication ?? 0;
  const problemSolvingScore = evaluation.problem_solving ?? evaluation.problemSolvingScore ?? evaluation.problemSolving ?? 0;
  const culturalFitScore = evaluation.cultural_fit ?? evaluation.culturalFitScore ?? evaluation.culturalFit ?? 0;
  
  // Safely handle arrays
  const strengths = Array.isArray(evaluation.strengths) ? evaluation.strengths : [];
  const areasForImprovement = Array.isArray(evaluation.areas_for_improvement) ? evaluation.areas_for_improvement : 
                              (Array.isArray(evaluation.areasForImprovement) ? evaluation.areasForImprovement : []);
  const skillsToDevelop = Array.isArray(evaluation.skills_to_develop) ? evaluation.skills_to_develop : 
                          (Array.isArray(evaluation.skillsToDevelop) ? evaluation.skillsToDevelop : []);
  
  const detailedFeedback = evaluation.detailed_feedback ?? evaluation.detailedFeedback ?? "No detailed feedback available.";
  const recommendation = evaluation.recommendation ?? "Review Needed";

  const downloadPDF = () => {
    try {
      // Validate required data before generating PDF
      if (!evaluation) {
        toast.error('No evaluation data to generate PDF');
        return;
      }

      // Create new PDF document
      const doc = new jsPDF();
      let yPos = 20;
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('Interview Feedback Report', 20, yPos);
      yPos += 10;
      
      // Date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPos);
      yPos += 15;
      
      // Overall Score
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text(`Overall Score: ${overallScore}/100`, 20, yPos);
      yPos += 15;
      
      // Score breakdown header
      doc.setFontSize(14);
      doc.text('Score Breakdown', 20, yPos);
      yPos += 10;
      
      // Draw score breakdown manually
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text(`Technical Proficiency: ${technicalScore}/100`, 25, yPos);
      yPos += 8;
      doc.text(`Communication Skills: ${communicationScore}/100`, 25, yPos);
      yPos += 8;
      doc.text(`Problem Solving: ${problemSolvingScore}/100`, 25, yPos);
      yPos += 8;
      doc.text(`Cultural Fit: ${culturalFitScore}/100`, 25, yPos);
      yPos += 15;
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Strengths
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Key Strengths', 20, yPos);
      yPos += 10;
      
      if (strengths && strengths.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        strengths.forEach((strength, index) => {
          if (strength && typeof strength === 'string') {
            const lines = doc.splitTextToSize(`• ${strength}`, 170);
            doc.text(lines, 25, yPos);
            yPos += (lines.length * 6) + 2;
          }
        });
        yPos += 5;
      } else {
        doc.text('• No strengths listed', 25, yPos);
        yPos += 10;
      }
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Areas for Improvement
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Areas for Improvement', 20, yPos);
      yPos += 10;
      
      if (areasForImprovement && areasForImprovement.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        areasForImprovement.forEach((area, index) => {
          if (area && typeof area === 'string') {
            const lines = doc.splitTextToSize(`• ${area}`, 170);
            doc.text(lines, 25, yPos);
            yPos += (lines.length * 6) + 2;
          }
        });
        yPos += 5;
      } else {
        doc.text('• No areas listed', 25, yPos);
        yPos += 10;
      }
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Skills to Develop
      if (skillsToDevelop && skillsToDevelop.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Skills to Develop', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        skillsToDevelop.forEach((skill, index) => {
          if (skill && typeof skill === 'string') {
            const lines = doc.splitTextToSize(`• ${skill}`, 170);
            doc.text(lines, 25, yPos);
            yPos += (lines.length * 6) + 2;
          }
        });
        yPos += 5;
      }
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Detailed Feedback
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Detailed Feedback', 20, yPos);
      yPos += 10;
      
      const feedbackText = detailedFeedback ? String(detailedFeedback) : "No detailed feedback available.";
      const feedbackLines = doc.splitTextToSize(feedbackText, 170);
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(feedbackLines, 20, yPos);
      yPos += (feedbackLines.length * 6) + 15;
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Recommendation
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text(`Recommendation: ${recommendation}`, 20, yPos);
      
      // Save PDF
      doc.save(`interview-feedback-${Date.now()}.pdf`);
      toast.success('PDF downloaded successfully!');
      
    } catch (error) {
      console.error('PDF generation error:', error);
      console.error('Error details:', error.message);
      toast.error(`Failed to generate PDF: ${error.message}`);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Interview Feedback Report</h2>
        
        {/* Overall Score */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {overallScore}/100
            </div>
            <div className="text-gray-600">Overall Performance Score</div>
          </div>
        </div>
        
        {/* Score Breakdown */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Score Breakdown</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Technical Proficiency</div>
              <div className="text-xl font-bold">{technicalScore}/100</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Communication Skills</div>
              <div className="text-xl font-bold">{communicationScore}/100</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Problem Solving</div>
              <div className="text-xl font-bold">{problemSolvingScore}/100</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Cultural Fit</div>
              <div className="text-xl font-bold">{culturalFitScore}/100</div>
            </div>
          </div>
        </div>
        
        {/* Strengths */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-green-600">Key Strengths</h3>
          <ul className="list-disc pl-5">
            {strengths && strengths.length > 0 ? (
              strengths.map((strength, index) => (
                <li key={index} className="mb-1">{strength}</li>
              ))
            ) : (
              <li className="text-gray-500">No strengths listed</li>
            )}
          </ul>
        </div>
        
        {/* Areas for Improvement */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-orange-600">Areas for Improvement</h3>
          <ul className="list-disc pl-5">
            {areasForImprovement && areasForImprovement.length > 0 ? (
              areasForImprovement.map((area, index) => (
                <li key={index} className="mb-1">{area}</li>
              ))
            ) : (
              <li className="text-gray-500">No areas listed</li>
            )}
          </ul>
        </div>
        
        {/* Skills to Develop */}
        {skillsToDevelop && skillsToDevelop.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3 text-purple-600">Skills to Develop</h3>
            <ul className="list-disc pl-5">
              {skillsToDevelop.map((skill, index) => (
                <li key={index} className="mb-1">{skill}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Detailed Feedback */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Detailed Feedback</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{detailedFeedback}</p>
        </div>
        
        {/* Recommendation */}
        <div className="mb-6 p-4 rounded-lg text-center" style={{
          backgroundColor: recommendation === 'Strong Hire' ? '#d4edda' :
                          recommendation === 'Hire' ? '#d4edda' :
                          recommendation === 'Consider' ? '#fff3cd' : '#f8d7da',
          color: recommendation === 'Strong Hire' ? '#155724' :
                 recommendation === 'Hire' ? '#155724' :
                 recommendation === 'Consider' ? '#856404' : '#721c24'
        }}>
          <h3 className="text-xl font-semibold mb-2">Recommendation</h3>
          <div className="text-2xl font-bold">{recommendation}</div>
        </div>
        
        {/* Session Summary */}
        {sessionSummary && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Session Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Job Title:</strong> {sessionSummary.job_title || 'N/A'}</div>
              <div><strong>Interview Type:</strong> {sessionSummary.interview_type || 'N/A'}</div>
              <div><strong>Difficulty:</strong> {sessionSummary.difficulty || 'N/A'}</div>
              <div><strong>Questions Answered:</strong> {sessionSummary.total_questions || 0}</div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-4">
          <button onClick={downloadPDF} className="btn btn-primary">
            Download PDF Report
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            Back to Dashboard
          </button>
          <button onClick={() => navigate('/')} className="btn btn-success">
            Start New Interview
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackReport;