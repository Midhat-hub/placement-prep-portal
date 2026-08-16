# ---------------------------------------------------------
# GROQ SERVICE
# ---------------------------------------------------------
#
# This service connects the RAG system with Groq.
#
# Flow:
#
# User Question
#       ↓
# RAG Context
#       ↓
# Groq
#       ↓
# AI Response
#
# ---------------------------------------------------------

import os

from dotenv import load_dotenv
from groq import Groq

# ---------------------------------------------------------
# LOAD ENVIRONMENT VARIABLES
# ---------------------------------------------------------

BACKEND_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

ENV_FILE = os.path.join(
    BACKEND_DIR,
    ".env"
)

load_dotenv(
    ENV_FILE
)


# ---------------------------------------------------------
# GROQ CLIENT
# ---------------------------------------------------------

def get_groq_client():
    """
    Create and return a Groq client using the
    GROQ_API_KEY stored in the backend .env file.
    """

    api_key = os.getenv(
        "GROQ_API_KEY"
    )

    if not api_key:

        raise ValueError(
            "GROQ_API_KEY is not configured."
        )

    return Groq(
        api_key=api_key
    )


# ---------------------------------------------------------
# SYSTEM PROMPT
# ---------------------------------------------------------

SYSTEM_PROMPT = """
You are an AI Placement Preparation Assistant
for an AI-based placement preparation portal.

Your purpose is to help students prepare for
technical and campus placements.

You can help students with:

- Data Structures and Algorithms
- Aptitude
- DBMS
- Operating Systems
- Object-Oriented Programming
- Computer Networks
- Coding concepts
- Technical interviews
- HR interviews
- Resume preparation
- Placement preparation
- Study planning

IMPORTANT RAG INSTRUCTIONS:

The user question may be accompanied by
retrieved knowledge from the placement
knowledge base.

When retrieved knowledge is provided:

1. Use the retrieved knowledge as the primary
   source for your answer.

2. Do not contradict the retrieved knowledge.

3. Do not invent facts that are not supported
   by the retrieved knowledge when answering
   placement-related questions.

4. You may use your general knowledge to make
   an explanation clearer, but do not fabricate
   specific facts.

5. If the retrieved knowledge does not contain
   enough information to answer the question,
   clearly say that the available placement
   knowledge base does not contain enough
   information.

6. Never claim that information came from the
   knowledge base if it was not provided.

ANSWER STYLE:

- Be clear and beginner-friendly.
- Explain concepts step by step.
- Use examples when useful.
- Prefer concise answers unless the student
  asks for detailed explanation.
- Use bullet points when appropriate.
- For technical concepts, explain both the
  concept and its placement relevance when useful.

You are a placement preparation assistant,
not a general-purpose search engine.
"""


# ---------------------------------------------------------
# GENERATE RAG CHAT RESPONSE
# ---------------------------------------------------------

def generate_rag_response(
    user_message,
    context=""
):
    """
    Generate a Groq response using retrieved
    RAG context.

    Args:
        user_message:
            The student's question.

        context:
            Relevant knowledge retrieved from
            the FAISS vector store.

    Returns:
        AI-generated response as a string.
    """

    if not user_message:
        raise ValueError(
            "User message cannot be empty."
        )

    client = get_groq_client()

    # -----------------------------------------------------
    # Build user prompt
    # -----------------------------------------------------

    if context:

        user_prompt = f"""
Student Question:

{user_message}

Retrieved Placement Knowledge:

{context}

Using the retrieved placement knowledge above,
answer the student's question clearly and
accurately.
"""

    else:

        user_prompt = f"""
Student Question:

{user_message}

No relevant information was retrieved from
the placement knowledge base.

Answer carefully. If the knowledge base does
not contain enough information, say so clearly.
"""

    # -----------------------------------------------------
    # Call Groq
    # -----------------------------------------------------

    response = client.chat.completions.create(

        model="llama-3.1-8b-instant",

        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],

        temperature=0.3,

        max_tokens=700
    )

    # -----------------------------------------------------
    # Extract response
    # -----------------------------------------------------

    return (
        response
        .choices[0]
        .message
        .content
        .strip()
    )


# ---------------------------------------------------------
# BACKWARD COMPATIBILITY
# ---------------------------------------------------------

def generate_chat_response(
    user_message
):
    """
    Backward-compatible wrapper.

    This function will retrieve RAG context
    and then generate the Groq response.

    This allows existing chatbot routes to
    continue using generate_chat_response().
    """

    from chatbot.rag_service import build_context

    context, _ = build_context(
        user_message
    )

    return generate_rag_response(
        user_message,
        context
    )


# ---------------------------------------------------------
# TEST GROQ + RAG
# ---------------------------------------------------------

if __name__ == "__main__":

    print(
        "\n==================================="
    )

    print(
        "GROQ + RAG TEST"
    )

    print(
        "===================================\n"
    )

    question = (
        "What is normalization in DBMS?"
    )

    print(
        f"Question:\n{question}\n"
    )

    # -----------------------------------------------------
    # Retrieve RAG context
    # -----------------------------------------------------

    from chatbot.rag_service import build_context

    print(
        "Retrieving relevant knowledge..."
    )

    context, sources = build_context(
        question,
        top_k=3
    )

    print(
        f"Retrieved sources: {len(sources)}"
    )

    # -----------------------------------------------------
    # Generate answer
    # -----------------------------------------------------

    print(
        "\nGenerating Groq response..."
    )

    answer = generate_rag_response(
        question,
        context
    )

    print(
        "\n==================================="
    )

    print(
        "AI RESPONSE"
    )

    print(
        "===================================\n"
    )

    print(answer)