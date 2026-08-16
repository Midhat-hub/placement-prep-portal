import React, {
    useEffect,
    useRef,
    useState
} from "react";


// =========================================================
// CHAT INPUT
// =========================================================

function ChatInput({
    onSend,
    disabled = false
}) {

    const [message, setMessage] = useState("");

    const textareaRef = useRef(null);


    // =====================================================
    // AUTO RESIZE
    // =====================================================

    useEffect(() => {

        const textarea =
            textareaRef.current;

        if (!textarea) {
            return;
        }

        textarea.style.height = "auto";

        textarea.style.height =
            `${Math.min(
                textarea.scrollHeight,
                130
            )}px`;

    }, [message]);


    // =====================================================
    // SEND
    // =====================================================

    const handleSend = () => {

        const trimmedMessage =
            message.trim();


        if (
            !trimmedMessage ||
            disabled
        ) {
            return;
        }


        onSend(trimmedMessage);

        setMessage("");

    };


    // =====================================================
    // KEYBOARD
    // =====================================================

    const handleKeyDown = (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            handleSend();

        }

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="ai-chat-input-area">

            <div className="ai-input-wrapper">


                <textarea
                    ref={textareaRef}
                    className="ai-input-box"

                    value={message}

                    onChange={(event) =>
                        setMessage(
                            event.target.value
                        )
                    }

                    onKeyDown={handleKeyDown}

                    placeholder={
                        disabled
                            ? "AI is thinking..."
                            : "Ask about DSA, DBMS, aptitude, coding, interviews..."
                    }

                    disabled={disabled}

                    rows={1}
                />


                <button
                    className="ai-send-button"

                    onClick={handleSend}

                    disabled={
                        disabled ||
                        !message.trim()
                    }
                >
                    {disabled
                        ? "..."
                        : "Send ➤"
                    }
                </button>

            </div>


            <div className="input-hint">
                Enter to send · Shift + Enter for a new line
            </div>

        </div>
    );
}

export default ChatInput;