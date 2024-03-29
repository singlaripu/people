"""add username

Revision ID: 1afa610bb8a6
Revises: 59035fffb245
Create Date: 2013-07-15 02:41:26.429456

"""

# revision identifiers, used by Alembic.
revision = '1afa610bb8a6'
down_revision = '59035fffb245'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('usercomplete', sa.Column('username', sa.String(length=30), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('usercomplete', 'username')
    ### end Alembic commands ###
