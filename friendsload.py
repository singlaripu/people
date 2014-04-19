
from datetime import datetime as dt
from models import User, ProfileData as pd, db
from jabber_register_user import register_user
from myfunctions import fb_call, push_to_index, get_user
from dateutil import parser
import time


access_token = ['CAACEdEose0cBAKVIiJgCYWZAihs2kewqHWSeVZCePSvKepFgIQsM4G02Ob1QIy5KngvQ6sXjMdZAZAEPlwZATlSjNf7EFP3cE0BGzAzysFTaPZC1rvzaxJguRTZAYGZA8qp3nsNWTALUXjTEo0hAWVbFAProeVRxKh8ZD']

friends = fb_call('me/friends?fields=name,picture,gender', args={'access_token': access_token})

count = 0
for friend in friends['data'][1:]:

    count += 1
    time.sleep(2)
    print count

    id = friend['id']
    name = friend['name']
    gender = friend['gender']
    url = friend['picture']['data']['url'].replace('q.jpg', 'n.jpg')
    email = id + '@fbpeople.com'

    user = User(name=name, email=email, fb_uid=id)
    db.session.add(user)
    db.session.commit()



    user = get_user(id)

    q = pd(
        user_id = user.id,
        profile_pic_url = url,
        profile_album = {},
        gender = gender,
        work_dummy = 'analyst at Citi',
        work = {},
        current_location_name = 'Kanpur, India',
        current_location_city = '',
        current_location_state = '',
        current_location_country = '',
        current_location_latlong = {},
        hometown_location_name = '',
        hometown_location_city = '',
        hometown_location_state = '',
        hometown_location_country = '',
        hometown_location_latlong = '',
        birthday = parser.parse('1 January 1988'),
        interested_in = [g for g in ('male','female') if g != gender][0],
        education_dummy = 'iit kanpur',
        education = {},
        likes_dummy = 'larry page',
        watched = {},
        wants_to = {},
        likes = {},
        relationship_status='single',
        votes = 10
        )
    db.session.add(q)
    db.session.commit()

    push_to_index(user)
    register_user(id, id)