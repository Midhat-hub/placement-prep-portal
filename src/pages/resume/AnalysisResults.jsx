import React from 'react';

function AnalysisResults({ results, onNewAnalysis }) {
  // Parse the analysis text to extract sections
  const parseAnalysis = (text) => {
    const sections = {};
    const lines = text.split('\n');
    let currentSection = null;

    lines.forEach(line => {
      // Check if line is a header (contains ** or **)
      const headerMatch = line.match(/^\*+(.+?)\*+/);
      if (headerMatch) {
        currentSection = headerMatch[1].trim();
        sections[currentSection] = [];
      } else if (currentSection && line.trim()) {
        sections[currentSection].push(line.trim());
      }
    });

    return sections;
  };

  const extractScore = (text) => {
    // More specific extraction - look for the score number
    const scoreMatch = text.match(/\*+\d+\*+|:\s*(\d+)\/100|```(\d+)|\b(\d+)\b(?:\s*\/100)?/);
    if (scoreMatch) {
      // Check each capture group
      for (let i = 1; i < scoreMatch.length; i++) {
        if (scoreMatch[i]) {
          const num = parseInt(scoreMatch[i]);
          if (num >= 0 && num <= 100) return num;
        }
      }
      // Fallback to first match
      const num = parseInt(scoreMatch[0].replace(/\D/g, ''));
      return num >= 0 && num <= 100 ? num : 70;
    }
    return 70;
  };

  const extractScoresFromAnalysis = (text) => {
    // Find "Overall Score: XX" or "Overall Score **XX**"
    const overallMatch = text.match(/Overall Score[:\s]+\**(\d+)\**/i);
    const overallScore = overallMatch ? parseInt(overallMatch[1]) : null;

    // Find "ATS Compatibility Score: XX" or similar
    const atsMatch = text.match(/ATS[^:]*Compatibility[^:]*Score[:\s]+\**(\d+)\**/i);
    const atsScore = atsMatch ? parseInt(atsMatch[1]) : null;

    return { overallScore, atsScore };
  };

  const sections = parseAnalysis(results.analysis);

  // Prefer backend numeric fields for deterministic display; fallback to text extraction.
  const parsedScores = extractScoresFromAnalysis(results.analysis || '');
  const overallScore = Number.isFinite(results.overall_score)
    ? results.overall_score
    : (parsedScores.overallScore ?? 0);
  const atsScore = Number.isFinite(results.ats_score)
    ? results.ats_score
    : (parsedScores.atsScore ?? 0);
  const detailedAnalysis = results.analysis_json?.detailed_analysis || '';

  const ScoreCard = ({ label, score, color = '#0B3D56' }) => (
    <div className="score-card" style={{ borderLeftColor: color }}>
      <div className="score-label">{label}</div>
      <div className="score-value">{score}</div>
      <div className="score-bar">
        <div className="score-fill" style={{ width: `${score}%`, backgroundColor: color }}></div>
      </div>
    </div>
  );

  const SectionBox = ({ title, items }) => (
    <div className="section-box">
      <h3 className="section-title">{title}</h3>
      <div className="section-content">
        {items.map((item, idx) => (
          <div key={idx} className="section-item">
            <span className="section-bullet">•</span>
            <span>{item.replace(/^[-•*]\s*/, '')}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="results-container">
      <div className="results-header">
        <div>
          <h2> Analysis Results</h2>
          <p className="results-subtitle">Your resume has been analyzed</p>
        </div>
        <button className="new-analysis-btn" onClick={onNewAnalysis}>
          ➕ New Analysis
        </button>
      </div>

      {/* Score Cards */}
      <div className="scores-grid">
        <ScoreCard label="Overall Score" score={overallScore} color="#0B3D56" />
        <ScoreCard label="ATS Compatibility" score={atsScore} color="#5BA3C3" />
      </div>

      {/* Sections */}
      <div className="sections-grid">
        {sections['Key Strengths'] && (
          <SectionBox title="💪 Key Strengths" items={sections['Key Strengths']} />
        )}

        {sections['Areas for Improvement'] && (
          <SectionBox title="📈 Areas for Improvement" items={sections['Areas for Improvement']} />
        )}

        {sections['Skills Identified'] && (
          <SectionBox title="🔧 Skills Identified" items={sections['Skills Identified']} />
        )}

        {sections['Suggestions for Enhancement'] && (
          <SectionBox
            title="💡 Suggestions for Enhancement"
            items={sections['Suggestions for Enhancement']}
          />
        )}
      </div>

      {/* Full Analysis */}
      <div className="full-analysis-box">
        <h3 className="section-title">📝 Detailed Analysis</h3>
        <div className="full-analysis-content">
          {detailedAnalysis || 'Detailed analysis is not available for this run.'}
        </div>
      </div>

      {/* Metadata */}
      <div className="analysis-meta">
        <div className="meta-item">
          <span className="meta-label">File:</span>
          <span>{results.filename}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Provider:</span>
          <span>{results.provider}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Model:</span>
          <span>{results.model_used}</span>
        </div>
      </div>
    </div>
  );
}

export default AnalysisResults;
