from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db.base import Base
from app.db.session import engine
from app.models.task import Task

from app.api.tasks import router as tasks_router
from app.api.auth import router as auth_router
from app.api.ai import router as ai_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as connection:
        await connection.run_sync(
            Base.metadata.create_all
        )

    yield

    await engine.dispose()


app = FastAPI(
    title="Mini Task Tracker with AI",
    lifespan=lifespan,
    swagger_ui_parameters={"persistAuthorization": True}
)

app.include_router(tasks_router)
app.include_router(auth_router)
app.include_router(ai_router)


@app.get("/")
async def root():
    return {
        "message": "Mini Task Tracker API is running!"
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}