import os
from dotenv import load_dotenv
import google.generativeai as genai
import numpy as np
from supabase import create_client
import argparse

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# Initialize Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-2.0-flash')

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
        return result['embedding']
    except Exception as e:
        print(f"Error getting embedding: {str(e)}")
        return None

def generate_ai_content(entity_data, content_type):
    """
    Generate AI content based on entity data and content type
    
    # CUSTOMIZE: Define your content generation logic here
    # Example: For a product, you might generate a description based on features
    # Example: For a blog post, you might generate a summary
    """
    try:
        # CUSTOMIZE: Define your prompts based on content_type
        if content_type == "example_content_type":
            prompt = f"""
            Create content based on the following information:
            Name: {entity_data.get('name', 'Not provided')}
            Field1: {entity_data.get('field1', 'Not provided')}
            Field2: {entity_data.get('field2', 'Not provided')}
            
            Generate appropriate content based on this data.
            """
        else:
            raise ValueError(f"Unknown content type: {content_type}")
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        entity_name = entity_data.get('name', entity_data.get('id', 'Unknown'))
        print(f"Error generating AI content for {entity_name}: {str(e)}")
        return None

def update_single_entity_embeddings(table_name, entity_id, generate_ai=False):
    """Update embeddings for a single entity"""
    try:
        # CUSTOMIZE: Define the fields you want to select for your entity
        select_fields = "id, name"  # Add your fields here
        
        response = supabase.table(table_name).select(select_fields).eq("id", entity_id).execute()
        
        if not response.data:
            raise Exception(f"Entity with ID {entity_id} not found in {table_name}")
            
        entity = response.data[0]
        updates = {}
        
        # CUSTOMIZE: Define field-to-vector mappings for your entity
        # Format: field_to_embed: vector_field_name
        fields_to_embed = {
            # 'description': 'description_vector',
            # 'category': 'category_vector',
            # Add your fields here
        }
        
        # Generate embeddings for each text field
        for field, vector_field in fields_to_embed.items():
            if field in entity and entity[field]:
                # CUSTOMIZE: Handle special field types (arrays, objects, etc.)
                field_value = entity[field]
                if isinstance(field_value, list):
                    field_value = ' '.join(field_value)
                
                embedding = get_embedding(field_value)
                if embedding:
                    updates[vector_field] = normalize_embedding(embedding)
        
        # Generate AI content if requested
        if generate_ai:
            # CUSTOMIZE: Define the type of content to generate
            content_type = "example_content_type"
            ai_content = generate_ai_content(entity, content_type)
            
            if ai_content:
                # CUSTOMIZE: Define where to store the AI content and its vector
                content_field = "ai_content_field"
                vector_field = "ai_content_vector"
                
                updates[content_field] = ai_content
                
                ai_content_embedding = get_embedding(ai_content)
                if ai_content_embedding:
                    updates[vector_field] = normalize_embedding(ai_content_embedding)
        
        # Update entity with new embeddings
        if updates:
            supabase.table(table_name).update(updates).eq("id", entity_id).execute()
            
        return updates
            
    except Exception as e:
        print(f"Error updating embeddings for {table_name} {entity_id}: {str(e)}")
        raise e

def update_all_entity_embeddings(table_name, generate_ai=False):
    """Update embeddings for all entities in a table"""
    try:
        # CUSTOMIZE: Define the fields you want to select for your entities
        select_fields = "id, name"  # Add your fields here
        
        response = supabase.table(table_name).select(select_fields).execute()
        
        entities = response.data
        print(f"Found {len(entities)} {table_name} entities to update")
        
        for entity in entities:
            try:
                updates = update_single_entity_embeddings(table_name, entity["id"], generate_ai)
                
                # Get entity name or ID for logging
                entity_identifier = entity.get('name', entity['id'])
                
                if updates:
                    print(f"Updated {table_name} '{entity_identifier}' with vectors: {list(updates.keys())}")
                else:
                    print(f"No updates needed for {table_name} '{entity_identifier}'")
                    
            except Exception as e:
                print(f"Error updating {table_name} {entity['id']}: {str(e)}")
                continue
        
        print(f"Completed {table_name} embedding updates")
        
    except Exception as e:
        print(f"Error in update_all_entity_embeddings for {table_name}: {str(e)}")
        raise e

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Update embeddings for database entities')
    parser.add_argument('--table', type=str, required=True,
                        help='Table name to update (e.g., "products", "blog_posts")')
    parser.add_argument('--id', type=str,
                        help='ID of specific entity to update (optional)')
    parser.add_argument('--generate-ai', action='store_true', default=False,
                        help='Generate and update AI content')
    
    args = parser.parse_args()
    
    print(f"Starting embedding updates for {args.table}...")
    
    try:
        if args.id:
            print(f"Updating single {args.table} with ID {args.id}")
            update_single_entity_embeddings(args.table, args.id, args.generate_ai)
        else:
            update_all_entity_embeddings(args.table, args.generate_ai)
            
        print("Successfully completed embedding updates")
    except Exception as e:
        print(f"Error updating embeddings: {str(e)}")


#//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
# # Update all entities in a table
# python embeddings_template.py --table your_table_name

# # Update a single entity by ID
# python embeddings_template.py --table your_table_name --id entity_id

# # Generate AI content while updating
# python embeddings_template.py --table your_table_name --generate-ai