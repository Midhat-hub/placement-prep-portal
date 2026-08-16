# ---------------------------------------------------------
# RAG RETRIEVAL TEST
# ---------------------------------------------------------

from chatbot.rag.vector_store import search_vector_store


# ---------------------------------------------------------
# TEST QUESTIONS
# ---------------------------------------------------------

TEST_QUERIES = [

    {
        "name": "Placement Preparation",
        "query": "How should I prepare for placements?"
    },

    {
        "name": "DSA",
        "query": "What are important DSA topics for placement preparation?"
    },

    {
        "name": "DBMS",
        "query": "What is normalization in DBMS?"
    },

    {
        "name": "Aptitude",
        "query": "What topics should I study for aptitude?"
    },

    {
        "name": "Deloitte",
        "query": "What coding problems should I practice for Deloitte?"
    }

]


# ---------------------------------------------------------
# RUN TESTS
# ---------------------------------------------------------

if __name__ == "__main__":

    print(
        "\n==================================="
    )

    print(
        "RAG RETRIEVAL TEST"
    )

    print(
        "==================================="
    )

    for test in TEST_QUERIES:

        print(
            "\n\n==================================="
        )

        print(
            f"TEST: {test['name']}"
        )

        print(
            "==================================="
        )

        print(
            f"\nQuery:"
        )

        print(
            test["query"]
        )

        print(
            "\nTop Results:"
        )

        results = search_vector_store(
            test["query"],
            top_k=3
        )

        for index, result in enumerate(
            results,
            start=1
        ):

            print(
                f"\nResult {index}"
            )

            print(
                "-----------------------------------"
            )

            print(
                f"Score: "
                f"{result['score']:.4f}"
            )

            print(
                f"Source: "
                f"{result['source']}"
            )

            print(
                f"Category: "
                f"{result['category']}"
            )

            print(
                f"Subject: "
                f"{result['subject']}"
            )

            print(
                f"Text:"
            )

            print(
                result["text"][:400]
            )