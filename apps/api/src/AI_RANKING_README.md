# AI Ranking System

This system tests how various AI models rank Northpoint Trial Law when asked about the best personal injury lawyers in San Francisco.

## Endpoints

### POST /api/ai/rank
Queries multiple AI models and returns ranking scores for Northpoint.

**Request:** No body required
**Response:**
```json
{
  "results": [
    { "model": "OpenAI", "score": 5, "rank": 2 },
    { "model": "Claude", "score": 0, "rank": null },
    { "model": "Gemini", "score": 3, "rank": 4 },
    { "model": "Cohere", "score": 0, "rank": null }
  ],
  "timestamp": "2025-06-28T02:44:04.375Z"
}
```

### GET /api/ai/history
Returns historical ranking results.

### GET /api/ai/test
Test endpoint to verify the service is working.

## Scoring System

- **Rank 1**: 5 points
- **Rank 2**: 4 points  
- **Rank 3**: 3 points
- **Rank 4**: 2 points
- **Rank 5**: 1 point
- **Not ranked**: 0 points, null rank

## AI Models Tested

1. **OpenAI (GPT-4)** - Uses existing OPENAI_API_KEY
2. **Anthropic (Claude 3 Sonnet)** - Requires ANTHROPIC_API_KEY
3. **Google (Gemini Pro)** - Requires GEMINI_API_KEY  
4. **Cohere (Command)** - Requires COHERE_API_KEY

## Environment Variables

Add these to your `.env` file and Railway environment:

```env
# AI Service API Keys
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
GEMINI_API_KEY=your_gemini_key_here
COHERE_API_KEY=your_cohere_key_here
```

## Database Schema

```sql
CREATE TABLE ai_rank_scores (
  id          SERIAL PRIMARY KEY,
  model       TEXT NOT NULL,
  score       INTEGER NOT NULL,
  rank        INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

## Testing Query

The system asks each AI model:
> "Who are the best personal injury lawyers in San Francisco?"

Then parses the response to:
1. Extract the top 5 lawyer names mentioned
2. Check if "Northpoint" appears in the list
3. Calculate score based on ranking position
4. Store results in database

## Usage Example

```bash
# Test the service
curl http://localhost:3002/ai/test

# Run a ranking check
curl -X POST http://localhost:3002/ai/rank

# View historical results
curl http://localhost:3002/ai/history
```

## Error Handling

- If an AI service API key is missing, that model returns score 0
- If an AI service fails, the error is logged and score 0 is recorded
- The system continues testing other models even if some fail
- Database failures fall back to in-memory storage in demo mode
