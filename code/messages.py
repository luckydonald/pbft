# -*- coding: utf-8 -*-
from luckydonaldUtils.logger import logging

from enums import INIT, LEADER_CHANGE, PROPOSE, PREVOTE, VOTE

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)


class Message(object):
    def __init__(self, type, sequence_no):
        assert isinstance(type, int)
        self.type = type
        self.sequence_no = sequence_no

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
            "sequence_no": data["equence_no"],
        })
    # end def

    def to_dict(self):
        return {
            "type": self.type,
            "sequence_no": self.sequence_no,
        }
    # end def
# end class


class InitMessage(Message):
    def __init__(self, sequence_no, node, value):
        super(InitMessage, self).__init__(INIT, sequence_no)
        self.node = node  # i
        self.value = value  # vi
    # end def
    
    @staticmethod
    def from_dict(data):
        kwargs = {
            "sequence_no": data["sequence_no"],
            "node": data["node"],
            "value": data["value"],
        }
        return InitMessage(**kwargs)

    # end def

    def to_dict(self):
        data = super().to_dict()
        data["node"] = self.node
        data["value"] = self.value
        return data
    # end def
# end class


class LeaderChangeMessage(Message):
    def __init__(self, sequence_no, node_num, leader, P):
        raise NotImplementedError("lel")
        super(LeaderChangeMessage, self).__init__(LEADER_CHANGE, sequence_no)
    # end def

    @staticmethod
    def from_dict(data):
        raise NotImplementedError("lel")
        kwargs = {
            "type": data["type"],
            "sequence_no": data["sequence_no"],
        }
        return LeaderChangeMessage(**kwargs)
    # end def

    def to_dict(self):
        raise NotImplementedError("lel")
        return {
            "type": self.type,
            "sequence_no": self.sequence_no,
        }
    # end def
# end class


class ProposeMessage(Message):
    def __init__(self, sequence_no, node, leader, proposal, value_store):
        super(ProposeMessage, self).__init__(PROPOSE, sequence_no)
        self.node = node
        self.leader = leader
        self.proposal = proposal
        self.value_store = value_store

    @staticmethod
    def from_dict(data):
        kwargs = {
            "sequence_no": data["sequence_no"],
            "node": data.get("node"),
            "leader": data.get("leader"),
            "proposal": data.get("proposal"),
            "value_store": data.get("value_store"),
        }
        return ProposeMessage(**kwargs)
    # end def

    def to_dict(self):
        data = super().to_dict()
        data["node"] = self.node
        data["leader"] = self.leader
        data["proposal"] = self.proposal
        data["value_store"] = self.value_store
        return data
    # end def
# end class


class PrevoteMessage(Message):
    def __init__(self, sequence_no, node, leader, value):
        super().__init__(PREVOTE, sequence_no)
        self.node = node
        self.leader = leader
        self.value = value

    @staticmethod
    def from_dict(data):
        kwargs = {
            "sequence_no": data["sequence_no"],
            "node": data["node"],
            "leader": data["leader"],
            "value": data["value"],
        }
        return PrevoteMessage(**kwargs)

    # end def

    def to_dict(self):
        data = super().to_dict()
        data["node"] = self.node
        data["leader"] = self.leader
        data["value"] = self.value
        return data
    # end def
# end class


class VoteMessage(Message):
    def __init__(self, sequence_no, node, leader, value):
        super().__init__(VOTE, sequence_no)
        self.node = node
        self.leader = leader
        self.value = value
    # end def

    @staticmethod
    def from_dict(data):
        kwargs = {
            "sequence_no": data["sequence_no"],
            "node": data["node"],
            "leader": data["leader"],
            "value": data["value"],
        }
        return VoteMessage(**kwargs)
    # end def

    def to_dict(self):
        data = super().to_dict()
        data["node"] = self.node
        data["leader"] = self.leader
        data["value"] = self.value
        return data
    # end def
# end class
