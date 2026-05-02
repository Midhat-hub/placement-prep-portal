from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from config import Config
from services.analyzer import ResumeAnalyzer

import os
print("GROQ KEY:", os.getenv("GROQ_API_KEY"))

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
    """Quick parse to extract structured data"""
    
    data = request.get_json()
    
    if not data or 'resume_text' not in data:
        return jsonify({'error': 'resume_text is required'}), 400
    
    resume_text = data['resume_text']
    
    try:
        result = analyzer.quick_parse(resume_text)
        return jsonify(result)
        
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
        print("\n⚠️  WARNING: OPENAI_API_KEY not set. Please configure it in .env file")
    
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=(Config.FLASK_ENV == 'development')
    )
