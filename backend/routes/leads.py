from flask import Blueprint, jsonify, request
from hubspot_service import fetch_lead_by_id, fetch_lead_by_email, fetch_engagements, fetch_recent_leads
from ai_service import extract_engagement_summary, clean_client_data
from openai_service import generate_intro_email, generate_contact_summary

leads_blueprint = Blueprint('leads', __name__)



@leads_blueprint.route('/<lead_id>', methods=['GET'])
def get_lead(lead_id):
    lead = fetch_lead_by_id(lead_id)
    print(lead)
    if not lead:
        return jsonify({"error": "No lead data"}), 404
    cleaned_client = clean_client_data(lead)
    return jsonify(cleaned_client)

@leads_blueprint.route('/email/<email>', methods=['GET'])
def get_lead_by_email(email):
    lead = fetch_lead_by_email(email)
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