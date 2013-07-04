import requests
from requests.auth import HTTPBasicAuth

def register_jabber_user(username, password):
	server = "ec2-54-218-10-57.us-west-2.compute.amazonaws.com"
	virtualhost = "jabber.fbpeople.com"
	url = "http://%s:5280/admin/server/%s/users/" % (server, virtualhost)
	# print url
	auth = HTTPBasicAuth("ripusingla@jabber.fbpeople.com", "Rips123Temp")
	data = {
	    'newusername': username,
	    'newuserpassword': password,
	    'addnewuser': "Add User"
	}
	resp = requests.post(url, data=data, auth=auth)


	assert resp.status_code == 200