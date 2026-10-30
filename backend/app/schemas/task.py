from pydantic import BaseModel, Field

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None
    is_completed: bool

    model_config = {
        'from_attributes': True
    }


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    is_completed: bool | None = None


