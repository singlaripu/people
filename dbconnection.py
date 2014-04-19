from flask.ext.sqlalchemy import SQLAlchemy
#import sqlalchemy
#import os
from flask import Flask

app = Flask(__name__)
app.config.from_object('conf.Config')
#app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
app.config['SQLALCHEMY_DATABASE_URI'] = app.config.get('DATABASE_URL_CUSTOM')
db = SQLAlchemy(app)

