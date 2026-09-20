# Resume Analyzer — Required Fixes for GPT-OSS-20B

## Objective

Fix the resume analyzer so that `openai/gpt-oss-20b` correctly understands the resume structure and does **not recommend adding sections that already exist**.

For example, if the resume contains:

- `Education`
- `Projects`
- `Skills`

the analyzer must NOT produce recommendations such as:

- "Add an Education section"
- "Add a Projects section"
- "Add a Skills section"

Instead, it should evaluate the **quality, relevance, organization, and content** of those existing sections.

Do not replace the current architecture. Improve the existing `ResumeAnalyzer` implementation.

---

# 1. Fix `preprocess_resume()`

## Current problem

The current implementation does:

```python
text = text.replace('\t', ' ')
text = ' '.join(text.split())
```

This destroys all newline information.

Later code expects newlines to identify sections and bullets, so this makes section parsing less reliable.

## Required change

Preserve meaningful line breaks.

Replace the current whitespace normalization logic with:

```python
text = text.replace('\t', ' ')

lines = text.splitlines()
lines = [re.sub(r'[ ]+', ' ', line).strip() for line in lines]
lines = [line for line in lines if line]

text = '\n'.join(lines)
```

Do NOT use:

```python
' '.join(text.split())
```

because it destroys the resume's section/bullet structure.

---

# 2. Remove the 2000-character resume truncation

## Current problem

The current implementation contains:

```python
if len(text) > 2000:
    text = text[:2000].strip()
```

This can cut the resume in the middle of a project or section.

For example, the current sample resume gets truncated in the middle of the AI Placement Preparation Platform project.

This means the LLM does not receive the complete resume.

## Required change

Remove the 2000-character truncation.

Do not arbitrarily truncate the resume before sending it to the LLM.

If a safety limit is absolutely necessary, use a substantially larger configurable limit such as:

```python
MAX_RESUME_CHARS = 12000
```

but prefer sending the complete extracted resume when the model context allows it.

---

# 3. Improve deterministic section detection

The project already has `extract_structured_data()`.

Use this parser as the source of truth for basic resume structure.

Create explicit section patterns for:

```python
section_patterns = {
    "skills": r'^\s*(skills|technical skills|core competencies|expertise|proficiencies|technical expertise)\s*$',
    "education": r'^\s*(education|academic background|academic qualifications)\s*$',
    "experience": r'^\s*(experience|professional experience|work experience|employment|career history)\s*$',
    "projects": r'^\s*(projects|portfolio|notable projects|key projects|side projects)\s*$',
    "certifications": r'^\s*(certifications|certificates)\s*$',
    "achievements": r'^\s*(achievements|awards|honors)\s*$',
    "leadership": r'^\s*(leadership|positions of responsibility)\s*$'
}
```

Use `^` and `$` so that a section is detected when the entire line is a heading.

Do NOT treat every occurrence of words such as `degree`, `academic`, or `training` as an Education section.

In particular, do not use:

```python
education_keywords = r'\b(education|academic|degree|certification|certifications|training)\b'
```

because certifications should not automatically be classified as education.

---

# 4. Separate section presence from section content

This is important.

The analyzer needs to distinguish:

```text
Projects section exists
```

from:

```text
Projects section contains bullet points
```

A section should be considered PRESENT even if its content is empty or unusual.

Create a section-presence structure such as:

```python
section_presence = {
    "education": True,
    "projects": True,
    "experience": False,
    "skills": True,
    "certifications": False,
    "achievements": False,
    "leadership": False
}
```

Return this information from the deterministic parser.

For example:

```python
return {
    "skills": skills_list,
    "education": education_list,
    "experience": experience_list,
    "projects": projects_list,
    "section_presence": section_presence
}
```

Do not infer section presence solely from whether bullet extraction returned content.

---

# 5. Pass the deterministic parser results to the LLM

## Current problem

The code currently executes:

```python
structured_data = self.extract_structured_data(resume_text)
```

but the result is not included in the LLM prompt.

Therefore, GPT-OSS-20B has to rediscover the resume structure itself.

## Required change

Create a verified structural summary before building the prompt.

For example:

```python
section_presence = structured_data.get("section_presence", {})

structural_facts = f"""
Education: {"PRESENT" if section_presence.get("education") else "NOT DETECTED"}
Projects: {"PRESENT" if section_presence.get("projects") else "NOT DETECTED"}
Experience: {"PRESENT" if section_presence.get("experience") else "NOT DETECTED"}
Skills: {"PRESENT" if section_presence.get("skills") else "NOT DETECTED"}
Certifications: {"PRESENT" if section_presence.get("certifications") else "NOT DETECTED"}
Achievements: {"PRESENT" if section_presence.get("achievements") else "NOT DETECTED"}
Leadership: {"PRESENT" if section_presence.get("leadership") else "NOT DETECTED"}
"""
```

Then include this BEFORE the resume text in the LLM prompt.

---

# 6. Add strong structural constraints to the LLM prompt

Add the following instructions to the prompt:

```text
STRUCTURAL FACTS — VERIFIED BY THE RESUME PARSER

The resume has already been analyzed by a deterministic parser.

The following section-presence information is authoritative.

[INSERT STRUCTURAL FACTS HERE]

IMPORTANT STRUCTURAL RULES:

1. Do NOT recommend adding a section that is marked PRESENT.
2. If Projects is PRESENT, never say "Add a Projects section."
3. If Education is PRESENT, never say "Add an Education section."
4. If Skills is PRESENT, never say "Add a Skills section."
5. If Experience is PRESENT, never say "Add an Experience section."
6. For sections that are PRESENT, evaluate their quality, content, organization, relevance, clarity, metrics, and impact instead.
7. Only recommend adding a section when that section is marked NOT DETECTED.
8. Do not invent missing sections, skills, achievements, metrics, experience, or technologies.

Before making any recommendation:
- Identify evidence in the resume.
- Verify that the claimed problem actually exists.
- If the resume already satisfies the recommendation, do not make that recommendation.
```

This should be treated as a hard instruction.

---

# 7. Fix the 5-vs-6 detailed-section contradiction

The current prompt says:

```text
You MUST provide exactly 6 detailed analysis sections
```

but only lists five sections.

The JSON schema contains six sections.

Make the prompt explicitly list all six:

```text
You MUST provide exactly 6 detailed analysis sections in this exact order:

1. Overall Assessment 🧭
2. Technical Strengths 💪
3. Gaps and Weaknesses ⚠️
4. ATS and Formatting Review 📄
5. Top Improvements 🚀
6. Stronger Resume Bullet ✍️
```

Then specify:

```text
Sections 1-5 must contain 3-5 sentences each.

Section 6 must contain exactly ONE improved resume bullet based on an existing resume bullet.

Do not invent metrics, achievements, technologies, or outcomes.
```

---

# 8. Improve ATS instructions

Add explicit ATS rules:

```text
ATS AND FORMATTING REVIEW:

Evaluate only issues supported by the provided resume text.

Check:
- Standard section headings
- Section organization
- Date consistency
- Bullet consistency
- Readability
- Standard resume terminology
- Keyword coverage
- Potential ATS parsing issues
- Unusual characters or extraction artifacts

Do NOT recommend adding a standard section when the verified structural facts show that the section is already PRESENT.

Do not treat PDF extraction artifacts as definite visual formatting problems unless the evidence supports that they would appear in the actual resume.
```

For example, if extracted text contains:

```text
�
```

do not automatically claim that the actual resume visually contains broken characters.

---

# 9. Improve recommendation quality

Add:

```text
RECOMMENDATION QUALITY RULES:

Every recommendation must be actionable and supported by specific evidence from this resume.

Bad recommendation:
"Add a Projects section."

Good recommendation when Projects already exists:
"Strengthen the Finora project bullets by leading with measurable backend performance or scale where available."

Bad recommendation:
"Add more technical skills."

Good recommendation:
"Prioritize the technologies most relevant to the target role and remove lower-value tools if they take attention away from core backend technologies."

Never recommend something solely because it is a common resume best practice. Recommend it only when the current resume demonstrates a relevant weakness.
```

---

# 10. Remove the generic retry instruction

The current retry contains:

```text
Previous response was too vague or incomplete. Regenerate fully with all required detail.
```

Remove this.

It encourages the model to generate more content rather than correcting the actual error.

Replace it with a targeted retry.

If the first response violates a structural constraint, retry with:

```text
The previous response violated a verified resume-structure constraint.

Review the verified structural facts again.

Do not recommend adding any section marked PRESENT.

Specifically check every recommendation against the verified section-presence data.

Return the complete JSON again.
```

---

# 11. Add deterministic validation after the LLM response

Before accepting the LLM output, inspect recommendations for contradictions.

Create a function such as:

```python
def _has_invalid_structural_recommendation(self, structured, section_presence):
    texts = []

    for item in structured.get("areas_for_improvement", []):
        texts.append(str(item).lower())

    for item in structured.get("suggestions_for_enhancement", []):
        texts.append(str(item).lower())

    for section in structured.get("detailed_analysis_sections", []):
        texts.append(str(section.get("content", "")).lower())

    combined = " ".join(texts)

    invalid_patterns = {
        "projects": [
            "add a projects section",
            "add projects section",
            "include a projects section"
        ],
        "education": [
            "add an education section",
            "add education section",
            "include an education section"
        ],
        "skills": [
            "add a skills section",
            "add skills section",
            "include a skills section"
        ],
        "experience": [
            "add an experience section",
            "add experience section",
            "include an experience section"
        ]
    }

    for section, patterns in invalid_patterns.items():
        if section_presence.get(section):
            for pattern in patterns:
                if pattern in combined:
                    return True

    return False
```

Use this validation together with the existing quality validation.

---

# 12. Retry specifically when structural validation fails

After:

```python
structured = self._build_structured_analysis(...)
```

perform:

```python
section_presence = structured_data.get("section_presence", {})

invalid_structure = self._has_invalid_structural_recommendation(
    structured,
    section_presence
)
```

If `invalid_structure` is `True`, retry the LLM.

The retry prompt should explicitly say:

```text
Your previous response contained a recommendation that conflicts with verified resume structure.

Do not recommend adding any section that is already PRESENT.

Re-evaluate the existing section instead.

Return the complete JSON using the exact required schema.
```

---

# 13. Do NOT change the model yet

Keep:

```python
openai/gpt-oss-20b
```

for now.

First fix:

1. PDF text preprocessing
2. Resume truncation
3. Section detection
4. Structural facts
5. Prompt constraints
6. Deterministic validation
7. Targeted retry

Only evaluate a different model after these changes are implemented.

The current issue is primarily pipeline/prompt design rather than proof that GPT-OSS-20B is incapable of resume analysis.

---

# 14. Preserve the existing JSON API

Do not break the frontend contract.

Continue returning:

```json
{
    "overall_score": 0,
    "ats_score": 0,
    "experience_level": "Entry",
    "key_strengths": [],
    "areas_for_improvement": [],
    "skills_identified": [],
    "suggestions_for_enhancement": [],
    "detailed_analysis_sections": [],
    "detailed_analysis": ""
}
```

The new `section_presence` can remain inside `structured_data` if needed.

Do not remove existing response fields.

---

# 15. Test using this exact scenario

After implementing the changes, test with a resume containing:

```text
EDUCATION

Bachelor of Technology in Data Science
...

PROJECTS

Finora – AI-Powered Personal Finance SaaS Platform
...

AI-Based Placement Preparation Platform
...

SKILLS

Python, JavaScript, React, Node.js, PostgreSQL
```

The output MUST NOT contain:

```text
Add a Projects section.
Add an Education section.
Add a Skills section.
```

Instead, recommendations should be about the actual quality of those sections.

For example:

```text
Strengthen project bullets by emphasizing measurable impact, scale, performance improvements, or outcomes where those details are available.
```

If Experience is genuinely absent, the analyzer MAY recommend adding an Experience section, because the parser has marked it as NOT DETECTED.

---

# 16. Final implementation requirement

Make these changes directly in `analyzer.py`.

Do not rewrite unrelated parts of the application.

After modifying the file:

1. Run syntax validation.
2. Run the existing resume analyzer tests if available.
3. Test with at least one PDF resume.
4. Print/log:
   - extracted text length
   - detected sections
   - LLM model
   - final validation result
5. Verify that existing sections are never incorrectly recommended as missing.
6. Verify that the complete resume is sent to the model rather than being silently truncated at 2000 characters.

The final implementation should make the deterministic parser responsible for **resume structure detection**, while GPT-OSS-20B is responsible primarily for **quality evaluation, scoring, and evidence-based recommendations**.