from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from models.schemas import ChatRequest
from services.agent_service import MissingApiKeyError, chat, chat_stream, get_client
import json

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/chat")
def agent_chat(req: ChatRequest):
    try:
        reply = chat(req)
    except MissingApiKeyError as e:
        raise HTTPException(status_code=503, detail=str(e))
    return {"reply": reply}


@router.post("/chat/stream")
def agent_chat_stream(req: ChatRequest):
    try:
        get_client()
    except MissingApiKeyError as e:
        raise HTTPException(status_code=503, detail=str(e))

    def generate():
        for chunk in chat_stream(req):
            yield f"data: {json.dumps({'text': chunk}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
