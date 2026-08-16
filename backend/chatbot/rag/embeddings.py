# ---------------------------------------------------------
# RAG EMBEDDING SERVICE
# ---------------------------------------------------------

import numpy as np
from sentence_transformers import SentenceTransformer


# ---------------------------------------------------------
# EMBEDDING MODEL
# ---------------------------------------------------------

MODEL_NAME = "all-MiniLM-L6-v2"


print("Loading embedding model...")

model = SentenceTransformer(MODEL_NAME)

print("Embedding model loaded successfully.")


# ---------------------------------------------------------
# CREATE EMBEDDINGS
# ---------------------------------------------------------

def create_embeddings(texts):
    """
    Convert a list of text chunks into numerical vectors.

    Args:
        texts: list[str]

    Returns:
        numpy.ndarray
    """

    if not texts:
        return np.array(
            [],
            dtype="float32"
        )

    embeddings = model.encode(
        texts,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=True
    )

    return embeddings.astype("float32")


# ---------------------------------------------------------
# CREATE SINGLE QUERY EMBEDDING
# ---------------------------------------------------------

def create_query_embedding(query):
    """
    Convert a single user query into an embedding.
    """

    embedding = model.encode(
        [query],
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    return embedding.astype("float32")


# ---------------------------------------------------------
# GET EMBEDDING DIMENSION
# ---------------------------------------------------------

def get_embedding_dimension():
    """
    Return the size of the embedding vector.
    """

    return model.get_sentence_embedding_dimension()


# ---------------------------------------------------------
# TEST
# ---------------------------------------------------------

if __name__ == "__main__":

    print("\n===================================")
    print("EMBEDDING SERVICE TEST")
    print("===================================")

    test_texts = [
        "What is DBMS?",
        "How should I prepare for placements?",
        "What are important DSA topics?"
    ]

    embeddings = create_embeddings(
        test_texts
    )

    print(
        f"\nNumber of embeddings: {len(embeddings)}"
    )

    print(
        f"Embedding dimension: {embeddings.shape[1]}"
    )

    print(
        "\nFirst embedding:"
    )

    print(
        embeddings[0]
    )

    print(
        "\nQuery embedding test:"
    )

    query_embedding = create_query_embedding(
        "What should I study for placements?"
    )

    print(
        f"Query shape: {query_embedding.shape}"
    )