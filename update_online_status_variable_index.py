
# from datetime import datetime as dt
from models import UserComplete
#from jabber_register_user import register_user
from myfunctions import get_index_handle
# from dateutil import parser
import time
# from get_image_size import getsizes
# import time



h = get_index_handle()
users = UserComplete.query.all()

t = int(1000*time.time())

for user in users:
	time.sleep(1)
	print user.id, user.name
	h.update_variables(user.id, {9:t})

