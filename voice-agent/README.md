# AjayBot Voice Agent

This is the LiveKit Agents backend for AjayBot's realtime voice mode.

## Local run

Create a Python environment, install the requirements, copy `.env.example` to `.env`, fill in the LiveKit and Google credentials, then run:

```bash
python agent.py dev
```

The dispatch name is `ajaybot-voice` by default.

## Production

Deploy this agent to LiveKit Cloud as a LiveKit Agent deployment. The AjayBot web backend issues user-specific LiveKit access tokens and includes a dispatch for `ajaybot-voice`.

The Gemini Live plugin uses the `GOOGLE_API_KEY` environment variable and the native-audio realtime model configured in `GEMINI_LIVE_MODEL`.
