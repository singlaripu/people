"""unified userdata

Revision ID: 4d849418f625
Revises: d46e5c16b78
Create Date: 2013-07-08 01:26:57.716961

"""

# revision identifiers, used by Alembic.
revision = '4d849418f625'
down_revision = 'd46e5c16b78'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.create_table('usercomplete',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=80), nullable=True),
    sa.Column('email', sa.String(length=120), nullable=True),
    sa.Column('fb_uid', sa.String(length=30), nullable=True),
    sa.Column('profile_pic_url', sa.String(length=300), nullable=True),
    sa.Column('profile_album', sa.PickleType(), nullable=True),
    sa.Column('gender', sa.String(length=10), nullable=True),
    sa.Column('work_dummy', sa.String(length=1000), nullable=True),
    sa.Column('work', sa.PickleType(), nullable=True),
    sa.Column('current_location_name', sa.String(length=80), nullable=True),
    sa.Column('current_location_city', sa.String(length=80), nullable=True),
    sa.Column('current_location_state', sa.String(length=80), nullable=True),
    sa.Column('current_location_country', sa.String(length=80), nullable=True),
    sa.Column('current_location_latlong', sa.PickleType(), nullable=True),
    sa.Column('hometown_location_name', sa.String(length=80), nullable=True),
    sa.Column('hometown_location_city', sa.String(length=80), nullable=True),
    sa.Column('hometown_location_state', sa.String(length=80), nullable=True),
    sa.Column('hometown_location_country', sa.String(length=80), nullable=True),
    sa.Column('hometown_location_latlong', sa.PickleType(), nullable=True),
    sa.Column('birthday', sa.DateTime(), nullable=True),
    sa.Column('interested_in', sa.String(length=80), nullable=True),
    sa.Column('education_dummy', sa.String(length=1000), nullable=True),
    sa.Column('education', sa.PickleType(), nullable=True),
    sa.Column('likes_dummy', sa.String(length=2000), nullable=True),
    sa.Column('watched', sa.PickleType(), nullable=True),
    sa.Column('wants_to', sa.PickleType(), nullable=True),
    sa.Column('likes', sa.PickleType(), nullable=True),
    sa.Column('votes', sa.Integer(), nullable=True),
    sa.Column('relationship_status', sa.String(length=80), nullable=True),
    sa.Column('last_updated', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('usercomplete')
    ### end Alembic commands ###
