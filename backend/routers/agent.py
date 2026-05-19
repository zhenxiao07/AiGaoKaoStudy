from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from models.schemas import ChatRequest
from services.agent_service import chat, chat_stream
import json

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/chat")
def agent_chat(req: ChatRequest):
    reply = chat(req)
    return {"reply": reply}


@router.post("/chat/stream")
def agent_chat_stream(req: ChatRequest):
    def generate():
        for chunk in chat_stream(req):
            yield f"data: {json.dumps({'text': chunk}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
