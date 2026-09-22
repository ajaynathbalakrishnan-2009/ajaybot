# AjayBot Voice Agent

This directory contains the LiveKit Agents Python service used by AjayBot's realtime voice mode.

## Local development

From the repository:

```powershell
cd voice-agent
powershell -ExecutionPolicy Bypass -File .\\run-dev.ps1
```

The direct LiveKit command is:

```powershell
lk agent dev
```

For a fast local audio test without joining a LiveKit room:

```powershell
lk agent console
```

The agent reads `GOOGLE_API_KEY`, `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` from the private project `.env` when running locally.

## Production deployment

The public AjayBot website dispatches `ajaybot-voice` to the **production** LiveKit Cloud deployment. A local `lk agent dev` process is only for development.

From this directory:

```powershell
powershell -ExecutionPolicy Bypass -File .\\deploy-production.ps1
```

The first run creates the production agent and generates `livekit.toml`. Later runs deploy a new production version from the same configuration.

LiveKit Cloud does not include `.env.*` files in the build context. The deployment helper therefore sends `GOOGLE_API_KEY` as a LiveKit Cloud secret rather than uploading the local environment file.

## Current model

The voice agent uses `gemini-3.8-live`, Google's stable Live API model for low-latency voice conversations. See the [Gemini 3.8 Live documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-live).

## Runtime behavior

The agent:

- uses native Gemini audio input/output;
- enables LiveKit's built-in voice I/O bridge;
- uses background noise cancellation;
- sends an initial greeting when the session starts;
- logs agent/user state transitions without storing raw speech transcripts;
- reports runtime errors in the LiveKit agent logs.

Keep `livekit.toml` and all secret values out of source control. The repository's `.gitignore` already excludes `.env` files.
