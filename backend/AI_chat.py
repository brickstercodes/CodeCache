import os
import sys
import json
from dotenv import load_dotenv
import google.generativeai as genai
from supabase import create_client
import base64

# Load environment variables
load_dotenv()

# Initialize Supabase client
try:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        raise ValueError("Missing Supabase environment variables (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)")
        
    supabase = create_client(supabase_url, supabase_key)
except Exception as e:
    print(f"Error initializing Supabase client: {str(e)}", file=sys.stderr)
    sys.exit(1)

# Initialize Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-2.0-flash')

def generate_tags(code_snippet, language, title, description):
    """Generate relevant tags for a code snippet."""
    try:
        prompt = f"""Given a code snippet and its metadata:

Title: {title}
Language: {language}
Description: {description}
Code:
{code_snippet}

Generate 3-7 relevant tags for this code snippet. Consider:
1. The primary functionality or purpose
2. Key technologies, frameworks, or libraries used
3. Common use cases or patterns implemented
4. Technical concepts demonstrated

Format your response as a JSON array of lowercase, hyphenated strings. Example:
["react-hooks", "state-management", "form-handling"]"""

        response = model.generate_content(prompt)
        try:
            # Try to parse as JSON array
            tags = json.loads(response.text.strip())
            if isinstance(tags, list):
                return tags
        except:
            # If JSON parsing fails, try to extract tags from text
            text = response.text.strip().lower()
            if '[' in text and ']' in text:
                tags_str = text[text.find('[')+1:text.find(']')]
                tags = [t.strip().strip('"\'') for t in tags_str.split(',')]
                return tags
            
        return None
    except Exception as e:
        print(f"Error generating tags: {str(e)}", file=sys.stderr)
        return None

def generate_ai_bio(code_snippet, language, title, description):
    """Generate an AI bio for a code snippet."""
    try:
        prompt = f"""Given a code snippet and its metadata:

Title: {title}
Language: {language}
Description: {description}
Code:
```{language}
{code_snippet}
```

Generate a concise but informative technical description (2-3 sentences) that:
1. Explains what the code does at a technical level
2. Highlights any notable patterns, best practices, or potential use cases
3. Mentions any important technical considerations or dependencies

Focus on being precise and technical rather than general or marketing-focused."""

        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error generating AI bio: {str(e)}", file=sys.stderr)
        return None

def get_template_recommendation(project_description):
    """Get template recommendations based on project description."""
    try:
        # Get all templates from the database
        response = supabase.table("code_templates").select("*").execute()
        templates = response.data

        if not templates:
            return json.dumps({
                "hasMatches": False,
                "message": "I don't have any templates in the library yet, but I'd love to help you find what you need! What kind of code are you working with? For example:\n- What programming language are you using?\n- What functionality are you trying to implement?\n- Are you working on a specific framework or technology?",
                "recommendations": []
            })

        # Create a prompt for Gemini
        templates_json = json.dumps([{
            'id': str(t['id']),
            'title': str(t['title']),
            'description': str(t['description']),
            'language': str(t['language']),
            'tags': t['tags'] if isinstance(t['tags'], list) else []
        } for t in templates], indent=2)

        prompt = f"""You are a helpful coding assistant helping users find relevant code templates. The user's request is: {json.dumps(project_description)}

Available templates:
{templates_json}

Your task is to:
1. If the user's request is brief or unclear, ask specific questions to better understand their needs while mentioning relevant template categories we have.
2. If you understand their needs but don't have exact matches, suggest related templates that might be helpful and explain how they could be adapted.
3. If you have relevant matches, recommend up to 3 most suitable templates with clear explanations.

Format your response as a JSON object:
{{
    "hasMatches": boolean,
    "message": "Your response should be conversational and helpful. For unclear requests, ask specific questions about their project. For no matches, acknowledge their need and suggest alternatives. For matches, explain why each template is relevant.",
    "recommendations": [
        {{
            "id": "template_id",
            "title": "template_title",
            "reason": "Clear explanation of why this template is relevant and how it can help"
        }}
    ]
}}

Examples of good responses:
1. For "hi": "Welcome! I can help you find code templates. What kind of project are you working on? For example, we have templates for [mention 2-3 popular categories from available templates]. Let me know your programming language and what functionality you're looking for!"
2. For vague requests: "I see you're interested in [topic]. To find the best templates, could you tell me: 1) What programming language you're using? 2) [relevant follow-up based on their request]? We have several templates that might help once I know more."

Keep responses friendly, specific to available templates, and focused on helping users find or adapt relevant code."""

        # Get recommendation from Gemini
        response = model.generate_content(prompt)
        
        try:
            # Clean up the response text to handle potential markdown formatting
            clean_text = response.text.strip()
            if clean_text.startswith('```json'):
                clean_text = clean_text[7:]
            if clean_text.endswith('```'):
                clean_text = clean_text[:-3]
            
            # Ensure the response is valid JSON
            result = json.loads(clean_text.strip())
            return json.dumps(result)
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {str(e)}\nResponse text: {response.text}", file=sys.stderr)
            return json.dumps({
                "hasMatches": False,
                "message": "I'm here to help you find the right code templates! Could you tell me more about your project?\n\n1. What programming language are you using?\n2. What kind of functionality are you looking to implement?\n3. Are you working with any specific frameworks or technologies?",
                "recommendations": []
            })

    except Exception as e:
        print(f"Error in get_template_recommendation: {str(e)}", file=sys.stderr)
        return json.dumps({
            "hasMatches": False,
            "message": "I'm here to help, but I encountered a temporary issue. Could you tell me more about what you're looking for?\n\n- What programming language are you using?\n- What functionality do you need?\n- Any specific frameworks or technologies?",
            "recommendations": []
        })

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide command: 'recommend <project_description>', 'bio <title> <language> <description> <code>', or 'tags <title> <language> <description> <code>'", file=sys.stderr)
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "recommend":
        if len(sys.argv) < 3:
            print("Please provide a project description", file=sys.stderr)
            sys.exit(1)
        # Decode the base64-encoded project description
        try:
            encoded_description = sys.argv[2]
            project_description = base64.b64decode(encoded_description).decode('utf-8')
            recommendation = get_template_recommendation(project_description)
            print(recommendation)
        except Exception as e:
            print(f"Error decoding project description: {str(e)}", file=sys.stderr)
            sys.exit(1)
    elif command == "bio":
        if len(sys.argv) < 6:
            print("Please provide title, language, description, and code", file=sys.stderr)
            sys.exit(1)
        title = sys.argv[2]
        language = sys.argv[3]
        description = sys.argv[4]
        code = sys.argv[5]
        bio = generate_ai_bio(code, language, title, description)
        if bio:
            print(json.dumps({"bio": bio}))
        else:
            sys.exit(1)
    elif command == "tags":
        if len(sys.argv) < 6:
            print("Please provide title, language, description, and code", file=sys.stderr)
            sys.exit(1)
        title = sys.argv[2]
        language = sys.argv[3]
        description = sys.argv[4]
        code = sys.argv[5]
        tags = generate_tags(code, language, title, description)
        if tags:
            print(json.dumps({"tags": tags}))
        else:
            sys.exit(1)
    else:
        print("Invalid command. Use 'recommend', 'bio', or 'tags'", file=sys.stderr)
        sys.exit(1)