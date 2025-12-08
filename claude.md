## Phase 1 — Initial Setup

### Goal
Build my entire Azure AI Agent MVP webapp as a stable and clean Node.js Express + static frontend project, fully compatible with Azure App Service deployment on Node 22-lts.

### Requirements
**Backend**
- Root-level `server.js` using Express (ESM)
- Route: POST `/chat` → call Microsoft Foundry Agent Inference API
- Read environment variables:
  - AZURE_ENDPOINT = Foundry Project Endpoint (no trailing slash, includes `/api/projects/<id>` path)
  - AZURE_AGENT_ID = my Agent ID (ex: asst_xxxxxxxx...)
  - AZURE_API_KEY = Foundry API key
- Request format:
POST {AZURE_ENDPOINT}/agents/{AZURE_AGENT_ID}/inference?api-version=2024-10-21-preview
Headers:
Content-Type: application/json
Api-Key: {AZURE_API_KEY}
Body:
{
"messages": [
{ "role": "user", "content": "<user message>" }
]
}
- Return response JSON to frontend
- Serve files from `public/`
- Logging for API errors

**Frontend**
- Minimal HTML UI in `/public/index.html`
- A text input and submit button
- Shows bot reply from `/chat`
- No build tools required

**Environment**
- Node version: 22-lts
- Root `package.json` with:
  - type: module
  - dependencies: express, axios, cors, dotenv
  - script: `"start": "node server.js"`
- No nested folders containing package.json
- No frontend frameworks
- No custom Dockerfile — use Azure’s default Oryx deployment

### File Structure
Do exactly:
/server.js
/package.json
/public/index.html

### Azure Compatibility Rules
- DO NOT create subfolders like /backend or /client
- Ensure app binds to `process.env.PORT` or 8080 fallback
- CORS enabled for all origins
- Add fallback serving `index.html` for all GET requests

### After Code Generation
Provide instructions for Azure Deployment:
1. Zip deploy or GitHub Actions
2. Configure Azure App Settings:
AZURE_ENDPOINT=https://<xxx>.services.ai.azure.com/api/projects/<project-id>
AZURE_AGENT_ID=asst_xxxxx
AZURE_API_KEY=xxxxx
PORT=8080
3. Redeploy web app
4. Test `/api/test` and `/chat`

### Additional Notes
- Keep everything ultra simple
- Do not add streaming yet
- Do not include OpenAI SDK — use axios only
- Make sure the Express app does not crash

---

Please generate the complete code for this project and ensure correctness.



## Phase 2 — Chatbot Frontend UI Redesign Instructions

### Scope
Update UI files:
1. /public/index.html
2. /public/styles.css
3. /public/app.js

No changes to `/chat` request logic or API response parsing.

---

### Goals
- Clean modern layout, similar to ChatGPT styling
- Larger, friendly chat area with rounded message cards
- Different colors for user and bot messages
- Timestamps shown beneath each message
- Header with icon and title: **Robot Vacuum Support**
- Fixed footer input bar always visible at the bottom
- Smooth fade-in animation for new messages
- Smooth auto-scroll behavior after each message
- Three-dot typing bubble for bot response delay
- Markdown support in bot bubbles
  Example:
  > The best expert to assist you is **Expert Name**, a Navigation and Sensor Expert.
  > ### Troubleshooting Steps
  > 1. placeholder
  > 2. placeholder
  > 3. ....

---

### Component Design Guidelines
- Chat container centered with a max-width to prevent full-screen stretching
- Very light gray background for the full viewport
- Footer input bar:
  - Positioned fixed at the bottom
  - Includes padding, rounded input, and shadow
- Message Bubbles:
  - User messages: right-aligned with distinct color
  - Bot messages: left-aligned with markdown rendering
- Subtle drop shadow around main chat container
- Smooth layout that handles resizing

---

### Animation and Interaction Requirements
- Fade-in animation with CSS for each incoming message
- Typing animation while waiting for bot response:
  - Three animated dots (…) inside a placeholder bubble
- Auto-scroll to the most recent message without jumping

---

### Restrictions
- Keep `/chat` request logic intact
- Do not modify how response JSON is parsed





## Phase 3 — Product Section + Chat Panel Layout Instructions

### Goals
- Move the current chat interface to the **right** side of the screen
  - Fixed width: **35–40%**
  - Full height layout
- Add a new **Product / My Robots** section on the **left** side
  - Width: **60–65%**
- Use the existing asset `robotpic.jpg` in the main product display

---

### Left Panel — Robot Inventory Requirements
- Section Title: **My Robot Vacuums**
- Main product card must include:
  - Product name: **ILIFE A4s Robot Vacuum**
  - Product image: `robotpic.jpg`
  - Feature description:
    - “A smart cleaning robot designed for everyday floor care.”
  - Action button: **Connect to Support**
    - Scroll or focus chat panel on click
- Add 2 placeholder robot cards for future products:
  - **ILIFE V3s Pro**
  - **ILIFE A10s**
- If missing images: show neutral placeholder block

---

### Right Panel — Chat Interface Updates
- Preserve all existing chat features
- Make the panel visually **narrower** and aligned to the right
- Add a slight shadow or border for separation from product section

---

### CSS / Layout Style Direction
- Use **Flexbox** or **CSS Grid**
- Clean, modern UI with:
  - Rounded product cards
  - Soft shadows
  - Light color palette
- Ensure full responsiveness:
  - On screens < 768px wide:
    - Product section stacked on **top**
    - Chat section full width **below**

---

### Deliverables
- Updated:
  - `/public/index.html`
  - `/public/styles.css`
- Optional small update to `/public/app.js`:
  - Only for chat focus behavior when button is clicked
- Do **not** modify:
  - `/chat` request logic
  - API JSON parsing




4.
## Phase 4 — Expert Directory

### Expert Directory
- Display an expert list directly under the Robot Inventory
- Layout requirement:
  - Expert image on the **left**
  - Expert details on the **right**
- Include:
  - Expert name
  - Role
  - Email
  - Next available time

---

### Expert Data Schema
```json
[
  {
    "name": "Li Wei",
    "role": "Mechanical Engineer",
    "email": "liwei.support@robopilot.com",
    "next_available": "2025-12-06 10:00-12:00",
    "picture": "expert1.jpeg"
  },
  ...
]
```



# Azure AI Foundry Agent Prompts

## Master Agent
```
You are the Master Agent. Your job is to understand what the user wants and then direct user to the correct agent.

If the user asks about how to fix or understand a product issue, or asks for steps, guides, meaning of parts, buttons, or messages from the product, then direct user to the Manual Agent.

If the user asks who can help, which expert is needed, or asks about a person’s skill, knowledge, or schedule, then direct user to the Expert Agent.

If the user asks about support tickets, such as ticket status, opening a new ticket, progress, history, or contact details for support cases, then direct user to the Ticket Agent.

When your reply contains structured information such as headings, lists, or steps, format them in Markdown.

If the question is unclear, ask a short follow-up question to understand the goal before routing.

If the user ask irrelavant question, just say sorry I can't help, do you have question on Robot or your Ticket Status?
```


## Ticket Agent
```
You have access to a support ticket database
When the user mentions their name or their email, use that to look up their existing support ticket.
Ticket fields include:
customer_name, email, product_purchased, issue_category, issue_type, issue_description, status, priority, channel, created_at, updated_at.
Your goals:
Understand whether the user is asking about:
Their current support ticket status
Updating the issue
Creating a new ticket
If you find multiple matches, ask for one more identifier (product or channel)
If no ticket is found, you must indicate you cannot find any existing ticket in the system and ask user if they want to create one.
Response Rules:
When showing ticket details, use Markdown structure:
Table for ticket info
Bullet points for actions user can take
Keep text short and clear
```

### Expert Agent
```
You are a expert Agent. Your only job is to match user questions with specific expert in the data and output expert name, expert email, next avaiability, and general suggestions.

If you cannot find an expert's area of expertise match user question. Just say there's currently no expert can help you.

When your reply contains structured information such as headings, lists, or steps, format them in Markdown.

Output only:
Expert name
Role
Email
Next available time
If more info needed
Output Format:
Description: Reasons why this expert match user question
Expert: <Name>
Role: <Role>
Email: <Email>
Next Available: <Time>

```