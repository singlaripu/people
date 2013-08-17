
# from datetime import datetime as dt
from models import UserComplete, db
#from jabber_register_user import register_user
from myfunctions import get_index_handle
# from dateutil import parser
# import time
# from get_image_size import getsizes
import time

h = get_index_handle()

def get_latlong_from_db(lobj):
	if not lobj:
		return 0, 0
	lat, lng = lobj
	if lat and lng:
		return lat, lng
	else:
		return 0, 0


def get_intersted_in_from_db(sobj):
	if not sobj:
		return 2
	if sobj == 'Male':
		return 1
	elif sobj == 'Female':
		return 0
	else:
		return 3

def add_variables(u):
	variables = {}

	variables[0] = 1

	try:
		variables[1] = u.birthday_dformat.year
	except Exception:
		variables[1] = 1900

	# latlong = u.current_location_latlong
	variables[2], variables[3] = get_latlong_from_db(u.current_location_latlong)
	variables[4], variables[5] = get_latlong_from_db(u.hometown_location_latlong)	
	variables[6] = get_intersted_in_from_db(u.interested_in)

	return variables


users = UserComplete.query.all()

for user in users:
	time.sleep(1)
	variables = add_variables(user)
	print user.id, variables
	h.update_variables(user.id, variables=variables)

	# if not user.width:
	# 	time.sleep(1)
	# 	print user.profile_pic_url, user.name
	#    	size = getsizes(user.profile_pic_url)
	#    	if size and size[1]:
	# 		user.width = size[1][0]
	# 		user.height = size[1][1]
	# 		db.session.add(user)
	# 		db.session.commit()