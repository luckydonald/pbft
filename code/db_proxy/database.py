from luckydonaldUtils.functions import deprecated
from pony import orm
import logging
from node import messages
from .env import POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASS, POSTGRES_DB

from node.enums import INIT, LEADER_CHANGE, PROPOSE, PREVOTE, VOTE

logger = logging.getLogger(__file__)
db = orm.Database()

VALUE_TYPE = float
MSG_TYPE_TYPE = int
NODE_TYPE = int
SEQUENCE_TYPE = int


class DBMessage(db.Entity):
    type = orm.Required(MSG_TYPE_TYPE)
    sequence_no = orm.Required(SEQUENCE_TYPE)
    node = orm.Optional(NODE_TYPE)
    value = orm.Optional(VALUE_TYPE)
    leader = orm.Optional(NODE_TYPE)

    def from_db(self):
        clazz = MSG_TYPE_CLASS_MAP[self.type]
        assert issubclass(clazz, messages.Message)
        return clazz.from_dict(self.as_dict())
    # end def

    def to_db(self, msg):
        self._to_db_message(msg)
        if hasattr(msg, "node"):
            self._to_db_node(msg)
        # end if

        if hasattr(msg, "value"):
            self._to_db_value(msg)
        # end if
        if hasattr(msg, "leader"):
            self._to_db_leader(msg)
        # end if
    # end def

    @orm.db_session
    def _to_db_message(self, msg):
        assert isinstance(msg, messages.Message)
        self.type = msg.type
        self.sequence_no = msg.sequence_no
    # end def

    @orm.db_session
    def _to_db_node(self, msg):
        self.node = msg.node
        # end if

    # end if

    @orm.db_session
    def _to_db_value(self, msg):
        self.value = msg.value
        # end if

    # end if

    @orm.db_session
    def _to_db_leader(self, msg):
        self.leader = msg.leader
        # end if
    # end if

    def as_dict(self):
        data = dict(type=self.type, sequence_no=self.sequence_no, )
        return data
    # end def
# end class


class DBInitMessage(DBMessage):
    def from_db(self):
        return messages.InitMessage(sequence_no=self.sequence_no, node=self.node, value=self.value)
    # end def

    def to_db(self, msg):
        assert isinstance(msg, messages.InitMessage)
        self._to_db_message(msg)
        self._to_db_node(msg)
        self._to_db_value(msg)
    # end def
# end class


class DBProposeMessage(DBMessage):
    proposal = orm.Required(VALUE_TYPE)
    value_store_json = orm.Required(str)  # json

    @property
    def value_store(self):
        import json
        return json.loads(self.value_store_json)
    # end def

    @value_store.setter
    def value_store(self, val):
        import json
        self.value_store_json = json.dumps(val)
    # end def

    @value_store.deleter
    def value_store(self):
        del self.value_store_json
    # end def

    def from_db(self):
        return messages.ProposeMessage(
            sequence_no=self.sequence_no, node=self.node, leader=self.leader, proposal=self.proposal,
            value_store=self.value_store
        )
    # end def

    @orm.db_session
    def to_db(self, msg):
        assert isinstance(msg, messages.ProposeMessage)
        self._to_db_message(msg)
        self._to_db_node(msg)
        self._to_db_leader(msg)
        self.proposal = msg.proposal
        self.value_store = msg.value_store
    # end def
# end class


class DBPrevoteMessage(DBMessage):
    def to_db(self, msg):
        assert isinstance(msg, messages.PrevoteMessage)
        self._to_db_message(msg)
        self._to_db_node(msg)
        self._to_db_leader(msg)
        self._to_db_value(msg)
    # end def

    def from_db(self):
        return messages.PrevoteMessage(sequence_no=self.sequence_no, node=self.node, leader=self.leader)
    # end def
# end class


class DBVoteMessage(DBMessage):
    def to_db(self, msg):
        assert isinstance(msg, messages.VoteMessage)
        self._to_db_message(msg)
        self._to_db_node(msg)
        self._to_db_leader(msg)
        self._to_db_value(msg)
    # end def

    def from_db(self):
        return messages.VoteMessage(sequence_no=self.sequence_no, node=self.node, leader=self.leader, value=self.value)
    # end def
# end class


MSG_TYPE_CLASS_MAP = {
    INIT: DBInitMessage,
    PROPOSE: DBProposeMessage,
    PREVOTE: DBPrevoteMessage,
    VOTE: DBVoteMessage,
}


@orm.db_session
def to_db(msg):
    if isinstance(msg, dict):
        # is still dict (json)
        msg = messages.Message.from_dict(msg)  # make a Message subclass first.
    assert isinstance(msg, messages.Message)
    db_msg_clazz = MSG_TYPE_CLASS_MAP[msg.type]  # Key error = not implemented yet.
    logger.warn(db_msg_clazz)
    assert issubclass(db_msg_clazz, DBMessage)
    db_msg = db_msg_clazz(type=1, sequence_no=msg.sequence_no)
    db_msg.type = msg.type
    db_msg.to_db(msg)
    return db_msg
# end def

db.bind("postgres", host=POSTGRES_HOST, user=POSTGRES_USER, password=POSTGRES_PASS, database=POSTGRES_DB)
db.generate_mapping(create_tables=True)