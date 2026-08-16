import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


// =========================================================
// CHAT MESSAGE
// =========================================================

function ChatMessage({
    message,
    sender,
    sources = [],
    sourceCount = 0
}) {

    const isUser = sender === "user";

    const [showSources, setShowSources] = useState(false);


    return (

        <div
            className={`chat-message-row ${
                isUser
                    ? "user"
                    : "assistant"
            }`}
        >

            <div className="chat-message-wrapper">


                {/* =================================================
                    AVATAR
                ================================================= */}

                <div
                    className={`chat-avatar ${
                        isUser
                            ? "user"
                            : "assistant"
                    }`}
                >
                    {isUser ? "You" : "AI"}
                </div>


                {/* =================================================
                    MESSAGE
                ================================================= */}

                <div className="chat-message-content">

                    <div
                        className={`chat-bubble ${
                            isUser
                                ? "user"
                                : "assistant"
                        }`}
                    >

                        {isUser ? (

                            // User message
                            message

                        ) : (

                            // AI Markdown response
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                            >
                                {message}
                            </ReactMarkdown>

                        )}

                    </div>


                    {/* =================================================
                        SOURCES
                    ================================================= */}

                    {!isUser &&
                        sources.length > 0 && (

                            <div className="chat-sources">

                                <button
                                    className="sources-toggle"
                                    onClick={() =>
                                        setShowSources(
                                            !showSources
                                        )
                                    }
                                >

                                    📚
                                    Knowledge used

                                    {sourceCount > 0 &&
                                        ` · ${sourceCount} sources`
                                    }

                                    <span>
                                        {showSources
                                            ? "▲"
                                            : "▼"
                                        }
                                    </span>

                                </button>


                                {showSources && (

                                    <div className="sources-list">

                                        {sources.map(
                                            (
                                                source,
                                                index
                                            ) => (

                                                <div
                                                    className="source-item"
                                                    key={index}
                                                >

                                                    <span className="source-name">
                                                        {source.source}
                                                    </span>

                                                    <span className="source-score">

                                                        {typeof source.score ===
                                                        "number"
                                                            ? `${(
                                                                source.score *
                                                                100
                                                            ).toFixed(
                                                                1
                                                            )}%`
                                                            : ""}

                                                    </span>

                                                </div>

                                            )
                                        )}

                                    </div>

                                )}

                            </div>

                        )}

                </div>

            </div>

        </div>
    );
}

export default ChatMessage;