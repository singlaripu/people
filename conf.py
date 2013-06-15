import os

class Config(object):
    DEBUG = True
    TESTING = False
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'DEBUG')
    FBAPI_APP_ID = os.environ.get('FACEBOOK_APP_ID')
    FBAPI_APP_SECRET = os.environ.get('FACEBOOK_SECRET')
    FBAPI_SCOPE = ['user_likes', 'user_photos', 'user_photo_video_tags']
    DATABASE_URL_CUSTOM = os.environ['DATABASE_URL']
    #DATABASE_URL_CUSTOM = 'postgresql://postgres:postgre@localhost/fbapp_people'