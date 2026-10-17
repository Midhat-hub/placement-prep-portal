import os
import firebase_admin
from firebase_admin import credentials, auth, firestore


def _init_firebase():
    if not firebase_admin._apps:
        cred_path = os.getenv('FIREBASE_SERVICE_ACCOUNT')
        print('FIREBASE_SERVICE_ACCOUNT env:', repr(cred_path))
        exists = os.path.exists(cred_path) if cred_path else False
        print(f'Credential file exists: {exists}')
        if not cred_path or not exists:
            raise RuntimeError("FIREBASE_SERVICE_ACCOUNT not set or file missing")
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    return firestore.client()


_db = None

def get_db():
    global _db
    if _db is None:
        _db = _init_firebase()
    return _db


def verify_id_token(id_token):
    _init_firebase()
    return auth.verify_id_token(id_token)


def _section_key(title):
    return (
        str(title)
        .strip()
        .lower()
        .replace('&', 'and')
        .replace('/', ' ')
        .replace('-', ' ')
        .replace('(', ' ')
        .replace(')', ' ')
        .replace('  ', ' ')
        .replace(' ', '_')
    )


def save_resume_summary(uid, overall_score, ats_score, detailed_sections, resume_summary):
    db = get_db()
    doc_ref = db.collection('user_progress').document(uid).collection('resume').document('latest')

    normalized_sections = []
    for index, section in enumerate(detailed_sections or []):
        if not isinstance(section, dict):
            continue

        title = str(section.get('title', '')).strip()
        content = str(section.get('content', '')).strip()
        if not title or not content:
            continue

        normalized_sections.append({
            'id': index,
            'key': _section_key(title),
            'content': content,
        })

    data = {
        'schema_version': 1,
        "overall_score": int(overall_score) if overall_score is not None else 0,
        "ats_score": int(ats_score) if ats_score is not None else 0,
        "detailed_analysis_sections": normalized_sections,
        "resume_summary": resume_summary or {},
        "created_at": firestore.SERVER_TIMESTAMP,
    }
    doc_ref.set(data, merge=True)


def create_interview(uid, interview_data):
    """Create a bounded voice interview session for the authenticated user."""
    db = get_db()
    doc_ref = db.collection('user_progress').document(uid).collection('interviews').document()
    doc_ref.set(interview_data)
    return doc_ref.id


def get_interview(uid, interview_id):
    """Read an interview only from the authenticated user's collection."""
    doc_ref = get_db().collection('user_progress').document(uid).collection('interviews').document(interview_id)
    snapshot = doc_ref.get()
    if not snapshot.exists:
        return None
    return {'id': snapshot.id, **snapshot.to_dict()}


def update_interview(uid, interview_id, updates):
    """Update an interview inside the authenticated user's collection."""
    doc_ref = get_db().collection('user_progress').document(uid).collection('interviews').document(interview_id)
    doc_ref.update(updates)
