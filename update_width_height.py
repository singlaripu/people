
# from datetime import datetime as dt
from models import UserComplete, db
#from jabber_register_user import register_user
# from myfunctions import get_data
# from dateutil import parser
# import time
from get_image_size import getsizes
import time


users = UserComplete.query.all()
for user in users:
	time.sleep(2)
	print user.profile_pic_url, user.name
   	size = getsizes(user.profile_pic_url)
   	if size:
		user.width = size[1][0]
		user.height = size[1][1]
		db.session.add(user)
		db.session.commit()