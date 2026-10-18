import React, { useState } from 'react';
import { PaperclipIcon, CheckCircleIcon } from '@/components/Icons';

function ResumeUploader({ file, onFileSelect, onRemoveFile }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile)) {
      onFileSelect(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && isValidFile(selectedFile)) {
      onFileSelect(selectedFile);
    }
  };

  const isValidFile = (file) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    return validTypes.includes(file.type);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="upload-section">
      {!file ? (
        <div
          className={`upload-box ${dragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <div className="upload-icon" style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
            <PaperclipIcon size={32} color="var(--color-blue)" />
          </div>
          <h3>Upload Your Resume</h3>
          <p>Drag and drop or click to browse</p>
          <p style={{ fontSize: '0.85rem', marginTop: '6px', color: '#94a3b8' }}>
            Supports PDF and DOCX (Max 16MB)
          </p>
          <input
            id="fileInput"
            type="file"
            className="file-input"
            accept=".pdf,.docx"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="file-info">
          <div className="file-info-text" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircleIcon size={16} color="var(--color-green)" />
            <span>{file.name}</span>
            <span style={{ color: '#666', fontSize: '0.9rem' }}>
              ({formatFileSize(file.size)})
            </span>
          </div>
          <button className="remove-file-btn" onClick={onRemoveFile}>
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

export default ResumeUploader;
