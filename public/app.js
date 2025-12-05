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

function sendFAQ(text) {
    userInput.value = text;
    sendMessage();
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function addMessage(sender, text) {
    const isUser = sender === "You";
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${isUser ? 'user' : 'bot'}`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";

    // Markdown → HTML (for bot only)
    if (!isUser) {
        contentDiv.innerHTML = marked.parse(text);
    } else {
        contentDiv.textContent = text;
    }

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

// Fetch and display tickets
async function fetchTickets() {
    try {
        const response = await fetch('ticket.json');
        if (!response.ok) {
            throw new Error('Failed to load tickets');
        }
        const tickets = await response.json();
        renderTickets(tickets);
    } catch (error) {
        console.error('Error loading tickets:', error);
        const tableBody = document.getElementById('ticketTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Failed to load ticket data.</td></tr>';
        }
    }
}

function renderTickets(tickets) {
    const tableBody = document.getElementById('ticketTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    tickets.forEach(ticket => {
        const row = document.createElement('tr');

        // Determine status class
        let statusClass = 'status-badge';
        if (ticket.status === 'Open') statusClass += ' status-open';
        else if (ticket.status === 'Closed') statusClass += ' status-closed';
        else statusClass += ' status-pending';

        // Determine priority class
        let priorityClass = 'priority-badge';
        if (ticket.priority === 'Critical') priorityClass += ' priority-critical';
        else priorityClass += ' priority-low';

        // Format Date (use created_at or just a placeholder if null)
        const dateStr = ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A';

        row.innerHTML = `
            <td>
                <div style="font-weight: 500;">${ticket.customer_name}</div>
                <div style="font-size: 12px; color: #888;">${ticket.email}</div>
            </td>
            <td>
                <div style="font-weight: 500;">${ticket.product_purchased}</div>
                <div style="font-size: 12px; color: #888;">${ticket.issue_type}</div>
            </td>
            <td style="max-width: 200px;">
                <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${ticket.issue_description}">
                    ${ticket.issue_description}
                </div>
            </td>
            <td><span class="${statusClass}">${ticket.status}</span></td>
            <td><span class="${priorityClass}">${ticket.priority}</span></td>
            <td style="color: #666;">${dateStr}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Load tickets on page load
fetchTickets();
