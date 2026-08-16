import React, { useEffect, useRef, useState } from "react";

import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";

import { sendChatMessage } from "../../services/chatbotApi";


// =========================================================
// INITIAL MESSAGE
// =========================================================

const INITIAL_MESSAGE = {
    id: "welcome",
    sender: "assistant",
    message:
        "Hello! 👋 I'm your AI Placement Assistant. I can help you prepare for DSA, aptitude, DBMS, Operating Systems, OOP, Computer Networks, coding, technical interviews, HR interviews, resumes, and placements.",
    sources: []
};


// =========================================================
// SUGGESTIONS
// =========================================================

const suggestions = [
    "What are the important DSA topics for placements?",
    "Explain normalization in DBMS",
    "How should I prepare for technical interviews?",
    "What topics should I study for aptitude?"
];


// =========================================================
// COMPONENT
// =========================================================

function ChatWindow() {

    const [messages, setMessages] = useState([
        INITIAL_MESSAGE
    ]);

    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef(null);


    // =====================================================
    // AUTO SCROLL
    // =====================================================

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages, isLoading]);


    // =====================================================
    // SEND MESSAGE
    // =====================================================

    const handleSendMessage = async (userMessage) => {

        if (!userMessage.trim() || isLoading) {
            return;
        }


        // -------------------------------------------------
        // Add user message
        // -------------------------------------------------

        const userMessageObject = {
            id: `user-${Date.now()}`,
            sender: "user",
            message: userMessage,
            sources: []
        };


        setMessages((previousMessages) => [
            ...previousMessages,
            userMessageObject
        ]);


        setIsLoading(true);


        try {

            // -------------------------------------------------
            // Backend request
            // -------------------------------------------------

            const data = await sendChatMessage(
                userMessage
            );


            // -------------------------------------------------
            // AI response
            // -------------------------------------------------

            const assistantMessage = {
                id: `assistant-${Date.now()}`,
                sender: "assistant",
                message:
                    data.response ||
                    "Sorry, I could not generate a response.",
                sources:
                    data.sources || [],
                sourceCount:
                    data.source_count || 0
            };


            setMessages((previousMessages) => [
                ...previousMessages,
                assistantMessage
            ]);

        }

        catch (error) {

            console.error(
                "Chatbot error:",
                error
            );


            setMessages((previousMessages) => [
                ...previousMessages,
                {
                    id: `error-${Date.now()}`,
                    sender: "assistant",
                    message:
                        "I couldn't connect to the AI Placement Assistant. Please check that the Flask backend is running on port 5000 and try again.",
                    sources: []
                }
            ]);

        }

        finally {

            setIsLoading(false);

        }
    };


    // =====================================================
    // CLEAR CHAT
    // =====================================================

    const handleClearChat = () => {

        setMessages([
            {
                ...INITIAL_MESSAGE,
                id: `welcome-${Date.now()}`
            }
        ]);

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="ai-chat-window">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="ai-chat-header">

                <div className="ai-chat-header-left">

                    <div className="ai-avatar-large">
                        🤖
                    </div>


                    <div>

                        <div className="ai-chat-title">
                            AI Placement Assistant
                        </div>

                        <div className="ai-chat-subtitle">
                            RAG-powered placement preparation
                        </div>

                        <div className="ai-chat-online">

                            <span className="ai-chat-online-dot"></span>

                            Knowledge base connected

                        </div>

                    </div>

                </div>


                <button
                    className="clear-chat-button"
                    onClick={handleClearChat}
                >
                    🗑 Clear
                </button>

            </div>


            {/* =================================================
                CHAT BODY
            ================================================= */}

            <div className="ai-chat-body">


                {/* Welcome section only at beginning */}

                {messages.length === 1 && !isLoading && (

                    <div className="chat-welcome">

                        <div className="chat-welcome-icon">
                            ✨
                        </div>

                        <h2>
                            How can I help you today?
                        </h2>

                        <p>
                            Ask me anything related to your placement
                            preparation. I'll use the placement knowledge
                            base to provide relevant guidance.
                        </p>


                        <div className="chat-suggestions">

                            {suggestions.map(
                                (suggestion) => (

                                    <button
                                        key={suggestion}
                                        className="chat-suggestion"
                                        onClick={() =>
                                            handleSendMessage(
                                                suggestion
                                            )
                                        }
                                    >
                                        💡 {suggestion}
                                    </button>

                                )
                            )}

                        </div>

                    </div>

                )}


                {/* Messages */}

                {messages.map((message) => (

                    <ChatMessage
                        key={message.id}
                        message={message.message}
                        sender={message.sender}
                        sources={message.sources}
                        sourceCount={message.sourceCount}
                    />

                ))}


                {/* Typing */}

                {isLoading && (
                    <TypingIndicator />
                )}


                <div ref={messagesEndRef} />

            </div>


            {/* =================================================
                INPUT
            ================================================= */}

            <ChatInput
                onSend={handleSendMessage}
                disabled={isLoading}
            />

        </div>
    );
}

export default ChatWindow;