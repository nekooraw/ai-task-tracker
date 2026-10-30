"""add user and task owner

Revision ID: 2f19a74bfdae
Revises: 
Create Date: 2026-10-30 21:36:08.141612

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2f19a74bfdae'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('tasks') as batch_op:
        batch_op.create_foreign_key('fk_tasks_owner_id_users', 'users', ['owner_id'], ['id'])

    with op.batch_alter_table('tasks') as batch_op:
        batch_op.add_column(sa.Column('owner_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_tasks_owner_id_users', 'users', ['owner_id'], ['id'])


def downgrade() -> None:
    with op.batch_alter_table('tasks') as batch_op:
        batch_op.drop_constraint('fk_tasks_owner_id_users', type_='foreignkey')
        batch_op.drop_column('owner_id')

    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
