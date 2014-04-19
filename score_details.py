
from parse_fbdata import add_variables, get_relationship_wgt, get_interested_in_index
from myfunctions import get_field_boost, get_user, get_index_handle, get_lv_likes
import math
import sys

def km(lat1, long1, lat2, long2):

    # Convert latitude and longitude to 
    # spherical coordinates in radians.
    degrees_to_radians = math.pi/180.0
        
    # phi = 90 - latitude
    phi1 = (90.0 - lat1)*degrees_to_radians
    phi2 = (90.0 - lat2)*degrees_to_radians
        
    # theta = longitude
    theta1 = long1*degrees_to_radians
    theta2 = long2*degrees_to_radians
        
    # Compute spherical distance from spherical coordinates.
        
    # For two locations in spherical coordinates 
    # (1, theta, phi) and (1, theta, phi)
    # cosine( arc length ) = 
    #    sin phi sin phi' cos(theta-theta') + cos phi cos phi'
    # distance = rho * arc length
    
    cos = (math.sin(phi1)*math.sin(phi2)*math.cos(theta1 - theta2) + 
           math.cos(phi1)*math.cos(phi2))
    arc = math.acos( cos )

    # Remember to multiply arc by the radius of the earth 
    # in your favorite set of units to get length.
    return arc*6373.0


def get_score_details(id1, id2, query="DBaMlk3TGxHRW91SWhTYUlLVktZTk"):

	# print id1, id2, query, type(query)

	scores = {}

	handle = get_index_handle()
	fetch_fields=['docid', 'query_relevance_score']
	user1 = get_user(str(id1))
	user2 = get_user(str(id2))

	# print user1.name, user2.name
	scores['name'] = user1.name + " : " + user2.name

	variables = add_variables(user1)
	variables2 = add_variables(user2)

	if query=='DBaMlk3TGxHRW91SWhTYUlLVktZTk':
		new_q = 'shauniqueid:DBaMlk3TGxHRW91SWhTYUlLVktZTk'
	else:
		new_q =	map(get_field_boost, query.split())
		new_q = ' AND '.join(new_q)

	res = handle.search(
			new_q, 
			length=700, 
			scoring_function=1, 
			fetch_fields=fetch_fields, 
			variables = variables
			)['results']

	relevance = [i['query_relevance_score'] for i in res if int(i['docid']) == user2.id]
	if relevance:
		relevance = int(relevance[0])
		relevance_scr = 8.0*math.log(relevance)
	else:
		relevance_scr = 0
	# print "relevance", relevance
	# print "relevance_scr", relevance_scr
	scores['relevance_scr'] = relevance_scr

	res = handle.search(
			new_q, 
			length=700, 
			scoring_function=2, 
			fetch_fields=fetch_fields, 
			variables = variables
			)['results']	

	age = [i['query_relevance_score'] for i in res if int(i['docid']) == user2.id]
	if age:
		age = int(age[0])
		new_member_scr = math.log(2918650749 - age) - 11
	else:
		new_member_scr = 0
	# print "age", age
	# print "new_member_scr", new_member_scr
	scores['new_member_scr'] = new_member_scr

	d = {}
	q = variables

	# print variables2[7]

	d[7] = variables2[7]
	d[8] = get_relationship_wgt(user2.relationship_status)
	relationship_scr = abs(d[7]-q[7])*d[8]*2
	# print "relationship_scr", relationship_scr
	scores['relationship_scr'] = relationship_scr


	votes_scr = math.log(1+1)
	# print "votes_scr", votes_scr
	scores['votes_scr'] = votes_scr

	d[6] = variables2[6]
	interested_in_scr = min(4, abs(d[6]-q[6])*4) if d[6]+q[6]<=2 else 4
	# print "interested_in_scr", interested_in_scr
	scores['interested_in_scr'] = interested_in_scr


	d[1] = variables2[1]
	age_scr = 0 if d[1]+q[1]>=9999 else 5.0*abs(d[7]-q[7])*math.log(1 + (1.0/max(1, abs(d[1]-q[1]))))
	# print "age_scr", age_scr
	scores['age_scr'] = age_scr


	d[2] = variables2[2]
	d[3] = variables2[3]
	curr_loc_scr = 0 if d[2]+q[2]>=9999 else math.log(1 + (1000.0/max(10, km(d[2], d[3], q[2], q[3]))))
	# print "curr_loc_scr", curr_loc_scr
	# print d[2], d[3], q[2], q[3]
	scores['curr_loc_scr'] = curr_loc_scr

	d[4] = variables2[4]
	d[5] = variables2[5]
	hometown_loc_scr = 0 if d[4]+q[4]>=9999 else math.log(1 + (100.0/max(10, km(d[4], d[5], q[4], q[5]))))
	# print "hometown_loc_scr", hometown_loc_scr
	# print d[4], d[5], q[4], q[5]
	scores['hometown_loc_scr'] = hometown_loc_scr


	lv_set, lv_scr = get_lv_likes(user1.likes_set, user2.likes_set)
	# print "lv_scr", lv_scr
	scores['lv_scr'] = lv_scr


	# print "sum_total", relevance_scr+new_member_scr+relationship_scr+votes_scr+interested_in_scr+age_scr+curr_loc_scr+hometown_loc_scr+lv_scr
	scores["sum_total"] = relevance_scr+new_member_scr+relationship_scr+votes_scr+interested_in_scr+age_scr+curr_loc_scr+hometown_loc_scr+lv_scr

	return scores


if __name__ == "__main__":
	id1 = sys.argv[1]
	id2 = sys.argv[2]
	if len(sys.argv) > 3:
		query = sys.argv[3]
		res = get_score_details(id1, id2, query)
	else:
		res = get_score_details(id1, id2)

	print res











