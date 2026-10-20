import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuration class for environment-based settings"""
    
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    
    # File upload settings
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'pdf', 'docx'}
    
    # API settings
    PORT = int(os.getenv('PORT', 5000))
    HOST = os.getenv('HOST', '0.0.0.0')
    
    # Groq settings
    GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
    GROQ_MODEL = os.getenv('GROQ_MODEL', 'openai/gpt-oss-20b')
    RESUME_MODEL = os.getenv('RESUME_MODEL', 'qwen/qwen3.8-27b')

    # Voice interview providers
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    OPENAI_REALTIME_MODEL = os.getenv('OPENAI_REALTIME_MODEL', 'gpt-realtime')
    DEEPGRAM_API_KEY = os.getenv('DEEPGRAM_API_KEY', '')

    # Gemini Live settings
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    GEMINI_LIVE_MODEL = os.getenv('GEMINI_LIVE_MODEL', 'gemini-3.8-live')
    
    # CORS settings
    CORS_ORIGINS = list(dict.fromkeys(
        [origin.strip() for origin in os.getenv('CORS_ORIGINS', '').split(',') if origin.strip()]
        + [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174',
        ]
    ))
    
    @staticmethod
    def init_app(app):
        """Initialize application with config"""
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
