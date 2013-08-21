
# from datetime import datetime as dt
from models import UserComplete, db
#from jabber_register_user import register_user
# from myfunctions import get_data
# from dateutil import parser
# import time
# from get_image_size import getsizes
from parse_fbdata import parse_videos, parse_likes
from myfunctions import fb_call, fql
import time

access_token = ['CAACEdEose0cBAAnhlMBhph40l5fbHzozgVcSffddKra9oaUZB1Git5ZCNJT7OFBQnwHMkAoD8Or1d62FwPnsA7WxmaHeD0TbKsMQQheJBzW29xpMKT8xZC6bXdYmP63mqe3PRzOiknnUZB0Q6ZBhZBRNZBWs4bqZAXUZD']

users = UserComplete.query.all()

for user in users:
	time.sleep(1)
	print user.id, user.fb_uid, user.name

	uid = user.fb_uid	

	vw = fb_call(uid + '/video.watches/?fields=data',args={'access_token': access_token})
	vw, vw_ids = parse_videos(vw)

	vww = fb_call(uid + '/video.wants_to_watch/?fields=data',args={'access_token': access_token})
	vww, vww_ids = parse_videos(vww)

	br = fb_call(uid + '/books.reads/?fields=data',args={'access_token': access_token})
	br, br_ids = parse_videos(br)

	bwr = fb_call(uid + '/books.wants_to_read/?fields=data',args={'access_token': access_token})
	bwr, bwr_ids = parse_videos(bwr)

	likes = fql(
	"select type, page_id, name from page where page_id in (select page_id from page_fan where uid=" + uid + ") limit 1000",
	access_token
	)
	likes, likes_ids = parse_likes(likes)

	# likes_dummy = likes + ', ' + vw + ', ' + vww + ', ' + br + ', ' + bwr
	# likes_dummy = ', '.join([i for i in (likes, vw, vww, br, bwr) if i])
	# likes_dummy = likes_dummy[:3000]
	# likes_dummy = join_likes(likes, vw, vww, br, bwr)
	likes_dummy_ids = vw_ids + vww_ids + br_ids + bwr_ids + likes_ids
	# user.likes_dummy_ids = set(likes_dummy_ids)
	user.likes_set = set(likes_dummy_ids)
	
	db.session.add(user)
	db.session.commit()