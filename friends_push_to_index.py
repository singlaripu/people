
from datetime import datetime as dt
from models import User, ProfileData as pd, db, UserComplete
from jabber_register_user import register_user
from myfunctions import fb_call, push_to_index, get_user
from dateutil import parser
import time


# access_token = ['CAACEdEose0cBAKVIiJgCYWZAihs2kewqHWSeVZCePSvKepFgIQsM4G02Ob1QIy5KngvQ6sXjMdZAZAEPlwZATlSjNf7EFP3cE0BGzAzysFTaPZC1rvzaxJguRTZAYGZA8qp3nsNWTALUXjTEo0hAWVbFAProeVRxKh8ZD']

# friends = fb_call('me/friends?fields=name,picture,gender', args={'access_token': access_token})

users = UserComplete.query.all()
count = 0
for user in users:
    time.sleep(0.25)
    print user.name
    push_to_index(user)
   