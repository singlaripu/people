# -*- coding: utf-8 -*-

import base64
import os
import os.path
import urllib
import hmac
import json
import hashlib
from base64 import urlsafe_b64decode, urlsafe_b64encode

import requests
from flask import Flask, request, redirect, render_template, url_for

from dbconnection import db

FB_APP_ID = os.environ.get('FACEBOOK_APP_ID')
requests = requests.session()

app_url = 'https://graph.facebook.com/{0}'.format(FB_APP_ID)
FB_APP_NAME = json.loads(requests.get(app_url).content).get('name')
FB_APP_SECRET = os.environ.get('FACEBOOK_SECRET')


def oauth_login_url(preserve_path=True, next_url=None):
    fb_login_uri = ("https://www.facebook.com/dialog/oauth"
                    "?client_id=%s&redirect_uri=%s" %
                    (app.config['FB_APP_ID'], get_home()))

    if app.config['FBAPI_SCOPE']:
        fb_login_uri += "&scope=%s" % ",".join(app.config['FBAPI_SCOPE'])
    return fb_login_uri


def simple_dict_serialisation(params):
    return "&".join(map(lambda k: "%s=%s" % (k, params[k]), params.keys()))


def base64_url_encode(data):
    return base64.urlsafe_b64encode(data).rstrip('=')


def fbapi_get_string(path,
    domain=u'graph', params=None, access_token=None,
    encode_func=urllib.urlencode):
    """Make an API call"""

    if not params:
        params = {}
    params[u'method'] = u'GET'
    if access_token:
        params[u'access_token'] = access_token

    for k, v in params.iteritems():
        if hasattr(v, 'encode'):
            params[k] = v.encode('utf-8')

    url = u'https://' + domain + u'.facebook.com' + path
    params_encoded = encode_func(params)
    url = url + params_encoded
    result = requests.get(url).content

    return result


def fbapi_auth(code):
    params = {'client_id': app.config['FB_APP_ID'],
              'redirect_uri': get_home(),
              'client_secret': app.config['FB_APP_SECRET'],
              'code': code}

    result = fbapi_get_string(path=u"/oauth/access_token?", params=params,
                              encode_func=simple_dict_serialisation)
    pairs = result.split("&", 1)
    result_dict = {}
    for pair in pairs:
        (key, value) = pair.split("=")
        result_dict[key] = value
    return (result_dict["access_token"], result_dict["expires"])


def fbapi_get_application_access_token(id):
    token = fbapi_get_string(
        path=u"/oauth/access_token",
        params=dict(grant_type=u'client_credentials', client_id=id,
                    client_secret=app.config['FB_APP_SECRET']),
        domain=u'graph')

    token = token.split('=')[-1]
    if not str(id) in token:
        print 'Token mismatch: %s not in %s' % (id, token)
    return token


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



app = Flask(__name__)
app.config.from_object(__name__)
app.config.from_object('conf.Config')


def get_home():
    return 'https://' + request.host + '/'


def get_token():

    #print 'hello'

    if request.args.get('code', None):
        return fbapi_auth(request.args.get('code'))[0]

    cookie_key = 'fbsr_{0}'.format(FB_APP_ID)

    if cookie_key in request.cookies:

        c = request.cookies.get(cookie_key)
        encoded_data = c.split('.', 2)

        sig = encoded_data[0]
        data = json.loads(urlsafe_b64decode(str(encoded_data[1]) +
            (64-len(encoded_data[1])%64)*"="))

        if not data['algorithm'].upper() == 'HMAC-SHA256':
            raise ValueError('unknown algorithm {0}'.format(data['algorithm']))

        h = hmac.new(FB_APP_SECRET, digestmod=hashlib.sha256)
        h.update(encoded_data[1])
        expected_sig = urlsafe_b64encode(h.digest()).replace('=', '')

        if sig != expected_sig:
            raise ValueError('bad signature')

        code =  data['code']

        params = {
            'client_id': FB_APP_ID,
            'client_secret': FB_APP_SECRET,
            'redirect_uri': '',
            'code': data['code']
        }

        from urlparse import parse_qs
        r = requests.get('https://graph.facebook.com/oauth/access_token', params=params)
        token = parse_qs(r.content).get('access_token')

        return token


@app.route('/', methods=['GET', 'POST'])
def index():
    # print get_home()


    access_token = get_token()
    print access_token
    channel_url = url_for('get_channel', _external=True)
    channel_url = channel_url.replace('http:', '').replace('https:', '')

    if access_token:

        # user_fb_uid = fb_call('me/?fields=id', args={'access_token': access_token})
        # my_user = db.session.query(User).filter_by(fb_uid=user_fb_uid['id']).first() 
        # if my_user:
        #     resp_dict = {}
        #     resp_dict['name'] = my_user.name
        #     user_data = db.session.query(Profile_data).filter_by(fb_uid=user_fb_uid['id']).first() 
        #     resp_dict['profile_pic_url'] = my_user.

        me = fb_call('me/?fields=name,gender,work,hometown,education,birthday,interested_in,location,email', args={'access_token': access_token})
        fb_app = fb_call(FB_APP_ID, args={'access_token': access_token})

        #likes = fb_call('me/likes', args={'access_token': access_token})

        likes = fql(
            "select type, page_id, name from page where page_id in (select page_id from page_fan where uid=me()) limit 1000",
            access_token
            )

        likes_dict = {}
        for like in likes:
            try:
                likes_dict[like['type']].append({'name':like['name'], 'id':like['page_id']})
            except KeyError:
                likes_dict[like['type']] = []
                likes_dict[like['type']].append({'name':like['name'], 'id':like['page_id']})
        likes_dict = [(key, value) for key, value in likes_dict.iteritems()]
        likes_dict = sorted(likes_dict, key =lambda x: len(x[1]), reverse=True)
        #likes_dict_sortd = {}

        #likes = {"keys":likes_dict.keys(), 'data':likes_dict}

        # = fb_call('me/friends', args={'access_token': access_token, 'limit': 4})
        #photos = fb_call('me/photos',args={'access_token': access_token, 'limit': 16})

        profile_pic = fb_call('me/picture/?type=large&redirect=false',args={'access_token': access_token})

        #profile_pic_album = fb_call('me/albums?fields=type',args={'access_token': access_token})
        #profile_pic_album_id = filter(lambda x: x['type'] == 'profile', profile_pic_album['data'])[0]['id']
        #profile_pic_album_photos = fb_call('{0}/photos?fields=picture,name'.format(profile_pic_album_id),args={'access_token': access_token})

        profile_pic_album_photos = fql(
            "select src, src_big from photo where album_object_id in (select object_id from album where owner=me() and type='profile')",
            access_token
            )

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
 

        #print photos

        redir = get_home() + 'close/'
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

        url = request.url

        return render_template(
            'index.html', 
            app_id=FB_APP_ID, 
            token=access_token, 
            likes=likes_dict,
            #friends=friends, 
            #photos=photos, 
            #app_friends=app_friends, 
            app=fb_app,
            me=me, 
            #POST_TO_WALL=POST_TO_WALL, 
            #SEND_TO=SEND_TO, url=url,
            channel_url=channel_url, 
            name=FB_APP_NAME, 
            profile_pic=profile_pic,
            profile_pic_album_photos=profile_pic_album_photos,
            video_watched_dict=video_watched_dict,
            video_want_to_watch_dict=video_want_to_watch_dict
            )
    else:
        return render_template('login.html', app_id=FB_APP_ID, token=access_token, url=request.url, channel_url=channel_url, name=FB_APP_NAME)

@app.route('/channel.html', methods=['GET', 'POST'])
def get_channel():
    return render_template('channel.html')

@app.route('/about')
def about():
  return render_template('about.html')


@app.route('/close/', methods=['GET', 'POST'])
def close():
    return render_template('close.html')

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    if app.config.get('FB_APP_ID') and app.config.get('FB_APP_SECRET'):
        app.debug = True
        app.run(host='0.0.0.0', port=port)
    else:
        print 'Cannot start application without Facebook App Id and Secret set'
