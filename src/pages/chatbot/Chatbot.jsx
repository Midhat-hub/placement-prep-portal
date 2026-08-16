import React from "react";
import ChatWindow from "../../components/chatbot/ChatWindow";
import "../../styles/chatbot.css";

function Chatbot() {
    return (
        <div className="chatbot-page">

            {/* Page Header */}
            <div className="chatbot-page-header">
                <div>
                    <div className="chatbot-breadcrumb">
                        Placement Preparation / AI Assistant
                    </div>

                    <h1>
                        AI Placement Assistant
                    </h1>

                    <p>
                        Your intelligent companion for placement preparation
                    </p>
                </div>

                <div className="chatbot-status">
                    <span className="status-dot"></span>
                    AI Assistant Online
                </div>
            </div>

            {/* Chat */}
            <div className="chatbot-page-content">
                <ChatWindow />
            </div>

        </div>
    );
}

export default Chatbot;