# Overview
## Key Goals:

Streamline lead engagement for sales teams.

Provide AI-powered insights and recommendations.


# Code Map & Module Overview
## Backend (Flask API)
The backend is built using Flask and is organized into several modules. Used due to familiarity and ease for api's.

## Entry Point & App Setup

### app.py

Initializes the Flask application, loads environment variables via dotenv, and registers the primary blueprint.

### Routing & Endpoints

routes/leads.py

Contains the Flask blueprint (leads_blueprint) that defines all the API endpoints.

### Key Endpoints:

/api/leads/<lead_id> – Fetch and return cleaned lead data. 

/api/leads/engagement/<lead_id> – Retrieve engagement details and provide summaries. 

/api/leads/draft_email/<lead_id> and /api/leads/draft_summary/<lead_id> – Generate email drafts and communication summaries via OpenAI.

/api/leads/next_steps/<lead_id> – Generate next steps recommendations, including support for function calling.


## Services

### hubspot_service.py

Responsible for all interactions with the HubSpot API:

Fetch lead details, engagements, and recent leads.

Create emails and notes in HubSpot.

Boundary: All external CRM interaction is encapsulated here.

### openai_service.py

Houses all the AI logic:

generate_intro_email(): Drafts an introductory email tailored to the lead’s profile.

generate_contact_summary(): Summarizes past communications.

generate_next_steps(): Provides actionable next steps recommendations.

### ai_service.py

Used for data cleaning and json creation

### cache.py

Implements a simple in-memory cache to reduce redundant API calls.



## Frontend (React)

React was chosen due to familiarity, ease of use, component structure, and compatablity with flask. In addition tailwind made styling fast for the webui. 

## Entry Point

### App.jsx

Sets up the main dashboard, orchestrates API calls via the custom hook, and organizes the display of lead details, engagements, email drafts, summaries, and next steps.

## Custom Hook

### useLeadApi.jsx

Centralizes API calls to the backend. Implements caching strategies and manages loading/error states for fetching leads, engagements, and AI-generated outputs.

## UI Components

### Search & Listing:

LeadSearch.jsx: Provides an input and buttons to fetch or trigger the AI agent for a lead.

LeadList.jsx: Lists recent leads fetched from HubSpot.

## Detail & Engagement View:

LeadDetail.jsx: Displays the detailed profile of a lead.

Engagements.jsx: Shows a grouped and chronologically ordered list of engagement items.

## AI-Generated Output Display:

DraftEmail.jsx: Presents the AI-generated email draft with an option to send.

DraftSummary.jsx: Displays the summary of prior interactions, with an option to save to HubSpot.

NextSteps.jsx: Lists recommended next steps.

