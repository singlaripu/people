
# from dbconnection import db
# import sqlalchemy

# class User(db.Model):

#     __tablename__ = 'user'

#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(80))
#     email = db.Column(db.String(120), unique=True)
#     fb_uid = db.Column(db.String(30))
#     last_updated = db.Column(db.DateTime, default=sqlalchemy.func.now)

#     def __init__(self, name, email, uid):
#         self.name = name
#         self.email = email
#         self.fb_uid = uid

#     def __repr__(self):
#         return '<Name %r>' % self.name



# class Profiledata(db.Model):

#     __tablename__ = 'profile_data'
    
#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
#     #user = relationship(User, primaryjoin=user_id == User.id)
#     profile_pic_url = db.Column(db.String(300))
#     profile_album = db.Column(db.PickleType)
#     gender = db.Column(db.String(10))
#     work_position = db.Column(db.String(200))
#     work_employer = db.Column(db.String(200))
#     work_startdate = db.Column(db.DateTime)



#     def __init__(self, user_id):
#         self.user_id = user_id
   

#     def __repr__(self):
#         return '<Name %r>' % self.user_id

