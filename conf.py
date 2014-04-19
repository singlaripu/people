import os

class Config(object):
    DEBUG = True
    TESTING = False
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'DEBUG')
    FBAPI_APP_ID = os.environ.get('FACEBOOK_APP_ID')
    FBAPI_APP_SECRET = os.environ.get('FACEBOOK_SECRET')
    DATABASE_URL_CUSTOM = os.environ['DATABASE_URL']
    FBAPI_SCOPE = ['user_likes', 'user_photos', 'user_photo_video_tags']
    # user_photos,user_birthday,user_relationship_details,user_hometown,user_likes, user_actions.video,user_actions.books,user_relationships