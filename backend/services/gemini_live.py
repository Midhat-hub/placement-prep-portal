import time
import warnings
from datetime import datetime, timedelta, timezone

from google import genai

from config import Config


def interviewer_instructions(interview):
    return f"""You are a friendly and encouraging technical interviewer for a placement preparation portal.
Ask exactly one concise question at a time and wait for the candidate's answer.
Ask relevant follow-up questions when useful, but never provide hints, answers, or coaching during the interview.
Use the candidate's resume and target role to make questions relevant.
Stay within exactly {interview['questionCount']} interviewer questions, including follow-ups.
Prioritize the candidate's requested focus: {interview.get('focus') or 'general interview readiness'}.
Interview type: {interview['mode']}.
Target role: {interview.get('role') or 'not specified'}.
Resume context: {interview.get('resume') or 'not provided'}.
Job description: {interview.get('jobDescription') or 'not provided'}.
This is voice-only. Never ask the candidate to write or execute code.
IMPORTANT: This is a mock interview simulation — do NOT ask "Do you have any questions for me?" or any reverse-question at the end. End the interview with a polite closing statement like "Thank you for your time, that concludes our interview today."
Begin with a brief greeting and the first interview question."""


def create_ephemeral_token(interview):
    if not Config.GEMINI_API_KEY:
        raise RuntimeError('GEMINI_API_KEY is not configured on the backend')

    now = datetime.now(timezone.utc)
    client = genai.Client(api_key=Config.GEMINI_API_KEY)

    token_config = {
        'uses': 1,
        'expire_time': now + timedelta(minutes=30),
        'new_session_expire_time': now + timedelta(minutes=1),
        'live_connect_constraints': {
            'model': Config.GEMINI_LIVE_MODEL,
            'config': {
                'response_modalities': ['AUDIO'],
                'system_instruction': interviewer_instructions(interview),
                'input_audio_transcription': {},
                'output_audio_transcription': {},
            },
        },
    }

    # Retry up to 3 times with exponential backoff to handle transient
    # network drops ("connection forcibly closed by remote host").
    max_attempts = 3
    last_error = None
    for attempt in range(1, max_attempts + 1):
        try:
            with warnings.catch_warnings():
                warnings.filterwarnings('ignore', category=Warning, message='.*experimental.*')
                token = client.auth_tokens.create(config=token_config)
            return {
                'token': token.name,
                'model': Config.GEMINI_LIVE_MODEL,
                'expiresAt': (now + timedelta(minutes=30)).isoformat(),
            }
        except Exception as exc:
            last_error = exc
            if attempt < max_attempts:
                time.sleep(2 ** (attempt - 1))  # 1s, 2s backoff

    raise RuntimeError(f'Gemini token creation failed after {max_attempts} attempts: {last_error}')