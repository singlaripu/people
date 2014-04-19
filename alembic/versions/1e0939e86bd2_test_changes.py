"""test changes

Revision ID: 1e0939e86bd2
Revises: 5631339fedc0
Create Date: 2013-06-16 14:33:49.714566

"""

# revision identifiers, used by Alembic.
revision = '1e0939e86bd2'
down_revision = '5631339fedc0'

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', u'last_updated')
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column(u'last_updated', postgresql.TIMESTAMP(), nullable=True))
    ### end Alembic commands ###
