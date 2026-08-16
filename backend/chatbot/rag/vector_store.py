# ---------------------------------------------------------
# RAG VECTOR STORE
# ---------------------------------------------------------

import pickle
from pathlib import Path

import faiss
import numpy as np

from chatbot.rag.knowledge_loader import load_all_knowledge
from chatbot.rag.chunker import chunk_documents
from chatbot.rag.embeddings import (
    create_embeddings,
    create_query_embedding,
)


# ---------------------------------------------------------
# PATHS
# ---------------------------------------------------------

# vector_store.py
# parents[0] = rag
# parents[1] = chatbot
# parents[2] = backend
# parents[3] = project root

CHATBOT_DIR = Path(__file__).resolve().parents[1]

VECTOR_STORE_DIR = (
    CHATBOT_DIR
    / "data"
    / "vector_store"
)

INDEX_FILE = (
    VECTOR_STORE_DIR
    / "knowledge.index"
)

DOCUMENTS_FILE = (
    VECTOR_STORE_DIR
    / "documents.pkl"
)


# ---------------------------------------------------------
# CREATE VECTOR STORE DIRECTORY
# ---------------------------------------------------------

def ensure_vector_store_directory():
    """
    Create the vector store directory if it doesn't exist.
    """

    try:

        VECTOR_STORE_DIR.mkdir(
            parents=True,
            exist_ok=True
        )

        print(
            f"Vector store directory ready: "
            f"{VECTOR_STORE_DIR}"
        )

    except Exception as e:

        raise RuntimeError(
            f"Could not create vector store directory: {e}"
        )


# ---------------------------------------------------------
# BUILD VECTOR STORE
# ---------------------------------------------------------

def build_vector_store():
    """
    Load knowledge, create chunks, generate embeddings,
    and build the FAISS index.
    """

    print("\n===================================")
    print("BUILDING RAG VECTOR STORE")
    print("===================================")

    # -----------------------------------------------------
    # Load documents
    # -----------------------------------------------------

    documents = load_all_knowledge()

    print(
        f"Documents loaded: {len(documents)}"
    )

    # -----------------------------------------------------
    # Create chunks
    # -----------------------------------------------------

    chunks = chunk_documents(
        documents,
        chunk_size=700,
        chunk_overlap=100
    )

    print(
        f"Chunks created: {len(chunks)}"
    )

    if not chunks:

        raise ValueError(
            "No chunks available for vector store."
        )

    # -----------------------------------------------------
    # Extract text
    # -----------------------------------------------------

    texts = [
        chunk["text"]
        for chunk in chunks
    ]

    # -----------------------------------------------------
    # Create embeddings
    # -----------------------------------------------------

    print("\nCreating embeddings...")

    embeddings = create_embeddings(
        texts
    )

    print(
        f"Embedding shape: {embeddings.shape}"
    )

    # -----------------------------------------------------
    # Create FAISS index
    # -----------------------------------------------------

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatIP(
        dimension
    )

    # Add embeddings to FAISS
    index.add(embeddings)

    print(
        f"Vectors stored in FAISS: "
        f"{index.ntotal}"
    )

    # -----------------------------------------------------
    # Create vector store directory
    # -----------------------------------------------------

    ensure_vector_store_directory()

    # -----------------------------------------------------
    # SAVE FAISS INDEX
    # -----------------------------------------------------

    print(
        "\nSaving FAISS index to:"
    )

    print(
        INDEX_FILE
    )

    # IMPORTANT:
    # We serialize the FAISS index in memory first.
    #
    # This avoids the Windows Unicode-path problem
    # caused by the "文档" folder in your OneDrive path.

    index_bytes = faiss.serialize_index(
        index
    )

    # Let Python write the actual file.
    # Python handles Unicode paths correctly.

    with open(
        INDEX_FILE,
        "wb"
    ) as file:

        file.write(
            index_bytes
        )

    print(
        "FAISS index saved."
    )

    # -----------------------------------------------------
    # SAVE DOCUMENT METADATA
    # -----------------------------------------------------

    print(
        "Saving document metadata..."
    )

    with open(
        DOCUMENTS_FILE,
        "wb"
    ) as file:

        pickle.dump(
            chunks,
            file
        )

    print(
        "Document metadata saved."
    )

    # -----------------------------------------------------
    # SUCCESS
    # -----------------------------------------------------

    print(
        "\n==================================="
    )

    print(
        "VECTOR STORE SAVED SUCCESSFULLY"
    )

    print(
        "==================================="
    )

    print(
        f"Index file:"
    )

    print(
        INDEX_FILE
    )

    print(
        f"\nDocuments file:"
    )

    print(
        DOCUMENTS_FILE
    )

    return index, chunks


# ---------------------------------------------------------
# LOAD VECTOR STORE
# ---------------------------------------------------------

def load_vector_store():
    """
    Load an existing FAISS index and its documents.
    """

    # -----------------------------------------------------
    # Check FAISS index
    # -----------------------------------------------------

    if not INDEX_FILE.exists():

        raise FileNotFoundError(
            "FAISS index does not exist. "
            "Build the vector store first."
        )

    # -----------------------------------------------------
    # Check documents file
    # -----------------------------------------------------

    if not DOCUMENTS_FILE.exists():

        raise FileNotFoundError(
            "Document metadata file does not exist. "
            "Build the vector store first."
        )

    # -----------------------------------------------------
    # LOAD FAISS INDEX
    # -----------------------------------------------------

    # Read the saved file using Python.
    #
    # FAISS deserialize_index() in this version expects
    # a NumPy uint8 array rather than raw bytes.

    with open(
        INDEX_FILE,
        "rb"
    ) as file:

        index_bytes = file.read()

    # Convert bytes to NumPy array


    index_array = np.frombuffer(
        index_bytes,
        dtype=np.uint8
    )

    # Deserialize FAISS index

    index = faiss.deserialize_index(
        index_array
    )

    # -----------------------------------------------------
    # LOAD DOCUMENT METADATA
    # -----------------------------------------------------

    with open(
        DOCUMENTS_FILE,
        "rb"
    ) as file:

        documents = pickle.load(
            file
        )

    return index, documents


# ---------------------------------------------------------
# SEARCH VECTOR STORE
# ---------------------------------------------------------

def search_vector_store(
    query,
    top_k=3,
    min_score=0.30,
    candidate_k=50
):
    """
    Search the FAISS vector store using a user query.

    The search retrieves a larger candidate pool first,
    then applies the similarity threshold and returns
    the best matching results.

    Args:
        query: User's search query.
        top_k: Number of final results to return.
        min_score: Minimum cosine similarity score.
        candidate_k: Number of FAISS candidates to inspect.
    """

    # -----------------------------------------------------
    # Load vector store
    # -----------------------------------------------------

    index, documents = load_vector_store()

    if not documents:
        return []

    # -----------------------------------------------------
    # Create query embedding
    # -----------------------------------------------------

    query_embedding = create_query_embedding(
        query
    )

    # -----------------------------------------------------
    # Search a larger candidate pool
    # -----------------------------------------------------

    k = min(
        candidate_k,
        len(documents)
    )

    scores, indices = index.search(
        query_embedding,
        k
    )

    results = []

    # -----------------------------------------------------
    # Process candidates
    # -----------------------------------------------------

    for score, index_position in zip(
        scores[0],
        indices[0]
    ):

        # Invalid FAISS result
        if index_position < 0:
            continue

        score = float(score)

        # -------------------------------------------------
        # Similarity threshold
        # -------------------------------------------------

        if score < min_score:
            continue

        document = documents[
            index_position
        ]

        results.append(
            {
                "text": document.get(
                    "text",
                    ""
                ),

                "source": document.get(
                    "source",
                    ""
                ),

                "category": document.get(
                    "category",
                    ""
                ),

                "subject": document.get(
                    "subject",
                    ""
                ),

                "difficulty": document.get(
                    "difficulty",
                    ""
                ),

                "chunk_id": document.get(
                    "chunk_id",
                    0
                ),

                "score": score,
            }
        )

        # -------------------------------------------------
        # Stop after collecting top_k
        # -------------------------------------------------

        if len(results) >= top_k:
            break

    return results

# ---------------------------------------------------------
# TEST
# ---------------------------------------------------------

if __name__ == "__main__":

    # -----------------------------------------------------
    # BUILD VECTOR STORE
    # -----------------------------------------------------

    build_vector_store()

    # -----------------------------------------------------
    # TEST VECTOR SEARCH
    # -----------------------------------------------------

    print(
        "\n==================================="
    )

    print(
        "VECTOR SEARCH TEST"
    )

    print(
        "==================================="
    )

    query = (
        "How should I prepare for placements?"
    )

    results = search_vector_store(
        query,
        top_k=3
    )

    print(
        f"\nQuery: {query}"
    )

    print(
        f"Results returned: {len(results)}"
    )

    # -----------------------------------------------------
    # DISPLAY RESULTS
    # -----------------------------------------------------

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
            f"Difficulty: "
            f"{result['difficulty']}"
        )

        print(
            f"Chunk ID: "
            f"{result['chunk_id']}"
        )

        print(
            f"Text: "
            f"{result['text'][:500]}"
        )