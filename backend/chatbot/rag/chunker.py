# ---------------------------------------------------------
# RAG TEXT CHUNKER
# ---------------------------------------------------------

import re


# ---------------------------------------------------------
# BASIC TEXT CHUNKING
# ---------------------------------------------------------

def chunk_text(
    text,
    chunk_size=700,
    chunk_overlap=100
):
    """
    Split plain text into smaller overlapping chunks.

    This function is used mainly for JSON/question
    documents and for sections that are too large.

    The implementation guarantees that the loop
    always moves forward.
    """

    if not text:
        return []

    text = text.strip()

    if not text:
        return []

    if chunk_size <= 0:
        raise ValueError(
            "chunk_size must be greater than 0."
        )

    if chunk_overlap < 0:
        raise ValueError(
            "chunk_overlap cannot be negative."
        )

    if chunk_overlap >= chunk_size:
        raise ValueError(
            "chunk_overlap must be smaller than chunk_size."
        )

    # -----------------------------------------------------
    # If text is already small enough
    # -----------------------------------------------------

    if len(text) <= chunk_size:
        return [text]

    chunks = []

    start = 0
    text_length = len(text)

    while start < text_length:

        # -------------------------------------------------
        # Calculate end position
        # -------------------------------------------------

        end = min(
            start + chunk_size,
            text_length
        )

        # -------------------------------------------------
        # Extract chunk
        # -------------------------------------------------

        chunk = text[start:end].strip()

        # -------------------------------------------------
        # Try to end at a natural boundary
        # -------------------------------------------------

        if end < text_length:

            # Prefer paragraph boundary
            paragraph_break = chunk.rfind(
                "\n\n"
            )

            if (
                paragraph_break > chunk_size // 2
            ):
                chunk = chunk[
                    :paragraph_break
                ].strip()

            else:

                # Otherwise use newline
                newline = chunk.rfind(
                    "\n"
                )

                if newline > chunk_size // 2:
                    chunk = chunk[
                        :newline
                    ].strip()

                else:

                    # Otherwise use space
                    last_space = chunk.rfind(
                        " "
                    )

                    if (
                        last_space
                        > chunk_size // 2
                    ):
                        chunk = chunk[
                            :last_space
                        ].strip()

        if chunk:
            chunks.append(chunk)

        # -------------------------------------------------
        # Always move forward
        # -------------------------------------------------

        actual_chunk_length = len(chunk)

        if actual_chunk_length == 0:
            next_start = (
                start
                + chunk_size
                - chunk_overlap
            )

        else:
            next_start = (
                start
                + actual_chunk_length
                - chunk_overlap
            )

        if next_start <= start:
            next_start = start + 1

        start = next_start

    return chunks


# ---------------------------------------------------------
# MARKDOWN SECTION SPLITTING
# ---------------------------------------------------------

def split_markdown_sections(text):
    """
    Split Markdown documents using headings.

    Each heading stays together with the content
    belonging to that section.

    Example:

        ## Normalization

        Normalization is...

    remains together instead of being randomly
    cut by character position.
    """

    if not text:
        return []

    text = text.strip()

    if not text:
        return []

    # -----------------------------------------------------
    # Detect Markdown headings
    #
    # Supports:
    # # Heading
    # ## Heading
    # ### Heading
    # -----------------------------------------------------

    heading_pattern = re.compile(
        r"(?m)^#{1,6}\s+.+$"
    )

    matches = list(
        heading_pattern.finditer(text)
    )

    # No headings
    if not matches:
        return [text]

    sections = []

    # -----------------------------------------------------
    # Content before first heading
    # -----------------------------------------------------

    first_heading_start = matches[0].start()

    if first_heading_start > 0:

        intro = text[
            :first_heading_start
        ].strip()

        if intro:
            sections.append(intro)

    # -----------------------------------------------------
    # Each heading + its content
    # -----------------------------------------------------

    for index, match in enumerate(matches):

        start = match.start()

        if index + 1 < len(matches):

            end = matches[
                index + 1
            ].start()

        else:

            end = len(text)

        section = text[
            start:end
        ].strip()

        if section:
            sections.append(section)

    return sections


# ---------------------------------------------------------
# CHUNK MARKDOWN DOCUMENT
# ---------------------------------------------------------

def chunk_markdown(
    text,
    chunk_size=700,
    chunk_overlap=100
):
    """
    Chunk Markdown while preserving logical sections.

    Small sections remain intact.

    Large sections are further split using the
    regular text chunker.
    """

    sections = split_markdown_sections(
        text
    )

    if not sections:
        return []

    chunks = []

    for section in sections:

        # -------------------------------------------------
        # Keep small sections intact
        # -------------------------------------------------

        if len(section) <= chunk_size:

            chunks.append(
                section
            )

            continue

        # -------------------------------------------------
        # Large section
        #
        # Split it while preserving the section heading
        # in every generated chunk.
        # -------------------------------------------------

        lines = section.splitlines()

        heading = ""

        if lines and lines[0].lstrip().startswith("#"):
            heading = lines[0].strip()

            body = "\n".join(
                lines[1:]
            ).strip()

        else:

            body = section

        body_chunks = chunk_text(
            body,
            chunk_size=(
                chunk_size
                - len(heading)
                - 2
                if heading
                else chunk_size
            ),
            chunk_overlap=chunk_overlap
        )

        for body_chunk in body_chunks:

            if heading:

                combined = (
                    f"{heading}\n\n"
                    f"{body_chunk}"
                )

            else:

                combined = body_chunk

            chunks.append(
                combined.strip()
            )

    return chunks


# ---------------------------------------------------------
# CHOOSE CHUNKING STRATEGY
# ---------------------------------------------------------

def chunk_document(
    document,
    chunk_size=700,
    chunk_overlap=100
):
    """
    Decide how a document should be chunked.

    Markdown knowledge files use semantic section
    chunking.

    JSON/question documents use regular text
    chunking.
    """

    text = document.get(
        "text",
        ""
    )

    if not text:
        return []

    source = document.get(
        "source",
        ""
    ).lower()

    # -----------------------------------------------------
    # Markdown knowledge
    # -----------------------------------------------------

    if source.endswith(
        ".md"
    ):

        return chunk_markdown(
            text,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )

    # -----------------------------------------------------
    # JSON / other documents
    # -----------------------------------------------------

    return chunk_text(
        text,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )


# ---------------------------------------------------------
# CHUNK ALL DOCUMENTS
# ---------------------------------------------------------

def chunk_documents(
    documents,
    chunk_size=700,
    chunk_overlap=100
):
    """
    Convert loaded documents into smaller chunks.

    Metadata from the original document is preserved.
    """

    chunked_documents = []

    for document in documents:

        if not isinstance(
            document,
            dict
        ):
            continue

        chunks = chunk_document(
            document,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )

        for index, chunk in enumerate(
            chunks
        ):

            if not chunk:
                continue

            chunked_documents.append(
                {
                    "text": chunk,

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

                    "chunk_id": index
                }
            )

    return chunked_documents


# ---------------------------------------------------------
# FIND CHUNKS FROM A SPECIFIC SOURCE
# ---------------------------------------------------------

def get_source_chunks(
    chunks,
    source
):
    """
    Return all chunks belonging to a specific
    source file.

    Useful for testing Markdown knowledge.
    """

    if not chunks:
        return []

    return [
        chunk
        for chunk in chunks
        if chunk.get("source")
        == source
    ]


# ---------------------------------------------------------
# TEST
# ---------------------------------------------------------

if __name__ == "__main__":

    from chatbot.rag.knowledge_loader import (
        load_all_knowledge
    )

    print(
        "\n==================================="
    )

    print(
        "RAG CHUNKER TEST"
    )

    print(
        "==================================="
    )

    # -----------------------------------------------------
    # Load documents
    # -----------------------------------------------------

    documents = load_all_knowledge()

    print(
        f"Original documents: "
        f"{len(documents)}"
    )

    # -----------------------------------------------------
    # Create chunks
    # -----------------------------------------------------

    chunks = chunk_documents(
        documents
    )

    print(
        f"Total chunks: "
        f"{len(chunks)}"
    )

    # -----------------------------------------------------
    # First chunk
    # -----------------------------------------------------

    if chunks:

        print(
            "\nFirst chunk:"
        )

        print(
            "-----------------------------------"
        )

        print(
            chunks[0]
        )

    # -----------------------------------------------------
    # Technical knowledge chunks
    # -----------------------------------------------------

    technical_chunks = get_source_chunks(
        chunks,
        "technical_knowledge.md"
    )

    print(
        "\nTechnical knowledge chunks:"
    )

    print(
        len(technical_chunks)
    )

    # -----------------------------------------------------
    # Show a normalization chunk
    # -----------------------------------------------------

    normalization_chunks = [
        chunk
        for chunk in technical_chunks
        if "normalization"
        in chunk["text"].lower()
    ]

    print(
        "\nNormalization-related chunks:"
    )

    print(
        len(normalization_chunks)
    )

    if normalization_chunks:

        print(
            "\nNormalization chunk preview:"
        )

        print(
            "-----------------------------------"
        )

        print(
            normalization_chunks[0]["text"]
        )

    # -----------------------------------------------------
    # Last chunk
    # -----------------------------------------------------

    if chunks:

        print(
            "\nLast chunk:"
        )

        print(
            "-----------------------------------"
        )

        print(
            chunks[-1]
        )