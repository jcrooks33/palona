# Palona AI Agent

This is an AI Sales Agent that integrates with Hubspot. After selecting a lead the agent will draft an email, summarize previous engagements, and give a recommendation for next steps. In addition to this, it is able to send the email (mock) and add it to Hubspot, along with adding the summary and recommendation to Hubspot as notes. 

# Setup & Installation

## Prerequisites
Python 

Node.js and npm

HubSpot API credentials (create a HubSpot Private App and set your API key/token)

OpenAI API key

<br>

## Backend Setup

### Clone the repo:

clone the repo and cd

<br>

### Create and activate a virtual environment:

python -m venv venv

source venv/bin/activate  # Linux/MacOS

<br>


### Install Python dependencies:

pip install -r requirements.txt

<br>


### Configure Environment Variables:

Create a .env file in the project root (or set env vars in your shell) with:

HUBSPOT_KEY=your_hubspot_api_key

OPENAI_KEY=your_openai_api_key

 The backend will run on http://127.0.0.1:5000/.

<br>

## Frontend Setup
### Navigate to the frontend folder

cd frontend

<br>

### Install Node dependencies:

npm install

<br>

### Run the React development server:

npm run dev

The frontend will run on http://localhost:5173 (or whatever port is open for you) and communicates with the Flask backend.

<br>

# Usage
## Open the Dashboard:
Navigate to your localhost.

<br>

## Search for a Lead:
Click Fetch Recent Leads to have all leads created within the past 7 days be fetched. 

If you want a specific lead then enter a HubSpot Lead ID in the search box and click “Fetch Lead by ID.” The lead’s details, including engagement history, will be displayed.

<br>

## Trigger the AI Agent:
Click “Trigger Agent” to have the AI:

Generate a draft email,

Summarize prior communications,

Propose concrete next steps.

<br>

## Review & Act:

View the generated email before sending it and storing in HubSpot as an email.

Review the AI-generated summary and save it to HubSpot as a note.

See the recommended next steps and save it to HubSpot as a note.

Use the “Approve & Send” or “Save to HubSpot” buttons accordingly.

<br>

# API Endpoints

Here are key endpoints available in the backend:

<br>

GET /api/leads/<lead_id>
Fetch detailed lead information from HubSpot.

<br>

GET /api/leads/engagement/<lead_id>
Retrieve engagement data (emails, notes, etc.) associated with a lead.

<br>

GET /api/leads/draft_email/<lead_id>
Generate a draft introduction email for a lead using OpenAI.

<br>

GET /api/leads/draft_summary/<lead_id>
Produce an interaction summary based on lead engagements.

<br>

GET /api/leads/recent
Retrieve recent leads created within a specified time frame.

<br>

POST /api/leads/next_steps/<lead_id>
Generate next steps recommendations. 

<br>

POST /api/leads/create_note/<lead_id>
Save AI-generated notes back to HubSpot.

<br>

POST /api/leads/create_email/<lead_id>
Log an email engagement in HubSpot after approval.

<br>
