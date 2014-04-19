
# from datetime import datetime as dt
from models import UserComplete, db
#from jabber_register_user import register_user
# from myfunctions import get_data
# from dateutil import parser
# import time
# from get_image_size import getsizes
# from parse_fbdata import parse_latlong
import time
from dateutil import parser

dummy_date = parser.parse('01/01/9999')


users = UserComplete.query.all()

for user in users:
	time.sleep(0.5)
	print user.id, user.name, user.birthday, user.birthday_dformat.strftime('%B %d %Y')

	if user.birthday_dformat.year == 2013:
		user.birthday_dformat = dummy_date
		db.session.add(user)
		db.session.commit()