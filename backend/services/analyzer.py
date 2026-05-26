import fitz
import docx
import os
import json
import re
from config import Config

try:
    from groq import Groq
except ImportError:
    Groq = None

class ResumeAnalyzer:
    """Core service for analyzing resumes using Groq."""
    
    def __init__(self):
        """Initialize the analyzer with Groq."""
        self.provider = 'groq'
        self.client = None

        if Groq and Config.GROQ_API_KEY:
            self.client = Groq(api_key=Config.GROQ_API_KEY)
            self.model = Config.GROQ_MODEL
        else:
            print("⚠️  Groq not available. Install: pip install groq")
    
    def extract_text_from_pdf(self, file_path):
        """Extract text content from PDF file using PyMuPDF (fitz).
        
        Extracts text page by page and concatenates all pages with newline separators.
        
        Args:
            file_path (str): Path to the PDF file
            
        Returns:
            str: Extracted text from all pages
            
        Raises:
            Exception: If PDF extraction fails
        """
        try:
            text_pages = []
            with fitz.open(file_path) as pdf_document:
                page_count = pdf_document.page_count
                for page_num in range(page_count):
                    page = pdf_document[page_num]
                    page_text = page.get_text()
                    if page_text.strip():
                        text_pages.append(page_text)
            
            # Concatenate all pages with newline separator
            extracted_text = "\n".join(text_pages)
            return extracted_text.strip()
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

    def preprocess_resume(self, text):
        """Preprocess resume text for analysis.
        
        Performs the following cleaning operations:
        - Normalizes whitespace (tabs, multiple spaces to single space)
        - Removes extra whitespace from line beginnings/endings
        - Collapses repeated newlines to single newline
        - Trims text to maximum 2000 characters
        
        Args:
            text (str): Raw resume text
            
        Returns:
            str: Cleaned and normalized text
        """
        if not text:
            return ""
        
        # Normalize spacing: replace tabs and multiple spaces with single space
        text = text.replace('\t', ' ')
        text = ' '.join(text.split())
        
        # Remove extra whitespace from each line
        lines = text.split('\n')
        lines = [line.strip() for line in lines]
        
        # Remove empty lines and rejoin
        lines = [line for line in lines if line]
        text = '\n'.join(lines)
        
        # Collapse repeated newlines to single newline
        while '\n\n' in text:
            text = text.replace('\n\n', '\n')
        
        # Trim to max 2000 characters
        if len(text) > 2000:
            text = text[:2000].strip()
        
        return text

    def extract_structured_data(self, resume_text):
        """Extract structured resume data without using LLM.
        
        Uses keyword-based section detection, regex patterns, and predefined skill matching
        to extract: skills, education, experience, and projects.
        
        Args:
            resume_text (str): Preprocessed resume text
            
        Returns:
            dict: JSON with keys: skills, education, experience, projects
        """
        # Predefined comprehensive skill list
        predefined_skills = {
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust',
            'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl',
            'react', 'angular', 'vue', 'svelte', 'express', 'django', 'flask',
            'fastapi', 'spring', 'asp.net', 'node.js', 'nodejs', 'nextjs', 'nuxt',
            'sql', 'mysql', 'postgresql', 'mongodb', 'firebase', 'redis', 'cassandra',
            'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github',
            'git', 'linux', 'unix', 'windows', 'macos', 'html', 'css', 'sass', 'less',
            'tailwind', 'bootstrap', 'rest', 'graphql', 'websocket', 'grpc',
            'elasticsearch', 'hadoop', 'spark', 'tensorflow', 'pytorch', 'scikit-learn',
            'pandas', 'numpy', 'matplotlib', 'seaborn', 'jupyter', 'anaconda',
            'agile', 'scrum', 'kanban', 'jira', 'confluence', 'slack', 'asana',
            'excel', 'powerpoint', 'word', 'outlook', 'salesforce', 'hubspot',
            'stripe', 'paypal', 'twilio', 'sendgrid', 'stripe', 'api',
            'iot', 'blockchain', 'ml', 'ai', 'nlp', 'cv', 'devops', 'ci/cd',
            'json', 'xml', 'yaml', 'regex', 'microservices', 'architecture'
        }
        
        text_lower = resume_text.lower()
        
        # Section detection keywords
        skills_keywords = r'\b(skills|technical skills|core competencies|expertise|proficiencies|technical expertise)\b'
        education_keywords = r'\b(education|academic|degree|certification|certifications|training)\b'
        experience_keywords = r'\b(experience|professional experience|work experience|employment|career history)\b'
        projects_keywords = r'\b(projects|portfolio|notable projects|key projects|side projects)\b'
        
        # Date pattern: YYYY, MM/YYYY, MM/DD/YYYY, Month Year, etc.
        date_pattern = r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}[/-]\d{4}|\d{4}|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4})'
        
        # Bullet point pattern
        bullet_pattern = r'^[\s\-•*•]\s+(.+)$'
        
        # Extract sections
        def find_section_content(keyword_pattern, text):
            """Find content between a keyword and next section heading."""
            match = re.search(keyword_pattern, text, re.IGNORECASE)
            if not match:
                return ""
            start = match.end()
            # Find next section keyword or end of text
            next_section = re.search(skills_keywords + '|' + education_keywords + '|' + experience_keywords + '|' + projects_keywords, 
                                    text[start:], re.IGNORECASE)
            end = start + next_section.start() if next_section else len(text)
            return text[start:end]
        
        # Extract bullet points from section
        def extract_bullets(section_text):
            """Extract bullet points from section text."""
            lines = section_text.split('\n')
            bullets = []
            for line in lines:
                line = line.strip()
                if line and (line.startswith('-') or line.startswith('•') or line.startswith('*')):
                    bullet = re.sub(r'^[-•*•]\s+', '', line).strip()
                    if bullet:
                        bullets.append(bullet)
            return bullets
        
        # Extract skills
        skills_section = find_section_content(skills_keywords, text_lower)
        skills_list = []
        
        # Find predefined skills in resume
        for skill in predefined_skills:
            if skill in text_lower:
                skills_list.append(skill)
        
        # Remove duplicates and sort
        skills_list = sorted(list(set(skills_list)))
        
        # Extract education
        education_section = find_section_content(education_keywords, resume_text)
        education_list = extract_bullets(education_section)
        
        # Extract experience
        experience_section = find_section_content(experience_keywords, resume_text)
        experience_list = extract_bullets(experience_section)
        
        # Extract projects
        projects_section = find_section_content(projects_keywords, resume_text)
        projects_list = extract_bullets(projects_section)
        
        return {
            'skills': skills_list,
            'education': education_list,
            'experience': experience_list,
            'projects': projects_list
        }

    def _clamp_score(self, value, default=0):
        """Convert a value to an integer score constrained to 0-100."""
        try:
            return max(0, min(100, int(round(float(value)))))
        except Exception:
            return default

    def _parse_json_response(self, text):
        """Parse model JSON response, including fenced JSON blocks."""
        if not text:
            return {}

        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.replace("```json", "").replace("```", "").strip()

        return json.loads(cleaned)

    def _normalize_str_list(self, value, default=None):
        """Normalize a value into a list of non-empty strings."""
        if default is None:
            default = []
        if not isinstance(value, list):
            return default
        cleaned = [str(item).strip() for item in value if str(item).strip()]
        return cleaned if cleaned else default

    def _normalize_detailed_sections(self, value):
        """Normalize detailed analysis sections into a strict 6-topic structure."""
        required = [
            ('Overall Assessment', '🧭'),
            ('Technical Strengths', '💪'),
            ('Gaps and Weaknesses', '⚠️'),
            ('ATS and Formatting Review', '📄'),
            ('Top Improvements', '🚀')
        ]

        if not isinstance(value, list):
            value = []

        input_map = {}
        for item in value:
            if not isinstance(item, dict):
                continue
            title = str(item.get('title', '')).strip()
            if not title:
                continue
            input_map[title.lower()] = {
                'title': title,
                'emoji': str(item.get('emoji', '')).strip(),
                'content': str(item.get('content', '')).strip(),
            }

        sections = []
        for title, emoji in required:
            match = input_map.get(title.lower(), {})
            content = match.get('content', '')
            sections.append({
                'title': title,
                'emoji': emoji,
                'content': content,
            })

        return sections

    def _compose_detailed_analysis(self, sections):
        """Render section objects into formatted text used by the UI."""
        blocks = []
        for sec in sections:
            title = sec.get('title', '').strip()
            emoji = sec.get('emoji', '').strip()
            content = sec.get('content', '').strip() or 'Not provided.'
            blocks.append(f"• {title} {emoji}\n{content}")
        return "\n\n".join(blocks)

    def _is_detailed_analysis_good(self, structured):
        """Basic quality guard to reduce vague responses."""
        sections = structured.get('detailed_analysis_sections', [])
        if len(sections) != 6:
            return False

        non_empty = 0
        total_len = 0
        for sec in sections:
            content = str(sec.get('content', '')).strip()
            if content:
                non_empty += 1
                total_len += len(content)

        return non_empty >= 5 and total_len >= 1000

    def _build_structured_analysis(self, raw_data, include_job_section=False):
        """Normalize model output into a stable JSON contract."""
        data = raw_data if isinstance(raw_data, dict) else {}

        detailed_sections = self._normalize_detailed_sections(
            data.get('detailed_analysis_sections', [])
        )
        detailed_analysis = self._compose_detailed_analysis(detailed_sections)

        structured = {
            'overall_score': self._clamp_score(data.get('overall_score'), 0),
            'ats_score': self._clamp_score(data.get('ats_score'), 0),
            'experience_level': str(data.get('experience_level', 'Entry')).strip() or 'Entry',
            'key_strengths': self._normalize_str_list(data.get('key_strengths'), ['Not provided']),
            'areas_for_improvement': self._normalize_str_list(data.get('areas_for_improvement'), ['Not provided']),
            'skills_identified': self._normalize_str_list(data.get('skills_identified'), ['Not provided']),
            'suggestions_for_enhancement': self._normalize_str_list(data.get('suggestions_for_enhancement'), ['Not provided']),
            'detailed_analysis_sections': detailed_sections,
            'detailed_analysis': detailed_analysis,
        }

        if include_job_section:
            job_match = data.get('job_match_score')
            structured['job_match_score'] = self._clamp_score(job_match, 0) if job_match is not None else None
            structured['missing_keywords_skills'] = self._normalize_str_list(
                data.get('missing_keywords_skills'), []
            )
            structured['job_match_recommendations'] = self._normalize_str_list(
                data.get('job_match_recommendations'), []
            )

        return structured

    def _format_analysis_text(self, analysis_json, include_job_section=False):
        """Convert structured JSON to a readable report for UI display."""

        def bullets(items):
            if not items:
                return "- Not provided"
            return "\n".join([f"- {str(item).strip()}" for item in items if str(item).strip()]) or "- Not provided"

        lines = [
            f"**Overall Score**: {analysis_json.get('overall_score', 0)}/100",
            f"**ATS Compatibility Score**: {analysis_json.get('ats_score', 0)}/100",
            f"**Experience Level**: {analysis_json.get('experience_level', 'Entry')}",
            "",
            "**Key Strengths**",
            bullets(analysis_json.get('key_strengths', [])),
            "",
            "**Areas for Improvement**",
            bullets(analysis_json.get('areas_for_improvement', [])),
            "",
            "**Skills Identified**",
            bullets(analysis_json.get('skills_identified', [])),
            "",
            "**Suggestions for Enhancement**",
            bullets(analysis_json.get('suggestions_for_enhancement', []))
        ]

        if include_job_section:
            job_match = analysis_json.get('job_match_score')
            if job_match is not None:
                lines.extend([
                    "",
                    f"**Job Match Score**: {job_match}/100",
                    "",
                    "**Missing Keywords/Skills for this job**",
                    bullets(analysis_json.get('missing_keywords_skills', [])),
                    "",
                    "**Recommendations to better match this job description**",
                    bullets(analysis_json.get('job_match_recommendations', []))
                ])

        return "\n".join(lines)
    
    def analyze_resume(self, resume_text, job_description=None):
        """Analyze resume using LLM and provide feedback"""
        
        if not self.client:
            return {
                'error': 'LLM API not configured',
                'message': 'Please set GROQ_API_KEY in .env file'
            }
        
        try:
            # Preprocess resume text for optimal analysis
            resume_text = self.preprocess_resume(resume_text)
            
            if not resume_text:
                return {
                    'error': 'Invalid input',
                    'message': 'Resume text is empty after preprocessing'
                }
            
            # Extract structured data first (fast, no LLM needed)
            structured_data = self.extract_structured_data(resume_text)
            
            # Build a deterministic, rubric-based prompt and require strict JSON.
            prompt = f"""You are scoring a resume with a strict rubric.

Scoring rubric (must be followed exactly):
- Formatting and readability: 20 points
- Skills relevance and breadth: 25 points
- Experience impact and quantification: 25 points
- ATS keyword and structure compatibility: 20 points
- Grammar and clarity: 10 points

Rules:
- Return ONLY valid JSON.
- All scores are integers between 0 and 100.
- Use specific evidence from resume content only.
- Do not give generic advice.
- Advice should be in second person format. Address the user directly.
- You MUST provide exactly 6 detailed analysis sections in this exact order:
    1) Overall Assessment 🧭
    2) Technical Strengths 💪
    3) Gaps and Weaknesses ⚠️
    4) ATS and Formatting Review 📄
    5) Top Improvements 🚀
- For sections 1-5: write 3-5 sentences each.

Resume:
{resume_text}

Return this JSON schema exactly:
{{
    "overall_score": number,
    "ats_score": number,
    "experience_level": "Entry|Mid|Senior",
    "key_strengths": ["..."],
    "areas_for_improvement": ["..."],
    "skills_identified": ["..."],
    "suggestions_for_enhancement": ["..."],
        "detailed_analysis_sections": [
            {{"title": "Overall Assessment", "emoji": "🧭", "content": "..."}},
            {{"title": "Technical Strengths", "emoji": "💪", "content": "..."}},
            {{"title": "Gaps and Weaknesses", "emoji": "⚠️", "content": "..."}},
            {{"title": "ATS and Formatting Review", "emoji": "📄", "content": "..."}},
            {{"title": "Top Improvements", "emoji": "🚀", "content": "..."}},
            {{"title": "Stronger Resume Bullet", "emoji": "✍️", "content": "..."}}
        ]
}}
"""

            if job_description:
                prompt += f"""
Job Description:
{job_description}

Also include these fields in the same JSON:
{{
    "job_match_score": number,
    "missing_keywords_skills": ["..."],
    "job_match_recommendations": ["..."]
}}
"""
            
            request_body = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert resume reviewer and career coach. Follow the rubric exactly and return valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0,
                "top_p": 1,
                "max_tokens": 800,
                "response_format": {"type": "json_object"}
            }

            try:
                response = self.client.chat.completions.create(**request_body)
            except Exception:
                # Fallback for Groq models that don't support response_format.
                request_body.pop("response_format", None)
                response = self.client.chat.completions.create(**request_body)

            analysis_text = response.choices[0].message.content
            tokens_used = response.usage.total_tokens if hasattr(response.usage, 'total_tokens') else 0

            parsed_json = self._parse_json_response(analysis_text)
            structured = self._build_structured_analysis(parsed_json, include_job_section=bool(job_description))

            if not self._is_detailed_analysis_good(structured):
                retry_messages = [
                    {
                        'role': 'system',
                        'content': 'Return valid JSON only. Fill all 6 detailed sections with specific evidence from the resume.'
                    },
                    {
                        'role': 'user',
                        'content': prompt + '\n\nPrevious response was too vague or incomplete. Regenerate fully with all required detail.'
                    }
                ]
                retry_body = {
                    'model': self.model,
                    'messages': retry_messages,
                    'temperature': 0,
                    'top_p': 1,
                    'max_tokens': 3000,
                    'response_format': {'type': 'json_object'}
                }

                try:
                    retry_response = self.client.chat.completions.create(**retry_body)
                except Exception:
                    retry_body.pop('response_format', None)
                    retry_response = self.client.chat.completions.create(**retry_body)

                retry_text = retry_response.choices[0].message.content
                retry_json = self._parse_json_response(retry_text)
                retry_structured = self._build_structured_analysis(
                    retry_json, include_job_section=bool(job_description)
                )

                if self._is_detailed_analysis_good(retry_structured):
                    structured = retry_structured

            formatted_analysis = self._format_analysis_text(structured, include_job_section=bool(job_description))
            
            return {
                'success': True,
                'resume_text': resume_text[:500] + '...' if len(resume_text) > 500 else resume_text,
                'analysis': formatted_analysis,
                'analysis_json': structured,
                'overall_score': structured.get('overall_score'),
                'ats_score': structured.get('ats_score'),
                'job_match_score': structured.get('job_match_score'),
                'provider': self.provider,
                'model_used': self.model,
                'tokens_used': tokens_used,
                'structured_data': structured_data
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
                'error': 'GROQ_API_KEY not configured'
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
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a resume parser. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0,
                top_p=1,
                max_tokens=1000,
                response_format={"type": "json_object"}
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
