from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


TaskPriority = Literal["low", "medium", "high"]


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    priority: TaskPriority = "medium"
    due_date: datetime | None = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None
    is_completed: bool
    priority: TaskPriority
    due_date: datetime | None

    model_config = {"from_attributes": True}


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    is_completed: bool | None = None
    priority: TaskPriority | None = None
    due_date: datetime | None = None
