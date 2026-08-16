// ---------------------------------------------------------
// CHATBOT API SERVICE
// ---------------------------------------------------------

const CHATBOT_API_URL = "http://127.0.0.1:5000/api/chatbot/chat";


// ---------------------------------------------------------
// SEND MESSAGE TO CHATBOT
// ---------------------------------------------------------

export async function sendChatMessage(message) {

    // Check for empty message
    if (!message || !message.trim()) {
        throw new Error("Message cannot be empty.");
    }


    // -----------------------------------------------------
    // Send request to Flask backend
    // -----------------------------------------------------

    const response = await fetch(
        CHATBOT_API_URL,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message.trim()
            })
        }
    );


    // -----------------------------------------------------
    // Read JSON response
    // -----------------------------------------------------

    const data = await response.json();


    // -----------------------------------------------------
    // Handle backend errors
    // -----------------------------------------------------

    if (!response.ok) {

        throw new Error(
            data.error ||
            "Failed to get chatbot response."
        );
    }


    // -----------------------------------------------------
    // Return chatbot response
    // -----------------------------------------------------

    return data;
}