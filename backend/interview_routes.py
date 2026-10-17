from datetime import datetime, timezone
import json
import os
import tempfile

from flask import Blueprint, current_app, jsonify, request
import requests
from werkzeug.utils import secure_filename

from config import Config
from services.analyzer import ResumeAnalyzer
from chatbot.services.groq_service import get_groq_client
from services.firebase_db import create_interview, get_interview, update_interview, verify_id_token
from services.gemini_live import create_ephemeral_token


interview_bp = Blueprint('interview', __name__, url_prefix='/api/interview')
resume_analyzer = ResumeAnalyzer()
MAX_ANSWER_SECONDS = 5 * 60


def _authenticated_uid():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None

    try:
        decoded_token = verify_id_token(auth_header.split(' ', 1)[1].strip())
        return decoded_token.get('uid')
    except Exception:
        return None


def _now():
    return datetime.now(timezone.utc).isoformat()


def _parse_timestamp(value):
    if not value:
        return datetime.now(timezone.utc)
    try:
        return datetime.fromisoformat(value.replace('Z', '+00:00'))
    except (TypeError, ValueError):
        return datetime.now(timezone.utc)


def _interviewer_instructions(interview):
    return f"""You are a friendly and encouraging voice mock interviewer for a placement preparation portal.
Ask one concise question at a time and wait for the candidate's answer.
Ask relevant follow-ups when useful, but never provide answers or coaching during the interview.
Stay within exactly {interview['questionCount']} interviewer questions, including follow-ups.
Prioritize the candidate's requested focus: {interview.get('focus') or 'general interview readiness'}.
Interview type: {interview['mode']}.
Target role: {interview.get('role') or 'not specified'}.
Resume context: {interview.get('resume') or 'not provided'}.
Job description: {interview.get('jobDescription') or 'not provided'}.
This is voice-only. Never ask the candidate to write or execute code. DSA questions must be answerable verbally.
IMPORTANT: This is a mock interview simulation — do NOT ask "Do you have any questions for me?" or any reverse-question at the end. End the interview with a polite closing statement like "Thank you for your time, that concludes our interview today."
Begin with a brief greeting and the first interview question."""


def _evaluation_payload(interview):
    def concise_text(value, limit=1200):
        text = str(value or '')
        return text[:limit].strip()

    return {
        'candidate': {
            'resume': concise_text(interview.get('resume', ''), 2500),
            'targetRole': concise_text(interview.get('role', ''), 400),
            'jobDescription': concise_text(interview.get('jobDescription', ''), 1500),
        },
        'interview': {
            'mode': interview.get('mode'),
            'focus': concise_text(interview.get('focus', ''), 500),
            'questionCount': interview.get('questionCount'),
            'durationSeconds': interview.get('duration'),
        },
        'conversation': [
            {
                'questionNumber': item.get('questionNumber'),
                'question': concise_text(item.get('question', ''), 600),
                'askedAt': item.get('askedAt'),
                'answer': concise_text(item.get('answer', ''), 800),
                'answerStartedAt': item.get('answerStartedAt'),
                'answerEndedAt': item.get('answerEndedAt'),
                'answerDuration': item.get('answerDuration'),
            }
            for item in interview.get('questions', [])
        ],
    }


def _default_evaluation_result(summary='Interview evaluation completed.'):
    return {
        'summary': summary,
        'technical': {'assessment': 'No technical assessment was returned.', 'strengths': [], 'areasToImprove': []},
        'completeness': {'assessment': 'No completeness assessment was returned.', 'missingPoints': []},
        'reasoning': {'assessment': 'No reasoning assessment was returned.', 'strengths': [], 'areasToImprove': []},
        'communication': {'assessment': 'No communication assessment was returned.', 'strengths': [], 'areasToImprove': []},
        'questionFeedback': [],
        'recommendations': [],
    }


def _evaluate_interview(interview):
    conversation = interview.get('questions', [])
    answered_count = sum(1 for item in conversation if str(item.get('answer', '')).strip())
    current_app.logger.info(
        'Interview evaluation input: questions=%d answered=%d answer_chars=%d',
        len(conversation),
        answered_count,
        sum(len(str(item.get('answer', ''))) for item in conversation),
    )
    try:
        client = get_groq_client()
        payload = _evaluation_payload(interview)
        prompt = f"""Evaluate this voice mock interview. Be fair, constructive, and encouraging — recognise partial knowledge and effort. Do not penalise for nervousness or minor gaps.
IMPORTANT: Return ONLY a valid JSON object. Every field below is REQUIRED — do not omit any field.
Return exactly this JSON shape:
{{"summary":"2-3 sentence overall summary","technical":{{"assessment":"2-3 sentences","strengths":["...","..."],"areasToImprove":["...","..."]}},"completeness":{{"assessment":"1-2 sentences","missingPoints":["..."]}},"reasoning":{{"assessment":"1-2 sentences","strengths":["..."],"areasToImprove":["..."]}},"communication":{{"assessment":"1-2 sentences on clarity, articulation, and confidence","strengths":["..."],"areasToImprove":["..."]}},"questionFeedback":[{{"questionNumber":1,"assessment":"brief","whatWasGood":"what the candidate did well","whatCouldImprove":"one specific suggestion"}}],"recommendations":["...","...","..."]}}

You MUST include one entry in questionFeedback for EVERY question in the conversation array.
You MUST fill in the communication section with real observations about how the candidate spoke.

Evaluation payload:
{json.dumps(payload, ensure_ascii=True)}"""
        response = client.chat.completions.create(
            model=Config.GROQ_MODEL,
            messages=[
                {'role': 'system', 'content': 'You are a supportive and constructive interview evaluator. Be encouraging and fair — reward partial knowledge and genuine effort. Avoid being harsh. Return valid JSON only, using the exact schema provided. Every field in the schema is REQUIRED; never omit questionFeedback, communication, reasoning, or completeness.'},
                {'role': 'user', 'content': prompt},
            ],
            temperature=0.3,
            max_tokens=2000,
            response_format={'type': 'json_object'},
        )
        content = response.choices[0].message.content.strip()
        if content.startswith('```'):
            content = content.removeprefix('```json').removesuffix('```').strip()

        try:
            result = json.loads(content)
        except (TypeError, ValueError):
            current_app.logger.warning('Interview evaluation response was not valid JSON: %r', content[:400])
            result = {}

        if isinstance(result, list):
            for item in result:
                if isinstance(item, dict):
                    result = item
                    break
            else:
                result = {}

        if not isinstance(result, dict):
            current_app.logger.warning('Interview evaluation response was not an object: %s', type(result).__name__)
            result = {}

        return {
            'summary': result.get('summary') or 'Interview evaluation completed.',
            'technical': result.get('technical') or {'assessment': 'No technical assessment returned.', 'strengths': [], 'areasToImprove': []},
            'completeness': result.get('completeness') or {'assessment': 'No completeness assessment returned.', 'missingPoints': []},
            'reasoning': result.get('reasoning') or {'assessment': 'No reasoning assessment returned.', 'strengths': [], 'areasToImprove': []},
            'communication': result.get('communication') or {'assessment': 'No communication assessment returned.', 'strengths': [], 'areasToImprove': []},
            'questionFeedback': result.get('questionFeedback') or [],
            'recommendations': result.get('recommendations') or [],
        }
    except Exception:
        current_app.logger.exception('Interview evaluation generation failed; using fallback result')
        return _default_evaluation_result('Interview evaluation is temporarily unavailable, but the interview was recorded successfully.')


def _extract_uploaded_resume():
    resume_file = request.files.get('resume')
    if not resume_file or not resume_file.filename:
        return '', None

    filename = secure_filename(resume_file.filename)
    extension = os.path.splitext(filename)[1].lower().lstrip('.')
    if not extension:
        extension = {
            'application/pdf': 'pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        }.get(resume_file.mimetype, '')
    if extension not in Config.ALLOWED_EXTENSIONS:
        return None, 'Resume must be a PDF or DOCX file'

    temporary_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{extension}') as temporary_file:
            temporary_path = temporary_file.name
        resume_file.save(temporary_path)
        extracted_text = resume_analyzer.extract_text(temporary_path).strip()
        if not extracted_text:
            return None, 'Could not extract any text from the uploaded resume'
        return extracted_text, None
    except Exception as error:
        return None, f'Unable to read the uploaded resume: {error}'
    finally:
        if temporary_path and os.path.exists(temporary_path):
            os.remove(temporary_path)


@interview_bp.post('/start')
def start_interview():
    uid = _authenticated_uid()
    if not uid:
        return jsonify({'error': 'A valid Firebase authentication token is required'}), 401

    data = request.form
    mode = data.get('mode')
    question_count = data.get('questionCount')
    uploaded_resume = request.files.get('resume')
    if current_app.debug:
        current_app.logger.info(
            'Interview start input: mode=%r question_count=%r resume_present=%s filename=%r mimetype=%r',
            mode,
            question_count,
            bool(uploaded_resume and uploaded_resume.filename),
            uploaded_resume.filename if uploaded_resume else None,
            uploaded_resume.mimetype if uploaded_resume else None,
        )

    if mode not in {'resume_based', 'role_based'}:
        return jsonify({'error': 'mode must be resume_based or role_based'}), 400

    try:
        question_count = int(question_count)
    except (TypeError, ValueError):
        return jsonify({'error': 'questionCount must be an integer'}), 400

    if question_count not in {5, 8, 10}:
        return jsonify({'error': 'questionCount must be 5, 8, or 10'}), 400

    role = str(data.get('role', '')).strip()
    resume = ''
    job_description = str(data.get('jobDescription', '')).strip()
    focus = str(data.get('focus', '')).strip()

    if mode == 'role_based' and not role:
        return jsonify({'error': 'role is required for a role-based interview'}), 400
    if mode == 'resume_based' and (not uploaded_resume or not uploaded_resume.filename):
        if current_app.debug:
            current_app.logger.warning('Interview start rejected: resume file is missing')
        return jsonify({'error': 'resume is required for a resume-based interview'}), 400
    if mode in {'resume_based', 'role_based'}:
        resume, resume_error = _extract_uploaded_resume()
        if resume_error:
            if current_app.debug:
                current_app.logger.warning('Interview start rejected during resume processing: %s', resume_error)
            return jsonify({'error': resume_error}), 400

    started_at = _now()
    interview_data = {
        'userId': uid,
        'mode': mode,
        'role': role,
        'questionCount': question_count,
        'focus': focus[:2000],
        'resume': resume[:30000],
        'jobDescription': job_description[:30000],
        'status': 'in_progress',
        'startedAt': started_at,
        'endedAt': None,
        'duration': None,
        'questions': [],
        'feedback': None,
        'evaluationStatus': 'pending',
        'evaluationError': None,
    }

    interview_id = create_interview(uid, interview_data)
    return jsonify({'success': True, 'interview': {'id': interview_id, **interview_data}}), 201


@interview_bp.post('/<interview_id>/realtime-token')
def realtime_token(interview_id):
    uid = _authenticated_uid()
    if not uid:
        return jsonify({'error': 'A valid Firebase authentication token is required'}), 401
    interview = get_interview(uid, interview_id)
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404
    if not Config.OPENAI_API_KEY:
        return jsonify({'error': 'OPENAI_API_KEY is not configured on the backend'}), 503

    try:
        response = requests.post(
            'https://api.openai.com/v1/realtime/client_secrets',
            headers={'Authorization': f'Bearer {Config.OPENAI_API_KEY}', 'Content-Type': 'application/json'},
            json={
                'session': {
                    'type': 'realtime',
                    'model': Config.OPENAI_REALTIME_MODEL,
                    'instructions': _interviewer_instructions(interview),
                    'audio': {'output': {'voice': 'marin'}},
                }
            },
            timeout=20,
        )
        response.raise_for_status()
        secret = response.json().get('value') or response.json().get('client_secret', {}).get('value')
        if not secret:
            return jsonify({'error': 'OpenAI did not return a realtime client secret'}), 502
        return jsonify({'clientSecret': secret, 'model': Config.OPENAI_REALTIME_MODEL})
    except requests.RequestException as error:
        return jsonify({'error': f'Unable to create OpenAI realtime session: {error}'}), 502


@interview_bp.post('/<interview_id>/gemini-token')
def gemini_token(interview_id):
    uid = _authenticated_uid()
    if not uid:
        return jsonify({'error': 'A valid Firebase authentication token is required'}), 401

    interview = get_interview(uid, interview_id)
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404
    if interview.get('status') != 'in_progress':
        return jsonify({'error': 'The interview is no longer active'}), 409

    try:
        return jsonify(create_ephemeral_token(interview))
    except RuntimeError as error:
        return jsonify({'error': str(error)}), 503
    except Exception:
        return jsonify({'error': 'Unable to create a Gemini Live session'}), 502


@interview_bp.post('/<interview_id>/deepgram-token')
def deepgram_token(interview_id):
    uid = _authenticated_uid()
    if not uid:
        return jsonify({'error': 'A valid Firebase authentication token is required'}), 401
    if not get_interview(uid, interview_id):
        return jsonify({'error': 'Interview not found'}), 404
    if not Config.DEEPGRAM_API_KEY:
        return jsonify({'error': 'DEEPGRAM_API_KEY is not configured on the backend'}), 503

    try:
        response = requests.post(
            'https://api.deepgram.com/v1/auth/grant',
            headers={'Authorization': f'Token {Config.DEEPGRAM_API_KEY}', 'Content-Type': 'application/json'},
            json={'ttl_seconds': 600},
            timeout=20,
        )
        response.raise_for_status()
        token = response.json().get('access_token')
        if not token:
            return jsonify({'error': 'Deepgram did not return a temporary token'}), 502
        return jsonify({'token': token})
    except requests.RequestException as error:
        return jsonify({'error': f'Unable to create Deepgram session: {error}'}), 502


@interview_bp.post('/<interview_id>/question')
def record_question(interview_id):
    uid = _authenticated_uid()
    if not uid:
        return jsonify({'error': 'A valid Firebase authentication token is required'}), 401
    interview = get_interview(uid, interview_id)
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404
    data = request.get_json(silent=True) or {}
    question = str(data.get('question', '')).strip()
    if not question:
        return jsonify({'error': 'question is required'}), 400
    questions = interview.get('questions', [])
    if len(questions) >= interview.get('questionCount', 0):
        return jsonify({'error': 'The configured question limit has been reached'}), 409
    item = {
        'questionNumber': len(questions) + 1,
        'question': question[:4000],
        'askedAt': data.get('askedAt') or _now(),
        'answer': '',
        'answerStartedAt': None,
        'answerEndedAt': None,
        'answerDuration': None,
        'timedOut': False,
    }
    questions.append(item)
    update_interview(uid, interview_id, {'questions': questions, 'state': 'WAITING_FOR_ANSWER'})
    return jsonify({'success': True, 'question': item})


@interview_bp.post('/<interview_id>/answer')
def record_answer(interview_id):
    uid = _authenticated_uid()
    if not uid:
        return jsonify({'error': 'A valid Firebase authentication token is required'}), 401
    interview = get_interview(uid, interview_id)
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404
    data = request.get_json(silent=True) or {}
    answer = str(data.get('answer', '')).strip()
    questions = interview.get('questions', [])
    if not questions:
        return jsonify({'error': 'A finalized answer and active question are required'}), 400
    active = questions[-1]
    if active.get('answer'):
        return jsonify({'error': 'The active question already has an answer'}), 409
    started_at = data.get('answerStartedAt') or _now()
    ended_at = data.get('answerEndedAt') or _now()
    duration = max(0, int((_parse_timestamp(ended_at) - _parse_timestamp(started_at)).total_seconds()))
    timed_out = bool(data.get('timedOut')) or duration >= MAX_ANSWER_SECONDS
    if not answer and not timed_out:
        return jsonify({'error': 'A finalized answer and active question are required'}), 400
    if timed_out and not answer:
        answer = '[No answer submitted before the five-minute limit.]'
    active.update({
        'answer': answer[:12000],
        'answerStartedAt': started_at,
        'answerEndedAt': ended_at,
        'answerDuration': min(duration, MAX_ANSWER_SECONDS),
        'timedOut': timed_out,
    })
    update_interview(uid, interview_id, {'questions': questions, 'state': 'ANSWER_COMPLETE'})
    interview['questions'] = questions
    try:
        feedback = _evaluate_interview(interview)
        evaluation_error = None
        update_interview(uid, interview_id, {
            'feedback': feedback,
            'evaluationStatus': 'complete',
            'evaluationError': None,
            'evaluatedAt': _now(),
        })
    except Exception:
        current_app.logger.exception('Interview answer evaluation failed')
        feedback = None
        evaluation_error = 'Evaluation is temporarily unavailable and will be retried at interview completion.'
        update_interview(uid, interview_id, {
            'evaluationStatus': 'failed',
            'evaluationError': evaluation_error,
        })
    return jsonify({
        'success': True,
        'question': active,
        'feedback': feedback,
        'evaluationError': evaluation_error,
        'questionCountReached': len(questions) >= interview.get('questionCount', 0),
    })


@interview_bp.post('/<interview_id>/end')
def end_interview(interview_id):
    uid = _authenticated_uid()
    if not uid:
        return jsonify({'error': 'A valid Firebase authentication token is required'}), 401
    interview = get_interview(uid, interview_id)
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404
    if interview.get('status') == 'completed':
        return jsonify({'success': True, 'interview': interview})

    ended_at = _now()
    duration = max(0, int((_parse_timestamp(ended_at) - _parse_timestamp(interview.get('startedAt'))).total_seconds()))
    interview.update({'status': 'completed', 'endedAt': ended_at, 'duration': duration})
    try:
        feedback = _evaluate_interview(interview)
        evaluation_status = 'complete'
        evaluation_error = None
    except Exception:
        current_app.logger.exception('Interview completion evaluation failed')
        feedback = None
        evaluation_status = 'failed'
        evaluation_error = 'Interview completed, but evaluation is temporarily unavailable.'
    update_interview(uid, interview_id, {
        'status': 'completed', 'endedAt': ended_at, 'duration': duration,
        'feedback': feedback, 'state': 'COMPLETED',
        'evaluationStatus': evaluation_status,
        'evaluationError': evaluation_error,
        'evaluatedAt': _now() if feedback else None,
    })
    interview['feedback'] = feedback
    interview['evaluationStatus'] = evaluation_status
    interview['evaluationError'] = evaluation_error
    return jsonify({'success': True, 'interview': interview})


@interview_bp.get('/<interview_id>')
def retrieve_interview(interview_id):
    uid = _authenticated_uid()
    if not uid:
        return jsonify({'error': 'A valid Firebase authentication token is required'}), 401

    interview = get_interview(uid, interview_id)
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404
    return jsonify({'success': True, 'interview': interview})