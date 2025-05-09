import os
import requests
from cache import get_cached, set_cached
import time
from datetime import datetime, timedelta

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


def fetch_recent_leads(limit=100, days_back=7):
    url = f"{BASE_URL}/crm/v3/objects/contacts/search"
    headers = {
        'Authorization': f"Bearer {HUBSPOT_API_KEY}",
        'Content-Type': 'application/json'
    }
    
    days_ago = datetime.now() - timedelta(days=days_back)
    timestamp = int(days_ago.timestamp() * 1000)
    
    payload = {
        "filterGroups": [
            {
                "filters": [
                    {
                        "propertyName": "createdate",
                        "operator": "GTE",
                        "value": str(timestamp)
                    }
                ]
            }
        ],
        "sorts": [
            {
                "propertyName": "createdate",
                "direction": "DESCENDING"
            }
        ],
        "properties": [
            "firstname", 
            "lastname", 
            "email", 
            "company",
            "jobtitle",
            "createdate",
            "hs_object_id"
        ],
        "limit": limit
    }

    cache_key = f"recent_leads_{days_back}_{limit}"
    cached_data = get_cached(cache_key)
    
    if cached_data:
        return cached_data
        
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        data = response.json()
        set_cached(cache_key, data, expire_minutes=5)
        return data
    else:
        print(f"Error fetching recent leads: {response.status_code} - {response.text}")
        return None

def create_email(properties, associations):
    url = f"{BASE_URL}/crm/v3/objects/emails"
    headers = {
        'Authorization': f"Bearer {HUBSPOT_API_KEY}",
        'Content-Type': 'application/json'
    }
    
    payload = {
        "properties": properties
    }
    
    if associations:
        payload["associations"] = associations
    
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 201:  # 201 Created
        return response.json()
    else:
        print(f"Error creating email: {response.status_code} - {response.text}")
        return None

def create_note(properties, associations):
    url = f"{BASE_URL}/crm/v3/objects/notes"
    headers = {
        'Authorization': f"Bearer {HUBSPOT_API_KEY}",
        'Content-Type': 'application/json'
    }
    
    if 'hs_timestamp' not in properties:
        from datetime import datetime
        properties['hs_timestamp'] = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    
    payload = {
        "properties": properties
    }
    
    if associations:
        payload["associations"] = associations
    
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 201:  
        return response.json()
    else:
        print(f"Error creating note: {response.status_code} - {response.text}")
        return None