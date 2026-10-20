# ============================================================
# DSA CODING / JUDGE0
# ============================================================

from flask import Blueprint, request, jsonify
import json
import re
import time
import urllib.request
import urllib.error
from pathlib import Path
import requests
coding_bp = Blueprint("coding", __name__)
JUDGE0_URL = "https://ce.judge0.com"

LANGUAGE_IDS = {
    "python": 100,
    "javascript": 97,
    "java": 91,
    "cpp": 105,
}


def get_testcases_path():

    candidates = [
        Path(__file__).resolve().parent / "datasets" / "coding_testcases.json",
        Path(__file__).resolve().parent.parent / "datasets" / "coding_testcases.json",
    ]

    for path in candidates:
        if path.exists():
            return path

    raise FileNotFoundError(
        "coding_testcases.json not found"
    )


def load_coding_testcases(problem_id):

    path = get_testcases_path()

    with open(path, "r", encoding="utf-8") as file:
        data = json.load(file)

    for problem in data:

        if problem.get("id") == problem_id:
            return problem.get(
                "hidden_test_cases",
                []
            )

    return []


def extract_function_name(language, starter_code):

    if language == "python":

        match = re.search(
            r"\bdef\s+([A-Za-z_]\w*)\s*\(",
            starter_code
        )

        if match:
            return match.group(1)

    elif language == "javascript":

        match = re.search(
            r"(?:var|let|const)\s+([A-Za-z_]\w*)\s*=\s*function",
            starter_code
        )

        if match:
            return match.group(1)

        match = re.search(
            r"function\s+([A-Za-z_]\w*)\s*\(",
            starter_code
        )

        if match:
            return match.group(1)

    elif language == "java":

        match = re.search(
            r"\bpublic\s+[\w<>\[\], ?]+\s+([A-Za-z_]\w*)\s*\(",
            starter_code
        )

        if match:
            return match.group(1)

    elif language == "cpp":

        match = re.search(
            r"[\w:<>,\s*&]+\s+([A-Za-z_]\w*)\s*\([^)]*\)\s*\{",
            starter_code
        )

        if match:
            return match.group(1)

    return None


def get_parameter_names(language, starter_code):

    if language == "python":

        match = re.search(
            r"\bdef\s+\w+\s*\(([^)]*)\)",
            starter_code
        )

        if not match:
            return []

        params = []

        for part in match.group(1).split(","):

            part = part.strip()

            if not part:
                continue

            part = part.split("=")[0]
            part = part.split(":")[0]

            params.append(part.strip())

        return params

    if language == "javascript":

        match = re.search(
            r"(?:var|let|const)\s+\w+\s*=\s*function\s*\(([^)]*)\)",
            starter_code
        )

        if not match:
            return []

        return [
            x.strip()
            for x in match.group(1).split(",")
            if x.strip()
        ]

    if language in ("java", "cpp"):

        if language == "java":
            match = re.search(
                r"\w+\s+\w+\s*\(([^)]*)\)",
                starter_code
            )
        else:
            match = re.search(
                r"\w+\s+\w+\s*\(([^)]*)\)",
                starter_code
            )

        if not match:
            return []

        result = []

        for param in match.group(1).split(","):

            param = param.strip()

            if not param:
                continue

            name = param.split()[-1]

            name = name.replace("&", "")
            name = name.replace("*", "")

            result.append(name)

        return result

    return []


def python_wrapper(source_code, function_name, input_data):

    input_json = json.dumps(
        input_data,
        ensure_ascii=False
    )

    return f"""
from typing import *

{source_code}

import json

_input = json.loads({input_json!r})

_solution = Solution()

_result = _solution.{function_name}(**_input)

print(json.dumps(_result, separators=(',', ':')))
"""


def javascript_wrapper(
    source_code,
    function_name,
    parameter_names,
    input_data
):

    input_json = json.dumps(
        input_data,
        ensure_ascii=False
    )

    args = ",".join(
        f"_input[{json.dumps(name)}]"
        for name in parameter_names
    )

    return f"""
{source_code}

const _input = {input_json};

const _result = {function_name}({args});

console.log(JSON.stringify(_result));
"""


def java_type_literal(value, java_type):

    java_type = java_type.strip()

    if value is None:

        if java_type.endswith("[]"):
            return "null"

        return "null"

    if java_type == "int":
        return str(int(value))

    if java_type in ("long", "long long"):
        return str(int(value))

    if java_type == "double":
        return str(float(value))

    if java_type == "boolean":
        return "true" if value else "false"

    if java_type == "String":
        return json.dumps(str(value))

    if java_type == "int[]":

        if any(x is None for x in value):
            raise ValueError(
                "Java primitive int[] cannot represent null values."
            )

        return (
            "new int[]{"
            + ",".join(
                str(int(x))
                for x in value
            )
            + "}"
        )

    if java_type == "int[][]":

        if any(
            any(x is None for x in row)
            for row in value
            if isinstance(row, list)
        ):
            raise ValueError(
                "Java primitive int[][] cannot represent null values."
            )

        rows = []

        for row in value:

            rows.append(
                "new int[]{"
                + ",".join(
                    str(int(x))
                    for x in row
                )
                + "}"
            )

        return (
            "new int[][]{"
            + ",".join(rows)
            + "}"
        )

    return json.dumps(value)


def get_java_parameter_types(starter_code):

    match = re.search(
        r"\w+\s+\w+\s*\(([^)]*)\)",
        starter_code
    )

    if not match:
        return []

    types = []

    for param in match.group(1).split(","):

        param = param.strip()

        if not param:
            continue

        pieces = param.split()

        if len(pieces) >= 2:

            java_type = " ".join(
                pieces[:-1]
            )

            types.append(java_type)

    return types


def java_wrapper(
    source_code,
    function_name,
    parameter_types,
    input_data,
    parameter_names
):
    args = []

    for name, java_type in zip(
        parameter_names,
        parameter_types
    ):
        value = input_data[name]

        args.append(
            java_type_literal(
                value,
                java_type
            )
        )

    return rf"""
import java.util.*;

{source_code}

public class Main {{

    static String json(Object value) {{

        if (value == null) {{
            return "null";
        }}

        if (value instanceof Boolean) {{
            return value.toString().toLowerCase();
        }}

        if (value instanceof Number) {{
            return value.toString();
        }}

        if (value instanceof String) {{
            String s = value.toString()
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");

            return "\"" + s + "\"";
        }}

        if (value.getClass().isArray()) {{

            int length =
                java.lang.reflect.Array.getLength(value);

            StringBuilder result =
                new StringBuilder("[");

            for (int i = 0; i < length; i++) {{

                if (i > 0) {{
                    result.append(",");
                }}

                Object item =
                    java.lang.reflect.Array.get(
                        value,
                        i
                    );

                result.append(json(item));
            }}

            result.append("]");

            return result.toString();
        }}

        return "\"" + value.toString() + "\"";
    }}

    public static void main(String[] args) {{

        Solution solution =
            new Solution();

        Object result =
            solution.{function_name}(
                {", ".join(args)}
            );

        System.out.println(json(result));
    }}
}}
"""


def cpp_literal(value, cpp_type):

    cpp_type = cpp_type.strip()

    if value is None:
        raise ValueError(
            "C++ primitive/vector test inputs cannot contain null values."
        )

    if cpp_type == "int":
        return str(int(value))

    if cpp_type in ("long long", "long"):
        return str(int(value))

    if cpp_type == "double":
        return str(float(value))

    if cpp_type == "bool":
        return "true" if value else "false"

    if cpp_type in ("string", "std::string"):
        return json.dumps(str(value))

    if cpp_type.startswith("vector<"):

        inner = cpp_type[
            len("vector<"):-1
        ]

        values = []

        for item in value:
            values.append(
                cpp_literal(item, inner)
            )

        return (
            f"vector<{inner}>{{"
            + ",".join(values)
            + "}"
        )

    return json.dumps(value)


def get_cpp_parameter_info(starter_code):

    match = re.search(
        r"\w[\w:<>,\s*&]*\s+\w+\s*\(([^)]*)\)",
        starter_code
    )

    if not match:
        return []

    result = []

    for param in match.group(1).split(","):

        param = param.strip()

        if not param:
            continue

        name = param.split()[-1]
        name = name.replace("&", "")
        name = name.replace("*", "")

        type_part = param[
            :param.rfind(name)
        ].strip()

        type_part = type_part.replace(
            "const ",
            ""
        )

        type_part = type_part.replace(
            "&",
            ""
        ).strip()

        result.append(
            (name, type_part)
        )

    return result


def cpp_wrapper(
    source_code,
    function_name,
    parameter_info,
    input_data
):

    args = []

    for name, cpp_type in parameter_info:

        args.append(
            cpp_literal(
                input_data[name],
                cpp_type
            )
        )

    return f"""
#include <bits/stdc++.h>
using namespace std;

{source_code}

template <typename T>
void printJson(const T& value) {{
    cout << value;
}}

void printJson(const string& value) {{
    cout << "\\"";

    for (char c : value) {{

        if (c == '\\\\')
            cout << "\\\\\\\\";

        else if (c == '"')
            cout << "\\\\\\"";

        else
            cout << c;
    }}

    cout << "\\"";
}}

void printJson(bool value) {{
    cout << (value ? "true" : "false");
}}

template <typename T>
void printJson(const vector<T>& value) {{

    cout << "[";

    for (size_t i = 0; i < value.size(); i++) {{

        if (i > 0)
            cout << ",";

        printJson(value[i]);
    }}

    cout << "]";
}}

int main() {{

    Solution solution;

    auto result =
        solution.{function_name}(
            {", ".join(args)}
        );

    printJson(result);

    cout << endl;

    return 0;
}}
"""


def run_judge0(source_code, language_id):

    payload = {
        "language_id": language_id,
        "source_code": source_code,
        "cpu_time_limit": 3,
        "wall_time_limit": 5,
        "memory_limit": 128000,
    }

    submit_url = (
        JUDGE0_URL
        + "/submissions"
        + "?base64_encoded=false"
        + "&wait=false"
    )

    response = requests.post(
        submit_url,
        json=payload,
        timeout=20
    )

    if response.status_code != 201:
        raise RuntimeError(
            f"Judge0 HTTP {response.status_code}: {response.text}"
        )

    submission = response.json()

    token = submission.get("token")

    if not token:
        raise RuntimeError(
            f"Judge0 did not return a token: {submission}"
        )

    result_url = (
        JUDGE0_URL
        + "/submissions/"
        + token
        + "?base64_encoded=false"
    )

    for _ in range(20):

        result_response = requests.get(
            result_url,
            timeout=20
        )

        if result_response.status_code != 200:
            raise RuntimeError(
                f"Judge0 result HTTP "
                f"{result_response.status_code}: "
                f"{result_response.text}"
            )

        result = result_response.json()

        status_id = result.get(
            "status",
            {}
        ).get("id")

        # 1 = In Queue
        # 2 = Processing
        # 3+ = Finished
        if status_id not in (1, 2):
            return result

        time.sleep(0.5)

    raise RuntimeError(
        "Judge0 execution timed out."
    )

    payload = {
        "language_id": language_id,
        "source_code": source_code,
        "cpu_time_limit": 3,
        "wall_time_limit": 5,
        "memory_limit": 128000,
    }

    data = json.dumps(payload).encode("utf-8")

    submit_url = (
        JUDGE0_URL
        + "/submissions"
        + "?base64_encoded=false"
        + "&wait=false"
    )

    request_obj = urllib.request.Request(
        submit_url,
        data=data,
        headers={
            "Content-Type": "application/json"
        },
        method="POST",
    )

    try:

        # Step 1: Submit code
        with urllib.request.urlopen(
            request_obj,
            timeout=20
        ) as response:

            submission = json.loads(
                response.read()
            )

        token = submission.get("token")

        if not token:
            raise RuntimeError(
                f"Judge0 did not return a token: {submission}"
            )

        # Step 2: Poll for result
        result_url = (
            JUDGE0_URL
            + "/submissions/"
            + token
            + "?base64_encoded=false"
        )

        for _ in range(20):

            result_request = urllib.request.Request(
                result_url,
                headers={
                    "Content-Type": "application/json"
                },
                method="GET",
            )

            with urllib.request.urlopen(
                result_request,
                timeout=20
            ) as response:

                result = json.loads(
                    response.read()
                )

            status_id = result.get(
                "status",
                {}
            ).get("id")

            # 1 = In Queue
            # 2 = Processing
            # Anything >= 3 = finished
            if status_id not in (1, 2):

                return result

            time.sleep(0.5)

        raise RuntimeError(
            "Judge0 execution timed out."
        )

    except urllib.error.HTTPError as error:

        body = error.read().decode(
            "utf-8",
            errors="replace"
        )

        try:
            error_data = json.loads(body)
        except Exception:
            error_data = {
                "error": body
            }

        raise RuntimeError(
            f"Judge0 HTTP {error.code}: {error_data}"
        )

    payload = {
        "language_id": language_id,
        "source_code": source_code,
        "cpu_time_limit": 3,
        "wall_time_limit": 5,
        "memory_limit": 128000,
    }

    data = json.dumps(
        payload
    ).encode("utf-8")

    url = (
        JUDGE0_URL
        + "/submissions"
        + "?base64_encoded=false"
        + "&wait=false"
    )

    request_obj = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json"
        },
        method="POST",
    )

    try:

        with urllib.request.urlopen(
            request_obj,
            timeout=20
        ) as response:

            return json.loads(
                response.read()
            )

    except urllib.error.HTTPError as error:

        body = error.read().decode(
            "utf-8",
            errors="replace"
        )

        try:
            error_data = json.loads(body)
        except Exception:
            error_data = {
                "error": body
            }

        raise RuntimeError(
            f"Judge0 HTTP {error.code}: {error_data}"
        )


@coding_bp.route("/api/coding/submit", methods=["POST"])
def submit_coding_solution():

    try:

        data = request.get_json()

        problem_id = data.get(
            "problem_id"
        )

        language = data.get(
            "language"
        )

        source_code = data.get(
            "source_code"
        )

        if not problem_id:
            return jsonify({
                "error": "Problem ID is required."
            }), 400

        if language not in LANGUAGE_IDS:
            return jsonify({
                "error": "Unsupported language."
            }), 400

        if not source_code:
            return jsonify({
                "error": "Source code is required."
            }), 400

        testcases = load_coding_testcases(
            problem_id
        )

        if not testcases:
            return jsonify({
                "error":
                    "No hidden test cases found."
            }), 404

        # Get starter code only from the
        # safe problem dataset on the backend.
        coding_questions_path = (
            get_testcases_path().parent
            / "coding_questions.json"
        )

        if not coding_questions_path.exists():
            return jsonify({
                "error":
                    "coding_questions.json not found on backend."
            }), 500

        with open(
            coding_questions_path,
            "r",
            encoding="utf-8"
        ) as file:
            questions = json.load(file)

        problem = next(
            (
                q for q in questions
                if q.get("id") == problem_id
            ),
            None
        )

        if not problem:
            return jsonify({
                "error": "Problem not found."
            }), 404

        starter_code = (
            problem
            .get("starter_code", {})
            .get(language)
        )

        if not starter_code:
            return jsonify({
                "error":
                    "Starter code not available for this language."
            }), 400

        function_name = extract_function_name(
            language,
            starter_code
        )

        if not function_name:
            return jsonify({
                "error":
                    "Could not determine function name."
            }), 500

        parameter_names = get_parameter_names(
            language,
            starter_code
        )

        passed = 0

        for index, testcase in enumerate(
            testcases,
            start=1
        ):

            input_data = json.loads(
                testcase["input"]
            )

            expected_output = (
                testcase["expected_output"]
            )

            if language == "python":

                wrapped_code = python_wrapper(
                    source_code,
                    function_name,
                    input_data
                )

            elif language == "javascript":

                wrapped_code = javascript_wrapper(
                    source_code,
                    function_name,
                    parameter_names,
                    input_data
                )

            elif language == "java":

                parameter_types = (
                    get_java_parameter_types(
                        starter_code
                    )
                )

                wrapped_code = java_wrapper(
                    source_code,
                    function_name,
                    parameter_types,
                    input_data,
                    parameter_names
                )

            elif language == "cpp":

                parameter_info = (
                    get_cpp_parameter_info(
                        starter_code
                    )
                )

                wrapped_code = cpp_wrapper(
                    source_code,
                    function_name,
                    parameter_info,
                    input_data
                )

            result = run_judge0(
                wrapped_code,
                LANGUAGE_IDS[language]
            )

            status = result.get(
                "status",
                {}
            )

            status_id = status.get(
                "id"
            )

            if status_id != 3:

                message = (
                    result.get("compile_output")
                    or result.get("stderr")
                    or result.get("message")
                    or status.get(
                        "description",
                        "Execution failed"
                    )
                )

                return jsonify({
                    "status": "failed",
                    "failed_test": index,
                    "message": message,
                })

            actual_output = (
                result.get("stdout") or ""
            ).strip()

            expected_output = str(
                expected_output
            ).strip()

            try:

                actual_json = json.loads(
                    actual_output
                )

                expected_json = json.loads(
                    expected_output
                )

                is_correct = (
                    actual_json ==
                    expected_json
                )

            except Exception:

                is_correct = (
                    actual_output ==
                    expected_output
                )

            if not is_correct:

                return jsonify({
                    "status": "failed",
                    "failed_test": index,
                    "message": "Wrong Answer",
                })

            passed += 1

        return jsonify({
            "status": "accepted",
            "passed_tests": passed,
            "total_tests": len(testcases),
        })

    except ValueError as error:

        return jsonify({
            "status": "failed",
            "message": str(error),
        }), 400

    except Exception as error:

        print(
            "Coding submission error:",
            error
        )

        return jsonify({
            "status": "failed",
            "message": str(error),
        }), 500