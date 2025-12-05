const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Focus chat input when "Connect to Support" is clicked
function focusChat() {
    const chatPanel = document.querySelector('.chat-panel');

    // Smooth scroll to chat panel on mobile/small screens
    if (window.innerWidth <= 768) {
        chatPanel.scrollIntoView({ behavior: 'smooth' });
    }

    // Focus the input
    userInput.focus();
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function addMessage(sender, text) {
    const isUser = sender === "You";
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${isUser ? 'user' : 'bot'}`;

    // Message Content
    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    contentDiv.textContent = text;

    // Timestamp
    const timeDiv = document.createElement("div");
    timeDiv.className = "timestamp";
    timeDiv.textContent = formatTime(new Date());

    msgDiv.appendChild(contentDiv);
    msgDiv.appendChild(timeDiv);

    chatBox.appendChild(msgDiv);
    scrollToBottom();
}

function scrollToBottom() {
    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
    });
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // UI Updates
    addMessage("You", message);
    userInput.value = "";
    userInput.disabled = true;
    sendBtn.disabled = true;

    // Loading Indicator (optional, but good UX)
    const loadingId = "loading-" + Date.now();
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "message bot";
    loadingDiv.id = loadingId;
    loadingDiv.innerHTML = `
        <div class="message-content" style="color: #666; font-style: italic;">
            Thinking...
        </div>
    `;
    chatBox.appendChild(loadingDiv);
    scrollToBottom();

    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
        });

        // Remove loading indicator
        const loadingMsg = document.getElementById(loadingId);
        if (loadingMsg) loadingMsg.remove();

        const data = await res.json();

        let botReply = "I'm not sure how to respond to that.";

        // Handle various response formats from the backend
        if (data.reply) {
            // Check if reply is an array (from messages list) or string
            if (Array.isArray(data.reply)) {
                 botReply = data.reply[0]?.text?.value || "No text content";
            } else if (typeof data.reply === 'object') {
                 // Try to dig into object if needed, or if it's just the content string
                 botReply = data.reply.content || JSON.stringify(data.reply);
            } else {
                 botReply = data.reply;
            }
        } else if (data.error) {
            botReply = `Error: ${data.error}`;
        }

        addMessage("Bot", botReply);

    } catch (err) {
        // Remove loading indicator if still there
        const loadingMsg = document.getElementById(loadingId);
        if (loadingMsg) loadingMsg.remove();

        console.error(err);
        addMessage("Bot", "⚠️ Sorry, I encountered an error. Please try again.");
    } finally {
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
}

// Event Listeners
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
