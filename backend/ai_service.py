from datetime import datetime

def extract_engagement_summary(data):
    interactions = []

    for item in data.get("results", []):
        type_ = item["engagement"].get("type", "UNKNOWN")
        timestamp = item["engagement"].get("timestamp")
        date = datetime.fromtimestamp(timestamp / 1000).strftime('%Y-%m-%d')

        # Choose the best available text field based on type
        body = (
            item["engagement"].get("bodyPreview") or
            item.get("metadata", {}).get("text") or
            item.get("metadata", {}).get("body") or
            "[No Content]"
        )

        # Clean up HTML if necessary
        if "<" in body:
            import re
            body = re.sub("<[^<]+?>", "", body)  # strip HTML tags

        interactions.append(f"[{type_}] {date}: {body.strip()}")

    return interactions


def clean_client_data(data):
    # Retrieve basic fields from the root of the JSON
    contact_id = data.get("id", "[No ID]")
    archived = data.get("archived", False)
    
    # Parse createdAt and updatedAt, converting ISO string to 'YYYY-MM-DD'
    created_at = data.get("createdAt", "")
    updated_at = data.get("updatedAt", "")
    try:
        created_date = datetime.fromisoformat(created_at.rstrip("Z")).strftime('%Y-%m-%d')
    except Exception:
        created_date = created_at  # fallback to original value if parsing fails

    try:
        updated_date = datetime.fromisoformat(updated_at.rstrip("Z")).strftime('%Y-%m-%d')
    except Exception:
        updated_date = updated_at  # fallback to original value if parsing fails

    # Retrieve properties from the nested 'properties' field
    properties = data.get("properties", {})
    company = properties.get("company", "[No Company]")
    email = properties.get("email", "[No Email]")
    firstname = properties.get("firstname", "[No First Name]")
    lastname = properties.get("lastname", "[No Last Name]")
    jobtitle = properties.get("jobtitle", "[No Job Title]")

    # Create a structured JSON object
    client_json = {
        "contact_id": contact_id,
        "archived": archived,
        "created_date": created_date,
        "updated_date": updated_date,
        "name": f"{firstname} {lastname}",
        "email": email,
        "company": company,
        "job_title": jobtitle
    }
    
    return client_json