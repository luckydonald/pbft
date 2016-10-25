# -*- coding: utf-8 -*-
from luckydonaldUtils.logger import logging
from flask import Flask, jsonify
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



@app.route("/dump/", methods=['POST', 'GET', 'PUT'])
@orm.db_session
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

@app.route("/get_value")
@orm.db_session
def get_value():
    """
    Gets the value they decided on, and the current value of each node.
    :return:
    """
    from .database import DBVoteMessage, DBMessage, DBInitMessage
    from node.enums import INIT
    from pony import orm
    # from .database import DBVoteMessage, DBInitMessage, DBMessage
    latest_vote = orm.select(m for m in DBVoteMessage).order_by(orm.desc(DBVoteMessage.date)).first()
    assert isinstance(latest_vote, DBVoteMessage)
    latest_values = DBMessage.select_by_sql("""
    SELECT DISTINCT ON (m.node) * FROM (
      SELECT * FROM DBmessage WHERE type = $INIT
    ) as m ORDER BY m.node, m.date DESC
    """)
    data = {"summary": latest_vote.value}
    for msg in latest_values:
        assert isinstance(msg, DBInitMessage)
        data[str(msg.node)] = msg.value
    return jsonify(data)

@app.route("/console/")
def console():
    return debug.display_console(request)
# end def


@app.route("/")
def root():
    return "Ready to take your requests."
# end def
