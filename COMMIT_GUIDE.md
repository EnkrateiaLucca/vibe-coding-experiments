# Commit Message Guide for Vibe Coding Experiments

## Including AI Conversation Links in Commits

When adding new HTML experiments, include the conversation link in your commit message so it appears in the colophon. The `gather_links.py` script will automatically extract any URLs from commit messages.

### Format for Commit Messages

```bash
git add your-new-experiment.html
git commit -m "Add [experiment name]: [brief description]

Created with [AI tool] conversation: [URL]
Optional: Additional details about the experiment"
```

### Examples

#### For Claude Conversations
```bash
git commit -m "Add rainbow spinner: Animated CSS loading indicator

Created with Claude conversation: https://claude.ai/chat/abc123def456
Features smooth color transitions and customizable speed"
```

#### For ChatGPT Conversations
```bash
git commit -m "Add todo list app: Simple task manager with local storage

Built with ChatGPT: https://chat.openai.com/share/xyz789abc123
Includes add/remove tasks and persistence across sessions"
```

#### For GitHub Gists (if you save the conversation)
```bash
git commit -m "Add canvas particles: Interactive particle system

Conversation transcript: https://gist.github.com/yourusername/abc123def456
Mouse-following particles with physics simulation"
```

### Tips

1. **Share/Export Conversations First**
   - Claude: Use the share feature to get a public link
   - ChatGPT: Use the share button to create a shareable link
   - Or save the conversation to a GitHub Gist

2. **Multiple Links**: You can include multiple URLs if you used multiple conversations:
   ```bash
   git commit -m "Add data visualizer: D3.js chart generator
   
   Initial design: https://claude.ai/chat/abc123
   Refinements: https://chat.openai.com/share/xyz789
   Bug fixes: https://claude.ai/chat/def456"
   ```

3. **Updating Existing Files**: When modifying an experiment, reference the new conversation:
   ```bash
   git commit -m "Update particle animation: Add gravity and collision

   Enhancement conversation: https://claude.ai/chat/newchat123
   Adds realistic physics and boundary detection"
   ```

### What Happens Next

The build process will:
1. Extract all URLs from your commit messages
2. Display them in the colophon page alongside the commit info
3. Make them clickable links so others can see how you built each experiment

### Example Workflow

```bash
# 1. Create your HTML file with an AI assistant
# 2. Save/share the conversation and get the URL
# 3. Add and commit with the URL included:

git add amazing-animation.html
git commit -m "Add amazing animation: 3D rotating cube with shadows

Created with Claude: https://claude.ai/chat/conversation-id-here
Uses CSS transforms and animations for smooth 3D effects"

git push origin main
```

The colophon will then show your experiment with the commit message and clickable conversation link!