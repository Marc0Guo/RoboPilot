# Azure AI Agent MVP

A simple Node.js Express webapp that connects to Microsoft Foundry Agent Inference API.

## File Structure

```
MVP/
├── server.js          # Express server (ESM)
├── package.json       # Dependencies and scripts
├── public/
│   └── index.html     # Frontend UI
└── README.md          # This file
```

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create a `.env` file in the MVP directory:**
   ```env
   AZURE_ENDPOINT=https://<your-endpoint>.services.ai.azure.com/api/projects/<project-id>
   AZURE_AGENT_ID=asst_xxxxxxxx
   AZURE_API_KEY=your-api-key-here
   PORT=8080
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:8080`

## Azure App Service Deployment

### Option 1: Zip Deploy

1. **Install dependencies and create deployment package:**
   ```bash
   npm install --production
   cd ..
   zip -r mvp-deployment.zip MVP/ -x "MVP/node_modules/*" "MVP/.env" "MVP/.git/*"
   ```

2. **Deploy via Azure Portal:**
   - Go to your Azure App Service
   - Navigate to Deployment Center
   - Choose "Zip Deploy"
   - Upload the zip file

3. **Configure App Settings in Azure Portal:**
   - Go to Configuration → Application Settings
   - Add the following settings:
     ```
     AZURE_ENDPOINT=https://<xxx>.services.ai.azure.com/api/projects/<project-id>
     AZURE_AGENT_ID=asst_xxxxx
     AZURE_API_KEY=xxxxx
     PORT=8080
     WEBSITE_NODE_DEFAULT_VERSION=22-lts
     ```
   - Click "Save"

4. **Test the deployment:**
   - Visit `https://your-app.azurewebsites.net/api/test` - should return JSON with status
   - Visit `https://your-app.azurewebsites.net` - should show the chat UI
   - Test `/chat` endpoint with a POST request

### Option 2: GitHub Actions (Recommended)

1. **Push your code to GitHub repository**

2. **Set up GitHub Actions workflow** (`.github/workflows/azure-webapps-deploy.yml`):
   ```yaml
   name: Deploy to Azure App Service
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '22-lts'
         - name: Install dependencies
           run: |
             cd MVP
             npm install --production
         - name: Deploy to Azure
           uses: azure/webapps-deploy@v2
           with:
             app-name: 'your-app-name'
             publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
             package: './MVP'
   ```

3. **Configure Azure App Settings** (same as Option 1, step 3)

4. **Test the deployment** (same as Option 1, step 4)

## API Endpoints

- `GET /` - Serves the frontend HTML
- `GET /api/test` - Health check endpoint
- `POST /chat` - Chat with Azure AI Agent
  - Request body: `{ "message": "your message here" }`
  - Response: Azure API response JSON

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AZURE_ENDPOINT` | Foundry Project Endpoint (no trailing slash, includes `/api/projects/<id>`) | Yes |
| `AZURE_AGENT_ID` | Agent ID (format: `asst_xxxxxxxx`) | Yes |
| `AZURE_API_KEY` | Foundry API key | Yes |
| `PORT` | Server port (default: 8080) | No |

## Troubleshooting

- **Server crashes**: Check Azure App Service logs in the Azure Portal
- **Environment variables not working**: Verify they're set in Azure App Settings, not just `.env` file
- **CORS errors**: The server already has CORS enabled for all origins
- **API errors**: Check the server logs for detailed error messages

## Node Version

This project uses Node.js 22-lts, configured in `package.json` engines field and Azure App Settings.

