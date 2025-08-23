#!/usr/bin/env python3
import os
from pathlib import Path
from datetime import datetime
import html

def extract_title(html_content, filename):
    """Extract title from HTML content or use filename as fallback."""
    import re
    title_match = re.search(r'<title>(.*?)</title>', html_content, re.IGNORECASE | re.DOTALL)
    if title_match:
        return html.escape(title_match.group(1).strip())
    # Fallback to filename without extension, replace hyphens/underscores with spaces
    return filename.replace('.html', '').replace('-', ' ').replace('_', ' ').title()

def get_file_modified_time(filepath):
    """Get the last modified time of a file."""
    return os.path.getmtime(filepath)

def build_index():
    """Build an index.html page listing all HTML files in the directory."""
    current_dir = Path.cwd()
    
    # Find all HTML files except index.html and colophon.html
    html_files = [f for f in current_dir.glob('*.html') 
                  if f.name not in ['index.html', 'colophon.html']]
    
    if not html_files:
        print("No HTML files found to index.")
        return
    
    # Sort by modification time (newest first)
    html_files.sort(key=lambda x: get_file_modified_time(x), reverse=True)
    
    # Build the HTML content
    html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vibe Coding Experiments</title>
    <style>
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem 1rem;
            background: #f5f5f5;
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #0066cc;
            padding-bottom: 0.5rem;
            margin-bottom: 2rem;
        }
        .subtitle {
            color: #666;
            font-size: 1.1rem;
            margin-top: -1.5rem;
            margin-bottom: 2rem;
        }
        .experiments-grid {
            display: grid;
            gap: 1.5rem;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }
        .experiment-card {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .experiment-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .experiment-title {
            margin: 0 0 0.5rem 0;
            font-size: 1.2rem;
        }
        .experiment-title a {
            color: #0066cc;
            text-decoration: none;
        }
        .experiment-title a:hover {
            text-decoration: underline;
        }
        .experiment-date {
            color: #999;
            font-size: 0.9rem;
        }
        .experiment-filename {
            color: #666;
            font-family: monospace;
            font-size: 0.85rem;
            margin-top: 0.5rem;
        }
        .nav-links {
            margin-bottom: 2rem;
            padding: 1rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .nav-links a {
            color: #0066cc;
            text-decoration: none;
            margin-right: 1.5rem;
        }
        .nav-links a:hover {
            text-decoration: underline;
        }
        .stats {
            margin: 2rem 0;
            padding: 1rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
            color: #666;
        }
        @media (max-width: 600px) {
            body {
                padding: 1rem 0.5rem;
            }
            .experiments-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <h1>Vibe Coding Experiments</h1>
    <p class="subtitle">A collection of HTML/JavaScript experiments built through AI-assisted coding</p>
    
    <div class="nav-links">
        <a href="colophon.html">View Colophon (Commit History)</a>
        <a href="https://github.com/EnkrateiaLucca/vibe-coding-experiments">GitHub Repository</a>
    </div>
    
    <div class="stats">
        <strong>''' + str(len(html_files)) + '''</strong> experiments and counting...
    </div>
    
    <div class="experiments-grid">
'''
    
    # Add each HTML file as a card
    for html_file in html_files:
        # Read file to extract title
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
                title = extract_title(content, html_file.name)
        except Exception as e:
            print(f"Error reading {html_file.name}: {e}")
            title = html_file.name.replace('.html', '').replace('-', ' ').replace('_', ' ').title()
        
        # Get modification date
        mod_time = datetime.fromtimestamp(get_file_modified_time(html_file))
        formatted_date = mod_time.strftime('%B %d, %Y')
        
        html_content += f'''
        <div class="experiment-card">
            <h2 class="experiment-title">
                <a href="{html_file.name}">{title}</a>
            </h2>
            <div class="experiment-date">Last modified: {formatted_date}</div>
            <div class="experiment-filename">{html_file.name}</div>
        </div>
'''
    
    html_content += '''
    </div>
    
    <div style="margin-top: 3rem; text-align: center; color: #999; font-size: 0.9rem;">
        <p>Built with vibe coding • Powered by AI assistance</p>
    </div>
</body>
</html>
'''
    
    # Write the index.html file
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"Index page built successfully with {len(html_files)} experiments")

if __name__ == "__main__":
    build_index()