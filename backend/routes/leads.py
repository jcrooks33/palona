from flask import Blueprint, jsonify, request
from hubspot_service import fetch_lead_by_id, fetch_lead_by_email, fetch_engagements
from ai_service import extract_engagement_summary, clean_client_data

leads_blueprint = Blueprint('leads', __name__)

@leads_blueprint.route('/<lead_id>', methods=['GET'])
def get_lead(lead_id):
    lead = fetch_lead_by_id(lead_id)
    return jsonify(lead or {"error": "Lead not found"})

@leads_blueprint.route('/email/<email>', methods=['GET'])
def get_lead_by_email(email):
    lead = fetch_lead_by_email(email)
    if not lead:
        return jsonify({"error": "No lead data"}), 404
    cleaned_client = clean_client_data(lead)
    return cleaned_client

@leads_blueprint.route('/engagement/<lead_id>', methods=['GET'])
def get_engagement(lead_id):
    raw = fetch_engagements(lead_id)
    if not raw:
        return jsonify({"error": "No engagement data"}), 404
    interactions = extract_engagement_summary(raw)
    return interactions