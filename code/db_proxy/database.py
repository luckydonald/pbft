from pony import orm

from node import messages
from .env import POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASS, POSTGRES_DB

from node.enums import INIT, LEADER_CHANGE, PROPOSE, PREVOTE, VOTE

db = orm.Database()

VALUE_TYPE = float
MSG_TYPE_TYPE = int
NODE_TYPE = int
SEQUENCE_TYPE = int

class Message(messages.Message, db.Entity):
    type = orm.Required(MSG_TYPE_TYPE)
    sequence_no = orm.Required(SEQUENCE_TYPE)

    @staticmethod
    def from_dict(data):
        assert "type" in data
        type = data["type"]
        assert type in [INIT, LEADER_CHANGE, PROPOSE, PREVOTE, VOTE]
        if type == INIT:
            return InitMessage.from_dict(data)
        # end def
        if type == LEADER_CHANGE:
            return LeaderChangeMessage.from_dict(data)
        # end def
        if type == PROPOSE:
            return ProposeMessage.from_dict(data)
        # end def
        if type == PREVOTE:
            return PrevoteMessage.from_dict(data)
        # end def
        if type == VOTE:
            return VoteMessage.from_dict(data)
        # end def
        return Message(**{
            "type": data["type"],
            "sequence_no": data["sequence_no"],
        })
    # end def


class InitMessageDB(messages.InitMessage, Message):
    node = orm.Required(NODE_TYPE)
    value = orm.Required(VALUE_TYPE)
# end class


class ProposeMessage(messages.ProposeMessage, Message):
    node = orm.Required(NODE_TYPE)
    leader = orm.Required(NODE_TYPE)
    proposal = orm.Required(VALUE_TYPE)
    # assert isinstance(value_store, list)
    value_store = orm.Required(list)
# end class

class PrevoteMessage(messages.PrevoteMessage, Message):
    node = orm.Required(NODE_TYPE)
    leader = orm.Required(NODE_TYPE)
    value = orm.Required(VALUE_TYPE)
# end class

class VoteMessage(messages.VoteMessage, Message):
    node = orm.Required(NODE_TYPE)
    leader = orm.Required(NODE_TYPE)
    value = orm.Required(VALUE_TYPE)
# end class

db.bind("postgres", host=POSTGRES_HOST, user=POSTGRES_USER, password=POSTGRES_PASS, database=POSTGRES_DB)
db.generate_mapping(create_tables=True)