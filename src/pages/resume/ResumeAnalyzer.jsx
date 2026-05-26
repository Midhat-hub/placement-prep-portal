import React, { useState } from 'react';
import axios from 'axios';
import '../../index.css';
import ResumeUploader from './ResumeUploader.jsx';
import AnalysisResults from './AnalysisResults.jsx';
import { auth } from '../../firebase/firebase';

// API base URL - can be configured via Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setError(null);
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError({ message: 'Please select a resume file first' });
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (jobDescription.trim()) {
        formData.append('job_description', jobDescription.trim());
      }

      const headers = { 'Content-Type': 'multipart/form-data' };
      const user = auth.currentUser;
      if (user) {
        try {
          const idToken = await user.getIdToken();
          headers['Authorization'] = `Bearer ${idToken}`;
        } catch (tokenErr) {
          console.warn('Failed to get ID token:', tokenErr);
        }
      }

      const response = await axios.post(`${API_BASE_URL}/full-analysis`, formData, {
        headers,
      });

      if (response.data.success) {
        setResults(response.data);
      } else {
        setError({ message: response.data.error || 'Analysis failed' });
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError({
        message: err.response?.data?.error || err.message || 'Failed to analyze resume. Please check if the backend server is running.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setFile(null);
    setJobDescription('');
    setResults(null);
    setError(null);
  };

  return (
    <div className="App">
      <div className="header">
        <h1> Resume Analyzer</h1>
        <p>Get instant AI-powered feedback on your resume</p>
      </div>

      {!results ? (
        <div className="container">
          <ResumeUploader
            file={file}
            onFileSelect={handleFileSelect}
            onRemoveFile={handleRemoveFile}
          />

          <div className="job-description-section">
            <h3>Job Description (Optional)</h3>
            <textarea
              className="job-description-textarea"
              placeholder="Paste a job description here to get targeted feedback..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          {error && (
            <div className="error">
              <h3>⚠️ Error</h3>
              <p>{error.message}</p>
            </div>
          )}

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Analyzing your resume... This may take a moment.</p>
            </div>
          ) : (
            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={!file}
            >
              {file ? ' Analyze Resume' : ' Select a file to analyze'}
            </button>
          )}
        </div>
      ) : (
        <AnalysisResults
          results={results}
          onNewAnalysis={handleNewAnalysis}
        />
      )}

      <div className="footer">
        <p>Built with React & Flask | Powered by Groq</p>
      </div>
    </div>
  );
}

export default ResumeAnalyzer;
