import React from "react";


// =========================================================
// TYPING INDICATOR
// =========================================================

function TypingIndicator() {

    return (

        <div className="chat-message-row assistant">

            <div className="chat-message-wrapper">

                <div className="chat-avatar assistant">
                    AI
                </div>

                <div className="typing-bubble">

                    <span className="typing-dot"></span>

                    <span className="typing-dot"></span>

                    <span className="typing-dot"></span>

                </div>

            </div>

        </div>
    );
}

export default TypingIndicator;