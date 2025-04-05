import os
import sys
import json
import argparse
from dotenv import load_dotenv
import google.generativeai as genai
from supabase import create_client
import numpy as np

# Load environment variables
load_dotenv()

# Initialize Supabase client
try:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Use service role key
    
    if not supabase_url or not supabase_key:
        raise ValueError("Missing Supabase environment variables (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)")
        
    supabase = create_client(supabase_url, supabase_key)
except Exception as e:
    print(f"Error initializing Supabase client: {str(e)}", file=sys.stderr)
    sys.exit(1)

# Initialize Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def normalize_embedding(embedding):
    """Normalize embedding vector using L2 normalization"""
    embedding_array = np.array(embedding)
    norm = np.linalg.norm(embedding_array)
    if norm == 0:
        return embedding_array.tolist()
    return (embedding_array / norm).tolist()

def get_embedding(text):
    """Get embedding for text using Gemini API"""
    if not text:
        return None
    try:
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document",
            title="Embedding of text"
        )
        return normalize_embedding(result['embedding'])
    except Exception as e:
        print(f"Error getting embedding: {str(e)}", file=sys.stderr)
        return None

def update_template_embedding(template_id, code_snippet):
    """Update embeddings for a single code template."""
    try:
        # Generate embedding for the code snippet
        embedding = get_embedding(code_snippet)
        if embedding:
            # Update the template with the new embedding
            updates = {"embedding": embedding}
            supabase.table("code_templates").update(updates).eq("id", template_id).execute()
            print(f"Updated embedding for template ID {template_id}")
        else:
            print(f"Failed to generate embedding for template ID {template_id}", file=sys.stderr)
            sys.exit(1)
    except Exception as e:
        print(f"Error updating embedding for template {template_id}: {str(e)}", file=sys.stderr)
        sys.exit(1)

def get_search_embedding(query):
    """Generate embedding for a search query."""
    try:
        embedding = get_embedding(query)
        if embedding:
            print(json.dumps(embedding))
        else:
            print("Failed to generate search embedding", file=sys.stderr)
            sys.exit(1)
    except Exception as e:
        print(f"Error generating search embedding: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generate and update embeddings')
    parser.add_argument('--query', help='Search query to generate embedding for')
    parser.add_argument('template_id', nargs='?', help='Template ID to update')
    parser.add_argument('code_snippet', nargs='?', help='Code snippet for embedding')
    
    args = parser.parse_args()
    
    if args.query:
        get_search_embedding(args.query)
    elif args.template_id and args.code_snippet:
        update_template_embedding(args.template_id, args.code_snippet)
    else:
        print("Invalid arguments. Use --query for search or provide template_id and code_snippet for updates.", file=sys.stderr)
        sys.exit(1)
