# -*- coding: utf-8 -*-
from luckydonaldUtils.logger import logging
from flask import Flask
from flask import request
from pony import orm
from .database import to_db, db

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

VERSION = "0.0.1"
__version__ = VERSION

from werkzeug.debug import DebuggedApplication
app = Flask(__name__)
debug = DebuggedApplication(app, console_path="/console/")



@orm.db_session
@app.route("/dump/", methods=['POST', 'GET', 'PUT'])
def dump_to_db():
    try:
        logger.info("Incoming: {}".format(request.get_json(force=True)))
        msg = to_db(request.get_json(force=True))
        if msg:
            db.commit()
            logger.info("Added {}: {id}".format(msg, id=msg.id))
            return "ok: {}".format(msg)
        else:
            return "fail: None"
        # end if
    except Exception as e:
        logger.exception("lel")
        raise
# end def

@orm.db_session
@app.route("/get_value")
def get_value():
    """
    Gets the value they decided on, and the current value of each node.
    :return:
    """
    from .database import DBVoteMessage, DBInitMessage
    from pony import orm
    from db_proxy.database import DBVoteMessage, DBInitMessage, DBMessage
    latest_vote = orm.select(m for m in DBVoteMessage).order_by(orm.desc(DBVoteMessage.date)).first().value()
    latest_values = DBMessage.select_by_sql("""
    SELECT DISTINCT ON (m.node) * FROM (
      SELECT * FROM DBmessage WHERE type = $INIT
    ) as m ORDER BY m.node, m.date DESC
    """)
    with orm.db_session: orm.select(m for m in DBInitMessage).order_by(DBInitMessage.date)

    return {"foo": "bar"}

@app.route("/console/")
def console():
    return debug.display_console(request)
# end def


@app.route("/")
def root():
    return "Ready to take your requests."
# end def
