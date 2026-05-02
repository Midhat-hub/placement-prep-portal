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
    
    # LLM Provider settings (openai, gemini, or groq)
    LLM_PROVIDER = os.getenv('LLM_PROVIDER', 'Groq')
    
    # OpenAI settings
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
    
    # Google Gemini settings (FREE)
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash')
    
    # Groq settings (free alternative)
    GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
    GROQ_MODEL = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')
    
    # CORS settin
    CORS_ORIGINS = ["*"]
    
    @staticmethod
    def init_app(app):
        """Initialize application with config"""
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
