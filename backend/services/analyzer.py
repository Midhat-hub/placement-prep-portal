import PyPDF2
import docx
import os
from config import Config

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

try:
    from google.genai import Client
except ImportError:
    Client = None

try:
    from groq import Groq
except ImportError:
    Groq = None

class ResumeAnalyzer:
    """Core service for analyzing resumes using LLM"""
    
    def __init__(self, provider=None):
        """Initialize the analyzer with LLM provider"""
        self.provider = provider or Config.LLM_PROVIDER
        self.client = None
        
        if self.provider == 'gemini':
            if Client and Config.GEMINI_API_KEY:
                self.client = Client(api_key=Config.GEMINI_API_KEY)
                self.model = Config.GEMINI_MODEL
            else:
                print("⚠️  Gemini not available. Install: pip install google-genai")
        elif self.provider == 'groq':
            if Groq and Config.GROQ_API_KEY:
                self.client = Groq(api_key=Config.GROQ_API_KEY)
                self.model = Config.GROQ_MODEL
            else:
                print("⚠️  Groq not available. Install: pip install groq")
        else:  # default to openai
            if OpenAI and Config.OPENAI_API_KEY:
                self.client = OpenAI(api_key=Config.OPENAI_API_KEY)
                self.model = Config.OPENAI_MODEL
            else:
                print("⚠️  OpenAI not available or API key not set")
    
    def extract_text_from_pdf(self, file_path):
        """Extract text content from PDF file"""
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            raise Exception(f"Error extracting PDF: {str(e)}")
    
    def extract_text_from_docx(self, file_path):
        """Extract text content from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text.strip()
        except Exception as e:
            raise Exception(f"Error extracting DOCX: {str(e)}")
    
    def extract_text(self, file_path):
        """Extract text from resume file based on extension"""
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext == '.pdf':
            return self.extract_text_from_pdf(file_path)
        elif ext == '.docx':
            return self.extract_text_from_docx(file_path)
        else:
            raise Exception(f"Unsupported file format: {ext}")
    
    def analyze_resume(self, resume_text, job_description=None):
        """Analyze resume using LLM and provide feedback"""
        
        if not self.client:
            return {
                'error': 'LLM API not configured',
                'message': f'Please set {self.provider.upper()}_API_KEY in .env file'
            }
        
        try:
            # Build the analysis prompt
            prompt = f"""Analyze the following resume and provide detailed feedback.

Resume:
{resume_text}

Please provide:
1. Overall Score (0-100)
2. Key Strengths (bullet points)
3. Areas for Improvement (bullet points)
4. Skills Identified (list)
5. Experience Level (Entry/Mid/Senior)
6. Suggestions for Enhancement (specific actionable items)
7. ATS (Applicant Tracking System) Compatibility Score (0-100)
"""
            
            if job_description:
                prompt += f"""
Job Description:
{job_description}

8. Job Match Score (0-100) - How well does this resume match the job description?
9. Missing Keywords/Skills for this job
10. Recommendations to better match this job description
"""
            
            # Call LLM API
            if self.provider == 'gemini':
                # Gemini API call with new google-genai SDK
                full_prompt = f"""You are an expert resume reviewer and career coach with experience in SWE and analyst roles. Provide constructive, specific, and actionable feedback.

{prompt}"""
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=full_prompt
                )
                analysis_text = response.text
                tokens_used = 0  # Gemini doesn't provide detailed token count
            else:
                # OpenAI/Groq API call
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert resume reviewer and career coach with experience in SWE and analyst roles. Provide constructive, specific, and actionable feedback."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=0.7,
                    max_tokens=2000
                )
                analysis_text = response.choices[0].message.content
                tokens_used = response.usage.total_tokens if hasattr(response.usage, 'total_tokens') else 0
            
            return {
                'success': True,
                'resume_text': resume_text[:500] + '...' if len(resume_text) > 500 else resume_text,
                'analysis': analysis_text,
                'provider': self.provider,
                'model_used': self.model,
                'tokens_used': tokens_used
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def quick_parse(self, resume_text):
        """Quick parse to extract structured data without full analysis"""
        
        if not self.client:
            return {
                'error': f'{self.provider.upper()} API key not configured'
            }
        
        try:
            prompt = f"""Extract the following information from this resume in JSON format:
- name
- email
- phone
- skills (array)
- experience_years (number)
- education (array of degrees)
- job_titles (array)

Resume:
{resume_text}

Return only valid JSON.
"""
            
            if self.provider == 'gemini':
                full_prompt = f"You are a resume parser. Return only valid JSON.\n\n{prompt}"
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=full_prompt
                )
                data = response.text
            else:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a resume parser. Return only valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=1000
                )
                data = response.choices[0].message.content
            
            return {
                'success': True,
                'data': data
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
