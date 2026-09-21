"""Prompt construction for resume analysis."""


RESUME_ANALYZER_SYSTEM_PROMPT = (
    "You are an expert resume reviewer and career coach. "
    "Follow the rubric exactly and return valid JSON only."
)


def build_resume_analysis_prompt(resume_text, structural_facts, job_description=None):
    """Build the structured resume-analysis prompt sent to the LLM."""
    prompt = f"""You are scoring a resume with a strict rubric.

The attached PDF page images are the authoritative source for visual formatting analysis. Review every page in order. Do not infer visual formatting from extracted text alone.

CONTENT ANALYSIS REQUIREMENTS:
- Evaluate skills, education, experience, projects, achievements, certifications, keywords, grammar, content quality, ATS compatibility, and job-description relevance when provided.

VISUAL ANALYSIS REQUIREMENTS:
- Use the rendered page images to evaluate font consistency, font-size hierarchy, section hierarchy, alignment, margins, spacing, whitespace, text density, column layout, section organization, visual readability, tables, icons, graphics, and potential ATS formatting concerns.
- Include concrete visual findings in the ATS and Formatting Review and the recommendations. If a visual feature is not present, do not invent one.

Scoring rubric (must be followed exactly):
- Formatting and readability: 20 points
- Skills relevance and breadth: 25 points
- Experience impact and quantification: 25 points
- ATS keyword and structure compatibility: 20 points
- Grammar and clarity: 10 points

Rules:
- Return ONLY valid JSON.
- All scores must be integers between 0 and 100.
- Use specific evidence from resume content only.
- Do not give generic advice or invent missing sections, skills, achievements, metrics, experience, or technologies.
- Advice should be in second person format. Address the user directly.
- You MUST provide exactly 6 detailed analysis sections in this exact order:
    1) Overall Assessment 🧭
    2) Technical Strengths 💪
    3) Gaps and Weaknesses ⚠️
    4) ATS and Formatting Review 📄
    5) Top Improvements 🚀
    6) Stronger Resume Bullet ✍️
- Sections 1-5 must contain 3-5 sentences each.
- Section 6 must contain exactly ONE improved resume bullet based on an existing resume bullet.
- Do not invent metrics, achievements, technologies, or outcomes.

STRUCTURAL FACTS — VERIFIED BY THE RESUME PARSER

The resume has already been analyzed by a deterministic parser. The following section-presence information is authoritative:
{structural_facts}

IMPORTANT STRUCTURAL RULES:
1. Do NOT recommend adding a section marked PRESENT.
2. If Projects is PRESENT, never say "Add a Projects section."
3. If Education is PRESENT, never say "Add an Education section."
4. If Skills is PRESENT, never say "Add a Skills section."
5. If Experience is PRESENT, never say "Add an Experience section."
6. For PRESENT sections, evaluate quality, content, organization, relevance, clarity, metrics, and impact instead.
7. Only recommend adding a section marked NOT DETECTED.
8. Before every recommendation, identify evidence and verify the claimed problem exists.

ATS SCORING — FOLLOW EXACTLY

ATS score is a score from 0-100 representing how well the resume's structure and content can be parsed by a typical ATS.

Calculate ATS score using these weighted criteria:

1. Standard section headings — 20 points
2. Section detectability and organization — 20 points
3. Skills and keyword extractability — 20 points
4. Education/experience/project/date structure — 15 points
5. Bullet and content structure — 10 points
6. Formatting/extraction cleanliness — 15 points

Scoring guidance:

90-100:
Excellent ATS compatibility. Standard sections are clearly identifiable, content is highly parseable, keywords are extractable, and there are no significant structural problems.

80-89:
Good ATS compatibility. Minor formatting or extraction issues may exist, but they should not meaningfully interfere with ATS parsing.

70-79:
Acceptable ATS compatibility. Some structural or formatting improvements are recommended.

60-69:
Moderate ATS concerns. Several issues may affect parsing or keyword extraction.

Below 60:
Significant ATS compatibility problems that could interfere with parsing.

IMPORTANT:
- Do not give a low ATS score merely because minor formatting imperfections exist.
- A resume with standard section headings, clearly extractable content, readable dates, normal bullets, and identifiable skills should generally score 80 or higher.
- A minor PDF extraction artifact such as "�" should not reduce the ATS score by more than 5 points unless there is evidence of widespread extraction corruption.
- Minor punctuation errors should have little or no effect on ATS score.
- Do not confuse grammar quality with ATS compatibility.
- Do not penalize a resume for not containing a section unless that section is actually required for ATS compatibility or relevant to the target role.
- Do not invent ATS problems.

RECOMMENDATION QUALITY RULES:
Every recommendation must be actionable and supported by specific evidence from this resume. Never recommend something solely because it is a common resume best practice. When a section exists, recommend improving its quality or content rather than adding it.

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

    return prompt
