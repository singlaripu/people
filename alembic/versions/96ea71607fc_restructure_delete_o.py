"""restructure delete old

Revision ID: 96ea71607fc
Revises: 1afa610bb8a6
Create Date: 2013-08-11 22:55:07.218084

"""

# revision identifiers, used by Alembic.
revision = '96ea71607fc'
down_revision = '1afa610bb8a6'

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_table(u'user')
    # op.drop_table(u'profile_data')
    op.add_column('usercomplete', sa.Column('birthday_dformat', sa.DateTime(), nullable=True))
    op.add_column('usercomplete', sa.Column('current_location_dummy', sa.String(length=300), nullable=True))
    op.add_column('usercomplete', sa.Column('hometown_location_dummy', sa.String(length=300), nullable=True))
    op.drop_column('usercomplete', u'education_dummy')
    op.drop_column('usercomplete', u'likes_name')
    op.drop_column('usercomplete', u'hometown_location_city')
    op.drop_column('usercomplete', u'work_name')
    op.drop_column('usercomplete', u'current_location_city')
    op.drop_column('usercomplete', u'current_location_state')
    op.drop_column('usercomplete', u'wants_to')
    op.drop_column('usercomplete', u'current_location_country')
    op.drop_column('usercomplete', u'education_name')
    op.drop_column('usercomplete', u'height')
    op.drop_column('usercomplete', u'work_dummy')
    op.drop_column('usercomplete', u'width')
    op.drop_column('usercomplete', u'hometown_location_state')
    op.drop_column('usercomplete', u'likes')
    op.drop_column('usercomplete', u'watched')
    op.drop_column('usercomplete', u'hometown_location_country')
    op.drop_column('usercomplete', u'interested_in')
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('usercomplete', sa.Column(u'interested_in', sa.VARCHAR(length=80), nullable=True))
    op.add_column('usercomplete', sa.Column(u'hometown_location_country', sa.VARCHAR(length=80), nullable=True))
    op.add_column('usercomplete', sa.Column(u'watched', postgresql.BYTEA(), nullable=True))
    op.add_column('usercomplete', sa.Column(u'likes', postgresql.BYTEA(), nullable=True))
    op.add_column('usercomplete', sa.Column(u'hometown_location_state', sa.VARCHAR(length=80), nullable=True))
    op.add_column('usercomplete', sa.Column(u'width', sa.VARCHAR(length=4), nullable=True))
    op.add_column('usercomplete', sa.Column(u'work_dummy', sa.VARCHAR(length=1000), nullable=True))
    op.add_column('usercomplete', sa.Column(u'height', sa.VARCHAR(length=4), nullable=True))
    op.add_column('usercomplete', sa.Column(u'education_name', sa.VARCHAR(length=300), nullable=True))
    op.add_column('usercomplete', sa.Column(u'current_location_country', sa.VARCHAR(length=80), nullable=True))
    op.add_column('usercomplete', sa.Column(u'wants_to', postgresql.BYTEA(), nullable=True))
    op.add_column('usercomplete', sa.Column(u'current_location_state', sa.VARCHAR(length=80), nullable=True))
    op.add_column('usercomplete', sa.Column(u'current_location_city', sa.VARCHAR(length=80), nullable=True))
    op.add_column('usercomplete', sa.Column(u'work_name', sa.VARCHAR(length=300), nullable=True))
    op.add_column('usercomplete', sa.Column(u'hometown_location_city', sa.VARCHAR(length=80), nullable=True))
    op.add_column('usercomplete', sa.Column(u'likes_name', sa.VARCHAR(length=100), nullable=True))
    op.add_column('usercomplete', sa.Column(u'education_dummy', sa.VARCHAR(length=1000), nullable=True))
    op.drop_column('usercomplete', 'hometown_location_dummy')
    op.drop_column('usercomplete', 'current_location_dummy')
    op.drop_column('usercomplete', 'birthday_dformat')
    op.create_table(u'profile_data',
    sa.Column(u'id', sa.INTEGER(), server_default="nextval('profile_data_id_seq'::regclass)", nullable=False),
    sa.Column(u'user_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column(u'profile_pic_url', sa.VARCHAR(length=300), autoincrement=False, nullable=True),
    sa.Column(u'profile_album', postgresql.BYTEA(), autoincrement=False, nullable=True),
    sa.Column(u'gender', sa.VARCHAR(length=10), autoincrement=False, nullable=True),
    sa.Column(u'education_dummy', sa.VARCHAR(length=1000), autoincrement=False, nullable=True),
    sa.Column(u'hometown_location_latlong', postgresql.BYTEA(), autoincrement=False, nullable=True),
    sa.Column(u'hometown_location_country', sa.VARCHAR(length=80), autoincrement=False, nullable=True),
    sa.Column(u'last_updated', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.Column(u'current_location_city', sa.VARCHAR(length=80), autoincrement=False, nullable=True),
    sa.Column(u'current_location_state', sa.VARCHAR(length=80), autoincrement=False, nullable=True),
    sa.Column(u'current_location_name', sa.VARCHAR(length=80), autoincrement=False, nullable=True),
    sa.Column(u'work', postgresql.BYTEA(), autoincrement=False, nullable=True),
    sa.Column(u'current_location_country', sa.VARCHAR(length=80), autoincrement=False, nullable=True),
    sa.Column(u'hometown_location_city', sa.VARCHAR(length=80), autoincrement=False, nullable=True),
    sa.Column(u'work_dummy', sa.VARCHAR(length=1000), autoincrement=False, nullable=True),
    sa.Column(u'birthday', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.Column(u'hometown_location_state', sa.VARCHAR(length=80), autoincrement=False, nullable=True),
    sa.Column(u'likes', postgresql.BYTEA(), autoincrement=False, nullable=True),
    sa.Column(u'current_location_latlong', postgresql.BYTEA(), autoincrement=False, nullable=True),
    sa.Column(u'watched', postgresql.BYTEA(), autoincrement=False, nullable=True),
    sa.Column(u'likes_dummy', sa.VARCHAR(length=2000), autoincrement=False, nullable=True),
    sa.Column(u'education', postgresql.BYTEA(), autoincrement=False, nullable=True),
    sa.Column(u'interested_in', sa.VARCHAR(length=80), autoincrement=False, nullable=True),
    sa.Column(u'wants_to', postgresql.BYTEA(), autoincrement=False, nullable=True),
    sa.Column(u'hometown_location_name', sa.VARCHAR(length=80), autoincrement=False, nullable=True),
    sa.Column(u'votes', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column(u'relationship_status', sa.VARCHAR(length=80), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['user_id'], [u'user.id'], name=u'profile_data_user_id_fkey'),
    sa.PrimaryKeyConstraint(u'id', name=u'profile_data_pkey')
    )
    op.create_table(u'user',
    sa.Column(u'id', sa.INTEGER(), server_default="nextval('user_id_seq'::regclass)", nullable=False),
    sa.Column(u'name', sa.VARCHAR(length=80), autoincrement=False, nullable=True),
    sa.Column(u'email', sa.VARCHAR(length=120), autoincrement=False, nullable=True),
    sa.Column(u'fb_uid', sa.VARCHAR(length=30), autoincrement=False, nullable=True),
    sa.Column(u'last_updated', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint(u'id', name=u'user_pkey')
    )
    ### end Alembic commands ###
