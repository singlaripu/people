
# from datetime import datetime as dt
from models import UserComplete, db
#from jabber_register_user import register_user
# from myfunctions import get_data
# from dateutil import parser
# import time
# from get_image_size import getsizes
from parse_fbdata import parse_latlong
import time


users = UserComplete.query.all()

for user in users:
	time.sleep(0.5)
	print user.id, user.name, user.current_location_latlong, user.hometown_location_latlong

	if user.current_location_latlong:
		c3, c4 = user.current_location_latlong	
		c_latlong = parse_latlong(c3, c4)
		user.current_location_latlong = c_latlong

	if user.hometown_location_latlong:
		h3, h4 = user.hometown_location_latlong
		h_latlong = parse_latlong(h3, h4)		
		user.hometown_location_latlong = h_latlong
	
	db.session.add(user)
	db.session.commit()