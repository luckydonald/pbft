# -*- coding: utf-8 -*-
from luckydonaldUtils.logger import logging
from flask import Flask
from flask import request
from flask import Response
from pony import orm

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

VERSION = "0.0.1"
__version__ = VERSION

app = Flask(__name__)

@orm.db_session
@app.route("/dump/")
@app.route("/dump")
def dump_to_db():
    from .database import Message
    Message.from_dict(request.get_json())
# end def

@app.route("/")
def root():
    return "Ready to take your requests."
# end def

