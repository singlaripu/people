
# from datetime import datetime as dt
from models import User, ProfileData as pd, db, UserComplete
#from jabber_register_user import register_user
from myfunctions import get_data
# from dateutil import parser
# import time


def convert_sqlobj_to_dict(obj):
    return [(c.name, getattr(obj, c.name)) for c in obj.__table__.columns]


users = User.query.all()
for user in users:
    data = get_data(user)
    if data:
        new_dict = dict(convert_sqlobj_to_dict(user) + convert_sqlobj_to_dict(data))
        new_dict.pop('user_id')
        q = UserComplete(**new_dict)

        db.session.add(q)
        db.session.commit()