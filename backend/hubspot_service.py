import os
import requests

HUBSPOT_API_KEY = os.getenv('HUBSPOT_KEY')
BASE_URL = 'https://api.hubapi.com'

def fetch_lead_by_id(lead_id):
    url = f"{BASE_URL}/crm/v3/objects/contacts/{lead_id}"
    headers = {'Authorization': f"Bearer {HUBSPOT_API_KEY}"}
    response = requests.get(url, headers=headers)
    return response.json() if response.status_code == 200 else None

def fetch_lead_by_email(lead_email):
    url = f"{BASE_URL}/crm/v3/objects/contacts/{lead_email}"
    headers = {'Authorization': f"Bearer {HUBSPOT_API_KEY}"}
    params = {"idProperty": "email", "properties": "firstname,lastname,email,jobtitle,company"}
    response = requests.get(url, headers=headers, params=params)
    return response.json() if response.status_code == 200 else None

def fetch_engagements(lead_id):
    url = f"{BASE_URL}/engagements/v1/engagements/associated/contact/{lead_id}"
    headers = {'Authorization': f"Bearer {HUBSPOT_API_KEY}"}
    response = requests.get(url, headers=headers)
    return response.json() if response.status_code == 200 else None