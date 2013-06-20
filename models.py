
from dbconnection import db
import sqlalchemy

class User(db.Model):

    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80))
    email = db.Column(db.String(120))
    fb_uid = db.Column(db.String(30))
    last_updated = db.Column(db.DateTime, default=sqlalchemy.func.now())

    def __init__(self, **kwargs):
        for k, v in kwargs.iteritems():
            setattr(self, k, v)

    def __repr__(self):
        return '<Name %r>' % self.name



class ProfileData(db.Model):

    __tablename__ = 'profile_data'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    #user = relationship(User, primaryjoin=user_id == User.id)
    profile_pic_url = db.Column(db.String(300))
    profile_album = db.Column(db.PickleType)
    gender = db.Column(db.String(10))

    work_dummy = db.Column(db.String(1000))
    work = db.Column(db.PickleType)


    current_location_name = db.Column(db.String(80))
    current_location_city = db.Column(db.String(80))
    current_location_state= db.Column(db.String(80))
    current_location_country = db.Column(db.String(80))
    current_location_latlong = db.Column(db.PickleType)

    hometown_location_name = db.Column(db.String(80))
    hometown_location_city = db.Column(db.String(80))
    hometown_location_state= db.Column(db.String(80))
    hometown_location_country = db.Column(db.String(80))
    hometown_location_latlong = db.Column(db.PickleType) 

    birthday = db.Column(db.DateTime)
    interested_in = db.Column(db.String(80))

    education_dummy = db.Column(db.String(1000))
    education = db.Column(db.PickleType)

    likes_dummy = db.Column(db.String(2000))
    watched = db.Column(db.PickleType)
    wants_to = db.Column(db.PickleType)
    likes = db.Column(db.PickleType)
    votes = db.Column(db.Integer)

    last_updated = db.Column(db.DateTime, default=sqlalchemy.func.now())

    def __init__(self, **kwargs):
        for k, v in kwargs.iteritems():
            setattr(self, k, v)

    def __repr__(self):
        return '<user_id %r>' % self.user_id
