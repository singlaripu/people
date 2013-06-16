"""change table name

Revision ID: 3c1765dd1b6e
Revises: 413c841c1e4
Create Date: 2013-06-16 14:45:26.757504

"""

# revision identifiers, used by Alembic.
revision = '3c1765dd1b6e'
down_revision = '413c841c1e4'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=80), nullable=True),
    sa.Column('email', sa.String(length=120), nullable=True),
    sa.Column('fb_uid', sa.String(length=30), nullable=True),
    sa.Column('last_updated', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.drop_table(u'users')
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.create_table(u'users',
    sa.Column(u'id', sa.INTEGER(), server_default="nextval('users_id_seq'::regclass)", nullable=False),
    sa.Column(u'name', sa.VARCHAR(length=80), autoincrement=False, nullable=True),
    sa.Column(u'email', sa.VARCHAR(length=120), autoincrement=False, nullable=True),
    sa.Column(u'fb_uid', sa.VARCHAR(length=30), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint(u'id', name=u'users_pkey')
    )
    op.drop_table('user')
    ### end Alembic commands ###
