from flask import Blueprint, jsonify, request
from hubspot_service import fetch_lead_by_id, fetch_engagements, fetch_recent_leads,create_note
from ai_service import extract_engagement_summary, clean_client_data
from openai_service import generate_intro_email, generate_contact_summary, generate_next_steps, generate_lead_segment

leads_blueprint = Blueprint('leads', __name__)



@leads_blueprint.route('/<lead_id>', methods=['GET'])
def get_lead(lead_id):
    lead = fetch_lead_by_id(lead_id)
    print(lead)
    if not lead:
        return jsonify({"error": "No lead data"}), 404
    cleaned_client = clean_client_data(lead)
    return jsonify(cleaned_client)

@leads_blueprint.route('/engagement/<lead_id>', methods=['GET'])
def get_engagement(lead_id):
    raw = fetch_engagements(lead_id)
    if not raw:
        return jsonify({"error": "No engagement data"}), 404
    interactions = extract_engagement_summary(raw)
    return jsonify(interactions)

@leads_blueprint.route('/draft_email/<lead_id>', methods=['GET'])
def get_lead_email(lead_id):
    lead = fetch_lead_by_id(lead_id)
    if not lead:
        return jsonify({"error": "No lead data"}), 404
    cleaned_client = clean_client_data(lead)
    email_text = generate_intro_email(cleaned_client, {
        "name": "Jeffrey Crooks",
        "company": "Palona",
        "title": "GTM Engineer"
    })
    return jsonify({ "draftEmail": email_text })
    
@leads_blueprint.route('/draft_summary/<lead_id>', methods=['GET'])
def get_lead_interaction_summary(lead_id):
    raw = fetch_engagements(lead_id)
    if not raw:
        return jsonify({"error": "No engagement data"}), 404
    interactions = extract_engagement_summary(raw)
    summary_text = generate_contact_summary(interactions)
    return jsonify({ "draftSummary": summary_text })

@leads_blueprint.route('/recent', methods=['GET'])
def get_recent_leads():
    # Get query parameters with defaults
    limit = request.args.get('limit', default=20, type=int)
    days = request.args.get('days', default=7, type=int)
    
    # Validate and cap the parameters for safety
    limit = min(limit, 100)  # Don't allow more than 100
    days = min(days, 30)     # Don't allow more than 30 days back
    
    leads = fetch_recent_leads(limit=limit, days_back=days)
    
    if not leads:
        return jsonify({"error": "No recent leads found"}), 404
        
    # Process the results to make them more usable in the frontend
    simplified_leads = []
    for lead in leads.get("results", []):
        properties = lead.get("properties", {})
        simplified_leads.append({
            "id": lead.get("id"),
            "name": f"{properties.get('firstname', '')} {properties.get('lastname', '')}".strip(),
            "email": properties.get("email", ""),
            "company": properties.get("company", ""),
            "job_title": properties.get("jobtitle", ""),
            "created_date": properties.get("createdate", "")
        })
    
    return jsonify({"leads": simplified_leads})

def create_email(properties, associations):
    """
    Creates a new email engagement in HubSpot.
    
    Args:
        properties: Dictionary of email properties (subject, body, etc.)
        associations: Optional list of associations to link the email to contacts, companies, etc.
    
    Returns:
        Created email data or None if the request fails
    """
    url = f"{BASE_URL}/crm/v3/objects/emails"
    headers = {
        'Authorization': f"Bearer {HUBSPOT_API_KEY}",
        'Content-Type': 'application/json'
    }
    
    # Ensure hs_timestamp exists as it's required
    if 'hs_timestamp' not in properties:
        from datetime import datetime
        # Current time in milliseconds or UTC format
        properties['hs_timestamp'] = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    
    payload = {
        "properties": properties
    }
    
    # Use the correct association format from the documentation
    if associations:
        payload["associations"] = associations
    
    response = requests.post(url, headers=headers, json=payload)
    
    # Log the full request and response for debugging
    print(f"Request payload: {payload}")
    print(f"Response: {response.status_code} - {response.text}")
    
    if response.status_code == 201:  # 201 Created
        return response.json()
    else:
        print(f"Error creating email: {response.status_code} - {response.text}")
        return None

@leads_blueprint.route('/create_email/<lead_id>', methods=['POST'])
def create_email_for_contact(lead_id):
    # Get the JSON data from the request
    data = request.get_json()
    
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request format. Expected JSON data"}), 400
    
    # Extract email properties from request
    properties = data.get('properties', {})
    
    # Ensure required properties are present
    if 'hs_email_subject' not in properties or ('hs_email_text' not in properties and 'hs_email_html' not in properties):
        return jsonify({
            "error": "Missing required fields. Email must have at least a subject and either text or HTML body"
        }), 400
    
    # Set default values if not provided - hs_timestamp is REQUIRED according to docs
    if 'hs_timestamp' not in properties:
        from datetime import datetime
        # UTC format as shown in the documentation examples
        properties['hs_timestamp'] = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    
    if 'hs_email_direction' not in properties:
        # Default to outgoing email
        properties['hs_email_direction'] = 'EMAIL'
    
    # Set up associations using the correct format from the documentation
    associations = []
    
    # Add contact association
    contact_association = {
        "to": {
            "id": lead_id
        },
        "types": [
            {
                "associationCategory": "HUBSPOT_DEFINED",
                "associationTypeId": 198  # Contact to email association type
            }
        ]
    }
    associations.append(contact_association)
    
    # Add owner association if present in request
    if 'hubspot_owner_id' in properties:
        owner_id = properties.pop('hubspot_owner_id')  # Remove from properties
        owner_association = {
            "to": {
                "id": owner_id
            },
            "types": [
                {
                    "associationCategory": "HUBSPOT_DEFINED",
                    "associationTypeId": 210  # User to email association type
                }
            ]
        }
        associations.append(owner_association)
        
        # Add the owner_id as a property too
        properties['hubspot_owner_id'] = owner_id
    
    # Call the service function to create the email
    from hubspot_service import create_email
    result = create_email(properties, associations)
    
    if not result:
        return jsonify({"error": "Failed to create email"}), 500
    
    return jsonify(result), 201  # 201 Created


@leads_blueprint.route('/next_steps/<lead_id>', methods=['POST'])
def get_next_steps(lead_id):
    # Get the JSON data from the request
    data = request.get_json()
    
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request format. Expected JSON data"}), 400
    
    # Extract the draft email and summary from the request
    draft_email = data.get('draftEmail')
    draft_summary = data.get('draftSummary')
    user_info = data.get('userInfo', {})
    
    if not draft_email or not draft_summary:
        return jsonify({
            "error": "Missing required fields. Next steps generation requires both draft email and summary"
        }), 400
    
    # Get lead data for additional context
    lead = fetch_lead_by_id(lead_id)
    if not lead:
        return jsonify({"error": "No lead data"}), 404
    
    cleaned_client = clean_client_data(lead)
    
    # Get engagement data for more context
    raw_engagements = fetch_engagements(lead_id)
    interactions = []
    if raw_engagements:
        interactions = extract_engagement_summary(raw_engagements)
    
    # Generate next steps using OpenAI
    from openai_service import generate_next_steps
    next_steps = generate_next_steps(cleaned_client, interactions, draft_email, draft_summary, user_info)
    
    return jsonify({"nextSteps": next_steps})

@leads_blueprint.route('/create_note/<lead_id>', methods=['POST'])
def create_note_for_contact(lead_id):
    data = request.get_json()
    
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request format. Expected JSON data"}), 400
    
    properties = data.get('properties', {})
    
    if 'hs_note_body' not in properties:
        return jsonify({"error": "Missing required fields. Note must have body content"}), 400
    
    if 'hs_timestamp' not in properties:
        from datetime import datetime
        properties['hs_timestamp'] = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    
    associations = [
    {
        "to": {"id": lead_id},
        "types": [
            {
                "associationCategory": "HUBSPOT_DEFINED",
                "associationTypeId": 202
            }
        ]
    }
]

    
    from hubspot_service import create_note
    result = create_note(properties, associations)
    
    if not result:
        return jsonify({"error": "Failed to create note"}), 500
    
    return jsonify(result), 201

@leads_blueprint.route('/segment/<lead_id>', methods=['GET'])
def get_lead_segment_route(lead_id):
    lead = fetch_lead_by_id(lead_id)
    if not lead:
        return jsonify({"error": "No lead data"}), 404
    cleaned_client = clean_client_data(lead)
    raw_engagements = fetch_engagements(lead_id)
    interactions = []
    if raw_engagements:
        interactions = extract_engagement_summary(raw_engagements)
    category = generate_lead_segment(cleaned_client, interactions)
    return jsonify({ "segment": category })