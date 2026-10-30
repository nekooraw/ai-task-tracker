
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


async def get_tasks(db: AsyncSession, user_id: int):
    result = await db.execute(select(Task).where(Task.owner_id == user_id))
    return result.scalars().all()


async def get_task(db: AsyncSession, task_id: int, user_id: int):
    result = await db.execute(select(Task).where(Task.id == task_id, Task.owner_id == user_id))
    return result.scalar_one_or_none()


async def create_task(db: AsyncSession, task_data: TaskCreate, user_id: int):
    new_task = Task(**task_data.model_dump(), owner_id=user_id)
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task


async def update_task(db: AsyncSession, task: Task, task_data: TaskUpdate):
    update_data = task_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(task, key, value)

    await db.commit()
    await db.refresh(task)

    return task


async def delete_task(db: AsyncSession, task: Task):
    await db.delete(task)
    await db.commit()
