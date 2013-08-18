
# from datetime import datetime as dt
from models import UserComplete
#from jabber_register_user import register_user
from myfunctions import get_index_handle
# from dateutil import parser
# import time
# from get_image_size import getsizes
import time
from parse_fbdata import get_relationship_wgt



def get_latlong_from_db(lobj):
	if not lobj:
		return 9999, 9999
	lat, lng = lobj
	if lat and lng:
		return lat, lng
	else:
		return 9999, 9999


def get_intersted_in_from_db(sobj):
	if not sobj:
		return 2
	if sobj == 'Male':
		return 1
	elif sobj == 'Female':
		return 0
	else:
		return 3

def get_gender_variable(g):
	if g == 'Female':
		return 0
	else:
		return 1


def add_variables(u):
	variables = {}

	variables[0] = 1

	try:
		variables[1] = u.birthday_dformat.year
	except Exception:
		variables[1] = 9999

	# latlong = u.current_location_latlong
	variables[2], variables[3] = get_latlong_from_db(u.current_location_latlong)
	variables[4], variables[5] = get_latlong_from_db(u.hometown_location_latlong)	
	variables[6] = get_intersted_in_from_db(u.interested_in)
	variables[7] = get_gender_variable(u.gender)
	variables[8] = get_relationship_wgt(u.relationship_status)

	return variables


h = get_index_handle()
users = UserComplete.query.all()

for user in users:
	time.sleep(1)
	variables = add_variables(user)
	print user.id, variables
	h.update_variables(user.id, variables=variables)

