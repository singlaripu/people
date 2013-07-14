# -*- coding: utf-8 -*-

import base64
import os
import os.path
import urllib
import hmac
import json
import hashlib
from base64 import urlsafe_b64decode, urlsafe_b64encode
from models import User, ProfileData, UserComplete

import requests
from flask import Flask, request, redirect, render_template, url_for, Response, session, jsonify, send_file, make_response
import flask
from myfunctions import *
#!/usr/bin/env python
from datetime import datetime as dt
#import redis
# import flask

from socketio import socketio_manage
import facebook

#!/usr/bin/env python
import sys

# Python versions before 3.0 do not use UTF-8 encoding
# by default. To ensure that Unicode is handled properly
# throughout SleekXMPP, we will set the default encoding
# ourselves to UTF-8.
if sys.version_info < (3, 0):
    reload(sys)
    sys.setdefaultencoding('utf8')
else:
    raw_input = input

from socketio_chat import ChatNamespace
from socketio_chat import EchoBot

FB_APP_ID = os.environ.get('FACEBOOK_APP_ID')
FB_APP_SECRET = os.environ.get('FACEBOOK_SECRET')
requests = requests.session()

app_url = 'https://graph.facebook.com/{0}'.format(FB_APP_ID)
FB_APP_NAME = json.loads(requests.get(app_url).content).get('name')







app = Flask(__name__)
app.config.from_object(__name__)
app.config.from_object('conf.Config')
app.secret_key = 'asdf'






def current_user():
    if session.get("user"):
        # User is logged in
        # print session.get("user")
        # print '\ni will go from here\n'
        return session.get("user")
    else:
        # Either used just logged in or just saw the first page
        # We'll see here
        cookie = facebook.get_user_from_cookie(request.cookies,
                                               FB_APP_ID,
                                               FB_APP_SECRET)
        if cookie:
            # Okay so user logged in.
            # Now, check to see if existing user
            user = get_user(cookie["uid"])
            if not user:
                # Not an existing user so get user info
                # graph = facebook.GraphAPI(cookie["access_token"])
                # profile = graph.get_object("me")
                # user = User(
                #     key_name=str(profile["id"]),
                #     id=str(profile["id"]),
                #     name=profile["name"],
                #     profile_url=profile["link"],
                #     access_token=cookie["access_token"]
                # )
                
                # user.put()
                user = get_or_create(cookie["access_token"])

            # elif user.access_token != cookie["access_token"]:
            #     user.access_token = cookie["access_token"]
            #     user.put()
            # User is now logged in
            session["user"] = dict(
                name=user.name,
                fb_uid=user.fb_uid,
                id=user.id,
                access_token=cookie["access_token"]
            )
            return session.get("user")
        else:
            # print request.args.get('code')
            # access_token = get_token() #fbapi_auth(request.args.get('code'))[0] #facebook.get_access_token_from_code(request.args.get('code'), get_home(), FB_APP_ID, FB_APP_SECRET)[0]
            # print '\ni am stuck here\n'
            # print access_token
            return None
    return None

@app.route('/', methods=['GET', 'POST'])
def index():

    return "hello world"

    # channel_url = url_for('get_channel', _external=True)
    # channel_url = channel_url.replace('http:', '').replace('https:', '')
    # return render_template('index.html', app_id=FB_APP_ID, name=FB_APP_NAME, channel_url=channel_url, current_user=None)
    # # print get_home()

    # access_token, channel_url = get_channel_token()

    # if access_token:
    channel_url = url_for('get_channel', _external=True)
    channel_url = channel_url.replace('http:', '').replace('https:', '')
    # logout_url = url_for('logout', _external=True)
    # logout_url = logout_url.replace('http:', '').replace('https:', '')
    my_user = current_user()
    if not my_user:
        return render_template('base.html', app_id=FB_APP_ID, name=FB_APP_NAME, channel_url=channel_url, current_user=my_user)
    my_user = get_user_by_id(my_user['id'])
    user_data = get_data(my_user)
    # redir = get_home() + 'close/'
    # url = request.url
    age = get_age(user_data.birthday)
    return render_template('index.html', app_id=FB_APP_ID, me = my_user, resp = user_data, age = age, channel_url=channel_url, current_user=my_user)
    # else:
        # return render_template('base.html', app_id=FB_APP_ID, token=access_token, name=FB_APP_NAME, current_user = 'singla')

@app.route('/wookmark', methods=['GET', 'POST'])
def wookmark():
    # return send_file('templates/wookmark.html')
    return make_response(open('templates/wookmark.html').read())
    # remove the username from the session if it's there
    print "i came to logout function"
    if session.get("user") is not None:
        session['user'] = None
    return redirect('/')

@app.route('/wookmark1', methods=['GET', 'POST'])
def wookmark1():
    return send_file('templates/wookmark1.html')
    # remove the username from the session if it's there
    print "i came to logout function"
    if session.get("user") is not None:
        session['user'] = None
    return redirect('/')

@app.route('/wookmark2', methods=['GET', 'POST'])
def wookmark2():
    return make_response(open('templates/wookmark_div.html').read())
    # remove the username from the session if it's there
    print "i came to logout function"
    if session.get("user") is not None:
        session['user'] = None
    return redirect('/')



@app.route('/logout', methods=['GET', 'POST'])
def logout():
    # remove the username from the session if it's there
    print "i came to logout function"
    if session.get("user") is not None:
        session['user'] = None
    return redirect('/')


@app.route('/channel.html', methods=['GET', 'POST'])
def get_channel():
    return render_template('channel.html') 


@app.route('/close/', methods=['GET', 'POST'])
def close():
    return render_template('close.html')

@app.route('/about')
def about():
    return render_template('about.html') 



@app.route('/search', methods=['GET', 'POST'])
def search():
    # print request.form
    access_token, channel_url = get_channel_token()
    if access_token:
        if request.method == 'POST':
            search_results = search_index(access_token, request.form)
            return render_template('search.html', app_id=FB_APP_ID, search_results=search_results, form_values=dict(request.form) )
        else:
            return redirect(url_for('index'))
    else:
       return render_template('base.html', app_id=FB_APP_ID, token=access_token, name=FB_APP_NAME) 
  
  

@app.route('/user/<username>/<int:user_id>', methods=['GET', 'POST'])
def get_profile(username, user_id):
    my_user = get_user_by_id(user_id/1347)
    user_data = get_data(my_user)
    age = get_age(user_data.birthday)

    return render_template('index.html', app_id=FB_APP_ID, me = my_user, resp = user_data, age = age )



@app.route('/online/<recipient>', methods=['GET', 'POST'])
def online(recipient):
    recipient = request.form['recipient']
    return render_template('room.html', recipient=recipient)



@app.route('/socket.io/<path:remaining>')
def socketio(remaining):
    try:
        # jid = flask.session['jid']
        # password = flask.session['jidpass']
        # xmpp, ans = xmpp_connect(jid, password)
        # if ans: 
        #     print "xmpp connection successfull"
        # else:
        #     print "xmpp connection Failed"
        data = {'jid': flask.session['jid'], 'jidpass':flask.session['jidpass']}
        socketio_manage(request.environ, {'/chat': ChatNamespace}, data)
    except:
        app.logger.error("Exception while handling socketio connection",
                         exc_info=True)
    return Response()


@app.route('/login', methods=['GET', 'POST'])
def login():
    if flask.request.method == 'POST':
        flask.session['jid'] = flask.request.form['user'] + '@jabber.fbpeople.com'
        flask.session['jidpass'] = flask.request.form['password']
        recipient = flask.request.form['to'] + '@jabber.fbpeople.com'
        return render_template('room.html', recipient=recipient)
    return '<form action="/login" method="post">user: <input name="user"><br>password:<input name="password"><br>chat with:<input name="to"><br><input type="submit" value="Submit"><br>'



@app.route('/getlist', methods=['GET'])
def getlist():
    if flask.request.method == 'GET':# and session.get('user'):
        users = UserComplete.query.all()
        json_results = to_json(users)
        return jsonify(**json_results)
    return jsonify([])









if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    if app.config.get('FB_APP_ID') and app.config.get('FB_APP_SECRET'):
        app.debug = True
        app.run(host='0.0.0.0', port=port)
    else:
        print 'Cannot start application without Facebook App Id and Secret set'

