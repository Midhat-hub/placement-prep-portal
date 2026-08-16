import json
from pathlib import Path


# ---------------------------------------------------------
# PROJECT PATH
# ---------------------------------------------------------

# backend/chatbot/rag/knowledge_loader.py
#
# parents[0] = rag
# parents[1] = chatbot
# parents[2] = backend
# parents[3] = project root

PROJECT_ROOT = Path(__file__).resolve().parents[3]

DATASETS_DIR = PROJECT_ROOT / "datasets"

CHATBOT_KNOWLEDGE_DIR = (
    DATASETS_DIR / "chatbot_knowledge"
)


# ---------------------------------------------------------
# LOAD JSON FILE
# ---------------------------------------------------------

def load_json_file(file_path):
    """
    Load a JSON dataset and return its contents.
    """

    try:

        with open(
            file_path,
            "r",
            encoding="utf-8"
        ) as file:

            return json.load(file)

    except Exception as e:

        print(
            f"Error loading JSON file "
            f"{file_path}: {e}"
        )

        return []


# ---------------------------------------------------------
# LOAD MARKDOWN FILE
# ---------------------------------------------------------

def load_markdown_file(file_path):
    """
    Load a Markdown knowledge file.
    """

    try:

        with open(
            file_path,
            "r",
            encoding="utf-8"
        ) as file:

            return file.read()

    except Exception as e:

        print(
            f"Error loading Markdown file "
            f"{file_path}: {e}"
        )

        return ""


# ---------------------------------------------------------
# NORMALIZE JSON QUESTIONS
# ---------------------------------------------------------

def normalize_question(
    question,
    source,
    category
):
    """
    Convert different question formats into
    one common structure.
    """

    if not isinstance(
        question,
        dict
    ):

        return None

    text = question.get(
        "question",
        ""
    )

    if not text:

        return None

    subject = question.get(
        "subject",
        category
    )

    difficulty = question.get(
        "difficulty",
        ""
    )

    options = question.get(
        "options",
        []
    )

    answer = question.get(
        "answer",
        ""
    )

    # -----------------------------------------------------
    # Build searchable text
    # -----------------------------------------------------

    searchable_text = text

    if options:

        searchable_text += (
            "\nOptions:\n"
        )

        for option in options:

            searchable_text += (
                f"- {option}\n"
            )

    if answer:

        searchable_text += (
            f"\nAnswer: {answer}"
        )

    return {
        "text": searchable_text.strip(),

        "source": source,

        "category": category,

        "subject": subject,

        "difficulty": difficulty
    }


# ---------------------------------------------------------
# LOAD QUESTION DATASET
# ---------------------------------------------------------

def load_question_dataset(
    filename,
    category
):
    """
    Load and normalize a question dataset.
    """

    file_path = (
        DATASETS_DIR / filename
    )

    data = load_json_file(
        file_path
    )

    documents = []

    if not isinstance(
        data,
        list
    ):

        print(
            f"Warning: {filename} "
            f"does not contain a list."
        )

        return documents

    for question in data:

        document = normalize_question(
            question,
            filename,
            category
        )

        if document:

            documents.append(
                document
            )

    return documents


# ---------------------------------------------------------
# LOAD PLACEMENT GUIDE
# ---------------------------------------------------------

def load_placement_guide():
    """
    Load the placement guide Markdown document.
    """

    file_path = (
        CHATBOT_KNOWLEDGE_DIR
        / "placement_guide.md"
    )

    text = load_markdown_file(
        file_path
    )

    if not text:

        return []

    return [
        {
            "text": text,

            "source": "placement_guide.md",

            "category": "placement",

            "subject": "general",

            "difficulty": ""
        }
    ]


# ---------------------------------------------------------
# LOAD TECHNICAL KNOWLEDGE
# ---------------------------------------------------------

def load_technical_knowledge():
    """
    Load the curated technical placement
    knowledge Markdown document.
    """

    file_path = (
        CHATBOT_KNOWLEDGE_DIR
        / "technical_knowledge.md"
    )

    text = load_markdown_file(
        file_path
    )

    if not text:

        print(
            "Warning: technical_knowledge.md "
            "could not be loaded."
        )

        return []

    return [
        {
            "text": text,

            "source": "technical_knowledge.md",

            "category": "technical",

            "subject": "general",

            "difficulty": ""
        }
    ]


# ---------------------------------------------------------
# LOAD ALL KNOWLEDGE
# ---------------------------------------------------------

def load_all_knowledge():
    """
    Load all available chatbot knowledge sources.

    Returns:
        list[dict]
    """

    documents = []

    # -----------------------------------------------------
    # Placement guide
    # -----------------------------------------------------

    documents.extend(
        load_placement_guide()
    )

    # -----------------------------------------------------
    # Technical knowledge
    # -----------------------------------------------------

    documents.extend(
        load_technical_knowledge()
    )

    # -----------------------------------------------------
    # Core subjects
    # -----------------------------------------------------

    documents.extend(
        load_question_dataset(
            "core_questions.json",
            "core"
        )
    )

    # -----------------------------------------------------
    # DSA
    # -----------------------------------------------------

    documents.extend(
        load_question_dataset(
            "dsa_questions.json",
            "dsa"
        )
    )

    # -----------------------------------------------------
    # General aptitude
    # -----------------------------------------------------

    documents.extend(
        load_question_dataset(
            "general_aptitude.json",
            "aptitude"
        )
    )

    # -----------------------------------------------------
    # Company aptitude
    # -----------------------------------------------------

    documents.extend(
        load_question_dataset(
            "company_aptitude_questions.json",
            "company_aptitude"
        )
    )

    # -----------------------------------------------------
    # Coding links
    # -----------------------------------------------------

    coding_data = load_json_file(
        DATASETS_DIR
        / "deloitte_coding_links.json"
    )

    if isinstance(
        coding_data,
        list
    ):

        for item in coding_data:

            if isinstance(
                item,
                dict
            ):

                text = json.dumps(
                    item,
                    ensure_ascii=False
                )

                documents.append(
                    {
                        "text": text,

                        "source":
                            "deloitte_coding_links.json",

                        "category": "company",

                        "subject": "deloitte",

                        "difficulty": ""
                    }
                )

    return documents


# ---------------------------------------------------------
# TEST LOADER
# ---------------------------------------------------------

if __name__ == "__main__":

    documents = load_all_knowledge()

    print(
        "\n==================================="
    )

    print(
        "RAG KNOWLEDGE LOADER TEST"
    )

    print(
        "==================================="
    )

    print(
        f"Total documents loaded: "
        f"{len(documents)}"
    )

    # -----------------------------------------------------
    # Show first document
    # -----------------------------------------------------

    if documents:

        print(
            "\nFirst document:"
        )

        print(
            "-----------------------------------"
        )

        print(
            documents[0]
        )

    # -----------------------------------------------------
    # Show technical knowledge
    # -----------------------------------------------------

    technical_documents = [
        document
        for document in documents
        if document.get("source")
        == "technical_knowledge.md"
    ]

    print(
        "\nTechnical knowledge documents:"
    )

    print(
        len(technical_documents)
    )

    if technical_documents:

        print(
            "\nTechnical knowledge preview:"
        )

        print(
            "-----------------------------------"
        )

        print(
            technical_documents[0]["text"][:1000]
        )

    # -----------------------------------------------------
    # Show last document
    # -----------------------------------------------------

    if documents:

        print(
            "\nLast document:"
        )

        print(
            "-----------------------------------"
        )

        print(
            documents[-1]
        )