import xmlrpclib

def get_online_users():

	server_url = 'http://ec2-54-218-10-57.us-west-2.compute.amazonaws.com:4560'
	server = xmlrpclib.Server(server_url)

	result = server.connected_users().get('connected_users')
	jids =  [i.get('sessions').split('@')[0] for i in result]
	return jids


if __name__ == '__main__':
	jids = get_online_users()
	print jids