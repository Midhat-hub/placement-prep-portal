from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from config import Config
from services.analyzer import ResumeAnalyzer
from services.firebase_db import verify_id_token, save_resume_summary

app = Flask(__name__)
app.config.from_object(Config)
Config.init_app(app)

# Enable CORS
CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})

# Initialize analyzer
analyzer = ResumeAnalyzer()

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Resume Analyzer API is running',
        'version': '1.0.0'
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload and return extracted text"""
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Only PDF and DOCX allowed'}), 400
    
    try:
        # Save file securely
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Extract text
        text = analyzer.extract_text(filepath)
        
        # Clean up file after extraction
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'text': text,
            'text_length': len(text)
        })
        
    except Exception as e:
        # Clean up file if exists
        if os.path.exists(filepath):
            os.remove(filepath)
        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Analyze resume text and provide feedback"""
    
    data = request.get_json()
    
    if not data or 'resume_text' not in data:
        return jsonify({'error': 'resume_text is required'}), 400
    
    resume_text = data['resume_text']
    job_description = data.get('job_description', None)
    
    if not resume_text.strip():
        return jsonify({'error': 'Resume text cannot be empty'}), 400
    
    try:
        result = analyzer.analyze_resume(resume_text, job_description)
        
        if result.get('success'):
            return jsonify(result)
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/parse', methods=['POST'])
def parse():
    """Quick parse to extract structured data without LLM"""
    
    data = request.get_json()
    
    if not data or 'resume_text' not in data:
        return jsonify({'error': 'resume_text is required'}), 400
    
    resume_text = data['resume_text']
    
    try:
        # Preprocess text
        resume_text = analyzer.preprocess_resume(resume_text)
        
        if not resume_text:
            return jsonify({'error': 'Resume text is empty'}), 400
        
        # Extract structured data
        structured_data = analyzer.extract_structured_data(resume_text)
        
        return jsonify({
            'success': True,
            'structured_data': structured_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/full-analysis', methods=['POST'])
def full_analysis():
    """Upload file and get full analysis in one call"""
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    job_description = request.form.get('job_description', None)

    # Try to verify Firebase ID token from Authorization header (optional)
    auth_header = request.headers.get('Authorization') or request.headers.get('authorization')
    uid = None
    print('Authorization header:', auth_header)
    if auth_header and auth_header.startswith('Bearer '):
        id_token = auth_header.split(' ', 1)[1].strip()
        try:
            decoded = verify_id_token(id_token)
            uid = decoded.get('uid')
            print('Verified UID:', uid)
        except Exception as e:
            print("Firebase token verification failed:", e)
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Only PDF and DOCX allowed'}), 400
    
    try:
        # Save and extract
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        text = analyzer.extract_text(filepath)
        
        # Analyze
        result = analyzer.analyze_resume(text, job_description)
        result['filename'] = filename
        
        # If token verified and analysis succeeded, persist compact summary
        try:
            if uid and result.get('success'):
                structured = result.get('analysis_json', {}) or {}
                detailed_sections = structured.get('detailed_analysis_sections', [])
                structured_data = result.get('structured_data', {}) or {}
                resume_summary = {
                    'skills': structured_data.get('skills', []) if isinstance(structured_data, dict) else [],
                    'education': structured_data.get('education', []) if isinstance(structured_data, dict) else [],
                    'experience': structured_data.get('experience', []) if isinstance(structured_data, dict) else [],
                    'projects': structured_data.get('projects', []) if isinstance(structured_data, dict) else [],
                }
                save_resume_summary(
                    uid,
                    result.get('overall_score'),
                    result.get('ats_score'),
                    detailed_sections,
                    resume_summary,
                )
        except Exception as e:
            print("Error saving resume summary to Firestore:", e)

        # Clean up
        os.remove(filepath)

        return jsonify(result)
        
    except Exception as e:
        # Clean up file if exists
        if os.path.exists(filepath):
            os.remove(filepath)
        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle file too large error"""
    return jsonify({
        'error': 'File too large. Maximum size is 16MB'
    }), 413

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    print(f"Starting Resume Analyzer API on {Config.HOST}:{Config.PORT}")
    print(f"Environment: {Config.FLASK_ENV}")
    print(f"CORS Origins: {Config.CORS_ORIGINS}")
    
    if not Config.GROQ_API_KEY:
        print("\n⚠️  WARNING: GROQ_API_KEY not set. Please configure it in .env file")
    
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=(Config.FLASK_ENV == 'development')
    )
