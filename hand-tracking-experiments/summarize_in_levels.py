import ollama
import json

def get_summary_level(text, level):
    prompts = {
        'tldr': 'Provide a one-sentence TLDR summary.',
        'headline': 'Create a headline-style summary (5-7 words).',
        'micro': 'Summarize in 2-3 bullet points.',
        'mini': 'Write a 2-3 sentence summary.',
        'brief': 'Create a 3-4 sentence summary.',
        'concise': 'Write a 4-5 sentence summary.',
        'standard': 'Provide a 5-7 sentence summary.',
        'detailed': 'Write a 7-9 sentence summary.',
        'comprehensive': 'Create a 9-11 sentence summary.',
        'full': 'Write a complete summary (12+ sentences).'
    }
    
    response = ollama.chat(model='gemma3', messages=[
        {
            'role': 'system',
            'content': f'You are a summarization engine. {prompts[level]}'
        },
        {
            'role': 'user',
            'content': text
        }
    ])
    return response['message']['content'].strip()

def main():
    # Read the article from file
    with open('file.txt', 'r', encoding='utf-8') as f:
        article = f.read()
    
    # Generate summaries for each level
    summaries = {}
    for level in ['tldr', 'headline', 'micro', 'mini', 'brief', 
                 'concise', 'standard', 'detailed', 'comprehensive', 'full']:
        summaries[level] = get_summary_level(article, level)
    
    # Save to JSON file
    with open('summaries.json', 'w', encoding='utf-8') as f:
        json.dump(summaries, f, indent=2)

if __name__ == '__main__':
    main()