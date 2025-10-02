# Web Search Setup Guide

## Serper API Setup

To enable web search functionality, you need to set up a Serper API key:

### 1. Get Serper API Key
1. Go to [serper.dev](https://serper.dev)
2. Sign up for a free account
3. Get your API key from the dashboard

### 2. Add API Key to Environment
Add your Serper API key to your `.env.local` file:

```bash
SERPER_API_KEY=your_api_key_here
```

### 3. Deploy to Convex
Make sure to add the environment variable to your Convex deployment:

```bash
npx convex env set SERPER_API_KEY your_api_key_here
```

## How It Works

1. **Automatic Detection**: The system detects when web search is needed based on message content
2. **Function Calling**: GPT decides to call the `web_search` function when current information is needed
3. **Google Search**: Uses Serper API to get real Google search results
4. **Rich Results**: Includes organic results, answer boxes, and knowledge graph data
5. **Seamless Integration**: Search results are fed back to GPT for comprehensive responses

## Features

- **Real-time Search**: Gets current information from Google
- **Rich Data**: Includes titles, snippets, and source URLs
- **Answer Boxes**: Direct answers when available
- **Knowledge Graph**: Additional context from Google's knowledge base
- **Error Handling**: Graceful fallback if search fails

## Testing

Try asking questions like:
- "What's the latest news about AI?"
- "Tell me about recent developments in renewable energy"
- "What's happening today in technology?"
- "Search for information about climate change"

The system will automatically use web search when it detects the need for current information!

