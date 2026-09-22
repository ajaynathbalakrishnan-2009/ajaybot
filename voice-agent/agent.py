import os
from pathlib import Path

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentServer, AgentSession, JobContext, cli, room_io
from livekit.plugins import google, noise_cancellation

from prompt import AGENT_INSTRUCTION

ROOT_ENV = Path(__file__).resolve().parents[1] / '.env'
load_dotenv(ROOT_ENV)
load_dotenv()

AGENT_NAME = os.getenv("LIVEKIT_AGENT_NAME", "ajaybot-voice")
MODEL = os.getenv("GEMINI_LIVE_MODEL", "gemini-2.5-flash-native-audio-latest")
VOICE = os.getenv("GEMINI_LIVE_VOICE", "Charon")


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

    await session.start(
        agent=Assistant(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=noise_cancellation.BVC(),
            ),
        ),
    )

    await session.generate_reply(
        instructions="Greet commander ajay naturally and invite him to speak.",
    )


if __name__ == "__main__":
    cli.run_app(server)
