from luckydonaldUtils.functions import deprecated
from pony import orm
import logging
from node import messages
from .env import POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASS, POSTGRES_DB

from node.enums import UNSET, INIT, PROPOSE, PREVOTE, VOTE

logger = logging.getLogger(__file__)
db = orm.Database()

VALUE_TYPE = float
MSG_TYPE_TYPE = int
NODE_TYPE = int
SEQUENCE_TYPE = int


class DBMessage(db.Entity):
    type = orm.Discriminator(MSG_TYPE_TYPE)
    sequence_no = orm.Required(SEQUENCE_TYPE)
    node = orm.Optional(NODE_TYPE)
    value = orm.Optional(VALUE_TYPE)
    leader = orm.Optional(NODE_TYPE)
    _discriminator_ = UNSET

    def from_db(self):
        clazz = MSG_TYPE_CLASS_MAP[self.type]
        assert issubclass(clazz, messages.Message)
        return clazz.from_dict(self.as_dict())
    # end def

    @classmethod
    def to_db(cls, msg):
        return cls(**msg.to_dict())
    # end def
# end class


class DBInitMessage(DBMessage):
    _discriminator_ = INIT

    def from_db(self):
        return messages.InitMessage(sequence_no=self.sequence_no, node=self.node, value=self.value)
    # end def

    @classmethod
    def to_db(cls, msg):
        assert isinstance(msg, messages.InitMessage)
        return super().to_db(msg)
    # end def
# end class


class DBProposeMessage(DBMessage):
    _discriminator_ = PROPOSE
    proposal = orm.Required(VALUE_TYPE)
    value_store = orm.Required(orm.Json)  # json

    def from_db(self):
        return messages.ProposeMessage(
            sequence_no=self.sequence_no, node=self.node, leader=self.leader, proposal=self.proposal,
            value_store=self.value_store
        )
    # end def

    @classmethod
    def to_db(cls, msg):
        assert isinstance(msg, messages.ProposeMessage)
        return super().to_db(msg)
    # end def
# end class


class DBPrevoteMessage(DBMessage):
    _discriminator_ = PREVOTE

    @classmethod
    def to_db(cls, msg):
        assert isinstance(msg, messages.PrevoteMessage)
        return super().to_db(msg)
    # end def

    def from_db(self):
        return messages.PrevoteMessage(sequence_no=self.sequence_no, node=self.node, leader=self.leader)
    # end def
# end class


class DBVoteMessage(DBMessage):
    _discriminator_ = VOTE

    @classmethod
    def to_db(cls, msg):
        assert isinstance(msg, messages.VoteMessage)
        return super().to_db(msg)
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
    if msg is None:
        return None
    if isinstance(msg, dict):
        # is still dict (json)
        msg = messages.Message.from_dict(msg)  # make a Message subclass first.
    assert isinstance(msg, messages.Message)
    db_msg_clazz = MSG_TYPE_CLASS_MAP[msg.type]  # Key error = not implemented yet.
    assert issubclass(db_msg_clazz, DBMessage)
    db_msg = db_msg_clazz.to_db(msg)
    assert db_msg.type == msg.type
    return db_msg
# end def

db.bind("postgres", host=POSTGRES_HOST, user=POSTGRES_USER, password=POSTGRES_PASS, database=POSTGRES_DB)
db.generate_mapping(create_tables=True)