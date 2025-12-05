import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Foundry config
const PROJECT_ENDPOINT = process.env.PROJECT_ENDPOINT;
const AGENT_ID = process.env.AZURE_AGENT_ID;

if (!PROJECT_ENDPOINT || !AGENT_ID) {
  console.error("Missing PROJECT_ENDPOINT or AZURE_AGENT_ID in .env");
}

const credential = new DefaultAzureCredential();
const project = new AIProjectClient(PROJECT_ENDPOINT, credential);

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "public")));

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    const thread = await project.agents.threads.create();
    await project.agents.messages.create(thread.id, "user", message);

    let run = await project.agents.runs.create(thread.id, AGENT_ID);

    while (["queued", "in_progress"].includes(run.status)) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      run = await project.agents.runs.get(thread.id, run.id);
    }

    const iterator = await project.agents.messages.list(thread.id);
    const messages = [];
    for await (const msg of iterator) messages.push(msg);

    const last = messages.reverse().find((m) => m.role === "assistant");
    res.json({ reply: last?.content || "No response returned" });
  } catch (err) {
    console.error("Azure Error:", err);
    res.status(500).json({ error: "Azure request failed" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
