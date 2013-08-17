from models import db, UserComplete
import requests, json
from dateutil import parser
from datetime import datetime as dt
from indextank1.client import ApiClient as itc
import os
from sqlalchemy import or_
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker
from parse_fbdata import *
from slugify import obfuscate



# session = sessionmaker(bind = db.engine, autocommit = True)()



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


# def get_location_for_dump(loc, key1, key2):
# 	try:
# 	    res = loc[0].get(key1).get(key2)
# 	except Exception, e:
# 	    print "FACEBOOK_DATAPULL: get_location_for_dump ::", key1, key2, e
# 	    res = ''
# 	return res


def get_user(uid):
	return UserComplete.query.filter_by(fb_uid=uid).first() 

# def get_data(my_user):
# 	return UserComplete.query.filter_by(id=my_user.id).first()


# def convert_sqlobj_to_dict(obj, restrict_to_keys):
# 	return [(c.name, getattr(obj, c.name)) for c in obj.__table__.columns if c.name in restrict_to_keys]


def get_index_handle():
	url_str = os.environ.get('INDEXDEN_API_URL')
	api_client = itc(url_str)
	people_index = api_client.get_index('people')
	return people_index


def push_to_index(**kwargs):
	
	handle = get_index_handle()

	keys = ['itf1', 'itf2', 'itf3', 'itf4', 'itf5', 'itf6', 'itf7', 'itf8']

	doc = {}
	doc['text'] = ', '.join([kwargs[key] for key in keys])
	doc['shauniqueid'] = 'DBaMlk3TGxHRW91SWhTYUlLVktZTk'
	for key in keys:
		doc[key] = kwargs[key]

	try:
		birthyear = kwargs['birthday'].year
	except Exception:
		birthyear = 1900

	c_lat = kwargs['c3'] if kwargs['c3'] else 0
	c_lng = kwargs['c4'] if kwargs['c4'] else 0
	h_lat = kwargs['h3'] if kwargs['h3'] else 0
	h_lng = kwargs['h4'] if kwargs['h4'] else 0
	g = 0 if kwargs['gender']=='Female' else 1
		
	
	variables = {0:1, 1:birthyear, 2:c_lat, 3:c_lng, 4:h_lat, 5:h_lng, 6:kwargs['iii'], 7:g}
	handle.add_document(kwargs['docid'], doc, variables)



def push_data(access_token, only_data=False):

	me = fb_call('me/?fields=name,picture,gender,work,education,birthday,interested_in,email,relationship_status,username', args={'access_token': access_token})

	name = parse_name(me.get('name'))
	email = me.get('email')
	fb_uid = me.get('id')
	username = me.get('username')
	gender = parse_gender(me.get('gender'))
	relationship_status = parse_status(me.get('relationship_status'))
	education, education_index = parse_education(me.get('education'))
	work, work_index = parse_work(me.get('work'))
	birthday, birthday_index = parse_birthday(me.get('birthday'))
	interested_in, interested_in_index = parse_interested_in(me.get('interested_in'))
	profile_pic_url = parse_picture(me.get('picture'))


	# profile_pic_url = fb_call('me/picture/?type=large&redirect=false',args={'access_token': access_token})
	# try:
	#     profile_pic_url = profile_pic_url['data']['url']
	# except Exception, e:
	#     profile_pic_url = ''
	#     print "FACEBOOK_DATAPULL: profile_pic_url ::", e

	loc = fql('select current_location, hometown_location from user where uid=me()', access_token)
	c1,c2,c3,c4,h1,h2,h3,h4 = parse_location_main(loc)

	vw = fb_call('me/video.watches/?fields=data',args={'access_token': access_token})
	vw = parse_videos(vw)

	vww = fb_call('me/video.wants_to_watch/?fields=data',args={'access_token': access_token})
	vww = parse_videos(vww)

	br = fb_call('me/books.reads/?fields=data',args={'access_token': access_token})
	br = parse_videos(br)

	bwr = fb_call('me/books.wants_to_read/?fields=data',args={'access_token': access_token})
	bwr = parse_videos(bwr)

	likes = fql(
	"select type, page_id, name from page where page_id in (select page_id from page_fan where uid=me()) limit 1000",
	access_token
	)
	likes = parse_likes(likes)

	# likes_dummy = likes + ', ' + vw + ', ' + vww + ', ' + br + ', ' + bwr
	# likes_dummy = ', '.join([i for i in (likes, vw, vww, br, bwr) if i])
	# likes_dummy = likes_dummy[:3000]
	likes_dummy = join_likes(likes, vw, vww, br, bwr)

	try:
		maxid = db.session.execute('select max(id) from usercomplete').fetchall()[0][0]
		if not maxid:
			maxid = 0
	except Exception:
		maxid = 0

	user_key = obfuscate(fb_uid)

	c_latlong = parse_latlong(c3, c4)
	h_latlong = parse_latlong(h3, h4)

	uc = UserComplete(
		id = maxid + 1,
	    name = name,
	    email = email,
	    fb_uid = fb_uid,
	    user_key = user_key,
	    username = username,
	    profile_pic_url = profile_pic_url,
	    # profile_album = profile_album,
	    gender = gender,
	    work = work,
	    current_location_name = c1,
	    current_location_dummy = c2,
	    current_location_latlong = c_latlong,
	    hometown_location_name = h1,
	    hometown_location_dummy = h2,
	    hometown_location_latlong = h_latlong,
	    birthday = birthday,
	    birthday_dformat = birthday_index,
	    education = education,
	    likes_dummy = likes_dummy,
	    relationship_status=relationship_status,
	    interested_in = interested_in
	    # votes = 1
	    )

	db.session.add(uc)
	db.session.commit()

	push_to_index(
		docid = maxid+1,
		itf1 = name,
		itf2 = gender,
		itf3 = relationship_status,
		itf4 = education_index,
		itf5 = work_index,
		itf6 = c2,
		itf7 = h2,
		itf8 = likes_dummy,
		birthday = birthday_index,
		c3 = c3,
		c4 = c4,
		h3 = h3,
		h4 = h4,
		iii = interested_in_index,
		gender = gender
		)



def get_or_create(access_token):
    uid = fb_call('me/?fields=id', args={'access_token': access_token}).get('id')
    my_user = get_user(uid)

    if my_user:
    	return my_user
    else:
    	push_data(access_token)
    	return get_or_create(access_token)


def get_age(b):
	if not b:
		return ''

	try:
		age = int(round((dt.now() - b).days/365.0))
		if not 13<=age<=100:
			age = ''
	except Exception, e:
		# print "FACEBOOK_DATAPULL: get_age ::", b, e
		age = ''
	return str(age)



# def search_index(token, form, fetch_fields=['docid']):
# 	handle = get_index_handle()
# 	#kwargs.keys() = ['user', 'query', 'filters', 'fetch_fields']
# 	#query = {'name':'ripu',  'current_location_city':'bangalore', 'likes_dummy':'sachin'}
# 	#filters = {'age':[20, 24], 'distance':10}
# 	fetch_fields=['fb_uid', 'name']
# 	#global_query = 'hathi'

# 	form = {key:value for key,value in form.iteritems() if value}

# 	function_filters = {}
# 	docvar_filters = {1:[[None, None]]}
# 	variables = {}
# 	# match_any_field=None
# 	# global_query = ''

# 	if 'distance' in form:
# 		function_filters[1] = [[ None, int(form['distance']) ]]
# 		user = get_or_create(token)
# 		data = get_data(user)
# 		#latitude = data.current_location_latlong.get('latitude')
# 		#longitude = data.current_location_latlong.get('longitude')
# 		#if latitude and longitude:
# 		variables[0] = data.current_location_latlong.get('latitude')
# 		variables[1] = data.current_location_latlong.get('longitude')

# 	if 'age_high' in form:
# 		docvar_filters[1][0][0] = dt.now().year-int(form['age_high'])

# 	if 'age_low' in form:
# 		docvar_filters[1][0][1] = dt.now().year-int(form['age_low'])

# 	keys = ['name', 'gender', 'current_location_dummy', 'hometown_location_dummy', 'work_dummy', 'education_dummy', 'likes_dummy', 'text']


# 	q = ' AND '.join([key+":("+' AND '.join(value.split())+")" for key, value in form.iteritems() if key in keys] )

# 	# if 'global_query' in form:
# 	# 	q1 = "(" + form['global_query'] + ')'
# 	# 	if q:
# 	# 		q = ' AND '.join((q1, q))
# 	# 	else:
# 	# 		q = q1
# 	# 	match_any_field = 'true'

# 	# print q

# 	if not q:
# 		return []

# 	# q = 'text:'+form['text']
# 	q = form['text']

# 	# res = handle.search(q, 
# 	# 		scoring_function=0, 
# 	# 		function_filters=function_filters, 
# 	# 		docvar_filters=docvar_filters,
# 	# 		fetch_fields=fetch_fields,
# 	# 		# match_any_field=match_any_field,
# 	# 		variables=variables)['results']
# 	res = handle.search(q, length=600)['results']

# 	# print res
# 	search_results = []

# 	for i in res:
# 		d = {}
# 		user = get_user_by_id(i['docid'])
# 		if user:
# 			data = get_data(user)
# 			d = dict( convert_sqlobj_to_dict(user, ('name','fb_uid', 'id')) + convert_sqlobj_to_dict(data, ('relationship_status', 'profile_pic_url', 'gender', 'current_location_name') ) )
# 			d['age'] = get_age(data.birthday)
# 			d['uid'] = '.'.join(user.name.split()).lower()
# 			search_results.append(user)

# 	return search_results



# def get_user_by_id(user_id):
# 	return UserComplete.query.get(int(user_id))


# def get_parsed_birthday(b):
# 	if b:
# 		return b.strftime('%B %d')
# 	else:
# 		return ''

def sqlobj_to_dict(users, maps):
	# import simplejson as json
	# from random import random
	# keys = ('name', 'user_key', 'gender', 'profile_pic_url', 'work', 'education','current_location_name',
	# 		'hometown_location_name', 'relationship_status', 'interested_in', 'likes_dummy', 'profile_album', 
	# 		'username', 'current_location_dummy', 'birthday', 'hometown_location_dummy', 'current_location_latlong'
	# 		)

	keys = {
			0: 'name',
			1: 'fb_uid',
			2: 'gender',
			3: 'profile_pic_url',
			4: 'work',
			5: 'education',
			6: 'current_location_name',
			7: 'hometown_location_name',
			8: 'relationship_status',
			9: 'interested_in',
			10: 'likes_dummy',
			11: 'profile_album',
			12: 'username',
			13: 'current_location_dummy',
			14: 'birthday',
			15: 'hometown_location_dummy',
			16: 'current_location_latlong'
			}

	res = []
	for user in users:
		# a = {c.name: getattr(user, c.name) for c in user.__table__.columns if c.name in keys}
		a = {c: getattr(user, keys[c]) for c in keys.keys() if getattr(user, keys[c])}
		a['scr'] = maps[user.id]
		if user.height and user.width:
			a[19] = round((float(user.height)/float(user.width))*200)
		else:
			a[19] = 200
		age = get_age(user.birthday_dformat)
		if age:
			a[18] = age
		# a['birthday'] = get_parsed_birthday(user.birthday)
		# if a['profile_album']:
		# 	a['profile_album'] = a['profile_album'][:4]

		# a['work_name'] = "Founder at People (June 2013 to present)"
		# a['likes'] = user.likes[:3]
	 	res.append(a)
	# start = int(random()*100)
	# end = start + 100
	return {'data':res}


def get_field_boost(query):

	# itf1 = name,
	# itf2 = gender,
	# itf3 = relationship_status,
	# itf4 = education_index,
	# itf5 = work_index,
	# itf6 = c2,
	# itf7 = h2,
	# itf8 = likes_dummy,

	return '(itf1:' + query + '^10 OR ' + \
			'itf2:' + query + '^15 OR ' + \
			'itf3:' + query + '^9 OR ' + \
			'itf4:' + query + '^3 OR ' + \
			'itf5:' + query + '^5 OR ' + \
			'itf6:' + query + '^4 OR ' + \
			'itf7:' + query + '^2 OR ' + \
			'itf8:' + query + '^1)'


def search_index(query, cuser=None):

	search_results = {'data':[]}
	user = get_user(cuser['fb_uid'])

	if query:	
		handle = get_index_handle()
		fetch_fields=['docid', 'query_relevance_score']
		variables = add_variables(user)

		if query=='DBaMlk3TGxHRW91SWhTYUlLVktZTk':
			new_q = 'shauniqueid:DBaMlk3TGxHRW91SWhTYUlLVktZTk'
		else:
			# query = '(' + ' OR '.join(query.split()) + ')'
			new_q =	map(get_field_boost, query.split())
			new_q = ' AND '.join(new_q)
			# print new_q			

		res = handle.search(
			new_q, 
			length=200, 
			scoring_function=3, 
			fetch_fields=fetch_fields, 
			# match_any_field='true',
			variables = variables
			)['results']
		
		if res:
			res1 = {int(i['docid']):float(i['query_relevance_score']) for i in res}
			clauses = or_( *[UserComplete.id==key for key in res1.keys()] )
			users = UserComplete.query.filter(clauses).all()
			search_results = sqlobj_to_dict(users, res1)

	search_results['name'] = user.name
	# search_results['fb_uid'] = cuser['user_key']
	search_results['latlong'] = user.current_location_latlong	
	search_results['userid'] = user.user_key
	search_results['username'] = user.fb_uid

	return search_results


# def push_data_mass(uid, access_token):

# 	me = fb_call(uid + '/?fields=name,picture,gender,work,education,birthday,interested_in,email,relationship_status,username', args={'access_token': access_token})

# 	name = parse_name(me.get('name'))
# 	email = me.get('email')
# 	fb_uid = me.get('id')
# 	username = me.get('username')
# 	gender = parse_gender(me.get('gender'))
# 	relationship_status = parse_status(me.get('relationship_status'))
# 	education, education_index = parse_education(me.get('education'))
# 	work, work_index = parse_work(me.get('work'))
# 	birthday, birthday_index = parse_birthday(me.get('birthday'))
# 	interested_in, interested_in_index = parse_interested_in(me.get('interested_in'))
# 	profile_pic_url = parse_picture(me.get('picture'))


# 	# profile_pic_url = fb_call('me/picture/?type=large&redirect=false',args={'access_token': access_token})
# 	# try:
# 	#     profile_pic_url = profile_pic_url['data']['url']
# 	# except Exception, e:
# 	#     profile_pic_url = ''
# 	#     print "FACEBOOK_DATAPULL: profile_pic_url ::", e

# 	loc = fql('select current_location, hometown_location from user where uid=' + uid, access_token)
# 	c1,c2,c3,c4,h1,h2,h3,h4 = parse_location_main(loc)

# 	vw = fb_call(uid + '/video.watches/?fields=data',args={'access_token': access_token})
# 	vw = parse_videos(vw)

# 	vww = fb_call(uid + '/video.wants_to_watch/?fields=data',args={'access_token': access_token})
# 	vww = parse_videos(vww)

# 	br = fb_call(uid + '/books.reads/?fields=data',args={'access_token': access_token})
# 	br = parse_videos(br)

# 	bwr = fb_call(uid + '/books.wants_to_read/?fields=data',args={'access_token': access_token})
# 	bwr = parse_videos(bwr)

# 	likes = fql(
# 	"select type, page_id, name from page where page_id in (select page_id from page_fan where uid=" + uid + ") limit 1000",
# 	access_token
# 	)
# 	likes = parse_likes(likes)

# 	# try:
# 	# 	likes = likes.encode('ascii', 'ignore')
# 	# except Exception:
# 	# 	newlikes = 't'

# 	# likes_dummy = likes + ', ' + vw + ', ' + vww + ', ' + br + ', ' + bwr
# 	# likes_dummy = ', '.join([i for i in (likes, vw, vww, br, bwr) if i])
# 	# likes_dummy = likes_dummy[:3000]

# 	likes_dummy = join_likes(likes, vw, vww, br, bwr)

# 	# maxid = db.session.execute('select max(id) from usercomplete').fetchall()[0][0]
# 	try:
# 		maxid = db.session.execute('select max(id) from usercomplete').fetchall()[0][0]
# 		if not maxid:
# 			maxid = 0
# 	except Exception:
# 		maxid = 0

# 	user_key = obfuscate(fb_uid)
# 	c_latlong = parse_latlong(c3, c4)
# 	h_latlong = parse_latlong(h3, h4)

# 	uc = UserComplete(
# 		id = maxid + 1,
# 	    name = name,
# 	    email = email,
# 	    fb_uid = fb_uid,
# 	    user_key = user_key,
# 	    username = username,
# 	    profile_pic_url = profile_pic_url,
# 	    # profile_album = profile_album,
# 	    gender = gender,
# 	    work = work,
# 	    current_location_name = c1,
# 	    current_location_dummy = c2,
# 	    current_location_latlong = c_latlong,
# 	    hometown_location_name = h1,
# 	    hometown_location_dummy = h2,
# 	    hometown_location_latlong = h_latlong,
# 	    birthday = birthday,
# 	    birthday_dformat = birthday_index,
# 	    education = education,
# 	    likes_dummy = likes_dummy,
# 	    relationship_status=relationship_status,
# 	    interested_in = interested_in
# 	    # votes = 1
# 	    )

# 	db.session.add(uc)
# 	db.session.commit()

# 	push_to_index(
# 		docid = maxid+1,
# 		itf1 = name,
# 		itf2 = gender,
# 		itf3 = relationship_status,
# 		itf4 = education_index,
# 		itf5 = work_index,
# 		itf6 = c2,
# 		itf7 = h2,
# 		itf8 = likes_dummy,
# 		birthday = birthday_index,
# 		c3 = c3,
# 		c4 = c4,
# 		h3 = h3,
# 		h4 = h4,
# 		iii = interested_in_index
# 		)