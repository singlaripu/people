"""add likes name

Revision ID: 59035fffb245
Revises: 893781361d8
Create Date: 2013-07-15 01:06:47.853156

"""

# revision identifiers, used by Alembic.
revision = '59035fffb245'
down_revision = '893781361d8'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('usercomplete', sa.Column('likes_name', sa.String(length=100), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('usercomplete', 'likes_name')
    ### end Alembic commands ###
