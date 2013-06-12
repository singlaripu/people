#from flask.ext.sqlalchemy import SQLAlchemy
import sqlalchemy
import os
from flask import Flask

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
db = sqlalchemy(app)