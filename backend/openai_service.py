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

    system_message = {
            "role": "system",
            "content": "You are a helpful sales assistant who drafts summaries of previous client interactions."
        }
    user_message = {
        "role": "user",
        "content": (
            f"Lead Summary: {contact}\n"
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


def generate_contact_summary(contact):
    system_message = {
            "role": "system",
            "content": "You are a helpful sales email assistant who drafts personalized outreach emails."
        }
    user_message = {
        "role": "user",
        "content": (
            f"Lead Interactions History: {contact}\n"
            "Summarize prior communications with the lead, "
        )
    }
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[system_message, user_message],
    )
    email_text = response.choices[0].message.content
    return email_text