# OpenAI Reference API Web Search Implementation

## Overview
This implementation adds OpenAI Reference API support for web searching when GPT answers prompts. The system now uses OpenAI's built-in `web_search` tool instead of the previous DuckDuckGo implementation.

## Changes Made

### 1. Updated Model Mapping
- Changed from `gpt-4.1` to `gpt-4o` and `gpt-4o-mini` to support the tools API
- Models now properly support the `web_search` tool

### 2. Enhanced API Functions
- **`callOpenAI`**: Added `enableWebSearch` parameter to conditionally include web search tools
- **`callOpenAIStream`**: Added `enableWebSearch` parameter for streaming responses with web search
- Both functions now include the `tools` parameter when web search is enabled

### 3. Smart Web Search Detection
- **`shouldEnableWebSearch`**: New helper function that analyzes user messages to determine if web search should be enabled
- Triggers on keywords like: "search", "current", "recent", "latest", "news", "today", "what is", "who is", etc.

### 4. Updated Actions
- **`complete`**: Now uses the new web search functionality
- **`completeStream`**: Now uses the new web search functionality for streaming responses
- Removed the old DuckDuckGo web search implementation

## How It Works

1. **Detection**: When a user sends a message, the system checks if it contains keywords that suggest a need for current information
2. **Tool Activation**: If web search is needed, the `web_search` tool is added to the OpenAI API request
3. **AI Response**: OpenAI's GPT model automatically uses the web search tool when appropriate and incorporates the results into its response
4. **Seamless Integration**: Users don't need to explicitly request web search - it happens automatically when the AI determines it's needed

## Testing the Implementation

### Test Cases to Try:
1. **Current Events**: "What's the latest news about AI?"
2. **Recent Information**: "Tell me about recent developments in renewable energy"
3. **Current Date**: "What's happening today in technology?"
4. **Search Queries**: "Search for information about climate change"
5. **General Questions**: "What is the current status of space exploration?"

### Expected Behavior:
- Messages containing web search triggers should automatically enable web search
- The AI should provide more current and accurate information
- Web search results should be seamlessly integrated into responses
- No manual intervention required from users

## API Reference

### OpenAI Tools Parameter
```json
{
  "tools": [
    {
      "type": "web_search"
    }
  ]
}
```

### Web Search Triggers
The system automatically enables web search when messages contain:
- "search", "current", "recent", "latest", "news", "today"
- "2024", "2025" (current years)
- Question words: "what is", "who is", "when did", "where is", "how does"
- Action words: "explain", "tell me about"
- Web-related terms: "internet", "web", "online"

## Benefits

1. **More Accurate Information**: Access to current, real-time data
2. **Better User Experience**: Automatic detection and activation
3. **Seamless Integration**: No changes needed to user interface
4. **Reliable Source**: Uses OpenAI's official web search tool
5. **Cost Effective**: Leverages OpenAI's infrastructure

## Migration Notes

- The old DuckDuckGo web search implementation has been removed
- All existing functionality remains the same from a user perspective
- Web search now happens automatically when appropriate
- No breaking changes to the API interface

