"""add likes str set

Revision ID: 50373b63c9bd
Revises: 45a547d8ba1f
Create Date: 2013-08-21 09:16:55.226186

"""

# revision identifiers, used by Alembic.
revision = '50373b63c9bd'
down_revision = '45a547d8ba1f'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('usercomplete', sa.Column('likes_set', sa.PickleType(), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('usercomplete', 'likes_set')
    ### end Alembic commands ###