import os
import requests
from cache import get_cached, set_cached

HUBSPOT_API_KEY = os.getenv('HUBSPOT_KEY')
BASE_URL = 'https://api.hubapi.com'

def fetch_lead_by_id(lead_id):
    cache_key = f"lead_id_{lead_id}"
    cached_data = get_cached(cache_key)
    
    if cached_data:
        print('hit')
        return cached_data
    
    url = f"{BASE_URL}/crm/v3/objects/contacts/{lead_id}"
    headers = {'Authorization': f"Bearer {HUBSPOT_API_KEY}"}
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        set_cached(cache_key, data)
        return data
    return None

def fetch_lead_by_email(lead_email):
    cache_key = f"lead_email_{lead_email}"
    cached_data = get_cached(cache_key)
    
    if cached_data:
        print('email hit')
        return cached_data

    url = f"{BASE_URL}/crm/v3/objects/contacts/{lead_email}"
    headers = {'Authorization': f"Bearer {HUBSPOT_API_KEY}"}
    params = {"idProperty": "email", "properties": "firstname,lastname,email,jobtitle,company"}
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        data = response.json()
        set_cached(cache_key, data)
        return data
    return None

def fetch_engagements(lead_id):
    cache_key = f"engagements_{lead_id}"
    cached_data = get_cached(cache_key)
    
    if cached_data:
        print('hit engagements')
        return cached_data

    url = f"{BASE_URL}/engagements/v1/engagements/associated/contact/{lead_id}"
    headers = {'Authorization': f"Bearer {HUBSPOT_API_KEY}"}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        set_cached(cache_key, data)
        return data
    return None