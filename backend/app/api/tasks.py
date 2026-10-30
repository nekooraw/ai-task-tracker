
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services.task_service import get_tasks, get_task, create_task, update_task, delete_task


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


@router.get("/", response_model=list[TaskResponse])
async def read_tasks(db: AsyncSession = Depends(get_db)):
    return await get_tasks(db)


@router.get("/{task_id}", response_model=TaskResponse)
async def read_task(task_id: int, db: AsyncSession = Depends(get_db)):
    task = await get_task(db, task_id)

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return task


@router.post("/", response_model=TaskResponse)
async def create_task_endpoint(task_data: TaskCreate, db: AsyncSession = Depends(get_db)):
    return await create_task(db, task_data)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task_endpoint(task_id: int, task_data: TaskUpdate, db: AsyncSession = Depends(get_db)):
    task = await get_task(db, task_id)

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    update_data = task_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update",
        )

    return await update_task(db, task, task_data)


@router.delete("/{task_id}")
async def delete_task_endpoint(task_id: int, db: AsyncSession = Depends(get_db)):
    task = await get_task(db, task_id)

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    await delete_task(db, task)

    return {"message": "Task deleted successfully"}
