from flask import Blueprint, jsonify, request
from hubspot_service import fetch_lead_by_id, fetch_lead_by_email, fetch_engagements
from ai_service import extract_engagement_summary, clean_client_data
from openai_service import generate_intro_email, generate_contact_summary

leads_blueprint = Blueprint('leads', __name__)



@leads_blueprint.route('/<lead_id>', methods=['GET'])
def get_lead(lead_id):
    lead = fetch_lead_by_id(lead_id)
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
    return jsonify(generate_intro_email(cleaned_client, {"name": "Jeffrey Crooks", "company": "Palona", "title": "GTM Engineer"}))
    
@leads_blueprint.route('/draft_summary/<lead_id>', methods=['GET'])
def get_lead_interaction_summary(lead_id):
    raw = fetch_engagements(lead_id)
    if not raw:
        return jsonify({"error": "No engagement data"}), 404
    interactions = extract_engagement_summary(raw)
    return jsonify(generate_contact_summary(interactions))