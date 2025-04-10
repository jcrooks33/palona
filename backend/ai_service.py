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
