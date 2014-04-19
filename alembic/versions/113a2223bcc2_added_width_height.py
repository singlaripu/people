"""added width height

Revision ID: 113a2223bcc2
Revises: 4d849418f625
Create Date: 2013-07-09 10:41:01.924267

"""

# revision identifiers, used by Alembic.
revision = '113a2223bcc2'
down_revision = '4d849418f625'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('profile_data', sa.Column('width', sa.String(length=4), nullable=True))
    op.add_column('profile_data', sa.Column('height', sa.String(length=4), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('profile_data', 'height')
    op.drop_column('profile_data', 'width')
    ### end Alembic commands ###
