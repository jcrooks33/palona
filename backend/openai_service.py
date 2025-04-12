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
            "content": "You are a helpful sales assistant who drafts introduction emails to potential clients that are tailored to their profile. Palona AI is a cutting-edge platform that empowers consumer-facing businesses to deploy emotionally intelligent, brand-aligned AI sales agents. These agents seamlessly integrate with existing systems like websites, point-of-sale (POS) systems, product catalogs, and social channels, providing 24/7 conversational ordering and customer service. Key Features:Brand Consistency: Palonas AI agents are tailored to reflect each brands unique voice and identity. For instance, Pizza My Heart utilizes Jimmy the Surfer, an AI persona that embodies their brand's character and interacts with customers via text or voice to facilitate orders. Emotional Intelligence (EQ): Built with proprietary models emphasizing high emotional intelligence, Palonas agents engage customers with empathy, humor, and persuasive communication, enhancing the overall customer experience. Multimodal Integration: The platform supports various communication channels, including SMS, chat, and direct messages, ensuring consistent and personalized interactions across all customer touchpoints.Operational Efficiency: Palonas agents boast high accuracy rates (93.3 percent for voice and 95 percent for text), reducing errors and the need for human intervention, thereby streamlining operations and improving customer satisfaction."
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
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[system_message, user_message],
        )
        email_text = response.choices[0].message.content
        return email_text
    except openai_error.OpenAIError as e:
        # Log error or raise a custom exception if desired
        raise Exception(f"Error generating introductory email: {str(e)}")
    except Exception as ex:
        raise Exception(f"Unexpected error during email generation: {str(ex)}")


def generate_contact_summary(contact):
    system_message = {
            "role": "system",
            "content": "You are an AI assistant that summarizes sales lead communications."
        }
    user_message = {
        "role": "user",
        "content": (
            f"Here is the lead’s interaction history: {contact}. Please summarize the key points of the communications with this lead in a few sentences. Focus on the leads interests, questions, and any follow-up items mentioned"
        )
    }
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[system_message, user_message],
        )
        summary_text = response.choices[0].message.content
        return summary_text
    except openai_error.OpenAIError as e:
        raise Exception(f"Error generating contact summary: {str(e)}")
    except Exception as ex:
        raise Exception(f"Unexpected error during summary generation: {str(ex)}")

def generate_next_steps(client_data, interactions, draft_email, draft_summary, user_info):
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

                Provide 2-3 specific, actionable next steps (in a numbered list) that would be appropriate to take after sending the draft email.
                These should be tailored to the lead's industry, recent interactions, and current engagement level.
                Include timeframes for when these actions should occur (e.g., "in 3 days if no response").
            """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Use the appropriate model
            messages=[
                {"role": "system", "content": "You are an expert sales assistant helping with lead engagement strategy."},
                {"role": "user", "content": prompt}
            ],
        )
        next_steps = response.choices[0].message.content.strip()
        return next_steps
    except openai_error.OpenAIError as e:
        raise Exception(f"Error generating next steps: {str(e)}")
    except Exception as ex:
        raise Exception(f"Unexpected error during next steps generation: {str(ex)}")

def generate_lead_segment(profile, interactions):
    system_message = {
        "role": "system",
        "content": ("You are an AI assistant that categorizes sales leads. Review the lead's profile and engagement history "
                    "to determine the level of interest. Classify the lead strictly as one of: 'High Intent', 'Moderate Interest', or 'Cold Lead'.")
    }
    # Build a text block from the profile
    profile_text = (
        f"Name: {profile.get('name', 'N/A')}\n"
        f"Title: {profile.get('job_title', 'N/A')}\n"
        f"Company: {profile.get('company', 'N/A')}\n"
        f"Email: {profile.get('email', 'N/A')}\n"
        f"Created Date: {profile.get('created_date', 'N/A')}"
    )
    # Assume interactions is a list of strings summarizing past engagements.
    history_text = "No engagement history." if not interactions else "\n".join(
        [f"- {item['date']}: {item['body']}" for item in interactions]
    )
    user_prompt = (
        f"Lead Profile:\n{profile_text}\n\n"
        f"Engagement History:\n{history_text}\n\n"
        "Based on the above, categorize this lead as 'High Intent', 'Moderate Interest', or 'Cold Lead'. "
        "Respond with only the category."
    )
    user_message = { "role": "user", "content": user_prompt }
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Change to your model if needed.
            messages=[system_message, user_message],
        )
        category = response.choices[0].message.content.strip()
        return category
    except openai_error.OpenAIError as e:
        raise Exception(f"Error generating lead segment: {str(e)}")
    except Exception as ex:
        raise Exception(f"Unexpected error during lead segmentation: {str(ex)}")