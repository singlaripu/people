#!/usr/bin/python
import os
import urlparse
import redis
import subprocess
import time

REDISCLOUD_URL = 'redis://rediscloud:YvIYrEH6Ph4j9HU9@pub-redis-14845.us-east-1-3.1.ec2.garantiadata.com:14845'
url = urlparse.urlparse(REDISCLOUD_URL)
r = redis.Redis(host=url.hostname, port=url.port, password=url.password)
pipe = r.pipeline()


p = subprocess.Popen(['sudo', 'ejabberdctl', 'connected_users'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
out, err = p.communicate()

ids = out.split()
users = [i.split('@')[0] for i in ids]

for user in users:
	pipe.sadd('online', user)
	time.sleep(0.001)

r.delete('online')
time.sleep(1)
pipe.execute()
