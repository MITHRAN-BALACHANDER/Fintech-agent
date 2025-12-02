# API Quota Management Guide

## Issue: Gemini API Quota Exceeded

The application uses Google's Gemini AI model for the trading assistant. When you see this error:

```
ERROR 429 RESOURCE_EXHAUSTED - Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests
```

This means you've hit the free tier API rate limits.

## Quick Fix Solutions

### Option 1: Switch to Stable Gemini Model (Recommended) ✅

The code has been updated to use `gemini-flash-latest` instead of `gemini-2.0-flash-exp` which has:
- **Higher quotas** (15 requests/minute vs 2 requests/minute)
- **More stable** (non-experimental)
- **Better performance**

**No action needed** - the fix is already applied!

### Option 2: Get Higher Gemini Quota

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Check your usage at [API Usage Dashboard](https://ai.google.dev/gemini-api/docs/rate-limits)
3. Options to increase quota:
   - Wait for quota reset (resets every minute)
   - Upgrade to paid tier for higher limits
   - Use multiple API keys with rotation

### Option 3: Use OpenAI as Fallback

Add OpenAI support by setting environment variable:

```bash
# In your .env file
OPENAI_API_KEY=sk-your-openai-key-here
```

Then modify agent creation to use OpenAI:
```python
platform = FintechAgentPlatform()
platform.agent_factory.model_provider = "openai"  # Switch to OpenAI
```

## What Changed

### Backend Improvements

1. **Stable Model**: Changed from experimental to production-ready model
   ```python
   # Before
   Gemini(id="gemini-2.0-flash-exp")
   
   # After
   Gemini(id="gemini-flash-latest")
   ```

2. **Retry Logic**: Automatic retries with exponential backoff
   - Waits 2s, then 4s, then 8s before giving up
   - Handles 429 errors gracefully

3. **Better Error Messages**: User-friendly messages instead of technical errors
   ```
   "Our AI service is experiencing high demand. Please try again in a few moments."
   ```

4. **Fallback Support**: Automatically falls back to OpenAI if configured

### Frontend Improvements

1. **Enhanced Error Handling**: Detects quota errors and shows helpful messages
2. **Retry Guidance**: Tells users exactly what to do
3. **User-Friendly**: Non-technical error messages

## Rate Limits Reference

| Model | Free Tier Limit | Paid Tier Limit |
|-------|----------------|-----------------|
| gemini-flash-latest | 15 RPM | 1000 RPM |
| gemini-1.5-pro | 2 RPM | 360 RPM |
| gemini-2.0-flash-exp | 2 RPM | N/A (experimental) |
| gpt-4o-mini (OpenAI) | Varies | High |

**RPM** = Requests Per Minute

## Testing the Fix

1. Restart your backend server:
   ```bash
   python start.py
   ```

2. Try sending a message in the chat interface

3. If you still see quota errors:
   - Wait 60 seconds (quotas reset every minute)
   - Check your API key at [Google AI Studio](https://aistudio.google.com/)
   - Consider adding an OpenAI API key as fallback

## Monitoring Usage

Check your current usage:
- **Gemini**: https://ai.dev/usage?tab=rate-limit
- **OpenAI**: https://platform.openai.com/usage

## Long-term Solutions

1. **Implement Request Queuing**: Queue requests when rate limited
2. **Caching**: Cache common responses to reduce API calls
3. **Load Balancing**: Distribute requests across multiple API keys
4. **Upgrade to Paid Tier**: Get significantly higher quotas

## Environment Variables

Required in `.env` file:
```bash
# Primary (Gemini)
GOOGLE_API_KEY=your-google-api-key

# Fallback (Optional but recommended)
OPENAI_API_KEY=your-openai-api-key
```

## Support

If issues persist:
1. Check logs in terminal for detailed error messages
2. Verify API keys are valid
3. Contact support with error logs
