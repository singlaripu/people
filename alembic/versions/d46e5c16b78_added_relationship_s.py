"""added relationship status

Revision ID: d46e5c16b78
Revises: 4e6ec201efc9
Create Date: 2013-06-22 19:23:51.515583

"""

# revision identifiers, used by Alembic.
revision = 'd46e5c16b78'
down_revision = '4e6ec201efc9'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('profile_data', sa.Column('relationship_status', sa.String(length=80), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('profile_data', 'relationship_status')
    ### end Alembic commands ###
