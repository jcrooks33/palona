# cache.py
from datetime import datetime, timedelta

# Simple in-memory cache
cache = {}

def get_cached(key):
    if key in cache:
        item = cache[key]
        # Check if cache is expired
        if datetime.now() < item['expiry']:
            return item['data']
        else:
            # Remove expired item
            del cache[key]
    return None

def set_cached(key, data, expire_minutes=15):
    cache[key] = {
        'data': data,
        'expiry': datetime.now() + timedelta(minutes=expire_minutes)
    }

def clear_cache(key_prefix=None):
    if key_prefix:
        keys_to_delete = [k for k in cache.keys() if k.startswith(key_prefix)]
        for key in keys_to_delete:
            del cache[key]
    else:
        cache.clear()