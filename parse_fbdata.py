
from dateutil import parser
import simplejson as sjson
from datetime import datetime as dt


import re
import unidecode

def slugify_unicode(str):
	if type(str) == unicode:
		# str = unidecode.unidecode(str).lower()
		str = unidecode.unidecode(str)
	# return re.sub(r'\W+','-',str)
	return str


def parse_education(listobj):

	if not listobj:
		return [], ''

	education = []
	edu_json = []

	for item in listobj:		
		
		line = ''
		# keys = item.keys()

		if item.get('degree'):
			line += item['degree']['name']

		if item.get('concentration'):
			if line:
				line += ' in '
			line += item['concentration'][0]['name']

		if item.get('school'):
			if line:
				line += ' from '
			line += item['school']['name']

		edu_json.append(line.encode('ascii', 'ignore'))

		if item.get('year'):
			if line:
				line += ' (' + item['year']['name'] + ')'

		if item.get('classes'):
			if line:
				line += ', ' + item['classes'][0]['name']

		# if 'type' in keys:
		# 	school_type = item['type']

		education.append(line.encode('ascii', 'ignore'))

	return education, ', '.join(edu_json)



def parse_work(listobj):

	if not listobj:
		return [], ''

	work = []
	work_json = []

	for item in listobj:		
		
		flag1 = False
		flag2 = False
		line = ''
		# keys = item.keys()

		if item.get('position'):
			line += item['position']['name']

		if item.get('employer'):
			if line:
				line += ' at '
			line += item['employer']['name']

		if item.get('description'):
			if line:
				line += ' ('
				flag1 = True
			line += item['description']
			if flag1:
				line += ')'

		if item.get('location'):
			if line:
				line += ', ' 
			line += item['location']['name']

		work_json.append(line.encode('ascii', 'ignore'))

		if item.get('start_date'):
			try:
				start_date = parser.parse(item['start_date']).strftime('%b %Y')
			except Exception:
				start_date = ''
			if line and start_date:
				if item.get('end_date'):
					line += ' - '
				else:
					line += ' - Since '
				line += parser.parse(item['start_date']).strftime('%b %Y')
				flag2 = True

		if item.get('end_date'):
			if flag2:
				try:
					line += ' to ' + parser.parse(item['end_date']).strftime('%b %Y')
				except Exception:
					end_data_Error = 'error'

		work.append(line.encode('ascii', 'ignore'))

	return work, ', '.join(work_json)


def parse_birthday(birthday):

	if not birthday:
		return '', dt.now()

	try:
		res = parser.parse(birthday)
		res_str = res.strftime('%B %d')
	except Exception:
		res = dt.now()
		res_str = ''

	birthday_comps = birthday.split('/')
	if len(birthday_comps) != 3:
		res = dt.now()

	return res_str, res



def parse_interested_in(listobj):
	# interested_in = me.get('interested_in')
	if not listobj:
		return '', 0
		
	try:
		interested_in = map(unicode.title, listobj)
		interested_in = ' and '.join(interested_in)
	except Exception, e:
		interested_in = ''
		print "FACEBOOK_DATAPULL: interested_in ::", interested_in, e 

	if 'male' in listobj and 'female' in listobj:
		interested_in_index = 3
	elif 'male' in listobj:
		interested_in_index = 2
	elif 'female' in listobj:
		interested_in_index = 1
	else:
		interested_in_index = 0

	return interested_in, interested_in_index 
	# return interested_in_index


def parse_gender(g):
	if g:
		return g.title()
	else:
		return ''


def parse_status(g):
	if g:
		return g.title()
	else:
		return ''		


def parse_location(dictobj):

	if not dictobj:
		return '', '', '', ''

	keys = dictobj.keys()
	line = ''

	if dictobj.get('name'):
		name = dictobj['name']

	if dictobj.get('street'):
		line += dictobj['street']

	if dictobj.get('city'):
		if line:
			line += ', '
		line += dictobj['city']

	if dictobj.get('state'):
		if line:
			line += ', '
		line += dictobj['state']

	if dictobj.get('country'):
		if line:
			line += ', '
		line += dictobj['country']

	if dictobj.get('zip'):
		if line:
			line += ', '
		line += dictobj['zip']

	if dictobj.get('latitude'):
		latitude = dictobj['latitude']
	else:
		latitude = ''

	if dictobj.get('longitude'):
		longitude = dictobj['longitude']
	else:
		longitude = ''

	return name.encode('ascii', 'ignore'), line.encode('ascii', 'ignore'), latitude, longitude


def parse_location_main(locobj):

	if not locobj:
		return '','','','','','','',''

	c1,c2,c3,c4 = parse_location(locobj[0].get('current_location'))
	h1,h2,h3,h4 = parse_location(locobj[0].get('hometown_location'))

	return c1,c2,c3,c4,h1,h2,h3,h4 


def parse_videos(dictobj):

	if not dictobj:
		return ''

	vw = dictobj.get('data')
	if not vw:
		return ''

	res = []

	for v in vw:
		d = v.get('data')
		if d:
			keys = d.keys()
			for key in keys:
				if d[key]:
					if type(d[key]) == dict:
						title = d[key].get('title')
						if title:
							res.append(title)

	# str_db = ', '.join(res[:3])
	# str_index = ', '.join(res)
	return ', '.join(res)
	

def parse_likes(listobj):

	if not listobj:
		return ''

	likes = []

	for like in listobj:
		name = like.get('name')
		if name:
			likes.append(name)

	return ', '.join(likes)


def parse_picture(dictobj):

	if not dictobj:
		return ''

	data = dictobj.get('data')
	if not data:
		return ''

	url = data.get('url')

	if not url:
		return ''
	
	try:
		url = url.replace('q.jpg', 'n.jpg')
	except Exception:
		url = ''

	return url


def parse_latlong(lat, lng):
	if lat and lng:
		return [lat, lng]
	else:
		return []


def join_likes(likes, vw, vww, br, bwr):
	likes_dummy = ', '.join([i for i in (likes, vw, vww, br, bwr) if i])
	likes_dummy = likes_dummy[:3000]
	try:
		res = likes_dummy.encode('ascii', 'ignore')
	except:
		res = likes_dummy
	return res


def parse_name(n):
	if not n:
		return ''

	return slugify_unicode(n)









