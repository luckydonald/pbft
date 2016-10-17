from pony import orm

from node import messages
from .env import POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASS, POSTGRES_DB

from node.enums import INIT, LEADER_CHANGE, PROPOSE, PREVOTE, VOTE

db = orm.Database()

VALUE_TYPE = float
MSG_TYPE_TYPE = int
NODE_TYPE = int
SEQUENCE_TYPE = int


def from_dict(data):
    assert "type" in data
    type = data["type"]
    assert type in [INIT, LEADER_CHANGE, PROPOSE, PREVOTE, VOTE]
    if type == INIT:
        return DBInitMessage.from_dict(data)
    # end def
    if type == LEADER_CHANGE:
        # return DBLeaderChangeMessage.from_dict(data)
        raise NotImplementedError("Leader change")
    # end def
    if type == PROPOSE:
        return DBProposeMessage.from_dict(data)
    # end def
    if type == PREVOTE:
        return DBPrevoteMessage.from_dict(data)
    # end def
    if type == VOTE:
        return DBVoteMessage.from_dict(data)
    # end def
    raise NotImplementedError("Message type {}".format(type))
# end def


class DBInitMessage(messages.InitMessage, db.Entity):
    type = orm.Required(MSG_TYPE_TYPE)
    sequence_no = orm.Required(SEQUENCE_TYPE)
    node = orm.Required(NODE_TYPE)
    value = orm.Required(VALUE_TYPE)
# end class


class DBProposeMessage(messages.ProposeMessage, db.Entity):
    type = orm.Required(MSG_TYPE_TYPE)
    sequence_no = orm.Required(SEQUENCE_TYPE)
    node = orm.Required(NODE_TYPE)
    leader = orm.Required(NODE_TYPE)
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


# end class

class DBPrevoteMessage(messages.PrevoteMessage, db.Entity):
    type = orm.Required(MSG_TYPE_TYPE)
    sequence_no = orm.Required(SEQUENCE_TYPE)
    node = orm.Required(NODE_TYPE)
    leader = orm.Required(NODE_TYPE)
    value = orm.Required(VALUE_TYPE)
# end class

class DBVoteMessage(messages.VoteMessage, db.Entity):
    type = orm.Required(MSG_TYPE_TYPE)
    sequence_no = orm.Required(SEQUENCE_TYPE)
    node = orm.Required(NODE_TYPE)
    leader = orm.Required(NODE_TYPE)
    value = orm.Required(VALUE_TYPE)
# end class

db.bind("postgres", host=POSTGRES_HOST, user=POSTGRES_USER, password=POSTGRES_PASS, database=POSTGRES_DB)
db.generate_mapping(create_tables=True)