# -*- coding: utf-8 -*-
from datetime import datetime

from DictObject import DictObject
from flask import Flask, request
from luckydonaldUtils.logger import logging
from pony import orm

from .enums import JSON_TYPES
from .utils import jsonify
from .database import to_db, db, DBVoteMessage, DBMessage, DBInitMessage, DBPrevoteMessage, DBProposeMessage, DBAcknowledge, \
    MSG_TYPE_CLASS_MAP
from node.enums import INIT  # noqa # pylint: disable=unused-import
from node.messages import Message  # noqa # pylint: disable=unused-import

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

VERSION = "0.0.1"
__version__ = VERSION
assert INIT == INIT  # to prevent the unused import warning. Is used in SQL statement.

from werkzeug.debug import DebuggedApplication
app = Flask(__name__)
debug = DebuggedApplication(app, console_path="/console/")

API_V1 = ""
API_V2 = "/api/v2"


@app.route(API_V1+"/dump", methods=['POST', 'GET', 'PUT'])
@app.route(API_V1+"/dump/", methods=['POST', 'GET', 'PUT'])
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


@app.route(API_V1+"/get_value")
@app.route(API_V1+"/get_value/")
@orm.db_session
def get_value():
    """
    Gets latest value they decided on, and the most recent measured value of each node.
    Only considers events in the last 10 seconds.

    :return:
    """
    latest_vote = orm.select(m for m in DBVoteMessage if m.date > orm.raw_sql("NOW() - '10 seconds'::INTERVAL")).order_by(orm.desc(DBVoteMessage.date)).first()
    if not latest_vote:
        return jsonify({}, allow_all_origin=True)
    # end if
    assert isinstance(latest_vote, DBVoteMessage)
    latest_values = DBMessage.select_by_sql("""
    SELECT DISTINCT ON (m.node) * FROM (
      SELECT * FROM DBmessage
      WHERE type = $INIT
      AND date >= NOW() - '10 seconds'::INTERVAL
    ) as m ORDER BY m.node, m.date DESC
    """)
    data = {"summary": latest_vote.value}
    for msg in latest_values:
        assert isinstance(msg, DBInitMessage)
        data[str(msg.node)] = msg.value
    # end for
    return jsonify(data, allow_all_origin=True)
# end def


@app.route(API_V2+"/get_value")
@app.route(API_V2+"/get_value/")
@orm.db_session
def get_value_v2():
    """
    Gets latest value they decided on, and the most recent measured value of each node.
    Only considers events in the last 10 seconds.

    :return:
    """
    latest_vote = orm.select(m for m in DBVoteMessage if m.date > orm.raw_sql("NOW() - '10 seconds'::INTERVAL")).order_by(orm.desc(DBVoteMessage.date)).first()
    if not latest_vote:
        return jsonify({}, allow_all_origin=True)
    # end if
    assert isinstance(latest_vote, DBVoteMessage)
    latest_values = DBMessage.select_by_sql("""
    SELECT DISTINCT ON (m.node) * FROM (
      SELECT * FROM DBmessage
      WHERE type = $INIT
      AND date >= NOW() - '10 seconds'::INTERVAL
    ) as m ORDER BY m.node, m.date DESC
    """)
    data = {
        "summary": {"value": latest_vote.value},
        "leader": 1,  # done later via observing latest LeaderChange events.
        "nodes": []
    }
    for msg in latest_values:
        assert isinstance(msg, DBInitMessage)
        data["nodes"].append({"node": str(msg.node), "value": msg.value})
    # end for
    return jsonify(data, allow_all_origin=True)
# end def


@app.route(API_V2+"/get_timeline")
@app.route(API_V2+"/get_timeline/")
def get_timeline():
    result = {
        "nodes": ["1", "2"],
        "timestamps": {"min": "23428001", "max": "23428013"},
        "events": []
    }
    node_events = DBMessage.select_by_sql("""
      SELECT * FROM DBmessage
      AND date >= NOW() - '10 seconds'::INTERVAL
    """)
    for node_event in node_events:
        event_dict = DictObject.objectify({
             "id": {},  # for deduplication in the GUI
             "action": None, # "send" or "acknowledge"
             "type": None,
             "nodes": {},
             "timestamps": {},
             "data": {}
         })
        if isinstance(node_event, DBAcknowledge):
            received_msg = Message.from_dict(node_event.raw)
            event_dict.id["receive"] = node_event.id
            event_dict.action = "acknowledge"
            event_dict.nodes["send"] = received_msg.node
            event_dict.nodes["receive"] = node_event.node
            event_dict.timestamps["send"] = received_msg.date
            event_dict.type = JSON_TYPES[received_msg.type]
            event_dict.data = generate_msg_data(received_msg)
            # additional DB query, to get sender
            DBClazz = MSG_TYPE_CLASS_MAP[received_msg.type]
            try:
                db_received_msg = DBClazz.get(
                    sequence_no=received_msg.sequence_no,
                    node=received_msg.node
                )
                event_dict.id["send"] = db_received_msg.id
                event_dict.timestamps["receive"] = db_received_msg.date
            except orm.DatabaseError:
                event_dict.id["send"] = None
                event_dict.timestamps["receive"] = None
            # end try
        else:
            event_dict.action = "send"
            event_dict.id["send"] = node_event.id
            event_dict.nodes["send"] = node_event.node
            event_dict.timestamps["send"] = node_event.date
            event_dict.type = JSON_TYPES[event_dict._discriminator_]
            event_dict.data = generate_msg_data(event_dict)
        # end if
        result["events"].append(event_dict)
    # end for
    return jsonify(result, allow_all_origin=True)
# end def


def generate_msg_data(msg):
    return {
        "node": "1",
        "origin": "4",
        "log": "This is a log. [VOTE]",
        "value": "0.5",
        "timestamp": "1"
    }
# end def

@app.route(API_V1+"/get_data")
@app.route(API_V1+"/get_data/")
@orm.db_session
def get_data():
    node = request.args.getlist('node', None)
    limit = request.args.get('limit', 100)
    assert isinstance(limit, int) or str.isnumeric(limit)   # TODO: specify error message, on error  # like int("abc")
    limit = int(limit)
    if node:
        for i in node:
            assert str.isnumeric(i)  # TODO: specify error message
        # end for
        node_values = orm.select(m for m in DBInitMessage if m.node in list(node)).order_by(orm.desc(DBInitMessage.date)).limit(limit)
    else:
        node_values = orm.select(m for m in DBInitMessage).order_by(orm.desc(DBInitMessage.date)).limit(limit)
    if not node_values:
        return jsonify({}, allow_all_origin=True)
    # end if
    data = {}
    for msg in node_values:
        assert isinstance(msg, DBInitMessage)
        assert isinstance(msg.date, datetime)
        if str(msg.node) not in data:
            data[str(msg.node)] = dict()
        # end if
        data[str(msg.node)][msg.date.timestamp()] = msg.value
    # end for
    return jsonify(data, allow_all_origin=True)
# end def


@app.route(API_V1+"/test")
@app.route(API_V1+"/test/")
@orm.db_session
def test():
    node = request.args.getlist('node', None)
    if request.environ.get('HTTP_ORIGIN', None) is not None:
        logger.warning("HTTP_ORIGIN: {!r}".format(request.environ['HTTP_ORIGIN']))
        # res.headers["Access-Control-Allow-Origin"] = request.environ['HTTP_ORIGIN']
    # end if
    return str(request.environ.get('HTTP_ORIGIN', None))
# end def


@app.route("/console/")
def console():
    return debug.display_console(request)
# end def


@app.route("/")
def root():
    return "Ready to take your requests."
# end def
