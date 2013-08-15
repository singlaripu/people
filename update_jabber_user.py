
# from datetime import datetime as dt
# from models import User, ProfileData as pd, db
# from jabber_register_user import register_user
from myfunctions import *
# from dateutil import parser
import time


# access_token = ['CAACEdEose0cBALUb60H6IOi65VtmFveTkZCvke0UnHPdYcBnqNsrDYZBvZBCGd8RSyIxO1wnzLWoNvDlKuCLhDQA7iABDvcFZCRJUot0CRroIaEZCG4Y46vC6AmZCaZCiGFyFxWbUsXXZCNZBnbhPBIMNKQgPIGj68tUZD']

# one = fb_call('me/friends/?fields=name,picture,gender,work,education,birthday,interested_in,email,relationship_status,username', args={'access_token': access_token})

# one = fb_call('me/friends/?fields=id', args={'access_token': access_token})

# ids = [i['id'] for i in one['data'][0] if i.get(id)]

# from datetime import datetime as dt
from models import UserComplete, db
#from jabber_register_user import register_user
# from myfunctions import get_data
# from dateutil import parser
# import time
# from get_image_size import getsizes
import time
from jabber_register_user import register_user


users = UserComplete.query.all()
for user in users:
	if user.user_key:
		time.sleep(1)
		print user.id, user.name, user.fb_uid, user.user_key
		register_user(user.fb_uid, user.user_key)
