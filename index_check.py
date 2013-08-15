from models import *
from myfunctions import *

h = get_index_handle()

res = h.search('shauniqueid:DBaMlk3TGxHRW91SWhTYUlLVktZTk', fetch_fields=['docid', 'itf1'], length=600)
r = res['results']
dball = UserComplete.query.all()

rdict = {int(i['docid']):i['itf1'].encode('ascii','ignore') for i in r}

f = open('index_check.txt', 'w')

for i in range(592):
	userid = dball[i].id
	try:
		name = str(dball[i].name)
	except Exception:
		name = slugify(dball[i].name)
		print name
	iname = rdict[userid]
	# if name != iname:
	try:		
		f.write(str(userid) + ' ' + name + ' : ' + iname + '\n')
	except Exception:

		iname = slugify(iname)
		print iname
		f.write(str(userid) + ' ' + name + ' : ' + iname + '\n')
	f.tell()
