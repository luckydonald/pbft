# -*- coding: utf-8 -*-
from luckydonaldUtils.logger import logging
from flask import Flask
from flask import request
from pony import orm

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

VERSION = "0.0.1"
__version__ = VERSION

app = Flask(__name__)

@orm.db_session
@app.route("/dump", methods=['PUT'])
@app.route("/dump/", methods=['PUT'])
def dump_to_db():
    from .database import from_dict
    msg = from_dict(request.get_json(force=True))
    logger.info("Added {}".format(msg))
    return "ok"
# end def


@app.route("/")
def root():
    return "Ready to take your requests."
# end def
