
# from datetime import datetime as dt
# from models import User, ProfileData as pd, db
# from jabber_register_user import register_user
from myfunctions import *
# from dateutil import parser
import time


access_token = ['CAACEdEose0cBALUb60H6IOi65VtmFveTkZCvke0UnHPdYcBnqNsrDYZBvZBCGd8RSyIxO1wnzLWoNvDlKuCLhDQA7iABDvcFZCRJUot0CRroIaEZCG4Y46vC6AmZCaZCiGFyFxWbUsXXZCNZBnbhPBIMNKQgPIGj68tUZD']

# one = fb_call('me/friends/?fields=name,picture,gender,work,education,birthday,interested_in,email,relationship_status,username', args={'access_token': access_token})

one = fb_call('me/friends/?fields=id', args={'access_token': access_token})

# ids = [i['id'] for i in one['data'][0] if i.get(id)]

for i in one['data'][252:]:

    uid = i.get('id')
    if uid:
        print uid
        time.sleep(2)
        push_data_mass(uid, access_token)

