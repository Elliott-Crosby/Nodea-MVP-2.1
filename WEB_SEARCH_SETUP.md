# Web Search Setup Guide

## OpenAI Web Search

Nodea now uses OpenAI's native web search functionality, which is built directly into the GPT models.

### 1. OpenAI API Key
Make sure you have your OpenAI API key set in your Convex environment:

```bash
npx convex env set CONVEX_OPENAI_API_KEY your_openai_api_key_here
```

## How It Works

1. **Automatic Detection**: The system detects when web search is needed based on message content
2. **Native Integration**: Uses OpenAI's built-in web search tool
3. **Real-time Results**: Gets current information from the web
4. **Seamless Integration**: Search results are automatically incorporated into responses

## Features

- **Real-time Search**: Gets current information from the web
- **Native Integration**: Uses OpenAI's official web search tool
- **Automatic Detection**: No need to explicitly request web search
- **Citation Support**: Includes source URLs in responses
- **Error Handling**: Graceful fallback if search fails

## Testing

Try asking questions like:
- "What's the latest news about AI?"
- "Tell me about recent developments in renewable energy"
- "What's happening today in technology?"
- "Search for information about climate change"

The system will automatically use web search when it detects the need for current information!

## Security

- All web search requests are handled server-side only
- Rate limiting prevents abuse
- User authentication required for all operations

