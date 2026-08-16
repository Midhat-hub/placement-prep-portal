# ---------------------------------------------------------
# RAG SERVICE
# ---------------------------------------------------------
#
# Central RAG orchestration layer.
#
# Flow:
#
# User Query
#     ↓
# Vector Store
#     ↓
# Relevant Documents
#     ↓
# Context Builder
#     ↓
# Groq Service
#
# ---------------------------------------------------------

from chatbot.rag.vector_store import search_vector_store


# ---------------------------------------------------------
# CONFIGURATION
# ---------------------------------------------------------

DEFAULT_TOP_K = 3
DEFAULT_MIN_SCORE = 0.30


# ---------------------------------------------------------
# BUILD RAG CONTEXT
# ---------------------------------------------------------

def build_context(
    query,
    top_k=DEFAULT_TOP_K,
    min_score=DEFAULT_MIN_SCORE
):
    """
    Retrieve relevant knowledge and convert it into
    structured context for the LLM.

    Args:
        query:
            User's question.

        top_k:
            Number of relevant documents to retrieve.

        min_score:
            Minimum similarity score.

    Returns:
        A tuple containing:

        context:
            Formatted text for Groq.

        sources:
            Metadata about retrieved documents.
    """

    # -----------------------------------------------------
    # Validate query
    # -----------------------------------------------------

    if not query or not query.strip():
        return "", []

    query = query.strip()

    # -----------------------------------------------------
    # Retrieve relevant documents
    # -----------------------------------------------------

    results = search_vector_store(
        query=query,
        top_k=top_k,
        min_score=min_score
    )

    # -----------------------------------------------------
    # No relevant knowledge
    # -----------------------------------------------------

    if not results:
        return "", []

    # -----------------------------------------------------
    # Build context
    # -----------------------------------------------------

    context_parts = []

    sources = []

    for index, result in enumerate(
        results,
        start=1
    ):

        text = result.get(
            "text",
            ""
        ).strip()

        if not text:
            continue

        source = result.get(
            "source",
            ""
        )

        category = result.get(
            "category",
            ""
        )

        subject = result.get(
            "subject",
            ""
        )

        difficulty = result.get(
            "difficulty",
            ""
        )

        score = result.get(
            "score",
            0.0
        )

        chunk_id = result.get(
            "chunk_id",
            0
        )

        # -------------------------------------------------
        # Format context block
        # -------------------------------------------------

        context_block = f"""
--- Retrieved Knowledge {index} ---

Source: {source}
Category: {category}
Subject: {subject}
Difficulty: {difficulty}
Relevance Score: {score:.4f}
Chunk ID: {chunk_id}

{text}
""".strip()

        context_parts.append(
            context_block
        )

        # -------------------------------------------------
        # Store source metadata
        # -------------------------------------------------

        sources.append(
            {
                "source": source,
                "category": category,
                "subject": subject,
                "difficulty": difficulty,
                "chunk_id": chunk_id,
                "score": score
            }
        )

    # -----------------------------------------------------
    # Combine all retrieved context
    # -----------------------------------------------------

    context = "\n\n".join(
        context_parts
    )

    return context, sources


# ---------------------------------------------------------
# GET RETRIEVED KNOWLEDGE
# ---------------------------------------------------------

def retrieve_knowledge(
    query,
    top_k=DEFAULT_TOP_K,
    min_score=DEFAULT_MIN_SCORE
):
    """
    Retrieve relevant documents without formatting
    them into an LLM context.

    Useful for debugging and testing.
    """

    if not query or not query.strip():
        return []

    return search_vector_store(
        query=query.strip(),
        top_k=top_k,
        min_score=min_score
    )


# ---------------------------------------------------------
# TEST RAG CONTEXT
# ---------------------------------------------------------

if __name__ == "__main__":

    print("\n===================================")
    print("RAG CONTEXT BUILDER TEST")
    print("===================================")

    query = "What is normalization in DBMS?"

    print(
        f"\nQuery:\n{query}"
    )

    print(
        "\nRetrieving relevant knowledge..."
    )

    context, sources = build_context(
        query,
        top_k=3
    )

    # -----------------------------------------------------
    # Display context
    # -----------------------------------------------------

    print(
        "\n==================================="
    )

    print(
        "GENERATED RAG CONTEXT"
    )

    print(
        "===================================\n"
    )

    if context:

        print(context)

    else:

        print(
            "No relevant knowledge found."
        )

    # -----------------------------------------------------
    # Display sources
    # -----------------------------------------------------

    print(
        "\n==================================="
    )

    print(
        "RETRIEVED SOURCES"
    )

    print(
        "===================================\n"
    )

    if sources:

        for index, source in enumerate(
            sources,
            start=1
        ):

            print(
                f"Source {index}:"
            )

            print(
                f"  File: {source['source']}"
            )

            print(
                f"  Category: {source['category']}"
            )

            print(
                f"  Subject: {source['subject']}"
            )

            print(
                f"  Score: {source['score']:.4f}"
            )

            print()

    else:

        print(
            "No sources retrieved."
        )