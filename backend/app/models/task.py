from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    title: Mapped[str] = mapped_column(String(200))

    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)