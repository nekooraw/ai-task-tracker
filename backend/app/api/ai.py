from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User

from app.services.task_service import get_tasks
from app.services.ai_service import generate_ai_response, AIServiceError


router = APIRouter(prefix="/ai", tags=["AI"])


class AIRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=4000)


class AIResponse(BaseModel):
    response: str


@router.post("/ask", response_model=AIResponse)
async def ask_ai(data: AIRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = await get_tasks(db, current_user.id)
    tasks_text = "\n".join([f"- {task.title}: {task.description or 'No description'} | Completed: {task.is_completed}" for task in tasks])

    prompt = f"User's tasks:\n{tasks_text}\n\nUser's request: {data.prompt}"

    try:
        response = await generate_ai_response(prompt)
    except AIServiceError as error:
        raise HTTPException(status_code=503, detail=str(error))

    return {"response": response}