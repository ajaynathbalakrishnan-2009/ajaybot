import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from livekit.agents import Agent, AgentServer, AgentSession, JobContext, cli, room_io
from livekit.plugins import google, noise_cancellation

from prompt import AGENT_INSTRUCTION

ROOT_ENV = Path(__file__).resolve().parents[1] / '.env'
load_dotenv(ROOT_ENV)
load_dotenv()

logger = logging.getLogger("ajaybot.voice")

AGENT_NAME = os.getenv("LIVEKIT_AGENT_NAME", "ajaybot-voice")
MODEL = os.getenv("GEMINI_LIVE_MODEL", "gemini-3.8-live")
VOICE = os.getenv("GEMINI_LIVE_VOICE", "Charon")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "").strip()

if not GOOGLE_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY is missing. Add it to the agent environment before starting AjayBot Voice.")


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=AGENT_INSTRUCTION)


server = AgentServer()


@server.rtc_session(agent_name=AGENT_NAME)
async def entrypoint(ctx: JobContext) -> None:
    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            model=MODEL,
            voice=VOICE,
            temperature=0.8,
            instructions=AGENT_INSTRUCTION,
        ),
    )

    @session.on("agent_state_changed")
    def on_agent_state_changed(event) -> None:
        logger.info("agent state: %s -> %s", event.old_state, event.new_state)

    @session.on("user_state_changed")
    def on_user_state_changed(event) -> None:
        logger.info("user state: %s -> %s", event.old_state, event.new_state)

    @session.on("user_input_transcribed")
    def on_user_input_transcribed(event) -> None:
        if event.is_final:
            logger.info("received final user speech transcript (%d chars)", len(event.transcript or ""))

    @session.on("error")
    def on_error(event) -> None:
        logger.error(
            "voice session error source=%s recoverable=%s error=%s",
            type(event.source).__name__,
            getattr(event.error, "recoverable", False),
            event.error,
        )

    await session.start(
        agent=Assistant(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=noise_cancellation.BVC(),
            ),
        ),
    )

    logger.info("voice session started room=%s model=%s voice=%s", ctx.room.name, MODEL, VOICE)

    await session.generate_reply(
        instructions="Greet commander ajay naturally and invite him to speak.",
    )


if __name__ == "__main__":
    cli.run_app(server)
