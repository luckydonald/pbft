from pony import orm

from node import messages
from .env import POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASS, POSTGRES_DB

from node.enums import INIT, LEADER_CHANGE, PROPOSE, PREVOTE, VOTE

db = orm.Database()

VALUE_TYPE = float
MSG_TYPE_TYPE = int
NODE_TYPE = int
SEQUENCE_TYPE = int

class DBMixin(object):
    def to_db(self, msg):
        pass
    # end def

class DBMessageMixin(DBMixin):
    type = orm.Required(MSG_TYPE_TYPE)
    sequence_no = orm.Required(SEQUENCE_TYPE)

    def from_db(self):
        return messages.Message(type=self.type, sequence_no=self.sequence_no)
    # end def

    def to_db(self, msg):
        super().to_db(msg)
        assert isinstance(msg, messages.Message)
        self.type = msg.type
        self.sequence_no = msg.sequence_no
    # end def
# end class


class DBNodeMixin(DBMixin):
    node = orm.Required(NODE_TYPE)

    def to_db(self, msg):
        super().to_db(msg)
        self.node = msg.node
    # end def
# end def


class DBValueMixin(DBMixin):
    value = orm.Required(VALUE_TYPE)

    def to_db(self, msg):
        super().to_db(msg)
        self.value = msg.value
    # end def
# end def


class DBLeaderMixin(DBMixin):
    leader = orm.Required(NODE_TYPE)

    def to_db(self, msg):
        super().to_db(msg)
        self.leader = msg.leader
    # end def
# pass


class DBInitMessage(db.Entity, DBMessageMixin, DBValueMixin):
    def from_db(self):
        return messages.InitMessage(sequence_no=self.sequence_no, node=self.node, value=self.value)
    # end def

    def to_db(self, msg):
        super().to_db(msg)
    # end def
# end class


class DBProposeMessage(db.Entity, DBMessageMixin, DBLeaderMixin):
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

    def to_db(self, msg):
        assert isinstance(msg, messages.ProposeMessage)
        super().to_db(msg)
        self.proposal = msg.proposal
        self.value_store = msg.value_store
    # end def
# end class


class DBPrevoteMessage(db.Entity, DBMessageMixin, DBLeaderMixin, DBValueMixin):
    def to_db(self, msg):
        assert isinstance(msg, messages.PrevoteMessage)
        super().to_db(msg)
        self.value = msg.value
    # end def

    def from_db(self):
        return messages.PrevoteMessage(sequence_no=self.sequence_no, node=self.node, leader=self.leader)
    # end def
# end class


class DBVoteMessage(db.Entity, DBMessageMixin, DBLeaderMixin, DBValueMixin):
    value = orm.Required(VALUE_TYPE)

    def to_db(self, msg):
        assert isinstance(msg, messages.VoteMessage)
        super().to_db(msg)
        self.value = msg.value
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
    assert issubclass(db_msg_clazz, DBMessageMixin)
    db_msg = db_msg_clazz()
    db_msg.to_db(msg)
    return db_msg
# end def

db.bind("postgres", host=POSTGRES_HOST, user=POSTGRES_USER, password=POSTGRES_PASS, database=POSTGRES_DB)
db.generate_mapping(create_tables=True)