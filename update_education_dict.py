
# from datetime import datetime as dt
from models import UserComplete, db
#from jabber_register_user import register_user
# from myfunctions import get_data
# from dateutil import parser
# import time
# from get_image_size import getsizes
from parse_fbdata import parse_education, parse_work
from myfunctions import fb_call
import time

access_token = ['CAACEdEose0cBAPxcMpeGmuFBYeLW6ErdHEGZAVjD5rooHZCFUBvX6EQV20f1cqrZCGoVrI3GEEO8sz1yrt4RaeWua4UesUAoUQmEpfrH8DkkWcLrkMkqUeT1KBr0lnoXC1tO47RFYOKa5XSz5iOJ3njZCGH9I0pK55YLNxYXZCo1fXzJlZBA6EPOC9jI5W7ZB4ZD']

users = UserComplete.query.all()

for user in users:
	time.sleep(1)
	print user.id, user.fb_uid, user.name

	uid = user.fb_uid	

	me = fb_call(uid + '/?fields=name,picture,gender,work,education,birthday,interested_in,email,relationship_status,username', args={'access_token': access_token})
	education, education_index = parse_education(me.get('education'))
	work, work_index = parse_work(me.get('work'))
	
	# print user.education, user.work
	# print education, '\n\n', work, '\n\n'
	user.education1 = education
	user.work1 = work
	
	db.session.add(user)
	db.session.commit()