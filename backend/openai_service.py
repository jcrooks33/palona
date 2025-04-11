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

def generate_next_steps(client_data, interactions, draft_email, draft_summary, user_info):
    """
    Generate recommended next steps for lead engagement based on all available context
    
    Args:
        client_data: Cleaned lead/client data
        interactions: List of previous interactions with the lead
        draft_email: The draft email that was generated
        draft_summary: The interaction summary that was generated
        user_info: Information about the user making the request
        
    Returns:
        String containing recommended next steps
    """
    
    # Construct the prompt for OpenAI
    print('hit')
    prompt = f"""
                Based on the following information about a sales lead, their engagement history, and a recent draft email,
                suggest 2-3 concrete next steps for follow-up and engagement with this lead.

                CLIENT INFORMATION:
                {client_data}

                INTERACTION HISTORY SUMMARY:
                {draft_summary}

                RECENT DRAFT EMAIL:
                {draft_email}

                USER INFO:
                {user_info}

                Provide 2-3 specific, actionable next steps that would be appropriate to take after sending the draft email.
                These should be tailored to the lead's industry, recent interactions, and current engagement level.
                Include timeframes for when these actions should occur (e.g., "in 3 days if no response").
            """

    # Call the OpenAI API
    response = client.chat.completions.create(
        model="gpt-4",  # Use the appropriate model
        messages=[
            {"role": "system", "content": "You are an expert sales assistant helping with lead engagement strategy."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=500
    )
    
    # Extract and return the generated next steps
    next_steps = response.choices[0].message.content.strip()
    return next_steps