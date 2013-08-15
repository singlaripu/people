"""delete usercomplete

Revision ID: 3f7b41f2a909
Revises: 2416bb81eefc
Create Date: 2013-08-13 11:12:45.196141

"""

# revision identifiers, used by Alembic.
revision = '3f7b41f2a909'
down_revision = '2416bb81eefc'

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_table(u'usercomplete')
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.create_table(u'usercomplete',
    sa.Column(u'id', sa.INTEGER(), server_default="nextval('usercomplete_id_seq'::regclass)", nullable=False),
    sa.Column(u'name', sa.VARCHAR(length=80), autoincrement=False, nullable=True),
    sa.Column(u'email', sa.VARCHAR(length=120), autoincrement=False, nullable=True),
    sa.Column(u'fb_uid', sa.VARCHAR(length=30), autoincrement=False, nullable=True),
    sa.Column(u'profile_pic_url', sa.VARCHAR(length=300), autoincrement=False, nullable=True),
    sa.Column(u'profile_album', postgresql.BYTEA(), autoincrement=False, nullable=True),
    sa.Column(u'gender', sa.VARCHAR(length=10), autoincrement=False, nullable=True),
    sa.Column(u'work', postgresql.BYTEA(), autoincrement=False, nullable=True),
    sa.Column(u'current_location_name', sa.VARCHAR(length=80), autoincrement=False, nullable=True),
    sa.Column(u'current_location_latlong', postgresql.BYTEA(), autoincrement=False, nullable=True),
    sa.Column(u'hometown_location_name', sa.VARCHAR(length=80), autoincrement=False, nullable=True),
    sa.Column(u'hometown_location_latlong', postgresql.BYTEA(), autoincrement=False, nullable=True),
    sa.Column(u'education', postgresql.BYTEA(), autoincrement=False, nullable=True),
    sa.Column(u'likes_dummy', sa.VARCHAR(length=2000), autoincrement=False, nullable=True),
    sa.Column(u'votes', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column(u'relationship_status', sa.VARCHAR(length=80), autoincrement=False, nullable=True),
    sa.Column(u'last_updated', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.Column(u'username', sa.VARCHAR(length=30), autoincrement=False, nullable=True),
    sa.Column(u'birthday_dformat', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.Column(u'current_location_dummy', sa.VARCHAR(length=300), autoincrement=False, nullable=True),
    sa.Column(u'hometown_location_dummy', sa.VARCHAR(length=300), autoincrement=False, nullable=True),
    sa.Column(u'user_key', sa.VARCHAR(length=50), autoincrement=False, nullable=True),
    sa.Column(u'birthday', sa.VARCHAR(length=20), autoincrement=False, nullable=True),
    sa.Column(u'interested_in', sa.VARCHAR(length=30), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint(u'id', name=u'usercomplete_pkey')
    )
    ### end Alembic commands ###