# ---------------------------------------------------------
# CHATBOT ROUTES
# ---------------------------------------------------------

from flask import Blueprint, request, jsonify

from .services.groq_service import (
    generate_rag_response
)

from .rag_service import (
    build_context
)


# ---------------------------------------------------------
# CHATBOT BLUEPRINT
# ---------------------------------------------------------

chatbot_bp = Blueprint(
    "chatbot",
    __name__,
    url_prefix="/api/chatbot"
)


# ---------------------------------------------------------
# CHAT ENDPOINT
# ---------------------------------------------------------

@chatbot_bp.route(
    "/chat",
    methods=["POST"]
)
def chat():

    try:

        # -------------------------------------------------
        # Get request data
        # -------------------------------------------------

        data = request.get_json()

        if not data:

            return jsonify({
                "error": "Request body is required."
            }), 400


        # -------------------------------------------------
        # Get user message
        # -------------------------------------------------

        user_message = data.get(
            "message",
            ""
        ).strip()


        if not user_message:

            return jsonify({
                "error": "Message cannot be empty."
            }), 400


        # -------------------------------------------------
        # RAG: BUILD CONTEXT
        # -------------------------------------------------

        context, sources = build_context(
            user_message,
            top_k=3
        )


        # -------------------------------------------------
        # GENERATE GROQ RESPONSE
        # -------------------------------------------------

        response = generate_rag_response(
            user_message,
            context
        )


        # -------------------------------------------------
        # PREPARE SOURCE INFORMATION
        # -------------------------------------------------

        source_data = []

        for source in sources:

            source_data.append(
                {
                    "source": source.get(
                        "source",
                        ""
                    ),

                    "category": source.get(
                        "category",
                        ""
                    ),

                    "subject": source.get(
                        "subject",
                        ""
                    ),

                    "score": source.get(
                        "score",
                        0.0
                    )
                }
            )


        # -------------------------------------------------
        # RETURN RESPONSE
        # -------------------------------------------------

        return jsonify(
            {
                "response": response,

                "sources": source_data,

                "source_count": len(
                    source_data
                )
            }
        ), 200


    except Exception as e:

        print(
            "Chatbot error:",
            str(e)
        )

        return jsonify(
            {
                "error":
                    "Failed to generate chatbot response."
            }
        ), 500