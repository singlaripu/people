from models import db, User, ProfileData
import requests, json
from dateutil import parser
from datetime import datetime as dt
from indextank1.client import ApiClient as itc
import os


def fql(fql, token, args=None):
    if not args:
        args = {}

    args["query"], args["format"], args["access_token"] = fql, "json", token

    url = "https://api.facebook.com/method/fql.query"

    r = requests.get(url, params=args)
    return json.loads(r.content)


def fb_call(call, args=None):
    url = "https://graph.facebook.com/{0}".format(call)
    r = requests.get(url, params=args)
    return json.loads(r.content)


def get_location_for_dump(loc, key1, key2):
	try:
	    res = loc[0].get(key1).get(key2)
	except Exception, e:
	    print "FACEBOOK_DATAPULL: get_location_for_dump ::", key1, key2, e
	    res = ''
	return res


def get_user(uid):
	return User.query.filter_by(fb_uid=uid).first() 

def get_data(my_user):
	return ProfileData.query.filter_by(user_id=my_user.id).first()


def convert_sqlobj_to_dict(obj, restrict_to_keys):
	return [(c.name, getattr(obj, c.name)) for c in obj.__table__.columns if c.name in restrict_to_keys]


def get_index_handle():
	url_str = os.environ.get('INDEXDEN_API_URL')
	api_client = itc(url_str)
	people_index = api_client.get_index('people')
	return people_index


def push_to_index(user):
	
	handle = get_index_handle()
	data = get_data(user)

	keys = ['name', 'fb_uid', 'gender', 'work_dummy', 'current_location_name', 'current_location_city', 'current_location_state',
	'current_location_country', 'hometown_location_name', 'hometown_location_city', 'hometown_location_state', 
	'hometown_location_country', 'education_dummy', 'likes_dummy']

	doc = dict(convert_sqlobj_to_dict(user, keys) + convert_sqlobj_to_dict(data, keys))

	latitude = data.current_location_latlong.get('latitude')
	longitude = data.current_location_latlong.get('longitude')
	birthyear = data.birthday.year
	
	variables = {0: data.votes, 1:birthyear, 2:latitude, 3:longitude}

	handle.add_document(user.id, doc, variables)



def push_data(access_token, only_data=False):

	me = fb_call('me/?fields=name,gender,work,education,birthday,interested_in,email', args={'access_token': access_token})

	if not only_data:
		user = User(name=me.get('name'), email=me.get('email'), fb_uid=me.get('id'))
		db.session.add(user)
		db.session.commit()	


	user = get_user(me.get('id'))
	user_id = user.id
	profile_pic_url = fb_call('me/picture/?type=large&redirect=false',args={'access_token': access_token})
	try:
	    profile_pic_url = profile_pic_url['data']['url']
	except Exception, e:
	    profile_pic_url = ''
	    print "FACEBOOK_DATAPULL: profile_pic_url ::", e


	profile_album = fql(
	"select src, src_big from photo where album_object_id in (select object_id from album where owner=me() and type='profile')",
	access_token
	)

	gender = me.get('gender')
	if gender:
		gender = gender.title()

	try:
	    work_dummy = ','.join([i.get('employer').get('name') for i in me.get('work')])
	except Exception, e:
	    print "FACEBOOK_DATAPULL: work_dummy ::", e
	    work_dummy = ''

	work = me.get('work')
	try:
		work[0]['start_date'] = parser.parse(work[0]['start_date']).strftime('%b %Y')
	except Exception, e:
		print "FACEBOOK_DATAPULL: work.start_date ::", e


	loc = fql('select current_location, hometown_location from user where uid=me()', access_token)

	current_location_name = get_location_for_dump(loc, 'current_location', 'name')
	current_location_city = get_location_for_dump(loc, 'current_location', 'city')
	current_location_state = get_location_for_dump(loc, 'current_location', 'state')
	current_location_country = get_location_for_dump(loc, 'current_location', 'country')
	current_location_latlong = dict((k, get_location_for_dump(loc, 'current_location', k)) for k in ('latitude', 'longitude'))

	hometown_location_name = get_location_for_dump(loc, 'hometown_location', 'name')
	hometown_location_city = get_location_for_dump(loc, 'hometown_location', 'city')
	hometown_location_state = get_location_for_dump(loc, 'hometown_location', 'state')
	hometown_location_country = get_location_for_dump(loc, 'hometown_location', 'country')
	hometown_location_latlong = dict((k, get_location_for_dump(loc, 'hometown_location', k)) for k in ('latitude', 'longitude'))            

	birthday = me.get('birthday')
	if birthday:
	    try:
	        birthday = parser.parse(birthday)
	    except Exception, e:
	        birthday = None
	        print "FACEBOOK_DATAPULL: birthday ::", birthday, e

	interested_in = me.get('interested_in')
	if interested_in:
		interested_in = map(unicode.title, interested_in)
		try:
		    interested_in = ' and '.join(interested_in)
		except Exception, e:
		    interested_in = None
		    print "FACEBOOK_DATAPULL: interested_in ::", interested_in, e            

	try:
	    education_dummy = ','.join([i.get('school').get('name') for i in me.get('education')])
	except Exception, e:
	    print "FACEBOOK_DATAPULL: education_dummy ::", e
	    education_dummy = ''

	education = me.get('education')

	video_watched_dict = {'TV Shows':[], 'Movies':[]}
	video_watched = fb_call('me/video.watches/?fields=data',args={'access_token': access_token})
	for vid in video_watched['data']:
	    if 'tv_show' in vid['data'].keys():
	        video_watched_dict['TV Shows'].append({'url':vid['data']['tv_show']['url'], 'title':vid['data']['tv_show']['title'], 'id':vid['data']['tv_show']['id']})
	    elif 'movie' in vid['data'].keys():
	        video_watched_dict['Movies'].append({'url':vid['data']['movie']['url'], 'title':vid['data']['movie']['title'], 'id':vid['data']['movie']['id']})

	video_want_to_watch_dict = {'TV Shows':[], 'Movies':[]}
	video_want_to_watch = fb_call('me/video.wants_to_watch/?fields=data',args={'access_token': access_token})
	for vid in video_want_to_watch['data']:
	    if 'tv_show' in vid['data'].keys():
	        video_want_to_watch_dict['TV Shows'].append({'url':vid['data']['tv_show']['url'], 'title':vid['data']['tv_show']['title'], 'id':vid['data']['tv_show']['id']})
	    elif 'movie' in vid['data'].keys():
	        video_want_to_watch_dict['Movies'].append({'url':vid['data']['movie']['url'], 'title':vid['data']['movie']['title'], 'id':vid['data']['movie']['id']})

	video_watched_dict['Books'] = []
	books_read = fb_call('me/books.reads/?fields=data',args={'access_token': access_token})
	for vid in books_read['data']:
	    if 'book' in vid['data'].keys():
	        video_watched_dict['Books'].append({'url':vid['data']['book']['url'], 'title':vid['data']['book']['title'], 'id':vid['data']['book']['id']})

	video_watched_dict = [(key, value) for key, value in video_watched_dict.iteritems()]
	video_watched_dict = sorted(video_watched_dict, key =lambda x: len(x[1]), reverse=True)


	video_want_to_watch_dict['Books'] = []
	books_wants_to_read = fb_call('me/books.wants_to_read/?fields=data',args={'access_token': access_token})
	for vid in books_wants_to_read['data']:
	    if 'book' in vid['data'].keys():
	        video_want_to_watch_dict['Books'].append({'url':vid['data']['book']['url'], 'title':vid['data']['book']['title'], 'id':vid['data']['book']['id']})

	video_want_to_watch_dict = [(key, value) for key, value in video_want_to_watch_dict.iteritems()]
	video_want_to_watch_dict = sorted(video_want_to_watch_dict, key =lambda x: len(x[1]), reverse=True)   

	likes = fql(
	"select type, page_id, name from page where page_id in (select page_id from page_fan where uid=me()) limit 1000",
	access_token
	)

	likes_dict = {}
	for like in likes:
	    try:
	        likes_dict[like['type']].append({'title':like['name'], 'id':like['page_id']})
	    except KeyError:
	        likes_dict[like['type']] = []
	        likes_dict[like['type']].append({'title':like['name'], 'id':like['page_id']})
	likes_dict = [(key, value) for key, value in likes_dict.iteritems()]
	likes_dict = sorted(likes_dict, key =lambda x: len(x[1]), reverse=True)

	watched = video_watched_dict
	wants_to = video_want_to_watch_dict
	likes = likes_dict

	likes_dummy = ','.join([k.get('title') for i,j in watched+wants_to+likes for k in j])

	#fb_app = fb_call(FB_APP_ID, args={'access_token': access_token})
	#photos = fb_call('me/photos',args={'access_token': access_token, 'limit': 16})
    #POST_TO_WALL = ("https://www.facebook.com/dialog/feed?redirect_uri=%s&"
    #                "display=popup&app_id=%s" % (redir, FB_APP_ID))

    #app_friends = fql(
    #    "SELECT uid, name, is_app_user, pic_square "
    #    "FROM user "
    #    "WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) AND "
    #    "  is_app_user = 1", access_token)

    #SEND_TO = ('https://www.facebook.com/dialog/send?'
    #           'redirect_uri=%s&display=popup&app_id=%s&link=%s'
    #           % (redir, FB_APP_ID, get_home()))

	
	pd = ProfileData(
	    user_id = user_id,
	    profile_pic_url = profile_pic_url,
	    profile_album = profile_album,
	    gender = gender,
	    work_dummy = work_dummy,
	    work = work,
	    current_location_name = current_location_name,
	    current_location_city = current_location_city,
	    current_location_state = current_location_state,
	    current_location_country = current_location_country,
	    current_location_latlong = current_location_latlong,
	    hometown_location_name = hometown_location_name,
	    hometown_location_city = hometown_location_city,
	    hometown_location_state = hometown_location_state,
	    hometown_location_country = hometown_location_country,
	    hometown_location_latlong = hometown_location_latlong,
	    birthday = birthday,
	    interested_in = interested_in,
	    education_dummy = education_dummy,
	    education = education,
	    likes_dummy = likes_dummy,
	    watched = watched,
	    wants_to = wants_to,
	    likes = likes 
	    )

	db.session.add(pd)
	db.session.commit()

	push_to_index(user)

	return user


def get_or_create(access_token):
    uid = fb_call('me/?fields=id', args={'access_token': access_token}).get('id')
    my_user = get_user(uid)
    
    if my_user:
        user_data = get_data(my_user)
        if not user_data:
        	my_user = push_data(access_token, only_data=True)
        	user_data = get_data(my_user)
    else:
        my_user = push_data(access_token)
        user_data = get_data(my_user)
    return my_user, user_data


def get_age(b):
	try:
		age = int(round((dt.now() - b).days/365.0))
		if not 13<=age<=100:
			age = ''
	except Exception, e:
		print "FACEBOOK_DATAPULL: get_age ::", b, e
		age = ''
	return str(age)



def search_index(**kwargs):
	handle = get_index_handle()
	#kwargs.keys() = ['user', 'query', 'filters', 'fetch_fields']
	#query = {'name':'ripu',  'current_location_city':'bangalore', 'likes_dummy':'sachin'}
	#filters = {'age':[20, 24], 'distance':10}
	#fetch_fields=['fb_uid', 'name']

	function_filters = {}
	docvar_filters = {}
	variables = {}
	fetch_fields = ['docid']

	if 'filters' in kwargs:

		if 'distance' in kwargs['filters']:
			function_filters[1] = [[ None, kwargs['filters']['distance'] ]]
			data = get_data(kwargs['user'])
			variables[0] = data.current_location_latlong.get('latitude')
			variables[1] = data.current_location_latlong.get('longitude')


		if 'age' in kwargs['filters']:
			year = dt.now().year
			docvar_filters[1] = [[year-i  for i in reversed(kwargs['filters']['age'])]]
			
	if 'fetch_fields' in kwargs:
		fetch_fields+=kwargs['fetch_fields']

	q = ' AND '.join([key+":("+' AND '.join(value.split())+")" for key, value in kwargs['query'].iteritems()])

	res = handle.search(q, 
			scoring_function=0, 
			function_filters=function_filters, 
			docvar_filters=docvar_filters,
			fetch_fields=fetch_fields, 
			variables=variables)['results']
	return res
