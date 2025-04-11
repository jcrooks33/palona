from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_KEY')

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable not set.")

client = OpenAI(api_key=OPENAI_API_KEY)

def generate_intro_email(contact, user_info):
    user_name = user_info.get("name")
    user_company = user_info.get("company")
    user_title = user_info.get("title")

    contact_name = contact.get("name")
    contact_company = contact.get("company")
    contact_title = contact.get("title")

    system_message = {
            "role": "system",
            "content": "You are a helpful sales email assistant who drafts personalized outreach emails."
        }
    user_message = {
        "role": "user",
        "content": (
            f"Lead Name: {contact_name}\n"
            f"Lead Company: {contact_company}\n"
            f"Lead Title: {contact_title}\n\n"
            f"User Name: {user_name}\n"
            f"User Company: {user_company}\n"
            f"User Title: {user_title}\n\n"
            "Draft a concise, friendly introductory sales email to this lead, "
            "highlighting how our product can benefit their company. "
            "Include a call-to-action to schedule a call."
        )
    }
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[system_message, user_message],
    )
    email_text = response.choices[0].message.content
    return email_text


contact_info = {"name": "Jane Doe", "company": "Acme Corp", "title": "Operations Manager"}
user_info = {"name": "Jeffrey Crooks", "company": "Palona", "title": "GTM Engineer"}
email = generate_intro_email(contact_info, user_info)
print(email)
